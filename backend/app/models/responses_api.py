"""Pydantic models for OpenAI Responses API integration.

Defines structured output models for SQL generation and query results.
"""

import re
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


class QueryType(str, Enum):
    """Types of queries the Responses API can handle."""

    SQL_GENERATION = "sql_generation"
    DATA_ANALYSIS = "data_analysis"
    SUMMARIZATION = "summarization"


class ResponsesAPIOutput(BaseModel):
    """Structured output from OpenAI Responses API for SQL generation.

    This model is used for OpenAI Responses API calls with strict mode,
    ensuring the LLM returns structured, validated data.

    NOTE: All fields are required by OpenAI strict mode.
    - generated_sql is ALWAYS a string (even for unsafe requests, use placeholder)
    - Other nullable fields use union types (T | None)
    """

    query_type: QueryType = Field(..., description="Type of query being processed")

    # ALWAYS required - for unsafe requests, use placeholder like "-- Denied: unsafe operation"
    generated_sql: str = Field(
        ..., description="Generated SQL query or denial message for unsafe requests"
    )

    explanation: str = Field(
        ..., description="Natural language explanation of what the query does"
    )

    safety_check: bool = Field(
        ..., description="Whether the SQL passed safety validation"
    )

    # Nullable fields using union types for strict mode compatibility
    confidence: float | None = Field(
        default=None,
        description="Confidence score for the generated query (0.0-1.0)",
    )

    warnings: List[str] | None = Field(
        default=None, description="Any warnings about the query"
    )

    @field_validator("generated_sql")
    @classmethod
    def validate_sql_safety(cls, v: str) -> str:
        """Basic SQL safety validation.

        Note: For denied/unsafe requests, LLM should return a SQL comment placeholder
        like '-- SQL generation denied: unsafe operation' which will pass validation.
        """
        if not v:
            raise ValueError("generated_sql cannot be empty")

        # Allow SQL comment placeholders for denied requests
        if v.strip().startswith("--"):
            return v

        sql_upper = v.upper().strip()

        # Dangerous patterns
        dangerous_patterns = [
            r"\bDROP\s+",
            r"\bTRUNCATE\s+",
            r"\bALTER\s+",
            r"\bCREATE\s+",
            r"\bGRANT\s+",
            r"\bREVOKE\s+",
            r";\s*DROP\s+",  # SQL injection attempt
            r"--",  # SQL comments (can hide malicious code)
            r"/\*",  # Block comments
        ]

        for pattern in dangerous_patterns:
            if re.search(pattern, sql_upper):
                raise ValueError(f"Unsafe SQL pattern detected: {pattern}")

        # DELETE without WHERE is dangerous
        if re.search(r"\bDELETE\s+FROM\s+\w+\s*(?!WHERE)", sql_upper):
            raise ValueError("DELETE without WHERE clause not allowed")

        # UPDATE without WHERE is dangerous
        if re.search(r"\bUPDATE\s+\w+\s+SET\s+.*(?!WHERE)", sql_upper):
            raise ValueError("UPDATE without WHERE clause not allowed")

        return v

    def validate_sql_safety_check(self) -> tuple[bool, List[str]]:
        """Comprehensive SQL safety validation.

        Returns:
            Tuple of (is_safe, warnings)
        """
        if not self.generated_sql:
            return True, []

        sql_upper = self.generated_sql.upper().strip()

        # SQL comment placeholders for denied requests are considered "safe" (won't execute)
        if sql_upper.startswith("--"):
            return True, ["Query was denied - SQL comment placeholder returned"]

        warnings = []

        # Must be SELECT query
        if not sql_upper.startswith("SELECT"):
            return False, ["Only SELECT queries are allowed"]

        # Check for LIMIT clause (recommended for safety)
        if "LIMIT" not in sql_upper:
            warnings.append("Consider adding LIMIT clause to prevent large result sets")

        # Check for potentially expensive operations
        if "JOIN" in sql_upper:
            count = sql_upper.count("JOIN")
            if count > 3:
                warnings.append(f"Query has {count} JOINs which may be slow")

        return True, warnings


class Message(BaseModel):
    """Single message in conversation history."""

    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class QuerySettings(BaseModel):
    """Optional AI query settings."""

    temperature: float = Field(
        default=0.7,
        ge=0.0,
        le=2.0,
        description="Controls randomness. Lower = focused, higher = creative",
    )
    max_tokens: int = Field(
        default=2000, ge=100, le=8192, description="Maximum response tokens"
    )


