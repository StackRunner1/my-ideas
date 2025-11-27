"""Secure storage for agent-user credentials.

This module provides a simple in-memory storage for agent credentials.
In production, this should be replaced with a secure secrets manager
(e.g., AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).

WARNING: In-memory storage is lost on server restart. For production,
implement persistent secure storage.
"""

import secrets
from typing import Dict, Optional, Tuple

# In-memory storage: {user_id: (agent_email, agent_password)}
_agent_credentials: Dict[str, Tuple[str, str]] = {}


def generate_agent_email(user_id: str) -> str:
    """Generate agent email for a user.

    Args:
        user_id: User's Supabase auth ID

    Returns:
        Agent email in format: agent_{user_id}@code45.internal
    """
    return f"agent_{user_id}@code45.internal"


def generate_secure_password(length: int = 32) -> str:
    """Generate a cryptographically secure random password.

    Args:
        length: Password length (default 32)

    Returns:
        Secure random password string
    """
    return secrets.token_urlsafe(length)


def store_agent_credentials(
    user_id: str, agent_email: str, agent_password: str
) -> None:
    """Store agent credentials securely.

    In production, this should write to a secrets manager instead of memory.

    Args:
        user_id: User's Supabase auth ID
        agent_email: Agent's email address
        agent_password: Agent's password (plaintext, will be hashed by Supabase)
    """
    _agent_credentials[user_id] = (agent_email, agent_password)


def get_agent_credentials(user_id: str) -> Optional[Tuple[str, str]]:
    """Retrieve agent credentials for a user.

    Args:
        user_id: User's Supabase auth ID

    Returns:
        Tuple of (agent_email, agent_password) if found, None otherwise
    """
    return _agent_credentials.get(user_id)
