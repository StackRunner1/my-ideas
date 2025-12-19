"""Secure storage for agent-user credentials.

This module provides database-backed storage for agent credentials with encryption.
Agent passwords are encrypted using Fernet symmetric encryption before storage.
"""

import logging
import secrets
from typing import Optional, Tuple

from ..core.encryption import decrypt_password, encrypt_password
from ..core.errors import APIError
from ..db.supabase_client import get_admin_client

logger = logging.getLogger(__name__)


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
    user_id: str, agent_user_id: str, agent_password: str
) -> None:
    """Store agent credentials securely in database with encryption.

    Args:
        user_id: User's Supabase auth ID (human user)
        agent_user_id: Agent's Supabase auth ID
        agent_password: Agent's password (plaintext, will be encrypted)

    Raises:
        APIError: If storage fails
    """
    try:
        # Encrypt password
        encrypted_password = encrypt_password(agent_password)

        # Store in database using admin client (bypasses RLS)
        admin_client = get_admin_client()

        result = (
            admin_client.table("user_profiles")
            .update(
                {
                    "agent_user_id": agent_user_id,
                    "agent_credentials_encrypted": encrypted_password,
                    "agent_created_at": "now()",
                }
            )
            .eq("user_id", user_id)
            .execute()
        )

        if not result.data:
            raise APIError(
                message="Failed to store agent credentials",
                status_code=500,
                error_code="AGENT_CREDENTIALS_STORE_ERROR",
            )

        logger.info(f"Agent credentials stored for user {user_id}")

    except APIError:
        raise
    except Exception as e:
        logger.error(f"Failed to store agent credentials: {e}")
        raise APIError(
            message="Failed to store agent credentials",
            status_code=500,
            error_code="AGENT_CREDENTIALS_STORE_ERROR",
        )


def get_agent_credentials(user_id: str) -> Optional[Tuple[str, str, str]]:
    """Retrieve and decrypt agent credentials for a user.

    Args:
        user_id: User's Supabase auth ID

    Returns:
        Tuple of (agent_user_id, agent_email, agent_password) if found, None otherwise

    Raises:
        APIError: If retrieval or decryption fails
    """
    try:
        admin_client = get_admin_client()

        # Retrieve from database
        result = (
            admin_client.table("user_profiles")
            .select("agent_user_id, agent_credentials_encrypted")
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            logger.warning(f"No agent credentials found for user {user_id}")
            return None

        agent_user_id = result.data.get("agent_user_id")
        encrypted_password = result.data.get("agent_credentials_encrypted")

        if not agent_user_id or not encrypted_password:
            logger.warning(f"Incomplete agent credentials for user {user_id}")
            return None

        # Decrypt password
        agent_password = decrypt_password(encrypted_password)

        # Generate agent email (deterministic)
        agent_email = generate_agent_email(user_id)

        logger.debug(f"Agent credentials retrieved for user {user_id}")

        return (agent_user_id, agent_email, agent_password)

    except APIError:
        raise
    except Exception as e:
        logger.error(f"Failed to retrieve agent credentials: {e}")
        raise APIError(
            message="Failed to retrieve agent credentials",
            status_code=500,
            error_code="AGENT_CREDENTIALS_RETRIEVE_ERROR",
        )