class SQLQueryRequest(BaseModel):
    """Request model for SQL query generation."""

    model_config = {"populate_by_name": True}

    query: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Natural language question to convert to SQL",
    )

    conversation_history: Optional[List[Message]] = Field(
        default=None,
        alias="conversationHistory",
        description="Previous messages in conversation for context",
        max_length=20,
    )

    settings: Optional[QuerySettings] = Field(
        default=None, description="Optional AI query settings"
    )

    schema_context: Optional[Dict[str, Any]] = Field(
        None, description="Optional schema hints (table names, column hints)"
    )

    include_explanation: bool = Field(
        default=True, description="Whether to include natural language explanation"
    )


class TokenUsage(BaseModel):
    """Token usage metrics from OpenAI API call."""

    prompt_tokens: int = Field(..., ge=0)
    completion_tokens: int = Field(..., ge=0)
    total_tokens: int = Field(..., ge=0)


class QueryResult(BaseModel):
    """Response model for SQL query execution."""

    success: bool = Field(..., description="Whether query executed successfully")

    query_type: QueryType = Field(
        default=QueryType.SQL_GENERATION, description="Type of query processed"
    )

    generated_sql: Optional[str] = Field(
        None, description="The SQL query that was generated and executed"
    )

    explanation: Optional[str] = Field(
        None, description="Natural language explanation of the query"
    )

    results: List[Dict[str, Any]] = Field(
        default_factory=list, description="Query results as list of dictionaries"
    )

    row_count: int = Field(default=0, ge=0, description="Number of rows returned")

    token_usage: Optional[TokenUsage] = Field(None, description="Token usage metrics")

    cost: Optional[float] = Field(None, ge=0.0, description="Estimated cost in USD")

    warnings: List[str] | None = Field(
        default=None, description="Any warnings about the query execution"
    )

    error: Optional[str] = Field(None, description="Error message if query failed")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "query_type": "sql_generation",
                "generated_sql": "SELECT * FROM items WHERE created_at > NOW() - INTERVAL '7 days' LIMIT 10",
                "explanation": "This query retrieves all items created in the last 7 days, limited to 10 results",
                "results": [
                    {
                        "id": "123",
                        "title": "My idea",
                        "created_at": "2024-12-15T10:00:00Z",
                    }
                ],
                "row_count": 1,
                "token_usage": {
                    "prompt_tokens": 150,
                    "completion_tokens": 50,
                    "total_tokens": 200,
                },
                "cost": 0.00015,
                "warnings": [],
            }
        }


def get_responses_api_schema() -> Dict[str, Any]:
    """Get JSON schema for OpenAI Responses API structured outputs.

    CRITICAL: This schema is for OpenAI Responses API with strict mode.
    - ALL properties MUST be in the required array (strict mode requirement)
    - Nullable fields use union types: {"type": ["string", "null"]}
    - additionalProperties MUST be false

    Official Documentation:
    - Responses API: https://platform.openai.com/docs/api-reference/responses
    - Structured Outputs: https://platform.openai.com/docs/guides/structured-outputs

    Returns:
        JSON schema compatible with OpenAI Responses API text.format parameter
    """
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "sql_query_response",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "query_type": {
                        "type": "string",
                        "enum": ["sql_generation", "data_analysis", "summarization"],
                        "description": "Type of query being processed",
                    },
                    "generated_sql": {
                        "type": "string",
                        "description": "The generated SQL query, or a SQL comment placeholder for denied/unsafe requests (e.g., '-- Denied: unsafe operation')",
                    },
                    "explanation": {
                        "type": "string",
                        "description": "Natural language explanation",
                    },
                    "safety_check": {
                        "type": "boolean",
                        "description": "Whether SQL passed safety checks",
                    },
                    "confidence": {
                        "type": ["number", "null"],
                        "minimum": 0.0,
                        "maximum": 1.0,
                        "description": "Confidence score 0.0-1.0 (null if not applicable)",
                    },
                    "warnings": {
                        "type": ["array", "null"],
                        "items": {"type": "string"},
                        "description": "List of warnings (null if none)",
                    },
                },
                # CRITICAL: All properties MUST be in required array for strict mode
                "required": [
                    "query_type",
                    "generated_sql",
                    "explanation",
                    "safety_check",
                    "confidence",
                    "warnings",
                ],
                "additionalProperties": False,
            },
        },
    }
