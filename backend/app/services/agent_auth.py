"""Agent authentication service.

Provides agent-user authentication and RLS-enforced Supabase client creation.
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Dict, Optional

from supabase import Client, create_client

from ..core.config import settings
from ..core.errors import APIError
from ..db.supabase_client import get_admin_client
from .agent_credentials import get_agent_credentials

logger = logging.getLogger(__name__)

# Session cache: {user_id: {"access_token": str, "refresh_token": str, "expires_at": float}}
_agent_sessions: Dict[str, dict] = {}


def authenticate_agent_user(user_id: str) -> dict:
    """Authenticate agent-user and return session.

    Retrieves encrypted agent credentials, decrypts them, and authenticates
    the agent-user with Supabase. Caches the session for future use.

    Args:
        user_id: User's Supabase auth ID (human user)

    Returns:
        Dictionary with access_token, refresh_token, expires_at, agent_user_id

    Raises:
        APIError: If authentication fails
    """
    try:
        # Check cache first
        cached_session = _agent_sessions.get(user_id)
        if cached_session and cached_session["expires_at"] > time.time():
            logger.debug(f"Using cached agent session for user {user_id}")
            return cached_session

        # Retrieve and decrypt agent credentials
        credentials = get_agent_credentials(user_id)
        if not credentials:
            raise APIError(
                message="Agent credentials not found for user",
                status_code=404,
                error_code="AGENT_CREDENTIALS_NOT_FOUND",
            )

        agent_user_id, agent_email, agent_password = credentials

        # Authenticate agent-user with Supabase
        admin_client = get_admin_client()

        try:
            signin_response = admin_client.auth.sign_in_with_password(
                {
                    "email": agent_email,
                    "password": agent_password,
                }
            )
        except Exception as e:
            logger.error(f"Agent authentication failed for user {user_id}: {e}")
            raise APIError(
                message="Agent authentication failed",
                status_code=401,
                error_code="AGENT_AUTH_FAILED",
            )

        if not signin_response or not signin_response.session:
            raise APIError(
                message="Agent authentication returned no session",
                status_code=401,
                error_code="AGENT_AUTH_NO_SESSION",
            )

        session = signin_response.session
        access_token = session.access_token
        refresh_token = session.refresh_token
        expires_in = session.expires_in or 3600
        expires_at = time.time() + expires_in

        # Cache session
        session_data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": expires_at,
            "agent_user_id": agent_user_id,
        }
        _agent_sessions[user_id] = session_data

        # Update agent_last_used_at timestamp
        try:
            get_admin_client().table("user_profiles").update(
                {
                    "agent_last_used_at": "now()",
                }
            ).eq("id", user_id).execute()
        except Exception as e:
            logger.warning(f"Failed to update agent_last_used_at: {e}")

        logger.info(f"Agent authenticated for user {user_id}, expires in {expires_in}s")

        return session_data

    except APIError:
        raise
    except Exception as e:
        logger.error(f"Unexpected error authenticating agent: {e}")
        raise APIError(
            message="Agent authentication error",
            status_code=500,
            error_code="AGENT_AUTH_ERROR",
        )


def get_agent_client(user_id: str) -> Client:
    """Get RLS-enforced Supabase client for agent operations.

    Creates a Supabase client authenticated as the agent-user, ensuring all
    database operations are subject to RLS policies scoped to the user.

    Args:
        user_id: User's Supabase auth ID (human user)

    Returns:
        Supabase client authenticated as agent-user with RLS enforcement

    Raises:
        APIError: If client creation fails
    """
    try:
        # Authenticate agent and get session
        session = authenticate_agent_user(user_id)

        access_token = session["access_token"]
        agent_user_id = session["agent_user_id"]

        # Create Supabase client with agent's access token
        client = create_client(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_anon_key,  # Use anon key for RLS enforcement
        )

        # Set session with agent's token
        client.auth.set_session(access_token, session["refresh_token"])

        # Attach metadata for audit logging
        client.user_id = user_id  # Human user ID
        client.agent_user_id = agent_user_id  # Agent user ID

        logger.debug(f"Agent client created for user {user_id}")

        return client

    except APIError:
        raise
    except Exception as e:
        logger.error(f"Failed to create agent client: {e}")
        raise APIError(
            message="Failed to create agent client",
            status_code=500,
            error_code="AGENT_CLIENT_ERROR",
        )


def revoke_agent_session(user_id: str) -> None:
    """Revoke cached agent session.

    Clears cached session forcing re-authentication on next use.
    Useful for logout scenarios.

    Args:
        user_id: User's Supabase auth ID (human user)
    """
    if user_id in _agent_sessions:
        del _agent_sessions[user_id]
        logger.info(f"Agent session revoked for user {user_id}")


def refresh_agent_session(user_id: str) -> dict:
    """Refresh agent session using refresh token.

    Args:
        user_id: User's Supabase auth ID (human user)

    Returns:
        New session data with refreshed tokens

    Raises:
        APIError: If refresh fails
    """
    try:
        cached_session = _agent_sessions.get(user_id)
        if not cached_session:
            # No cached session, perform full authentication
            return authenticate_agent_user(user_id)

        refresh_token = cached_session["refresh_token"]

        # Refresh session with Supabase
        admin_client = get_admin_client()

        try:
            refresh_response = admin_client.auth.refresh_session(refresh_token)
        except Exception as e:
            logger.error(f"Agent session refresh failed for user {user_id}: {e}")
            # Clear cache and try full re-authentication
            del _agent_sessions[user_id]
            return authenticate_agent_user(user_id)

        if not refresh_response or not refresh_response.session:
            # Refresh failed, try full re-authentication
            del _agent_sessions[user_id]
            return authenticate_agent_user(user_id)

        session = refresh_response.session
        expires_in = session.expires_in or 3600
        expires_at = time.time() + expires_in

        # Update cache
        session_data = {
            "access_token": session.access_token,
            "refresh_token": session.refresh_token,
            "expires_at": expires_at,
            "agent_user_id": cached_session["agent_user_id"],
        }
        _agent_sessions[user_id] = session_data

        logger.info(f"Agent session refreshed for user {user_id}")

        return session_data

    except Exception as e:
        logger.error(f"Unexpected error refreshing agent session: {e}")
        raise APIError(
            message="Agent session refresh error",
            status_code=500,
            error_code="AGENT_SESSION_REFRESH_ERROR",
        )
