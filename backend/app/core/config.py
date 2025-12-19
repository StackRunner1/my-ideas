"""Configuration settings for the application.

Uses Pydantic BaseSettings to load environment variables with validation.
"""

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase Configuration
    supabase_url: str = Field(..., env="SUPABASE_URL")
    supabase_service_role_key: str = Field(..., env="SUPABASE_SERVICE_ROLE_KEY")
    supabase_anon_key: str = Field(..., env="SUPABASE_ANON_KEY")

    # Timeout and Retry Configuration
    supabase_timeout_seconds: int = Field(default=10, env="SUPABASE_TIMEOUT_SECONDS")
    supabase_retry_attempts: int = Field(default=3, env="SUPABASE_RETRY_ATTEMPTS")
    supabase_retry_backoff_seconds: float = Field(
        default=1.0, env="SUPABASE_RETRY_BACKOFF_SECONDS"
    )

    # Environment
    env: str = Field(default="local", env="ENV")

    # OpenAI Configuration
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL")
    openai_max_tokens: int = Field(default=4096, env="OPENAI_MAX_TOKENS")
    openai_temperature: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    openai_timeout_seconds: int = Field(default=30, env="OPENAI_TIMEOUT_SECONDS")

    # Encryption Configuration (optional - will be required when using agent features)
    encryption_key: str = Field(default="", env="ENCRYPTION_KEY")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
