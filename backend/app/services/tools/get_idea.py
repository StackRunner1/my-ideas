"""
Get Idea Tool - OpenAI Agent SDK Implementation

Retrieves a single idea by ID from the database.
Enforces RLS via agent_client parameter.

Documentation: https://openai.github.io/openai-agents-python/tools/
"""

from typing import Optional, Union

from supabase import Client

from ...core.logging import get_logger

logger = get_logger(__name__)


def get_idea(
    agent_client: Client,
    idea_id: Union[str, int],
    user_id: Optional[str] = None,
) -> dict:
    """
    Retrieve a single idea by its ID.

    RLS enforcement: Only returns the idea if agent-user has access
    (own idea or published idea from others based on RLS policy).

    Args:
        agent_client: RLS-enforced Supabase client
        idea_id: UUID or integer ID of the idea to retrieve
        user_id: Human user's UUID for ownership verification (optional)

    Returns:
        dict: {
            "success": bool,
            "data": idea object or None,
            "error": error message if failed
        }

    Example:
        >>> result = get_idea(client, "550e8400-e29b-41d4-a716-446655440000")
        >>> result["data"]["title"]  # "My Great Idea"
    """
    logger.info(f"Getting idea: id={idea_id}")

    # Validate idea_id
    if not idea_id:
        logger.warning("Idea ID is required")
        return {
            "success": False,
            "data": None,
            "error": "Idea ID is required",
        }

    # Convert to string for UUID comparison
    idea_id_str = str(idea_id)

    try:
        # Query for the idea - RLS handles access control
        db_query = agent_client.from_("ideas").select("*").eq("id", idea_id_str)

        # Add user_id filter if provided (for strict ownership check)
        if user_id:
            db_query = db_query.eq("user_id", user_id)

        response = db_query.execute()

        if not response.data or len(response.data) == 0:
            logger.info(f"Idea {idea_id} not found or access denied")
            return {
                "success": False,
                "data": None,
                "error": f"Idea with ID '{idea_id}' not found or you don't have access",
            }

        idea = response.data[0]
        logger.info(f"Retrieved idea: id={idea_id}, title='{idea.get('title', 'N/A')}'")

        return {
            "success": True,
            "data": idea,
            "error": None,
        }

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error getting idea {idea_id}: {error_msg}")
        return {
            "success": False,
            "data": None,
            "error": f"Database error: {error_msg}",
        }
