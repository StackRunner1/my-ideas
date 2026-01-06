"""
Edit Tag Tool - OpenAI Agent SDK Implementation

Updates an existing tag in the database.
Enforces RLS via agent_client parameter.

Documentation: https://openai.github.io/openai-agents-python/tools/
"""

import re
from typing import Optional

from supabase import Client

from ...core.logging import get_logger

logger = get_logger(__name__)


def edit_tag(
    agent_client: Client,
    tag_id: int,
    tag_name: str,
    user_id: Optional[str] = None,
) -> dict:
    """
    Update an existing tag's name in the database.

    RLS enforcement: Only tags owned by user_id can be updated.
    The agent_client ensures proper access control.

    Args:
        agent_client: RLS-enforced Supabase client
        tag_id: Integer ID of the tag to update (required)
        tag_name: New name for the tag (required, alphanumeric/hyphens/underscores, max 50 chars)
        user_id: Human user's UUID who owns this tag (required for RLS)

    Returns:
        dict: {
            "success": bool,
            "data": updated tag object or None,
            "error": error message if failed
        }

    Example:
        >>> result = edit_tag(
        ...     client,
        ...     tag_id=42,
        ...     tag_name="python-3",
        ...     user_id="user-uuid"
        ... )
        >>> result["data"]["name"]  # "python-3"
    """
    logger.info(f"Editing tag: tag_id={tag_id}, new_name='{tag_name}'")

    # Validate tag_id
    if tag_id is None or not isinstance(tag_id, int):
        error_msg = "tag_id must be an integer"
        logger.error(f"Validation failed: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "INVALID_TAG_ID"}

    # Validate user_id is provided
    if not user_id:
        error_msg = "user_id is required for RLS enforcement"
        logger.error(f"Validation failed: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "MISSING_USER_ID"}

    # Validate tag_name
    if not tag_name or not isinstance(tag_name, str):
        error_msg = "tag_name must be a non-empty string"
        logger.error(f"Validation failed: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "INVALID_TAG_NAME"}

    # Trim and normalize
    tag_name = tag_name.strip().lower()

    # Validate length
    if len(tag_name) > 50:
        error_msg = (
            f"tag_name exceeds maximum length of 50 characters (got {len(tag_name)})"
        )
        logger.error(f"Validation failed: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "TAG_NAME_TOO_LONG"}

    # Validate format: alphanumeric, hyphens, underscores only
    if not re.match(r"^[a-z0-9_-]+$", tag_name):
        error_msg = "tag_name can only contain lowercase letters, numbers, hyphens, and underscores"
        logger.error(f"Validation failed: {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "error_code": "INVALID_TAG_FORMAT",
        }

    try:
        # First verify tag exists and user owns it
        logger.info(f"Verifying tag ownership: tag_id={tag_id}, user_id={user_id}")
        existing = (
            agent_client.from_("tags")
            .select("id, name, user_id")
            .eq("id", tag_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not existing.data:
            error_msg = f"Tag with id '{tag_id}' not found or access denied"
            logger.warning(f"Tag not found: {error_msg}")
            return {"success": False, "error": error_msg, "error_code": "TAG_NOT_FOUND"}

        old_name = existing.data[0].get("name", "unknown")

        # Check if new name would create a duplicate
        duplicate_check = (
            agent_client.from_("tags")
            .select("id")
            .eq("name", tag_name)
            .eq("user_id", user_id)
            .neq("id", tag_id)  # Exclude current tag
            .execute()
        )

        if duplicate_check.data:
            error_msg = f"A tag with name '{tag_name}' already exists"
            logger.warning(f"Duplicate tag: {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "error_code": "DUPLICATE_TAG_NAME",
            }

        # Perform the update
        logger.info(f"Updating tag: {old_name} -> {tag_name}")
        result = (
            agent_client.from_("tags")
            .update({"name": tag_name})
            .eq("id", tag_id)
            .eq("user_id", user_id)
            .execute()
        )

        if result.data:
            updated_tag = result.data[0]
            logger.info(
                f"✅ Tag updated successfully: id={updated_tag.get('id')}, name={updated_tag.get('name')}"
            )
            return {
                "success": True,
                "data": updated_tag,
                "message": f"Tag renamed from '{old_name}' to '{tag_name}' successfully",
            }
        else:
            error_msg = "Update returned no data - tag may not exist or access denied"
            logger.error(f"Update failed: {error_msg}")
            return {"success": False, "error": error_msg, "error_code": "UPDATE_FAILED"}

    except Exception as e:
        error_msg = f"Database error while updating tag: {str(e)}"
        logger.exception(f"Exception in edit_tag: {error_msg}")
        return {"success": False, "error": error_msg, "error_code": "DATABASE_ERROR"}
