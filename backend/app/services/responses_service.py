"""Responses API service with function calling for database queries.

Implements multi-turn conversation where:
1. LLM decides if it needs database access
2. LLM calls query_database() function tool
3. We execute the SQL and return results
4. LLM sees results and formats natural language response
"""

import json
from typing import Any, Dict, Optional

from supabase import Client

from ..core.errors import APIError
from ..core.logging import get_logger
from ..models.responses_api import QueryResult, QueryType, TokenUsage
from ..tools import ALL_TOOLS, TOOL_HANDLERS
from .openai_service import calculate_cost, get_openai_client

logger = get_logger(__name__)


def build_schema_context() -> str:
    """Build database schema description for system instructions."""
    return """
DATABASE SCHEMA:
- ideas: id (uuid), user_id (uuid), title (text), description (text), status (draft|published|archived), tags (text[]), vote_count (int), created_at (timestamptz), updated_at (timestamptz)
- votes: id (uuid), idea_id (uuid), user_id (uuid), created_at (timestamptz)
- comments: id (uuid), idea_id (uuid), user_id (uuid), content (text), parent_id (uuid), created_at (timestamptz), updated_at (timestamptz)

NOTES:
- All queries automatically scoped to authenticated user via RLS
- Use PostgreSQL syntax
- Always add LIMIT clause (default 50)
- Only SELECT queries allowed
"""


# ============================================================================
# MULTI-TURN CONVERSATION HANDLER
# ============================================================================


