"""
Ideas API Routes
Session 3, Unit 12: Ideas CRUD Operations

Provides RESTful endpoints for creating, reading, updating, and deleting ideas
with Row Level Security enforcement.
"""

from typing import Any, Dict, List
from uuid import UUID

from app.api.auth_utils import get_current_user, get_user_scoped_client
from app.core.errors import NotFoundError, ServerError
from app.core.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

logger = get_logger(__name__)
router = APIRouter()


# Pydantic Models
class CreateIdeaRequest(BaseModel):
    """Request model for creating a new idea."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    tags: List[str] = Field(default_factory=list)


class UpdateIdeaRequest(BaseModel):
    """Request model for updating an existing idea."""

    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = Field(None, pattern="^(draft|published|archived)$")
    tags: List[str] | None = None


@router.get("")
async def list_ideas(
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> List[Dict[str, Any]]:
    """
    Get all ideas visible to the current user.

    Returns ideas based on RLS policy:
    - All of the user's own ideas (any status)
    - Published ideas from other users

    This allows for collaborative features and agent-created ideas.

    Returns:
        List of idea objects
    """
    user_id = current_user["user"]["id"]

    try:
        # RLS policy handles access control:
        # - Returns user's own ideas (all statuses)
        # - Returns other users' published ideas
        # No need to filter by user_id here - let RLS do its job
        response = (
            supabase.table("ideas").select("*").order("created_at", desc=True).execute()
        )

        logger.info(
            f"Fetched {len(response.data)} ideas for user {user_id}",
            extra={"user_id": user_id, "count": len(response.data)},
        )

        return response.data

    except Exception as e:
        logger.error(
            f"Error fetching ideas: {str(e)}",
            extra={"user_id": user_id},
        )
        raise ServerError(f"Failed to fetch ideas: {str(e)}")


@router.get("/{idea_id}")
async def get_idea(
    idea_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> Dict[str, Any]:
    """
    Get a single idea by ID.

    Access is controlled by RLS:
    - User can view their own ideas (any status)
    - User can view published ideas from others

    Args:
        idea_id: UUID of the idea

    Returns:
        Idea object

    Raises:
        404: Idea not found or user doesn't have access
    """
    user_id = current_user["user"]["id"]

    try:
        # Let RLS handle access control - don't filter by user_id
        response = supabase.table("ideas").select("*").eq("id", idea_id).execute()

        if not response.data:
            raise NotFoundError(f"Idea {idea_id} not found")

        logger.info(
            f"Fetched idea {idea_id} for user {user_id}",
            extra={"user_id": user_id, "idea_id": idea_id},
        )

        return response.data[0]

    except NotFoundError:
        raise
    except Exception as e:
        logger.error(
            f"Error fetching idea {idea_id}: {str(e)}",
            extra={"user_id": user_id, "idea_id": idea_id},
        )
        raise ServerError(f"Failed to fetch idea: {str(e)}")


@router.post("", status_code=201)
async def create_idea(
    request: CreateIdeaRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> Dict[str, Any]:
    """
    Create a new idea.

    Args:
        request: Idea creation data

    Returns:
        Created idea object
    """
    user_id = current_user["user"]["id"]

    try:
        idea_data = {
            "user_id": user_id,
            "title": request.title,
            "description": request.description,
            "status": request.status,
            "tags": request.tags,
        }

        response = supabase.table("ideas").insert(idea_data).execute()

        if not response.data:
            raise ServerError("Failed to create idea: no data returned")

        created_idea = response.data[0]

        logger.info(
            f"Created idea {created_idea['id']} for user {user_id}",
            extra={
                "user_id": user_id,
                "idea_id": created_idea["id"],
                "title": request.title,
            },
        )

        return created_idea

    except Exception as e:
        logger.error(
            f"Error creating idea: {str(e)}",
            extra={"user_id": user_id, "title": request.title},
        )
        raise ServerError(f"Failed to create idea: {str(e)}")


@router.patch("/{idea_id}")
async def update_idea(
    idea_id: str,
    request: UpdateIdeaRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> Dict[str, Any]:
    """
    Update an existing idea.

    Args:
        idea_id: UUID of the idea to update
        request: Updated idea data

    Returns:
        Updated idea object

    Raises:
        404: Idea not found or user doesn't have access
    """
    user_id = current_user["user"]["id"]

    try:
        # Build update payload (only include provided fields)
        update_data = {}
        if request.title is not None:
            update_data["title"] = request.title
        if request.description is not None:
            update_data["description"] = request.description
        if request.status is not None:
            update_data["status"] = request.status
        if request.tags is not None:
            update_data["tags"] = request.tags

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        response = (
            supabase.table("ideas")
            .update(update_data)
            .eq("id", idea_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise NotFoundError(f"Idea {idea_id} not found")

        updated_idea = response.data[0]

        logger.info(
            f"Updated idea {idea_id} for user {user_id}",
            extra={"user_id": user_id, "idea_id": idea_id, "updates": update_data},
        )

        return updated_idea

    except NotFoundError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Error updating idea {idea_id}: {str(e)}",
            extra={"user_id": user_id, "idea_id": idea_id},
        )
        raise ServerError(f"Failed to update idea: {str(e)}")


@router.delete("/{idea_id}", status_code=204)
async def delete_idea(
    idea_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> None:
    """
    Delete an idea.

    Args:
        idea_id: UUID of the idea to delete

    Raises:
        404: Idea not found or user doesn't have access
    """
    user_id = current_user["user"]["id"]

    try:
        response = (
            supabase.table("ideas")
            .delete()
            .eq("id", idea_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise NotFoundError(f"Idea {idea_id} not found")

        logger.info(
            f"Deleted idea {idea_id} for user {user_id}",
            extra={"user_id": user_id, "idea_id": idea_id},
        )

    except NotFoundError:
        raise
    except Exception as e:
        logger.error(
            f"Error deleting idea {idea_id}: {str(e)}",
            extra={"user_id": user_id, "idea_id": idea_id},
        )
        raise ServerError(f"Failed to delete idea: {str(e)}")
