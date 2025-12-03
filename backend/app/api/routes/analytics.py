"""
Analytics API Routes
Session 3, Unit 11: Recharts Integration

Provides aggregated data for dashboard charts:
- Items created over time
- Items by status
- Tag usage statistics
"""

from typing import Any, Dict, List

from app.api.auth_utils import get_current_user, get_user_scoped_client
from app.core.errors import ServerError
from app.core.logging import get_logger
from fastapi import APIRouter, Depends, HTTPException

logger = get_logger(__name__)
router = APIRouter()


@router.get("/items-by-date")
async def get_items_by_date(
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> List[Dict[str, Any]]:
    """
    Get count of items created per day (last 30 days).

    Returns:
        List of {date: str, count: int} objects
    """
    user_id = current_user["user"]["id"]

    try:
        # Query the items_by_date view filtered by user
        response = supabase.table("items_by_date").select("date, count").execute()

        logger.info(
            f"Fetched items_by_date analytics for user {user_id}",
            extra={"user_id": user_id, "result_count": len(response.data)},
        )

        # Convert date objects to ISO strings for JSON serialization
        return [
            {"date": str(item["date"]), "count": item["count"]}
            for item in response.data
        ]

    except Exception as e:
        logger.error(
            f"Error fetching items_by_date analytics: {str(e)}",
            extra={"user_id": user_id},
        )
        raise ServerError(f"Failed to fetch analytics data: {str(e)}")


@router.get("/items-by-status")
async def get_items_by_status(
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> List[Dict[str, Any]]:
    """
    Get count of items by status.

    Returns:
        List of {status: str, count: int} objects
    """
    user_id = current_user["user"]["id"]

    try:
        # Query the items_by_status view filtered by user
        response = supabase.table("items_by_status").select("status, count").execute()

        logger.info(
            f"Fetched items_by_status analytics for user {user_id}",
            extra={"user_id": user_id, "result_count": len(response.data)},
        )

        return response.data

    except Exception as e:
        logger.error(
            f"Error fetching items_by_status analytics: {str(e)}",
            extra={"user_id": user_id},
        )
        raise ServerError(f"Failed to fetch analytics data: {str(e)}")


@router.get("/tags-usage")
async def get_tags_usage(
    current_user: Dict[str, Any] = Depends(get_current_user),
    supabase=Depends(get_user_scoped_client),
) -> List[Dict[str, Any]]:
    """
    Get top 10 most used tags.

    Returns:
        List of {label: str, usage_count: int} objects
    """
    user_id = current_user["user"]["id"]

    try:
        # Query the tags_usage view
        response = supabase.table("tags_usage").select("label, usage_count").execute()

        logger.info(
            f"Fetched tags_usage analytics for user {user_id}",
            extra={"user_id": user_id, "result_count": len(response.data)},
        )

        return response.data

    except Exception as e:
        logger.error(
            f"Error fetching tags_usage analytics: {str(e)}",
            extra={"user_id": user_id},
        )
        raise ServerError(f"Failed to fetch analytics data: {str(e)}")
