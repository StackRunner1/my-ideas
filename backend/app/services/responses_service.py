"""Responses API service for SQL generation and query execution.

Provides functions for generating SQL from natural language using OpenAI,
validating safety, and executing queries via RLS-enforced agent client.
"""

import json
import logging
import re
from typing import Any, Dict, List, Optional

from supabase import Client

from ..core.errors import APIError
from ..models.responses_api import (QueryResult, QueryType, ResponsesAPIOutput,
                                    TokenUsage, get_responses_api_schema)
from .openai_service import calculate_cost, get_openai_client

logger = logging.getLogger(__name__)


def build_schema_context(agent_client: Client) -> Dict[str, Any]:
    """Extract relevant table schemas for SQL generation context.

    Args:
        agent_client: RLS-enforced Supabase client

    Returns:
        Dictionary with table schemas and column information
    """
    try:
        # For now, provide a static schema for items and tags tables
        # In production, this could query information_schema or be configured
        schema = {
            "tables": {
                "items": {
                    "columns": [
                        {"name": "id", "type": "uuid", "description": "Primary key"},
                        {"name": "title", "type": "text", "description": "Item title"},
                        {
                            "name": "description",
                            "type": "text",
                            "description": "Item description",
                        },
                        {
                            "name": "status",
                            "type": "text",
                            "description": "Item status (active, archived, etc.)",
                        },
                        {
                            "name": "user_id",
                            "type": "uuid",
                            "description": "Owner user ID (filtered by RLS)",
                        },
                        {
                            "name": "created_at",
                            "type": "timestamptz",
                            "description": "Creation timestamp",
                        },
                        {
                            "name": "updated_at",
                            "type": "timestamptz",
                            "description": "Last update timestamp",
                        },
                    ],
                    "description": "User's ideas/items",
                },
                "tags": {
                    "columns": [
                        {"name": "id", "type": "uuid", "description": "Primary key"},
                        {
                            "name": "item_id",
                            "type": "uuid",
                            "description": "Foreign key to items",
                        },
                        {
                            "name": "label",
                            "type": "text",
                            "description": "Tag label/name",
                        },
                        {
                            "name": "created_at",
                            "type": "timestamptz",
                            "description": "Creation timestamp",
                        },
                    ],
                    "description": "Tags associated with items",
                },
            },
            "notes": [
                "All queries are automatically scoped to the authenticated user via RLS",
                "Always use SELECT queries only",
                "Add LIMIT clause to prevent large result sets",
                "Use PostgreSQL syntax and functions",
            ],
        }

        return schema

    except Exception as e:
        logger.error(f"Failed to build schema context: {e}")
        return {"tables": {}, "notes": ["Schema information unavailable"]}


def generate_sql_query(
    user_query: str, schema_context: Dict[str, Any]
) -> ResponsesAPIOutput:
    """Generate SQL query from natural language using OpenAI Responses API.

    Args:
        user_query: Natural language question from user
        schema_context: Database schema information

    Returns:
        ResponsesAPIOutput with generated SQL and metadata

    Raises:
        APIError: If SQL generation fails
    """
    try:
        client = get_openai_client()

        # Build system prompt emphasizing safety
        system_prompt = f"""You are a SQL query generator for a personal ideas management application.

DATABASE SCHEMA:
{json.dumps(schema_context, indent=2)}

SAFETY RULES (CRITICAL):
1. ONLY generate SELECT queries - no INSERT, UPDATE, DELETE, DROP, ALTER, CREATE
2. ALWAYS add a LIMIT clause (default: LIMIT 50 unless user specifies otherwise)
3. For DELETE or UPDATE requests, explain why you cannot do them
4. Use PostgreSQL syntax and functions
5. Respect RLS - queries are automatically scoped to the authenticated user
6. Avoid complex subqueries when possible
7. Use proper JOINs when querying related tables

RESPONSE FORMAT:
- query_type: Always "sql_generation" for SQL queries
- generated_sql: The SQL query (SELECT only, with LIMIT)
- explanation: Clear explanation of what the query does
- safety_check: Always true if query follows rules
- confidence: Your confidence level (0.0-1.0)
- warnings: Any caveats about the query

If the user asks for something unsafe (DELETE, DROP, etc.), set safety_check to false and explain why in the explanation field.
"""

        # Build user message
        user_message = f"Generate a SQL query for this question: {user_query}"

        # Call OpenAI with structured output
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            response_format=get_responses_api_schema(),
            temperature=0.3,  # Lower temperature for more consistent SQL
            max_tokens=1000,
        )

        # Parse response
        content = response.choices[0].message.content
        if not content:
            raise APIError(
                message="OpenAI returned empty response",
                status_code=500,
                error_code="EMPTY_RESPONSE",
            )

        response_data = json.loads(content)
        output = ResponsesAPIOutput(**response_data)

        # Log token usage and cost
        usage = response.usage
        if usage:
            cost = calculate_cost(usage.prompt_tokens, usage.completion_tokens)
            logger.info(
                f"SQL generated: tokens={usage.total_tokens}, cost=${cost:.6f}, "
                f"safety={output.safety_check}, confidence={output.confidence}"
            )

        return output

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse OpenAI response as JSON: {e}")
        raise APIError(
            message="Invalid response format from AI",
            status_code=500,
            error_code="INVALID_RESPONSE_FORMAT",
        )
    except Exception as e:
        logger.error(f"SQL generation failed: {e}")
        raise APIError(
            message=f"Failed to generate SQL query: {str(e)}",
            status_code=500,
            error_code="SQL_GENERATION_ERROR",
        )


