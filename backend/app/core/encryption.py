"""Encryption utilities for secure credential storage.

Provides Fernet symmetric encryption for agent passwords.
"""

import logging
from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken

from ..core.errors import APIError
from .config import settings

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_fernet() -> Fernet:
    """Get cached Fernet cipher instance.

    Returns:
        Fernet cipher instance

    Raises:
        APIError: If encryption key is invalid or missing
    """
    if not settings.encryption_key:
        logger.error("ENCRYPTION_KEY not set in environment variables")
        raise APIError(
            message="Encryption key not configured. Please set ENCRYPTION_KEY in .env file.",
            status_code=500,
            error_code="ENCRYPTION_KEY_MISSING",
        )

    try:
        key = settings.encryption_key.encode("utf-8")
        return Fernet(key)
    except Exception as e:
        logger.error("Failed to initialize Fernet cipher (key may be invalid)")
        raise APIError(
            message="Encryption initialization failed",
            status_code=500,
            error_code="ENCRYPTION_INIT_ERROR",
        )


def encrypt_password(password: str) -> str:
    """Encrypt password using Fernet symmetric encryption.

    Args:
        password: Plaintext password to encrypt

    Returns:
        Base64-encoded ciphertext

    Raises:
        APIError: If encryption fails
    """
    try:
        fernet = get_fernet()
        encrypted_bytes = fernet.encrypt(password.encode("utf-8"))
        encrypted_str = encrypted_bytes.decode("utf-8")

        # Never log plaintext password
        logger.debug("Password encrypted successfully")

        return encrypted_str

    except Exception as e:
        logger.error(f"Password encryption failed: {type(e).__name__}")
        raise APIError(
            message="Password encryption failed",
            status_code=500,
            error_code="ENCRYPTION_ERROR",
        )


def decrypt_password(encrypted: str) -> str:
    """Decrypt password using Fernet symmetric encryption.

    Args:
        encrypted: Base64-encoded ciphertext

    Returns:
        Plaintext password

    Raises:
        APIError: If decryption fails or ciphertext is invalid
    """
    try:
        fernet = get_fernet()
        encrypted_bytes = encrypted.encode("utf-8")
        decrypted_bytes = fernet.decrypt(encrypted_bytes)
        password = decrypted_bytes.decode("utf-8")

        # Never log plaintext password
        logger.debug("Password decrypted successfully")

        return password

    except InvalidToken:
        logger.error(
            "Password decryption failed: Invalid token (tampered or wrong key)"
        )
        raise APIError(
            message="Password decryption failed: Invalid credentials",
            status_code=500,
            error_code="DECRYPTION_INVALID_TOKEN",
        )
    except Exception as e:
        logger.error(f"Password decryption failed: {type(e).__name__}")
        raise APIError(
            message="Password decryption failed",
            status_code=500,
            error_code="DECRYPTION_ERROR",
        )


def rotate_encryption(old_encrypted: str, old_key: str, new_key: str) -> str:
    """Rotate encryption key for stored credentials.

    This function is for future key rotation scenarios. It decrypts with old key
    and re-encrypts with new key.

    Args:
        old_encrypted: Ciphertext encrypted with old key
        old_key: Old encryption key (base64-encoded Fernet key)
        new_key: New encryption key (base64-encoded Fernet key)

    Returns:
        New ciphertext encrypted with new key

    Raises:
        APIError: If rotation fails
    """
    try:
        # Decrypt with old key
        old_fernet = Fernet(old_key.encode("utf-8"))
        plaintext = old_fernet.decrypt(old_encrypted.encode("utf-8")).decode("utf-8")

        # Encrypt with new key
        new_fernet = Fernet(new_key.encode("utf-8"))
        new_encrypted = new_fernet.encrypt(plaintext.encode("utf-8")).decode("utf-8")

        logger.info("Encryption key rotation successful")

        return new_encrypted

    except Exception as e:
        logger.error(f"Encryption key rotation failed: {type(e).__name__}")
        raise APIError(
            message="Encryption key rotation failed",
            status_code=500,
            error_code="KEY_ROTATION_ERROR",
        )
