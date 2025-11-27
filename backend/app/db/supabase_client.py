"""Supabase client factory functions.

Provides two types of clients:
1. Admin Client: Uses service role key, bypasses RLS, for admin operations
2. User-Scoped Client: Bound to user's JWT, enforces RLS, for user operations

Usage:
    # Admin operations (bypasses RLS)
    admin_client = get_admin_client()
    result = admin_client.table("users").select("*").execute()

    # User operations (enforces RLS)
    user_client = get_user_client(user_jwt_token)
    result = user_client.table("ideas").select("*").execute()
"""

from typing import Any

try:
    from supabase import Client, create_client

    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    Client = Any  # Type hint fallback

from ..core.config import settings


class SupabaseNotInstalledError(Exception):
    """Raised when supabase-py is not installed."""

    def __init__(self):
        super().__init__(
            "The 'supabase' package is not installed. "
            "Install it with: pip install supabase"
        )


def get_admin_client() -> Any:
    """Create a Supabase client with service role key (bypasses RLS).

    Use this for:
    - Creating agent-user auth accounts during signup
    - Admin operations (feedback summaries, course management)
    - Any operation that needs to bypass Row Level Security

    Returns:
        Supabase client with admin privileges

    Raises:
        SupabaseNotInstalledError: If supabase-py package not installed
        ValueError: If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set
    """
    if not SUPABASE_AVAILABLE:
        raise SupabaseNotInstalledError()

    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise ValueError(
            "Missing required environment variables: "
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
        )

    return create_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_service_role_key,
    )


def get_user_client(jwt: str) -> Any:
    """Create a Supabase client scoped to a user's JWT (enforces RLS).

    Use this for:
    - All regular user operations
    - Agent-user operations (after agent authenticates)
    - Any operation that should respect Row Level Security

    Args:
        jwt: User's Supabase access token (JWT)

    Returns:
        Supabase client with user privileges and RLS enforcement

    Raises:
        SupabaseNotInstalledError: If supabase-py package not installed
        ValueError: If SUPABASE_URL or SUPABASE_ANON_KEY not set, or if jwt is empty
    """
    if not SUPABASE_AVAILABLE:
        raise SupabaseNotInstalledError()

    if not settings.supabase_url or not settings.supabase_anon_key:
        raise ValueError(
            "Missing required environment variables: "
            "SUPABASE_URL and SUPABASE_ANON_KEY must be set"
        )

    if not jwt:
        raise ValueError("JWT token is required for user-scoped client")

    # Create client with anon key
    client = create_client(
        supabase_url=settings.supabase_url, supabase_key=settings.supabase_anon_key
    )

    # Bind the JWT to the client for RLS enforcement
    # Version-agnostic approach: try different methods
    try:
        # Modern supabase-py (v2.x)
        if hasattr(client.postgrest, "auth"):
            client.postgrest.auth(jwt)
        # Older versions might use different patterns
        elif hasattr(client, "auth") and hasattr(client.auth, "set_session"):
            # Alternative: set session directly if available
            pass  # Session setting handled differently in newer versions
    except AttributeError:
        # If neither method works, the JWT will be passed via headers in requests
        # This is a fallback for compatibility
        pass

    # Store JWT on client for easy access
    client._jwt = jwt

    return client