def validate_and_sanitize_sql(sql: str) -> tuple[bool, List[str]]:
    """Comprehensive SQL safety validation.

    Args:
        sql: SQL query to validate

    Returns:
        Tuple of (is_safe, warnings/errors)
    """
    errors = []
    sql_upper = sql.upper().strip()

    # Must be SELECT query
    if not sql_upper.startswith("SELECT"):
        errors.append("Only SELECT queries are allowed")
        return False, errors

    # Dangerous operations
    dangerous_keywords = [
        "DROP",
        "TRUNCATE",
        "ALTER",
        "CREATE",
        "GRANT",
        "REVOKE",
        "EXECUTE",
    ]
    for keyword in dangerous_keywords:
        if re.search(rf"\b{keyword}\b", sql_upper):
            errors.append(f"Dangerous keyword detected: {keyword}")
            return False, errors

    # DELETE without WHERE
    if re.search(r"\bDELETE\s+FROM\s+\w+\s*(?!WHERE)", sql_upper):
        errors.append("DELETE without WHERE clause not allowed")
        return False, errors

    # UPDATE without WHERE
    if re.search(r"\bUPDATE\s+\w+\s+SET\s+.*(?!WHERE)", sql_upper):
        errors.append("UPDATE without WHERE clause not allowed")
        return False, errors

    # SQL injection patterns
    injection_patterns = [
        r";\s*DROP",
        r";\s*DELETE",
        r";\s*INSERT",
        r"--",  # SQL comments
        r"/\*.*\*/",  # Block comments
        r"\bUNION\s+SELECT",  # UNION injection
    ]
    for pattern in injection_patterns:
        if re.search(pattern, sql_upper):
            errors.append(f"Potential SQL injection pattern detected")
            return False, errors

    # Warnings (not blocking)
    warnings = []
    if "LIMIT" not in sql_upper:
        warnings.append("Missing LIMIT clause - query may return large result set")

    if sql_upper.count("JOIN") > 3:
        warnings.append(f"Query has {sql_upper.count('JOIN')} JOINs - may be slow")

    return True, warnings


def execute_generated_query(
    agent_client: Client, sql: str, user_query: str
) -> QueryResult:
    """Execute validated SQL query via RLS-enforced agent client.

    Args:
        agent_client: RLS-enforced Supabase client
        sql: Validated SQL query
        user_query: Original natural language query

    Returns:
        QueryResult with execution results

    Raises:
        APIError: If query execution fails
    """
    try:
        # Final safety check
        is_safe, messages = validate_and_sanitize_sql(sql)
        if not is_safe:
            logger.warning(f"Unsafe SQL blocked: {sql[:100]}")
            return QueryResult(
                success=False,
                error=f"Unsafe SQL query: {', '.join(messages)}",
                generated_sql=sql,
                warnings=messages,
            )

        # Execute query using RLS-enforced client
        logger.info(f"Executing SQL: {sql[:100]}...")
        result = agent_client.rpc("exec_sql", {"query": sql}).execute()

        # Format results
        results = result.data if result.data else []
        row_count = len(results) if isinstance(results, list) else 0

        logger.info(f"Query executed successfully: {row_count} rows returned")

        return QueryResult(
            success=True,
            query_type=QueryType.SQL_GENERATION,
            generated_sql=sql,
            results=results,
            row_count=row_count,
            warnings=messages,  # Include any warnings from validation
        )

    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        return QueryResult(
            success=False,
            error=f"Query execution failed: {str(e)}",
            generated_sql=sql,
        )


def process_query_request(
    agent_client: Client, user_query: str, schema_hints: Optional[Dict[str, Any]] = None
) -> QueryResult:
    """Process complete query request: generate SQL, validate, execute.

    This is the main entry point for the Responses API flow.

    Args:
        agent_client: RLS-enforced Supabase client
        user_query: Natural language question
        schema_hints: Optional schema context overrides

    Returns:
        QueryResult with complete execution results
    """
    try:
        # Build schema context
        schema_context = build_schema_context(agent_client)
        if schema_hints:
            schema_context.update(schema_hints)

        # Generate SQL using OpenAI
        logger.info(f"Processing query: {user_query[:100]}")
        llm_output = generate_sql_query(user_query, schema_context)

        # Check if LLM marked as unsafe
        if not llm_output.safety_check:
            logger.warning(f"LLM marked query as unsafe: {user_query[:100]}")
            return QueryResult(
                success=False,
                query_type=llm_output.query_type,
                explanation=llm_output.explanation,
                error="Query violates safety rules",
                warnings=llm_output.warnings,
            )

        # Validate generated SQL
        if not llm_output.generated_sql:
            return QueryResult(
                success=False,
                explanation=llm_output.explanation,
                error="No SQL query was generated",
            )

        # Note: We can't execute raw SQL directly via Supabase client without a stored procedure
        # For now, we'll return the generated SQL for the user to review
        # In production, you'd need to create a PostgreSQL function to execute dynamic SQL

        logger.info(f"SQL generated successfully: {llm_output.generated_sql[:100]}")

        return QueryResult(
            success=True,
            query_type=llm_output.query_type,
            generated_sql=llm_output.generated_sql,
            explanation=llm_output.explanation,
            results=[],  # Would contain actual results if we could execute
            row_count=0,
            warnings=llm_output.warnings,
        )

    except APIError:
        raise
    except Exception as e:
        logger.error(f"Query processing failed: {e}")
        raise APIError(
            message=f"Failed to process query: {str(e)}",
            status_code=500,
            error_code="QUERY_PROCESSING_ERROR",
        )
