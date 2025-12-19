"""Pydantic models for OpenAI Agent SDK implementation.

These models define the data structures for agent interactions,
following patterns from the OpenAI Agent SDK:
https://openai.github.io/openai-agents-python/ref/agent/
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class AgentAction(str, Enum):
    """Types of actions an agent can take."""

    ANSWER = "answer"  # Direct answer without tool use
    TOOL_CALL = "tool_call"  # Execute a tool
    CLARIFY = "clarify"  # Need more information from user
    REFUSE = "refuse"  # Cannot or should not fulfill request


class AgentResponse(BaseModel):
    """Agent's decision about how to handle a user request."""

    action: AgentAction
    message: str = Field(description="Message to display to the user")
    rationale: Optional[str] = Field(
        default=None,
        description="Internal reasoning for the action (for debugging/logging)",
    )
    tool_name: Optional[str] = Field(
        default=None, description="Name of tool to call (if action is TOOL_CALL)"
    )
    tool_params: Optional[Dict[str, Any]] = Field(
        default=None, description="Parameters for tool call (if action is TOOL_CALL)"
    )
    confidence: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        description="Confidence score for this action (0.0-1.0)",
    )
    needs_confirmation: bool = Field(
        default=False,
        description="Whether action requires user confirmation before executing",
    )

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        """Ensure confidence is between 0 and 1."""
        if not 0.0 <= v <= 1.0:
            raise ValueError(f"Confidence must be between 0.0 and 1.0, got {v}")
        return v

    @field_validator("tool_name")
    @classmethod
    def validate_tool_name(cls, v: Optional[str], info) -> Optional[str]:
        """Ensure tool_name is provided when action is TOOL_CALL."""
        if info.data.get("action") == AgentAction.TOOL_CALL and not v:
            raise ValueError("tool_name is required when action is TOOL_CALL")
        return v


class ToolExecutionResult(BaseModel):
    """Result of executing a tool."""

    tool_name: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    error_code: Optional[str] = None
    execution_time_ms: Optional[int] = Field(
        default=None, description="Tool execution time in milliseconds"
    )

    @field_validator("error")
    @classmethod
    def validate_error(cls, v: Optional[str], info) -> Optional[str]:
        """Ensure error message is provided when success is False."""
        if not info.data.get("success") and not v:
            raise ValueError("error message is required when success is False")
        return v


class ConversationMessage(BaseModel):
    """A message in the conversation history."""

    role: str = Field(description="Message role: 'user', 'assistant', or 'system'")
    content: str = Field(description="Message content")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="When the message was created"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None, description="Additional metadata (tool calls, confidence, etc.)"
    )

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        """Ensure role is valid."""
        if v not in ("user", "assistant", "system"):
            raise ValueError(
                f"role must be 'user', 'assistant', or 'system', got '{v}'"
            )
        return v


class ConversationContext(BaseModel):
    """Context for an agent conversation."""

    user_id: str = Field(description="ID of the user having the conversation")
    conversation_id: Optional[str] = Field(
        default=None, description="Optional conversation/session ID for tracking"
    )
    messages: List[ConversationMessage] = Field(
        default_factory=list, description="Conversation history"
    )
    agent_user_id: str = Field(
        description="ID of the agent-user (RLS-enforced identity)"
    )

    def add_message(
        self, role: str, content: str, metadata: Optional[Dict[str, Any]] = None
    ):
        """Add a message to the conversation history."""
        self.messages.append(
            ConversationMessage(role=role, content=content, metadata=metadata)
        )

    def get_recent_messages(self, limit: int = 10) -> List[ConversationMessage]:
        """Get the most recent N messages."""
        return self.messages[-limit:] if len(self.messages) > limit else self.messages

    def to_openai_format(self, limit: int = 10) -> List[Dict[str, str]]:
        """Convert recent messages to OpenAI API format."""
        recent = self.get_recent_messages(limit)
        return [{"role": msg.role, "content": msg.content} for msg in recent]


class AgentChatRequest(BaseModel):
    """Request to the agent chat endpoint."""

    message: str = Field(description="User's message to the agent")
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default=None, description="Previous conversation messages in OpenAI format"
    )
    conversation_id: Optional[str] = Field(
        default=None, description="Optional conversation ID for tracking"
    )


class AgentChatResponse(BaseModel):
    """Response from the agent chat endpoint."""

    message: str = Field(description="Agent's response message")
    action: AgentAction = Field(description="Action the agent took or wants to take")
    tool_result: Optional[ToolExecutionResult] = Field(
        default=None, description="Result of tool execution (if action was TOOL_CALL)"
    )
    needs_confirmation: bool = Field(
        default=False, description="Whether the action requires user confirmation"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Agent's confidence in the response"
    )
    conversation_id: Optional[str] = Field(
        default=None, description="Conversation ID for tracking"
    )