def process_query_request(
    agent_client: Client,
    user_query: str,
    schema_hints: Optional[Dict[str, Any]] = None,
    conversation_history: Optional[list] = None,
    temperature: float = 0.7,
    max_tokens: int = 2000,
) -> QueryResult:
    """Process query with multi-turn function calling and conversation history.

    Flow:
    1. Build messages array with conversation history + new user query
    2. Send to LLM with query_database tool
    3. If LLM calls tool, execute SQL and return results
    4. LLM sees results and formats natural response
    5. Return final response to user

    Args:
        agent_client: RLS-enforced Supabase client
        user_query: Natural language question
        schema_hints: Optional additional schema info
        conversation_history: Previous messages for context
        temperature: LLM temperature (0.0-2.0)
        max_tokens: Maximum response tokens

    Returns:
        QueryResult with LLM's formatted response
    """
    try:
        client = get_openai_client()

        # Build system instructions
        system_instructions = f"""You are an AI assistant for a personal ideas management application.

{build_schema_context()}

When users ask about their data:
1. Use the query_database function to fetch data
2. After seeing results, provide a natural, conversational response
3. Format data clearly (counts, lists, summaries)
4. If no results, explain kindly

For general questions (greetings, help, etc.):
- Respond conversationally without calling functions
"""

        # Build conversation messages
        messages = []

        # Add conversation history if provided
        if conversation_history:
            for msg in conversation_history[-10:]:  # Last 10 messages for context
                messages.append({"role": msg["role"], "content": msg["content"]})

        # Add current user query
        messages.append({"role": "user", "content": user_query})

        logger.info(
            f"[RESPONSES_API] Processing query with {len(messages)} messages (including {len(conversation_history or [])} history)"
        )
        logger.info(
            f"[RESPONSES_API] Settings: temp={temperature}, max_tokens={max_tokens}"
        )

        # ===== TURN 1: Initial LLM call with tools =====
        response = client.responses.create(
            model="gpt-4o-mini",
            instructions=system_instructions,
            input=messages,
            tools=ALL_TOOLS,  # Tools from centralized module
            tool_choice="auto",  # LLM decides if it needs the tool
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

        logger.info(f"[RESPONSES_API] Turn 1 complete, status={response.status}")

        # Check if LLM called the function
        tool_calls = []
        for item in response.output:
            # Function calls can be top-level items OR nested in messages
            if item.type == "function_call":
                tool_calls.append(item)
                logger.info(f"[RESPONSES_API] ✅ Tool call detected: {item.name}")
            elif item.type == "message" and hasattr(item, "content"):
                for content_item in item.content:
                    if (
                        hasattr(content_item, "type")
                        and content_item.type == "function_call"
                    ):
                        tool_calls.append(content_item)
                        logger.info(
                            f"[RESPONSES_API] ✅ Tool call detected: {content_item.name}"
                        )

        # If no tool calls, LLM responded directly (conversational)
        if not tool_calls:
            logger.warning(
                "[RESPONSES_API] ⚠️ No tool calls detected - LLM chose conversational response"
            )
            logger.warning(f"[RESPONSES_API] Query was: '{user_query}'")
            logger.warning(
                "[RESPONSES_API] This may indicate: tool not passed correctly, or LLM didn't recognize data query"
            )

            # Extract text response
            response_text = ""
            for item in response.output:
                if item.type == "message" and item.role == "assistant":
                    for content_item in item.content:
                        if (
                            hasattr(content_item, "type")
                            and content_item.type == "output_text"
                        ):
                            response_text += content_item.text

            return QueryResult(
                success=True,
                query_type=QueryType.SUMMARIZATION,
                generated_sql=None,
                explanation=response_text,
                results=[],
                row_count=0,
                token_usage=TokenUsage(
                    prompt_tokens=response.usage.input_tokens,
                    completion_tokens=response.usage.output_tokens,
                    total_tokens=response.usage.total_tokens,
                ),
                cost=calculate_cost(
                    response.usage.input_tokens, response.usage.output_tokens
                ),
            )

        # ===== TURN 2: Execute tool calls and get final response =====
        logger.info(f"[RESPONSES_API] {len(tool_calls)} tool call(s) detected")

        # Execute all tool calls
        tool_results = []
        executed_sql = None
        all_results = []

        for tool_call in tool_calls:
            # ResponseFunctionToolCall has name/arguments directly (not under .function)
            tool_name = tool_call.name
            args = json.loads(tool_call.arguments)

            # Get tool handler from registry
            if tool_name in TOOL_HANDLERS:
                logger.info(f"[TOOL_CALL] {tool_name}: {args.get('explanation', '')}")

                # Execute tool
                result = TOOL_HANDLERS[tool_name](agent_client, **args)

                # Track SQL for query_database
                if tool_name == "query_database":
                    executed_sql = args.get("sql", "")
                    logger.info(f"[TOOL_CALL] SQL: {executed_sql}")

                all_results.extend(result.get("results", []))

                tool_results.append(
                    {
                        "type": "function_call_output",
                        "call_id": tool_call.call_id,
                        "output": json.dumps(result),
                    }
                )
            else:
                logger.error(f"[TOOL_CALL] Unknown tool: {tool_name}")
                tool_results.append(
                    {
                        "type": "function_call_output",
                        "call_id": tool_call.call_id,
                        "output": json.dumps(
                            {"success": False, "error": f"Unknown tool: {tool_name}"}
                        ),
                    }
                )

        # Send tool results back to LLM for final formatting
        logger.info("[RESPONSES_API] Sending tool results back to LLM")

        final_response = client.responses.create(
            model="gpt-4o-mini",
            previous_response_id=response.id,  # Multi-turn conversation
            input=tool_results,  # Tool execution results
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

        logger.info(f"[RESPONSES_API] Turn 2 complete, status={final_response.status}")

        # Extract final response text
        final_text = ""
        for item in final_response.output:
            if item.type == "message" and item.role == "assistant":
                for content_item in item.content:
                    if (
                        hasattr(content_item, "type")
                        and content_item.type == "output_text"
                    ):
                        final_text += content_item.text

        # Calculate total token usage
        total_input = response.usage.input_tokens + final_response.usage.input_tokens
        total_output = response.usage.output_tokens + final_response.usage.output_tokens
        total_tokens = total_input + total_output

        return QueryResult(
            success=True,
            query_type=QueryType.SQL_GENERATION,
            generated_sql=executed_sql,
            explanation=final_text,
            results=all_results,
            row_count=len(all_results),
            token_usage=TokenUsage(
                prompt_tokens=total_input,
                completion_tokens=total_output,
                total_tokens=total_tokens,
            ),
            cost=calculate_cost(total_input, total_output),
        )

    except Exception as e:
        logger.error(f"[RESPONSES_API] Query processing failed: {e}", exc_info=True)
        raise APIError(
            code="QUERY_PROCESSING_ERROR",
            message=f"Failed to process query: {str(e)}",
            status_code=500,
        )
