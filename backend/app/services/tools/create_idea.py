"""
Create Idea Tool - OpenAI Agent SDK Implementation

Creates a new idea in the database.
Enforces RLS via agent_client parameter.

Documentation: https://openai.github.io/openai-agents-python/tools/
"""

import re
from typing import List, Optional

from supabase import Client

from ...core.logging import get_logger

logger = get_logger(__name__)


def create_idea(
    agent_client: Client,
    title: str,
    description: Optional[str] = None,
    status: str = "draft",
    tags: Optional[List[str]] = None,
    user_id: Optional[str] = None,
) -> dict:
    """
    Create a new idea in the database.

    RLS enforcement: Idea is created with the provided user_id as owner.
    The agent_client ensures proper access control.

    Args:
        agent_client: RLS-enforced Supabase client
        title: Title of the idea (required, 1-200 characters)
        description: Optional detailed description of the idea
        status: Idea status ('draft', 'published', 'archived'). Default 'draft'
        tags: Optional list of tag strings to associate with the idea
        user_id: Human user's UUID who will own this idea (required)

    Returns:
        dict: {
            "success": bool,
            "data": created idea object or None,
            "error": error message if failed
        }

    Example:
        >>> result = create_idea(
        ...     client,
        ...     title="AI-powered todo app",
        ...     description="Build a todo app with AI prioritization",
        ...     status="draft",
        ...     tags=["ai", "productivity"],
        ...     user_id="user-uuid"
        ... )
        >>> result["data"]["id"]  # UUID of created idea
    """
    logger.info(f"Creating idea: title='{title[:50]}...', status={status}")

    # Validate title
    if not title or len(title.strip()) == 0:
        logger.warning("Title is required")
        return {
            "success": False,
            "data": None,
            "error": "Title is required and cannot be empty",
        }

    title = title.strip()
    if len(title) > 200:
        logger.warning(f"Title too long: {len(title)} characters")
        return {
            "success": False,
            "data": None,
            "error": "Title must be 200 characters or less",
        }

    # Validate status
    valid_statuses = ["draft", "published", "archived"]
    if status not in valid_statuses:
        logger.warning(f"Invalid status: {status}")
        return {
            "success": False,
            "data": None,
            "error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        }

    # Validate user_id is provided
    if not user_id:
        logger.warning("user_id is required for idea creation")
        return {
            "success": False,
            "data": None,
            "error": "User ID is required to create an idea",
        }

    # Validate tags if provided
    if tags:
        # Ensure tags is a list of strings
        if not isinstance(tags, list):
            tags = [str(tags)]
        # Clean and validate each tag
        cleaned_tags = []
        for tag in tags:
            tag_str = str(tag).strip().lower()
            if tag_str and len(tag_str) <= 50:
                # Allow alphanumeric, hyphens, underscores
                if re.match(r"^[a-z0-9_-]+$", tag_str):
                    cleaned_tags.append(tag_str)
        tags = cleaned_tags if cleaned_tags else None

    try:
        # Build the idea data
        idea_data = {
            "title": title,
            "description": description.strip() if description else None,
            "status": status,
            "user_id": user_id,
        }

        # Add tags if provided (stored as array in PostgreSQL)
        if tags:
            idea_data["tags"] = tags

        # Insert into database
        response = agent_client.from_("ideas").insert(idea_data).execute()

        if not response.data or len(response.data) == 0:
            logger.error("Insert returned no data")
            return {
                "success": False,
                "data": None,
                "error": "Failed to create idea - no data returned",
            }

        created_idea = response.data[0]
        logger.info(
            f"Idea created successfully: id={created_idea.get('id')}, title='{title}'"
        )

        return {
            "success": True,
            "data": created_idea,
            "error": None,
        }

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error creating idea: {error_msg}")

        # Check for common errors
        if "duplicate" in error_msg.lower():
            return {
                "success": False,
                "data": None,
                "error": "An idea with this title may already exist",
            }

        return {
            "success": False,
            "data": None,
            "error": f"Database error: {error_msg}",
        }
