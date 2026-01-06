"""
Edit Idea Tool - OpenAI Agent SDK Implementation

Updates an existing idea in the database.
Enforces RLS via agent_client parameter.

Documentation: https://openai.github.io/openai-agents-python/tools/
"""

import re
from typing import List, Optional

from supabase import Client

from ...core.logging import get_logger

logger = get_logger(__name__)


def edit_idea(
    agent_client: Client,
    idea_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    user_id: Optional[str] = None,
) -> dict:
    """
    Update an existing idea in the database.

    RLS enforcement: Only ideas owned by user_id can be updated.
    The agent_client ensures proper access control.

    Args:
        agent_client: RLS-enforced Supabase client
        idea_id: UUID of the idea to update (required)
        title: New title for the idea (optional, 1-200 characters if provided)
        description: New description for the idea (optional)
        status: New status ('draft', 'published', 'archived') (optional)
        user_id: Human user's UUID who owns this idea (required for RLS)

    Returns:
        dict: {
            "success": bool,
            "data": updated idea object or None,
            "error": error message if failed
        }

    Example:
        >>> result = edit_idea(
        ...     client,
        ...     idea_id="uuid-here",
        ...     title="Updated title",
        ...     status="published",
        ...     user_id="user-uuid"
        ... )
        >>> result["data"]["title"]  # "Updated title"
    """
    logger.info(f"Editing idea: idea_id='{idea_id}'")

    # Validate idea_id
    if not idea_id or not isinstance(idea_id, str):
        error_msg = "idea_id must be a non-empty string"
        logger.error(f"Validation failed: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "INVALID_IDEA_ID"}

    # Validate user_id is provided
    if not user_id:
        error_msg = "user_id is required for RLS enforcement"
        logger.error(f"Validation failed: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "MISSING_USER_ID"}

    # Build update payload - only include fields that were provided
    update_data = {}

    if title is not None:
        # Validate title
        title = title.strip()
        if not title:
            error_msg = "title cannot be empty"
            logger.error(f"Validation failed: {error_msg}")
            return {"success": False, "error": error_msg, "error_code": "EMPTY_TITLE"}

        if len(title) > 200:
            error_msg = (
                f"title exceeds maximum length of 200 characters (got {len(title)})"
            )
            logger.error(f"Validation failed: {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "error_code": "TITLE_TOO_LONG",
            }

        update_data["title"] = title

    if description is not None:
        update_data["description"] = description.strip() if description else None

    if status is not None:
        valid_statuses = ["draft", "published", "archived"]
        if status not in valid_statuses:
            error_msg = f"status must be one of: {', '.join(valid_statuses)}"
            logger.error(f"Validation failed: {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "error_code": "INVALID_STATUS",
            }
        update_data["status"] = status

    # Check if any fields to update
    if not update_data:
        error_msg = "No fields provided to update. Provide at least one of: title, description, status"
        logger.warning(f"No update: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "error_code": "NO_FIELDS_TO_UPDATE",
        }

    try:
        # First verify idea exists and user owns it
        logger.info(f"Verifying idea ownership: idea_id={idea_id}, user_id={user_id}")
        existing = (
            agent_client.from_("ideas")
            .select("id, title, user_id")
            .eq("id", idea_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not existing.data:
            error_msg = f"Idea with id '{idea_id}' not found or access denied"
            logger.warning(f"Idea not found: {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "error_code": "IDEA_NOT_FOUND",
            }

        # Perform the update
        logger.info(f"Updating idea: {update_data}")
        result = (
            agent_client.from_("ideas")
            .update(update_data)
            .eq("id", idea_id)
            .eq("user_id", user_id)
            .execute()
        )

        if result.data:
            updated_idea = result.data[0]
            logger.info(f"✅ Idea updated successfully: id={updated_idea.get('id')}")
            return {
                "success": True,
                "data": updated_idea,
                "message": f"Idea '{updated_idea.get('title', idea_id)}' updated successfully",
            }
        else:
            error_msg = "Update returned no data - idea may not exist or access denied"
            logger.error(f"Update failed: {error_msg}")
            return {"success": False, "error": error_msg, "error_code": "UPDATE_FAILED"}

    except Exception as e:
        error_msg = f"Database error while updating idea: {str(e)}"
        logger.exception(f"Exception in edit_idea: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "DATABASE_ERROR"}
