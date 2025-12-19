"""
Agent SDK API Route - POST /api/v1/agent/chat

Endpoint for autonomous agent interactions using OpenAI Agent SDK.
Separate from Responses API (/api/v1/ai/query) - Part B implementation.

Documentation:
- Running Agents: https://openai.github.io/openai-agents-python/running_agents/
- Sessions: https://openai.github.io/openai-agents-python/sessions/
"""

from typing import Any, Dict

from agents import Runner, SQLiteSession
from fastapi import APIRouter, Depends, HTTPException, Request, status

from ...api.auth_utils import get_current_user
from ...core.errors import APIError
from ...core.logging import get_logger
from ...models.agent import AgentChatRequest, AgentChatResponse
from ...services.agent_auth import get_agent_client
from ...services.app_agents import create_orchestrator

logger = get_logger(__name__)
router = APIRouter()

# In-memory session store (simple implementation for now)
# TODO: Migrate to persistent session storage (file-based SQLite or Redis)
sessions: dict[str, SQLiteSession] = {}


@router.post("/chat", response_model=AgentChatResponse)
async def agent_chat(
    request_body: AgentChatRequest,
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> AgentChatResponse:
    """
    Agent SDK chat endpoint - autonomous agent interactions.

    This endpoint:
    1. Creates/retrieves session for conversation continuity
    2. Creates orchestrator agent with user context
    3. Runs agent with user query using Runner.run_sync
    4. Tracks actions, tool calls, and handoffs
    5. Returns structured response with agent output

    Args:
        request: Agent chat request with query and optional history
        current_user_id: Authenticated user ID (from agent-user credentials)
        request_id: Request ID for tracing

    Returns:
        AgentChatResponse with agent output, actions, and tool calls

    Raises:
        HTTPException: If agent execution fails

    Architecture:
        User Query
            ↓
        Orchestrator Agent
            ↓
        [Handoff to Specialist]
            ↓
        Items Agent OR Tags Agent
            ↓
        Tool Execution (create_tag, etc.)
            ↓
        Response to User
    """
    # Extract user ID and request ID
    user_id = current_user["id"]
    request_id = getattr(request.state, "request_id", "unknown")

    logger.info(
        f"Agent chat request from user {user_id}: '{request_body.query[:100]}...'",
        extra={"request_id": request_id, "user_id": user_id},
    )

    try:
        # Get agent client for RLS-enforced operations (Phase 1 implementation)
        agent_client = get_agent_client(user_id)
        logger.info(f"Retrieved agent client for user {user_id}")

        # Get or create session for conversation continuity
        session_id = request_body.session_id or f"session_{user_id}_{request_id}"

        if session_id not in sessions:
            # Create in-memory SQLite session (":memory:" = in-memory database)
            sessions[session_id] = SQLiteSession(session_id, ":memory:")
            logger.info(f"Created new session: {session_id}")
        else:
            logger.info(f"Using existing session: {session_id}")

        session = sessions[session_id]

        # Create orchestrator agent with RLS-enforced client
        orchestrator = create_orchestrator(agent_client)
        logger.info(f"Created orchestrator agent for user {user_id}")

        # Run agent with user query
        # Following SDK pattern: https://openai.github.io/openai-agents-python/running_agents/
        logger.info(f"Running agent with query: '{request_body.query}'")
        result = Runner.run_sync(
            agent=orchestrator,
            user_message=request_body.query,
            session=session,
        )

        logger.info(
            f"Agent execution complete. Final output length: {len(result.final_output)} chars"
        )

        # Extract actions and tool calls from result
        # TODO: Parse result.messages for detailed action tracking
        actions = []
        tool_calls = []
        final_agent = "Orchestrator"  # Track which agent provided final response

        # For now, simple response structure
        # Will enhance with detailed action/tool tracking in next iteration
        response = AgentChatResponse(
            success=True,
            response=result.final_output,
            actions=actions,
            tool_calls=tool_calls,
            session_id=session_id,
            agent_used=final_agent,
            error=None,
        )

        logger.info(f"Agent chat successful for user {user_id}")
        return response

    except Exception as e:
        error_msg = str(e)
        logger.error(
            f"Agent chat failed: {error_msg}",
            exc_info=True,
            extra={"request_id": request_id, "user_id": user_id},
        )

        # Return error response
        return AgentChatResponse(
            success=False,
            response=f"I encountered an error while processing your request: {error_msg}",
            actions=[],
            tool_calls=[],
            session_id=request_body.session_id or "",
            agent_used="System",
            error=error_msg,
        )
