"""
Search Ideas Tool - OpenAI Agent SDK Implementation

Searches for ideas in the database by title, description, or status.
Enforces RLS via agent_client parameter.

Documentation: https://openai.github.io/openai-agents-python/tools/
"""

from typing import Optional

from supabase import Client

from ...core.logging import get_logger

logger = get_logger(__name__)


def search_ideas(
    agent_client: Client,
    query: str,
    status: Optional[str] = None,
    limit: int = 10,
    user_id: Optional[str] = None,
) -> dict:
    """
    Search for ideas by title/description text or status.

    RLS enforcement: Only returns ideas the agent-user has access to
    (user's own ideas or published ideas from others based on RLS policy).

    Args:
        agent_client: RLS-enforced Supabase client
        query: Search text to match against title and description (case-insensitive)
        status: Optional filter by status ('draft', 'published', 'archived')
        limit: Maximum results to return (default 10, max 50)
        user_id: Human user's UUID for ownership filtering (optional)

    Returns:
        dict: {
            "success": bool,
            "data": list of matching ideas or None,
            "count": number of results,
            "error": error message if failed
        }

    Example:
        >>> result = search_ideas(client, "python", status="published", limit=5)
        >>> result["data"]  # List of matching ideas
    """
    logger.info(f"Searching ideas: query='{query}', status={status}, limit={limit}")

    # Validate inputs
    if not query or len(query.strip()) == 0:
        logger.warning("Search query is empty")
        return {
            "success": False,
            "data": None,
            "count": 0,
            "error": "Search query cannot be empty",
        }

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
    limit = max(1, min(limit, 50))

    try:
        # Build query - RLS handles access control
        # Search in title and description using ilike (case-insensitive)
        search_pattern = f"%{query.strip()}%"

        db_query = agent_client.from_("ideas").select("*")

        # Add text search filter (title OR description contains query)
        # Using or_ filter for multi-column search
        db_query = db_query.or_(
            f"title.ilike.{search_pattern},description.ilike.{search_pattern}"
        )

        # Add status filter if provided
        if status:
            db_query = db_query.eq("status", status)

        # Add user_id filter if provided (for ownership queries)
        if user_id:
            db_query = db_query.eq("user_id", user_id)

        # Order by recency and apply limit
        db_query = db_query.order("created_at", desc=True).limit(limit)

        # Execute query
        response = db_query.execute()

        ideas = response.data if response.data else []
        count = len(ideas)

        logger.info(f"Search found {count} ideas matching '{query}'")

        return {
            "success": True,
            "data": ideas,
            "count": count,
            "error": None,
        }

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error searching ideas: {error_msg}")
        return {
            "success": False,
            "data": None,
            "count": 0,
            "error": f"Database error: {error_msg}",
        }
