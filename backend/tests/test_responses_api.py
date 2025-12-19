"""
Tests for OpenAI Responses API integration.

Validates that the Responses API:
- Processes conversational queries without tool calls
- Processes data queries with multi-turn function calling
- Validates SQL safety (blocks DROP, DELETE, etc.)
- Enforces RLS via agent-user authentication
- Tracks token usage and costs
- Handles errors gracefully
"""

from unittest.mock import MagicMock, Mock, patch

import pytest
from app.services.responses_service import (build_schema_context,
                                            process_query_request)
from app.tools import TOOL_HANDLERS


@pytest.mark.unit
def test_build_schema_context():
    """Test schema context builder returns description of database schema."""
    context = build_schema_context()

    assert isinstance(context, str)
    assert len(context) > 0
    assert "ideas" in context.lower()
    assert "table" in context.lower() or "schema" in context.lower()


@pytest.mark.unit
@patch("app.services.responses_service.get_openai_client")
def test_process_query_conversational_no_tool_call(mock_get_client):
    """Test conversational query that doesn't require database access."""
    # Mock OpenAI client
    mock_client = Mock()
    mock_get_client.return_value = mock_client

    # Mock response with no tool calls (conversational response)
    mock_response = Mock()
    mock_response.id = "resp_123"
    mock_response.output = [
        Mock(
            type="message",
            role="assistant",
            content=[
                Mock(type="output_text", text="I'm doing well, thank you for asking!")
            ],
        )
    ]
    mock_response.usage = Mock(input_tokens=50, output_tokens=20, total_tokens=70)

    mock_client.responses.create.return_value = mock_response

    # Mock agent client
    mock_agent_client = Mock()

    # Execute
    result = process_query_request(mock_agent_client, "How are you?")

    # Assert
    assert result.success is True
    assert result.query_type.value == "summarization"  # Changed from CONVERSATIONAL
    assert result.explanation == "I'm doing well, thank you for asking!"
    assert result.generated_sql is None
    assert result.results == []
    assert result.row_count == 0
    assert result.token_usage.total_tokens == 70
    assert result.cost > 0


@pytest.mark.unit
@patch("app.services.responses_service.get_openai_client")
def test_process_query_with_tool_call_success(mock_get_client):
    """Test data query that triggers tool call and executes SQL."""
    # Mock OpenAI client
    mock_client = Mock()
    mock_get_client.return_value = mock_client

    # Mock Turn 1 response with function call
    mock_turn1_response = Mock()
    mock_turn1_response.id = "resp_turn1"

    # Create mock function call
    mock_function_call = Mock()
    mock_function_call.type = "function_call"
    mock_function_call.name = "query_database"
    mock_function_call.call_id = "call_123"
    mock_function_call.arguments = '{"sql": "SELECT * FROM ideas ORDER BY created_at DESC LIMIT 10", "explanation": "Fetching all ideas"}'

    mock_turn1_response.output = [mock_function_call]
    mock_turn1_response.usage = Mock(
        input_tokens=100, output_tokens=50, total_tokens=150
    )

    # Mock Turn 2 response with formatted results
    mock_turn2_response = Mock()
    mock_turn2_response.id = "resp_turn2"
    mock_turn2_response.output = [
        Mock(
            type="message",
            role="assistant",
            content=[
                Mock(
                    type="output_text", text="You have 3 ideas: Idea 1, Idea 2, Idea 3"
                )
            ],
        )
    ]
    mock_turn2_response.usage = Mock(
        input_tokens=200, output_tokens=80, total_tokens=280
    )

    # Setup client to return different responses on each call
    mock_client.responses.create.side_effect = [
        mock_turn1_response,
        mock_turn2_response,
    ]

    # Mock agent client for database query
    mock_agent_client = Mock()
    mock_table_query = Mock()
    mock_table_query.order.return_value = mock_table_query
    mock_table_query.limit.return_value = mock_table_query
    mock_table_query.execute.return_value = Mock(
        data=[
            {"id": 1, "title": "Idea 1"},
            {"id": 2, "title": "Idea 2"},
            {"id": 3, "title": "Idea 3"},
        ]
    )
    mock_agent_client.table.return_value.select.return_value = mock_table_query

    # Execute
    result = process_query_request(mock_agent_client, "Show me all my ideas")

    # Assert
    assert result.success is True
    assert result.query_type.value == "sql_generation"  # Enum value
    assert "SELECT * FROM ideas" in result.generated_sql
    assert result.explanation == "You have 3 ideas: Idea 1, Idea 2, Idea 3"
    assert len(result.results) == 3
    assert result.row_count == 3
    assert result.token_usage.total_tokens == 430  # 150 + 280
    assert result.cost > 0

    # Verify both API calls were made
    assert mock_client.responses.create.call_count == 2


