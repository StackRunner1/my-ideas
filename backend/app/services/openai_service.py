"""OpenAI service for AI integrations.

Provides utilities for OpenAI API interactions including client setup,
token estimation, and cost calculation.
"""

import logging
import time
from typing import Optional

import tiktoken
from openai import OpenAI, OpenAIError, RateLimitError, Timeout

from ..core.config import settings
from ..core.errors import APIError

logger = logging.getLogger(__name__)

# Pricing per 1M tokens (as of Dec 2024)
# GPT-4o-mini pricing
PRICING = {
    "gpt-4o-mini": {"input": 0.150, "output": 0.600},  # per 1M tokens
    "gpt-4o": {"input": 5.00, "output": 15.00},
    "gpt-4": {"input": 30.00, "output": 60.00},
}


def get_openai_client() -> OpenAI:
    """Get configured OpenAI client with timeout and retry settings.

    Returns:
        Configured OpenAI client instance

    Raises:
        APIError: If client cannot be initialized
    """
    try:
        client = OpenAI(
            api_key=settings.openai_api_key,
            timeout=settings.openai_timeout_seconds,
            max_retries=2,
        )
        return client
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI client: {e}")
        raise APIError(
            code="OPENAI_CLIENT_ERROR",
            message="Failed to initialize OpenAI client",
            status_code=500,
        )


def estimate_tokens(text: str, model: str = "gpt-4o-mini") -> int:
    """Estimate token count for text using tiktoken.

    Args:
        text: Text to estimate tokens for
        model: OpenAI model name (default: gpt-4o-mini)

    Returns:
        Estimated token count
    """
    try:
        # Get encoding for model
        encoding = tiktoken.encoding_for_model(model)
        tokens = encoding.encode(text)
        return len(tokens)
    except Exception as e:
        logger.warning(f"Token estimation failed, using rough estimate: {e}")
        # Rough estimate: ~4 characters per token
        return len(text) // 4


def calculate_cost(
    prompt_tokens: int, completion_tokens: int, model: str = "gpt-4o-mini"
) -> float:
    """Calculate cost for OpenAI API call.

    Args:
        prompt_tokens: Number of tokens in prompt
        completion_tokens: Number of tokens in completion
        model: OpenAI model name

    Returns:
        Cost in USD
    """
    if model not in PRICING:
        logger.warning(f"Unknown model {model}, using gpt-4o-mini pricing")
        model = "gpt-4o-mini"

    pricing = PRICING[model]
    input_cost = (prompt_tokens / 1_000_000) * pricing["input"]
    output_cost = (completion_tokens / 1_000_000) * pricing["output"]

    return input_cost + output_cost


async def test_openai_connection() -> dict:
    """Test OpenAI API connectivity.

    Returns:
        Dictionary with connection status and model info

    Raises:
        APIError: If connection test fails
    """
    try:
        client = get_openai_client()

        # Make a minimal API call to test connectivity
        start_time = time.perf_counter()
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[{"role": "user", "content": "test"}],
            max_tokens=5,
        )
        latency_ms = int((time.perf_counter() - start_time) * 1000)

        logger.info(
            f"OpenAI connection test successful: model={settings.openai_model}, "
            f"latency={latency_ms}ms"
        )

        return {
            "status": "healthy",
            "model": settings.openai_model,
            "latency_ms": latency_ms,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
        }

    except RateLimitError as e:
        logger.error(f"OpenAI rate limit exceeded: {e}")
        raise APIError(
            code="OPENAI_RATE_LIMIT",
            message="OpenAI rate limit exceeded",
            status_code=429,
        )
    except Timeout as e:
        logger.error(f"OpenAI request timeout: {e}")
        raise APIError(
            code="OPENAI_TIMEOUT",
            message="OpenAI request timeout",
            status_code=504,
        )
    except OpenAIError as e:
        logger.error(f"OpenAI API error: {e}")
        raise APIError(
            code="OPENAI_API_ERROR",
            message="OpenAI API error",
            status_code=500,
        )
    except Exception as e:
        logger.error(f"Unexpected error testing OpenAI connection: {e}")
        raise APIError(
            code="OPENAI_CONNECTION_ERROR",
            message="Failed to test OpenAI connection",
            status_code=500,
        )
