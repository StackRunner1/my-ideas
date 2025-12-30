"""
Agent SDK API Route - POST /api/v1/agent/chat

Endpoint for autonomous agent interactions using OpenAI Agent SDK.
Separate from Responses API (/api/v1/ai/query) - Part B implementation.

Documentation:
- Running Agents: https://openai.github.io/openai-agents-python/running_agents/
- Sessions: https://openai.github.io/openai-agents-python/sessions/
"""

import time
from typing import Any, Dict, List

from agents import Runner, SQLiteSession
from fastapi import APIRouter, Depends, HTTPException, Request, status

from ...api.auth_utils import get_current_user
from ...core.errors import APIError
from ...core.logging import get_logger
from ...models.agent import (AgentChatRequest, AgentChatResponse, Handoff,
                             ToolCall)
from ...services.agent_auth import get_agent_client
from ...services.app_agents import create_orchestrator

logger = get_logger(__name__)
router = APIRouter()

# In-memory session store (simple implementation for now)
# TODO: Migrate to persistent session storage (file-based SQLite or Redis)
sessions: dict[str, SQLiteSession] = {}


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    request_body: AgentChatRequest,
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> AgentChatResponse:
    """
    Agent SDK chat endpoint - autonomous agent interactions.

    This endpoint:
    1. Creates/retrieves session for conversation continuity
    2. Creates orchestrator agent with user context
    3. Runs agent with user message using Runner.run (async)
    4. Tracks actions, tool calls, and handoffs
    5. Returns structured response with agent output

    Args:
        request: Agent chat request with query and optional history
        current_user_id: Authenticated user ID (from agent-user credentials)
        request_id: Request ID for tracing

    Returns:
        AgentChatResponse with agent output, actions, and tool calls

    Raises:
        HTTPException: If agent execution fails

    Architecture:
        User Query
            ↓
        Orchestrator Agent
            ↓
        [Handoff to Specialist]
            ↓
        Items Agent OR Tags Agent
            ↓
        Tool Execution (create_tag, etc.)
            ↓
        Response to User
    """
    # Extract user ID and request ID
    user_id = current_user["user"]["id"]
    request_id = getattr(request.state, "request_id", "unknown")

    logger.info(
        f"Agent chat request from user {user_id}: '{request_body.message[:100]}...'",
        extra={"request_id": request_id, "user_id": user_id},
    )

    try:
        # Get agent client for RLS-enforced operations (Phase 1 implementation)
        agent_client = get_agent_client(user_id)
        logger.info(f"Retrieved agent client for user {user_id}")

        # Get or create session for conversation continuity
        session_id = request_body.session_id or f"session_{user_id}_{request_id}"

        if session_id not in sessions:
            # Create in-memory SQLite session (":memory:" = in-memory database)
            sessions[session_id] = SQLiteSession(session_id, ":memory:")
            logger.info(f"Created new session: {session_id}")
        else:
            logger.info(f"Using existing session: {session_id}")

        session = sessions[session_id]

        # Create orchestrator agent with RLS-enforced client
        # Note: User context will be passed via RunContextWrapper (see Unit 16.5)
        orchestrator = create_orchestrator(agent_client)
        logger.info(f"Created orchestrator agent for user {user_id}")

        # Run agent with user query
        # Following SDK pattern: https://openai.github.io/openai-agents-python/running_agents/
        logger.info(f"Running agent with query: '{request_body.message}'")
        start_time = time.time()

        result = await Runner.run(
            orchestrator,
            request_body.message,
            session=session,
        )

        execution_time = time.time() - start_time
        logger.info(
            f"Agent execution complete in {execution_time:.2f}s. Final output length: {len(result.final_output)} chars"
        )

        # Log result details for debugging
        logger.info(f"Result has {len(result.new_items)} new_items")
        logger.info(
            f"Last agent: {result.last_agent.name if result.last_agent else 'None'}"
        )

        # Log each item type for debugging handoff issues
        for i, item in enumerate(result.new_items):
            item_type = type(item).__name__
            logger.info(f"  new_items[{i}]: {item_type}")

            # Log item details for handoffs
            if item_type == "HandoffOutputItem":
                logger.info(
                    f"    ✅ HANDOFF FOUND: {getattr(item, 'source_agent', '?')} → {getattr(item, 'target_agent', '?')}"
                )
            elif item_type == "ToolCallOutputItem":
                logger.info(
                    f"    ✅ TOOL CALL FOUND: {getattr(item, 'tool_name', '?')}"
                )
            elif item_type == "MessageOutputItem":
                content_preview = str(getattr(item, "content", ""))[:100]
                logger.info(f"    📝 MESSAGE: {content_preview}...")

        # Parse new_items to extract handoffs and tool calls
        # SDK documentation: https://github.com/openai/openai-agents-python/blob/main/docs/results.md
        handoffs: List[Handoff] = []
        tool_calls: List[ToolCall] = []
        final_agent_name = (
            result.last_agent.name if result.last_agent else "Orchestrator"
        )

        # Iterate through new_items to track agent transitions and tool executions
        for i, item in enumerate(result.new_items):
            item_type = type(item).__name__

            # Log item for debugging
            logger.debug(f"Item {i}: type={item_type}")

            # Check for handoffs using HandoffOutputItem
            if item_type == "HandoffOutputItem":
                from_agent = (
                    item.source_agent.name
                    if hasattr(item, "source_agent") and item.source_agent
                    else "Unknown"
                )
                to_agent = (
                    item.target_agent.name
                    if hasattr(item, "target_agent") and item.target_agent
                    else "Unknown"
                )

                handoff = Handoff(
                    from_agent=from_agent,
                    to_agent=to_agent,
                    timestamp=int(time.time() * 1000),
                )
                handoffs.append(handoff)
                logger.info(f"🔄 Handoff detected: {from_agent} → {to_agent}")

            # Check for tool calls using ToolCallOutputItem
            elif item_type == "ToolCallOutputItem":
                tool_name = item.tool_name if hasattr(item, "tool_name") else "unknown"
                tool_output = item.tool_output if hasattr(item, "tool_output") else None

                # Parse tool output for success/error
                tool_result = None
                tool_error = None

                if tool_output:
                    if isinstance(tool_output, dict):
                        if tool_output.get("success"):
                            tool_result = tool_output.get("data")
                        else:
                            tool_error = tool_output.get("error")
                    else:
                        tool_result = str(tool_output)

                    tool_call_obj = ToolCall(
                        tool_name=tool_name,
                        parameters={},  # Tool parameters not directly accessible from ToolCallOutputItem
                        result=tool_result,
                        error=tool_error,
                    )
                    tool_calls.append(tool_call_obj)
                    logger.info(f"🔧 Tool call detected: {tool_name}")

        # Log summary
        logger.info(
            f"Extracted {len(handoffs)} handoffs and {len(tool_calls)} tool calls"
        )

        # For now, simple response structure
        response = AgentChatResponse(
            success=True,
            response=result.final_output,
            session_id=session_id,
            handoffs=handoffs if handoffs else None,
            tool_calls=tool_calls if tool_calls else None,
            agent_name=final_agent_name,
            confidence=None,  # TODO: Extract from agent reasoning
            token_usage=None,  # TODO: Extract from result if available
            cost=None,  # TODO: Calculate based on token usage
            error=None,
        )

        logger.info(f"Agent chat successful for user {user_id}")
        return response

    except Exception as e:
        error_msg = str(e)
        logger.error(
            f"Agent chat failed: {error_msg}",
            exc_info=True,
            extra={"request_id": request_id, "user_id": user_id},
        )

        # Return error response
        return AgentChatResponse(
            success=False,
            response=f"I encountered an error while processing your request: {error_msg}",
            session_id=request_body.session_id or "",
            handoffs=None,
            tool_calls=None,
            agent_name="System",
            error=error_msg,
        )
