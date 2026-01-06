"""
Link Tag to Idea Tool - OpenAI Agent SDK Implementation

Tool for linking existing tags to ideas via the idea_tags junction table.
Uses agent_client (RLS-enforced Supabase client) for database operations.

Documentation: https://openai.github.io/openai-agents-python/tools/
"""

from typing import Any, Dict

from supabase import Client

from ...core.logging import get_logger

logger = get_logger(__name__)


def link_tag_to_idea(
    agent_client: Client,
    tag_id: int,
    idea_id: str,
    user_id: str,
) -> Dict[str, Any]:
    """
    Link an existing tag to an idea.

    Creates an entry in the idea_tags junction table.
    Both the tag and idea must exist and be owned by the user.

    Args:
        agent_client: RLS-enforced Supabase client
        tag_id: ID of the tag to link (integer)
        idea_id: UUID of the idea to link the tag to
        user_id: Human user's UUID for ownership verification

    Returns:
        Dict with success status and link details or error message

    Example:
        >>> link_tag_to_idea(client, 6, "abc-123-uuid", "user-uuid")
        {'success': True, 'link': {'tag_id': 6, 'idea_id': 'abc-123-uuid'}}
    """
    logger.info(f"Linking tag {tag_id} to idea {idea_id} for user {user_id}")

    try:
        # Validate tag_id is an integer
        if not isinstance(tag_id, int):
            try:
                tag_id = int(tag_id)
            except (ValueError, TypeError):
                return {
                    "success": False,
                    "error": f"Invalid tag_id: must be an integer, got {type(tag_id).__name__}",
                }

        # Validate idea_id is a non-empty string (UUID format)
        if not idea_id or not isinstance(idea_id, str):
            return {
                "success": False,
                "error": "Invalid idea_id: must be a non-empty UUID string",
            }

        # Verify the tag exists and belongs to the user
        tag_check = (
            agent_client.from_("tags")
            .select("id, name, user_id")
            .eq("id", tag_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not tag_check.data:
            return {
                "success": False,
                "error": f"Tag with id {tag_id} not found or not owned by user",
            }

        tag_name = tag_check.data[0]["name"]

        # Verify the idea exists and belongs to the user
        idea_check = (
            agent_client.from_("ideas")
            .select("id, title, user_id")
            .eq("id", idea_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not idea_check.data:
            return {
                "success": False,
                "error": f"Idea with id {idea_id} not found or not owned by user",
            }

        idea_title = idea_check.data[0]["title"]

        # Check if link already exists
        existing_link = (
            agent_client.from_("idea_tags")
            .select("id")
            .eq("tag_id", tag_id)
            .eq("idea_id", idea_id)
            .execute()
        )

        if existing_link.data:
            return {
                "success": True,
                "message": f"Tag '{tag_name}' is already linked to idea '{idea_title}'",
                "already_linked": True,
                "link": {
                    "tag_id": tag_id,
                    "tag_name": tag_name,
                    "idea_id": idea_id,
                    "idea_title": idea_title,
                },
            }

        # Create the link in idea_tags junction table
        link_result = (
            agent_client.from_("idea_tags")
            .insert({"tag_id": tag_id, "idea_id": idea_id})
            .execute()
        )

        if link_result.data:
            logger.info(
                f"Successfully linked tag '{tag_name}' (id={tag_id}) to idea '{idea_title}' (id={idea_id})"
            )
            return {
                "success": True,
                "message": f"Successfully linked tag '{tag_name}' to idea '{idea_title}'",
                "link": {
                    "id": link_result.data[0].get("id"),
                    "tag_id": tag_id,
                    "tag_name": tag_name,
                    "idea_id": idea_id,
                    "idea_title": idea_title,
                },
            }
        else:
            return {
                "success": False,
                "error": "Failed to create tag-idea link - no data returned",
            }

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error linking tag to idea: {error_msg}")

        # Handle unique constraint violation (already linked)
        if "duplicate key" in error_msg.lower() or "unique" in error_msg.lower():
            return {
                "success": False,
                "error": "This tag is already linked to this idea",
            }

        return {
            "success": False,
            "error": f"Failed to link tag to idea: {error_msg}",
        }
