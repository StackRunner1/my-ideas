"""Authentication utilities and FastAPI dependencies.

Provides reusable dependencies for extracting and validating user tokens,
managing auth cookies, and creating user-scoped Supabase clients.
"""

import time
from typing import Any, Dict, Optional

from fastapi import Depends, HTTPException, Request, Response

from ..core.config import settings
from ..db.supabase_client import get_admin_client, get_user_client

# In-memory tracking for refresh cooldown
_last_refresh_time: Dict[str, float] = {}
REFRESH_COOLDOWN_SECONDS = 5


def _cookie_config() -> Dict[str, Any]:
    """Get environment-aware cookie configuration.

    Returns:
        Dictionary with cookie settings for httpOnly cookies:
        - secure: True for production, False for local/dev
        - samesite: "none" for production (cross-origin), "lax" for local
        - httponly: Always True (prevents JavaScript access)
    """
    is_production = settings.env.lower() == "production"

    return {
        "httponly": True,
        "secure": is_production,
        "samesite": "none" if is_production else "lax",
        "path": "/",
    }


def _set_auth_cookies(
    response: Response, access_token: str, refresh_token: str, expires_in: int
) -> None:
    """Set httpOnly authentication cookies on response.

    Args:
        response: FastAPI response object
        access_token: Supabase access token (JWT)
        refresh_token: Supabase refresh token
        expires_in: Token expiry time in seconds
    """
    cookie_config = _cookie_config()

    # Set access token cookie
    response.set_cookie(
        key="access_token", value=access_token, max_age=expires_in, **cookie_config
    )

    # Set refresh token cookie (longer expiry)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=expires_in * 24,  # Refresh token typically lasts much longer
        **cookie_config,
    )


def _extract_token_from_request(request: Request) -> Optional[str]:
    """Extract authentication token from request.

    Checks two sources in priority order:
    1. access_token httpOnly cookie (primary)
    2. Authorization: Bearer header (fallback for API clients)

    Args:
        request: FastAPI request object

    Returns:
        Token string if found, None otherwise
    """
    # Priority 1: Check cookie
    token = request.cookies.get("access_token")
    if token:
        return token

    # Priority 2: Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.replace("Bearer ", "")

    return None


async def get_current_user(request: Request, response: Response) -> Dict[str, Any]:
    """FastAPI dependency to get current authenticated user.

    Validates token, automatically refreshes if expired, and returns user data.
    Sets new auth cookies if token was refreshed.

    Args:
        request: FastAPI request object
        response: FastAPI response object

    Returns:
        Dictionary containing:
        - user: dict with id, email, and token

    Raises:
        HTTPException: 401 if authentication fails

    Usage:
        @app.get("/protected")
        async def protected_route(current_user = Depends(get_current_user)):
            user_id = current_user["user"]["id"]
            return {"message": f"Hello {user_id}"}
    """
    access_token = _extract_token_from_request(request)

    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        # Get admin client to validate token
        admin_client = get_admin_client()

        # Validate token and get user
        user_response = admin_client.auth.get_user(access_token)

        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = user_response.user

        return {"user": {"id": user.id, "email": user.email, "token": access_token}}

    except Exception as e:
        # Token might be expired, try to refresh
        refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            raise HTTPException(
                status_code=401, detail="Token expired and no refresh token available"
            )

        # Check refresh cooldown to prevent abuse
        user_key = refresh_token[:20]  # Use part of token as key
        current_time = time.time()

        if user_key in _last_refresh_time:
            time_since_last_refresh = current_time - _last_refresh_time[user_key]
            if time_since_last_refresh < REFRESH_COOLDOWN_SECONDS:
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {REFRESH_COOLDOWN_SECONDS - int(time_since_last_refresh)} seconds before refreshing",
                )

        try:
            # Attempt to refresh session
            admin_client = get_admin_client()

            # Version-agnostic refresh approach
            try:
                # Modern supabase-py (v2.x)
                refresh_response = admin_client.auth.refresh_session(refresh_token)
            except AttributeError:
                # Fallback for older versions
                refresh_response = admin_client.auth.refresh_session(
                    {"refresh_token": refresh_token}
                )

            if not refresh_response or not refresh_response.session:
                raise HTTPException(status_code=401, detail="Failed to refresh session")

            session = refresh_response.session
            new_access_token = session.access_token
            new_refresh_token = session.refresh_token
            expires_in = session.expires_in or 3600

            # Update refresh cooldown tracking
            _last_refresh_time[user_key] = current_time

            # Set new cookies
            _set_auth_cookies(response, new_access_token, new_refresh_token, expires_in)

            # Get user from refreshed session
            user = session.user

            return {
                "user": {"id": user.id, "email": user.email, "token": new_access_token}
            }

        except Exception as refresh_error:
            raise HTTPException(
                status_code=401, detail=f"Authentication failed: {str(refresh_error)}"
            )


async def get_user_scoped_client(request: Request, response: Response) -> Any:
    """FastAPI dependency to get Supabase client with user context.

    Creates a user-scoped Supabase client with RLS enforcement.
    Automatically validates session and refreshes token if needed.

    Args:
        request: FastAPI request object
        response: FastAPI response object

    Returns:
        Supabase client with:
        - RLS enforcement active
        - client.user_id: User's ID for convenience
        - client.token: User's access token
        - client.table(): Standard Supabase table queries
        - client.auth: Auth operations

    Raises:
        HTTPException: 401 if authentication fails

    Usage:
        @app.get("/my-data")
        async def get_my_data(client = Depends(get_user_scoped_client)):
            result = client.table("ideas").select("*").eq("user_id", client.user_id).execute()
            return result.data
    """
    # Get current user (validates and auto-refreshes)
    current_user = await get_current_user(request, response)

    user_data = current_user["user"]
    user_id = user_data["id"]
    token = user_data["token"]

    # Create user-scoped client
    client = get_user_client(token)

    # Attach user_id and token for convenience
    client.user_id = user_id
    client.token = token

    return client