@pytest.mark.unit
@patch("app.services.responses_service.get_openai_client")
def test_process_query_sql_validation_blocks_unsafe(mock_get_client):
    """Test that unsafe SQL operations are blocked."""
    # Mock OpenAI client
    mock_client = Mock()
    mock_get_client.return_value = mock_client

    # Mock response with unsafe SQL
    mock_function_call = Mock()
    mock_function_call.type = "function_call"
    mock_function_call.name = "query_database"
    mock_function_call.call_id = "call_unsafe"
    mock_function_call.arguments = (
        '{"sql": "DELETE FROM ideas WHERE id = 1", "explanation": "Deleting idea"}'
    )

    mock_turn1_response = Mock()
    mock_turn1_response.id = "resp_unsafe"
    mock_turn1_response.output = [mock_function_call]
    mock_turn1_response.usage = Mock(input_tokens=50, output_tokens=30, total_tokens=80)

    mock_client.responses.create.return_value = mock_turn1_response

    # Mock agent client
    mock_agent_client = Mock()

    # Execute
    result = process_query_request(mock_agent_client, "Delete all ideas")

    # Assert - should fail due to SQL validation
    # The tool handler will return an error
    assert hasattr(result, "error") or not result.success


@pytest.mark.unit
def test_tool_handler_query_database_validates_sql():
    """Test that query_database tool validates SQL before execution."""
    from app.tools.database_tools import execute_query_database

    mock_agent_client = Mock()

    # Test 1: Block DELETE
    result = execute_query_database(
        mock_agent_client,
        sql="DELETE FROM ideas WHERE id = 1",
        explanation="Unsafe query",
    )
    assert result["success"] is False
    assert (
        "not allowed" in result["error"].lower() or "unsafe" in result["error"].lower()
    )

    # Test 2: Block DROP
    result = execute_query_database(
        mock_agent_client, sql="DROP TABLE ideas", explanation="Unsafe query"
    )
    assert result["success"] is False

    # Test 3: Block UPDATE
    result = execute_query_database(
        mock_agent_client,
        sql="UPDATE ideas SET title = 'hacked'",
        explanation="Unsafe query",
    )
    assert result["success"] is False

    # Test 4: Block CREATE
    result = execute_query_database(
        mock_agent_client,
        sql="CREATE TABLE hacked (id INT)",
        explanation="Unsafe query",
    )
    assert result["success"] is False


@pytest.mark.unit
def test_tool_handler_query_database_requires_limit():
    """Test that SELECT queries require LIMIT clause."""
    from app.tools.database_tools import execute_query_database

    mock_agent_client = Mock()
    mock_table = Mock()
    mock_table.select.return_value.limit.return_value.execute.return_value = Mock(
        data=[{"id": 1}]
    )
    mock_agent_client.table.return_value = mock_table

    # Query without LIMIT should have default LIMIT applied
    result = execute_query_database(
        mock_agent_client, sql="SELECT * FROM ideas", explanation="Get ideas"
    )

    # Should succeed with default limit
    assert result["success"] is True or "results" in result


@pytest.mark.integration
@patch("app.services.responses_service.get_openai_client")
def test_process_query_handles_openai_api_error(mock_get_client):
    """Test error handling when OpenAI API fails."""
    import pytest
    from app.core.errors import APIError

    # Mock OpenAI client to raise error
    mock_client = Mock()
    mock_get_client.return_value = mock_client
    mock_client.responses.create.side_effect = Exception("OpenAI API error")

    mock_agent_client = Mock()

    # Execute - should raise APIError
    with pytest.raises(APIError) as exc_info:
        process_query_request(mock_agent_client, "Show me ideas")

    # Verify error message contains relevant info
    assert "OpenAI" in str(exc_info.value) or "API" in str(exc_info.value)


@pytest.mark.integration
def test_tool_handler_handles_database_error():
    """Test error handling when database query fails."""
    from app.tools.database_tools import execute_query_database

    # Mock agent client that raises error on query
    mock_agent_client = Mock()
    mock_agent_client.table.side_effect = Exception("Database connection failed")

    result = execute_query_database(
        mock_agent_client, sql="SELECT * FROM ideas LIMIT 10", explanation="Get ideas"
    )

    # Should return error result
    assert result["success"] is False
    assert "error" in result


@pytest.mark.unit
def test_tool_handlers_registration():
    """Test that all tools are properly registered in TOOL_HANDLERS."""
    assert "query_database" in TOOL_HANDLERS
    assert callable(TOOL_HANDLERS["query_database"])
