"""
List Ideas Tool - OpenAI Agent SDK Implementation

Lists all ideas for the current user from the database.
Enforces RLS via agent_client parameter.

Documentation: https://openai.github.io/openai-agents-python/tools/
"""

from typing import Optional

from supabase import Client

from ...core.logging import get_logger

logger = get_logger(__name__)


def list_ideas(
    agent_client: Client,
    status: Optional[str] = None,
    limit: int = 20,
    user_id: Optional[str] = None,
) -> dict:
    """
    List ideas with optional status filtering.

    RLS enforcement: Only returns ideas the agent-user has access to
    (user's own ideas based on RLS policy).

    Args:
        agent_client: RLS-enforced Supabase client
        status: Optional filter by status ('draft', 'published', 'archived')
        limit: Maximum results to return (default 20, max 100)
        user_id: Human user's UUID for ownership filtering

    Returns:
        dict: {
            "success": bool,
            "data": list of ideas or None,
            "count": number of results,
            "error": error message if failed
        }

    Example:
        >>> result = list_ideas(client, status="published", limit=10)
        >>> result["data"]  # List of published ideas
    """
    logger.info(f"Listing ideas: status={status}, limit={limit}, user_id={user_id}")

    # Validate status if provided
    valid_statuses = ["draft", "published", "archived"]
    if status and status not in valid_statuses:
        logger.warning(f"Invalid status filter: {status}")
        return {
            "success": False,
            "data": None,
            "count": 0,
            "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        }

    # Clamp limit to reasonable bounds
    limit = max(1, min(limit, 100))

    try:
        # Build query - RLS handles access control
        db_query = agent_client.from_("ideas").select("*")

        # Add status filter if provided
        if status:
            db_query = db_query.eq("status", status)

        # Add user_id filter if provided (for user's own ideas only)
        if user_id:
            db_query = db_query.eq("user_id", user_id)

        # Order by recency and apply limit
        db_query = db_query.order("created_at", desc=True).limit(limit)

        # Execute query
        response = db_query.execute()

        ideas = response.data if response.data else []
        count = len(ideas)

        logger.info(f"Listed {count} ideas")

        return {
            "success": True,
            "data": ideas,
            "count": count,
            "error": None,
        }

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error listing ideas: {error_msg}")
        return {
            "success": False,
            "data": None,
            "count": 0,
            "error": f"Database error: {error_msg}",
        }
