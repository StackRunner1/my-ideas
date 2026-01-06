"""Search tags tool for Agent SDK.

Searches tags by name pattern with RLS enforcement.
"""

import re
from typing import Optional

from supabase import Client

from ...core.errors import APIError
from ...core.logging import get_logger

logger = get_logger(__name__)


def search_tags(
    agent_client: Client,
    query: str,
    limit: Optional[int] = 10,
    user_id: Optional[str] = None,
) -> dict:
    """Search for tags matching a query pattern.

    Args:
        agent_client: RLS-enforced Supabase client for database operations
        query: Search pattern (case-insensitive partial match)
        limit: Maximum number of results to return (default 10, max 50)
        user_id: Human user's UUID to filter tags by ownership

    Returns:
        dict: Result with success status and tag data
            {
                "success": True,
                "data": [{"id": 1, "name": "python", ...}, ...],
                "count": 5
            }
            or
            {
                "success": False,
                "error": "Error message"
            }
    """
    try:
        # Validate and cap limit
        if limit is None or limit < 1:
            limit = 10
        if limit > 50:
            limit = 50

        logger.info(
            f"[TOOL] search_tags: query='{query}', limit={limit}, user_id={user_id}"
        )

        # Search tags with case-insensitive pattern matching
        # Filter by user_id to only show human user's tags
        query_builder = (
            agent_client.from_("tags")
            .select("id, name, created_at")
            .ilike("name", f"%{query}%")
        )

        # Filter by user_id if provided
        if user_id:
            query_builder = query_builder.eq("user_id", user_id)

        response = query_builder.limit(limit).execute()

        tags = response.data if response.data else []
        count = len(tags)

        logger.info(f"[TOOL] search_tags: found {count} tags")

        return {
            "success": True,
            "data": tags,
            "count": count,
        }

    except Exception as e:
        error_msg = f"Failed to search tags: {str(e)}"
        logger.error(f"[TOOL] search_tags ERROR: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
        }
