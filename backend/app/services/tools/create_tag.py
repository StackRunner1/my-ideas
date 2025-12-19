"""Create Tag Tool for OpenAI Agent SDK.

This tool allows agents to create new tags in the user's database.
Follows OpenAI Agent SDK patterns for tool implementation:
https://openai.github.io/openai-agents-python/tools/
"""

import re
from typing import Optional

from supabase import Client

from ...core.errors import APIError
from ...core.logging import get_logger

logger = get_logger(__name__)


def create_tag(
    agent_client: Client,
    tag_name: str,
    item_id: Optional[int] = None,
) -> dict:
    """Create a new tag in the user's database.

    This tool creates a tag and optionally links it to an item. The agent_client
    must be an RLS-enforced Supabase client authenticated as the agent-user.

    Args:
        agent_client: RLS-enforced Supabase client for the agent-user
        tag_name: Name of the tag to create (alphanumeric, hyphens, underscores, max 50 chars)
        item_id: Optional ID of an item to link the tag to

    Returns:
        dict: Result with success status, created tag data, and any error messages

    Raises:
        APIError: If validation fails or database operation fails

    Examples:
        >>> result = create_tag(client, "urgent")
        >>> result = create_tag(client, "bug-fix", item_id=42)
    """
    logger.info(f"create_tag called: tag_name={tag_name}, item_id={item_id}")

    # Validate tag_name format
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
        # If item_id provided, verify the item exists and user has access
        if item_id is not None:
            logger.info(f"Verifying item exists: item_id={item_id}")
            item_check = (
                agent_client.from_("ideas").select("id").eq("id", item_id).execute()
            )

            if not item_check.data:
                error_msg = f"Item with ID {item_id} not found or access denied"
                logger.error(error_msg)
                return {
                    "success": False,
                    "error": error_msg,
                    "error_code": "ITEM_NOT_FOUND",
                }
            logger.info(f"Item verified: item_id={item_id}")

        # Create the tag
        logger.info(f"Creating tag in database: {tag_name}")
        tag_result = agent_client.from_("tags").insert({"name": tag_name}).execute()

        if not tag_result.data:
            error_msg = "Failed to create tag - no data returned"
            logger.error(error_msg)
            return {
                "success": False,
                "error": error_msg,
                "error_code": "TAG_CREATION_FAILED",
            }

        created_tag = tag_result.data[0]
        logger.info(
            f"Tag created successfully: id={created_tag['id']}, name={created_tag['name']}"
        )

        # If item_id provided, link tag to item
        if item_id is not None:
            logger.info(f"Linking tag {created_tag['id']} to item {item_id}")
            link_result = (
                agent_client.from_("item_tags")
                .insert({"item_id": item_id, "tag_id": created_tag["id"]})
                .execute()
            )

            if not link_result.data:
                # Tag was created but linking failed - still return success with warning
                logger.warning(f"Tag created but linking to item {item_id} failed")
                return {
                    "success": True,
                    "tag": created_tag,
                    "warning": f"Tag created but could not link to item {item_id}",
                    "linked": False,
                }

            logger.info(f"Tag linked to item successfully")
            return {
                "success": True,
                "tag": created_tag,
                "linked": True,
                "item_id": item_id,
            }

        # Tag created without linking
        return {"success": True, "tag": created_tag, "linked": False}

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Database error in create_tag: {error_msg}", exc_info=True)

        # Check for duplicate tag error
        if "duplicate" in error_msg.lower() or "unique" in error_msg.lower():
            return {
                "success": False,
                "error": f"Tag '{tag_name}' already exists",
                "error_code": "DUPLICATE_TAG",
            }

        # Generic database error
        return {
            "success": False,
            "error": f"Database error: {error_msg}",
            "error_code": "DATABASE_ERROR",
        }
