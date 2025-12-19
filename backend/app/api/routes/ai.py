"""AI-related API routes."""

import time
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Request

from ...api.auth_utils import get_current_user
from ...models.responses_api import QueryResult, SQLQueryRequest
from ...services.agent_auth import get_agent_client
from ...services.openai_service import (calculate_cost, estimate_tokens,
                                        test_openai_connection)
from ...services.responses_service import process_query_request

router = APIRouter(prefix="/ai", tags=["ai"])

# Rate limiting: {user_id: [(timestamp, count)]}
_query_rate_limit: Dict[str, list] = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_QUERIES = 10


def check_rate_limit(user_id: str) -> bool:
    """Check if user has exceeded rate limit.

    Args:
        user_id: User's ID

    Returns:
        True if within limit, False if exceeded
    """
    now = time.time()

    # Initialize if first request
    if user_id not in _query_rate_limit:
        _query_rate_limit[user_id] = []

    # Clean old entries outside window
    _query_rate_limit[user_id] = [
        ts for ts in _query_rate_limit[user_id] if now - ts < RATE_LIMIT_WINDOW
    ]

    # Check limit
    if len(_query_rate_limit[user_id]) >= RATE_LIMIT_MAX_QUERIES:
        return False

    # Add new request
    _query_rate_limit[user_id].append(now)
    return True


@router.get("/health")
async def ai_health_check(request: Request):
    """Health check endpoint for AI services.

    Tests OpenAI API connectivity and returns status.

    Returns:
        Dictionary with OpenAI connection status and metrics
    """
    result = await test_openai_connection()
    result["request_id"] = getattr(request.state, "request_id", None)
    return result


@router.post("/query", response_model=QueryResult)
async def query_database(
    request: Request,
    query_request: SQLQueryRequest,
    current_user: Dict = Depends(get_current_user),
) -> QueryResult:
    """Generate and execute SQL query from natural language.

    This endpoint uses OpenAI Responses API to convert natural language
    questions into SQL queries, validates safety, and executes via RLS-enforced
    agent client.

    **Rate Limiting:** 10 queries per minute per user

    **Safety:** Only SELECT queries allowed, automatic RLS enforcement

    Args:
        request: FastAPI request object (for request_id)
        query_request: Natural language query and optional schema hints
        current_user: Authenticated user from dependency injection

    Returns:
        QueryResult with generated SQL, execution results, and metadata

    Raises:
        429: Rate limit exceeded
        401: Not authenticated
        400: Invalid query or unsafe SQL
        500: Server error

    Example:
        ```
        POST /api/v1/ai/query
        {
          "query": "Show me all items created this week",
          "include_explanation": true
        }
        ```
    """
    user_id = current_user["user"]["id"]
    request_id = getattr(request.state, "request_id", "unknown")

    # Rate limiting
    if not check_rate_limit(user_id):
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: {RATE_LIMIT_MAX_QUERIES} queries per minute",
        )

    try:
        # Get agent client for RLS-enforced database access
        agent_client = get_agent_client(user_id)

        # Process query request
        result = process_query_request(
            agent_client=agent_client,
            user_query=query_request.query,
            schema_hints=query_request.schema_context,
        )

        # Add token usage and cost if available
        if result.generated_sql:
            # Estimate tokens (rough approximation)
            prompt_tokens = estimate_tokens(
                query_request.query + str(query_request.schema_context or "")
            )
            completion_tokens = estimate_tokens(
                result.generated_sql + (result.explanation or "")
            )
            cost = calculate_cost(prompt_tokens, completion_tokens)

            result.token_usage = {
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
            }
            result.cost = cost

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Query processing failed: {str(e)}"
        )
