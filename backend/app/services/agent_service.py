"""Agent service for AI-driven database operations.

Enables AI agents to perform CRUD operations on behalf of users using
standard Supabase auth and RLS enforcement.
"""

import time
from typing import Any, Dict, Optional

from ..db.supabase_client import get_admin_client, get_user_client
from .agent_credentials import get_agent_credentials

# Cache for agent sessions: {user_id: (access_token, expires_at)}
_agent_sessions: Dict[str, tuple[str, float]] = {}


def get_agent_session(user_id: str, force_refresh: bool = False) -> dict:
    """Get or create an agent session for a user.

    Retrieves agent credentials and authenticates the agent-user to get
    a valid Supabase session. Caches the session until expiry.

    Args:
        user_id: User's Supabase auth ID
        force_refresh: Force new session even if cached session exists

    Returns:
        Dictionary with:
        - access_token: Agent's Supabase JWT
        - refresh_token: Agent's refresh token
        - expires_in: Token expiry in seconds

    Raises:
        ValueError: If agent credentials not found for user
        Exception: If agent authentication fails
    """
    # Check cache first (unless force refresh)
    if not force_refresh and user_id in _agent_sessions:
        cached_token, expires_at = _agent_sessions[user_id]
        # Use cached token if still valid (with 5 min buffer)
        if time.time() < (expires_at - 300):
            return {"access_token": cached_token, "expires_at": expires_at}

    # Get agent credentials
    agent_creds = get_agent_credentials(user_id)
    if not agent_creds:
        raise ValueError(f"Agent credentials not found for user {user_id}")

    agent_email, agent_password = agent_creds

    # Authenticate agent
    admin_client = get_admin_client()

    try:
        signin_response = admin_client.auth.sign_in_with_password(
            {"email": agent_email, "password": agent_password}
        )
    except Exception as e:
        raise Exception(f"Agent authentication failed: {str(e)}")

    if not signin_response or not signin_response.session:
        raise Exception("Failed to create agent session")

    session = signin_response.session
    access_token = session.access_token
    expires_in = session.expires_in or 3600
    expires_at = time.time() + expires_in

    # Cache the session
    _agent_sessions[user_id] = (access_token, expires_at)

    return {
        "access_token": access_token,
        "refresh_token": session.refresh_token,
        "expires_in": expires_in,
        "expires_at": expires_at,
    }


def get_agent_client(user_id: str) -> Any:
    """Get a user-scoped Supabase client for the agent.

    Creates a Supabase client with the agent's JWT, enforcing RLS
    with agent's permissions. Agent operations use the SAME endpoints
    as user operations.

    Args:
        user_id: User's Supabase auth ID

    Returns:
        Supabase client with:
        - RLS enforcement (agent's context)
        - client.user_id: Original user's ID
        - client.agent_id: Agent's auth ID
        - client.token: Agent's access token

    Raises:
        ValueError: If agent credentials not found
        Exception: If agent session creation fails

    Usage:
        # In an endpoint that needs agent operations:
        agent_client = get_agent_client(user_id)
        result = agent_client.table("ideas").insert({
            "user_id": user_id,
            "title": "AI Generated Idea"
        }).execute()
    """
    # Get agent session
    session = get_agent_session(user_id)
    agent_token = session["access_token"]

    # Create user-scoped client with agent's token
    client = get_user_client(agent_token)

    # Attach metadata
    client.user_id = user_id  # Original user
    client.token = agent_token

    # Get agent's own ID from token
    try:
        admin_client = get_admin_client()
        agent_user = admin_client.auth.get_user(agent_token)
        if agent_user and agent_user.user:
            client.agent_id = agent_user.user.id
    except:
        pass  # Non-critical, agent_id is for logging

    return client


def refresh_agent_session(user_id: str) -> dict:
    """Force refresh of agent session.

    Args:
        user_id: User's Supabase auth ID

    Returns:
        New session data
    """
    return get_agent_session(user_id, force_refresh=True)


def clear_agent_session_cache(user_id: Optional[str] = None) -> None:
    """Clear cached agent sessions.

    Args:
        user_id: Specific user to clear, or None to clear all
    """
    if user_id:
        _agent_sessions.pop(user_id, None)
    else:
        _agent_sessions.clear()
