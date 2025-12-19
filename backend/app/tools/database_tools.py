"""Database query tools for OpenAI Responses API.

Provides function calling tools for querying the user's ideas database.
Follows OpenAI official documentation for tool definitions:
https://platform.openai.com/docs/guides/function-calling
"""

import re
from typing import Any, Dict, List

from supabase import Client

from ..core.logging import get_logger

logger = get_logger(__name__)


# ============================================================================
# TOOL DEFINITION
# ============================================================================

QUERY_DATABASE_TOOL = {
    "type": "function",
    "name": "query_database",
    "description": (
        "Execute a SQL SELECT query on the user's ideas database. "
        "Use this when the user asks to see their data, count items, find specific ideas, etc. "
        "Returns the raw query results as JSON."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "sql": {
                "type": "string",
                "description": (
                    "PostgreSQL SELECT query to execute. "
                    "Must start with SELECT. "
                    "Always include LIMIT clause (default 50). "
                    "Available tables: ideas (id, user_id, title, description, status, tags[], vote_count, created_at, updated_at), "
                    "votes (id, idea_id, user_id, created_at), "
                    "comments (id, idea_id, user_id, content, parent_id, created_at)"
                ),
            },
            "explanation": {
                "type": "string",
                "description": "Brief explanation of what this query does",
            },
        },
        "required": ["sql", "explanation"],
    },
}


# ============================================================================
# SQL VALIDATION
# ============================================================================


def validate_sql_safety(sql: str) -> tuple[bool, List[str]]:
    """Validate SQL query for safety.

    Args:
        sql: SQL query string

    Returns:
        Tuple of (is_safe, error_messages)
    """
    errors = []
    sql_upper = sql.upper().strip()

    # Must be SELECT
    if not sql_upper.startswith("SELECT"):
        errors.append("Only SELECT queries allowed")
        return False, errors

    # Dangerous keywords
    dangerous = ["DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE", "EXECUTE"]
    for keyword in dangerous:
        if re.search(rf"\b{keyword}\b", sql_upper):
            errors.append(f"Dangerous keyword: {keyword}")
            return False, errors

    return True, []


# ============================================================================
# TOOL HANDLER
# ============================================================================


def execute_query_database(
    agent_client: Client, sql: str, explanation: str = ""
) -> Dict[str, Any]:
    """Execute the query_database tool.

    This is the handler function that actually executes SQL queries
    via PostgREST when the LLM calls the query_database tool.

    Args:
        agent_client: RLS-enforced Supabase client
        sql: SQL SELECT query to execute
        explanation: Optional explanation of the query

    Returns:
        Dict with success status, results, row_count, or error message
    """
    logger.info(f"[TOOL:query_database] Executing: {explanation}")
    logger.info(f"[TOOL:query_database] SQL: {sql[:200]}")

    try:
        # Validate safety
        is_safe, errors = validate_sql_safety(sql)
        if not is_safe:
            return {
                "success": False,
                "error": f"Unsafe SQL: {', '.join(errors)}",
                "results": [],
            }

        # Parse query components
        sql_clean = sql.strip()

        # Extract table name
        from_match = re.search(r"\bFROM\s+(\w+)", sql_clean, re.IGNORECASE)
        if not from_match:
            return {
                "success": False,
                "error": "Could not parse table name from query",
                "results": [],
            }

        table_name = from_match.group(1)
        logger.info(f"[TOOL:query_database] Querying table: {table_name}")

        # Extract columns
        select_match = re.search(
            r"\bSELECT\s+(.+?)\s+FROM", sql_clean, re.IGNORECASE | re.DOTALL
        )
        columns = "*"
        if select_match:
            columns_str = select_match.group(1).strip()
            if columns_str != "*":
                columns = columns_str

        # Build query
        query = agent_client.table(table_name).select(columns)

        # Extract and apply WHERE clause (basic support)
        where_match = re.search(
            r"\bWHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)",
            sql_clean,
            re.IGNORECASE | re.DOTALL,
        )
        if where_match:
            where_clause = where_match.group(1).strip()
            logger.info(
                f"[TOOL:query_database] WHERE clause detected (not applied): {where_clause}"
            )
            # NOTE: Complex WHERE parsing not implemented - would need PostgREST filter syntax conversion

        # Extract and apply ORDER BY
        order_match = re.search(
            r"\bORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?", sql_clean, re.IGNORECASE
        )
        if order_match:
            order_col = order_match.group(1)
            order_dir = order_match.group(2)
            logger.info(
                f"[TOOL:query_database] 🔍 ORDER BY detected: column={order_col}, direction={order_dir}"
            )
            if order_dir and order_dir.upper() == "DESC":
                logger.info(
                    f"[TOOL:query_database] 📊 Applying .order('{order_col}', desc=True)"
                )
                query = query.order(order_col, desc=True)
            else:
                logger.info(f"[TOOL:query_database] 📊 Applying .order('{order_col}')")
                query = query.order(order_col)
        else:
            logger.info("[TOOL:query_database] No ORDER BY clause detected")

        # Extract and apply LIMIT
        limit_match = re.search(r"\bLIMIT\s+(\d+)", sql_clean, re.IGNORECASE)
        if limit_match:
            limit_val = int(limit_match.group(1))
            query = query.limit(limit_val)
        else:
            query = query.limit(50)  # Safety default

        # Execute
        result = query.execute()
        results = result.data if result.data else []
        row_count = len(results) if isinstance(results, list) else 0

        logger.info(f"[TOOL:query_database] Success: {row_count} rows returned")

        return {"success": True, "results": results, "row_count": row_count}

    except Exception as e:
        logger.error(f"[TOOL:query_database] Query execution failed: {e}")
        return {"success": False, "error": str(e), "results": []}
