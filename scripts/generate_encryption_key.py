"""Script to generate secure encryption key for agent credentials.

Run this script once to generate the ENCRYPTION_KEY for your .env file.
The key is a base64-encoded Fernet key (32 bytes).

Usage:
    python scripts/generate_encryption_key.py
"""

from cryptography.fernet import Fernet


def generate_encryption_key() -> str:
    """Generate a secure Fernet encryption key.
    
    Returns:
        Base64-encoded Fernet key (44 characters)
    """
    key = Fernet.generate_key()
    return key.decode('utf-8')


if __name__ == "__main__":
    key = generate_encryption_key()
    
    print("=" * 60)
    print("ENCRYPTION KEY GENERATED")
    print("=" * 60)
    print(f"\nAdd this to your backend/.env file:\n")
    print(f"ENCRYPTION_KEY={key}")
    print("\n" + "=" * 60)
    print("SECURITY WARNINGS:")
    print("=" * 60)
    print("1. Never commit this key to git")
    print("2. Store securely (password manager, secrets vault)")
    print("3. Rotate periodically in production")
    print("4. If key is lost, agent credentials cannot be decrypted")
    print("5. Different keys for dev/staging/production")
    print("=" * 60)
