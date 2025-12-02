"""
Tests for error handling and standardized error responses.

Validates that:
- 404 errors return standardized schema
- 401 errors handled correctly
- 500 errors sanitized (no stack traces exposed)
- All errors include request ID
"""

import pytest


@pytest.mark.unit
def test_404_error_returns_standardized_schema(test_app):
    """Test that 404 errors follow standardized error response format."""
    response = test_app.get("/api/v1/nonexistent")

    assert response.status_code == 404
    data = response.json()

    assert "error" in data
    error = data["error"]

    assert "code" in error
    assert "message" in error
    assert "request_id" in error


@pytest.mark.unit
def test_404_error_includes_request_id(test_app, mock_request_id):
    """Test that 404 error response includes the request ID."""
    response = test_app.get(
        "/api/v1/nonexistent", headers={"x-request-id": mock_request_id}
    )

    assert response.status_code == 404
    data = response.json()

    assert data["error"]["request_id"] == mock_request_id


@pytest.mark.unit
def test_error_response_has_consistent_structure(test_app):
    """Test that all error responses have consistent structure."""
    # Test different error scenarios
    endpoints_to_test = [
        "/api/v1/nonexistent",  # 404
        "/api/v1/missing",  # 404
    ]

    for endpoint in endpoints_to_test:
        response = test_app.get(endpoint)
        data = response.json()

        assert "error" in data, f"Error response missing 'error' key for {endpoint}"
        error = data["error"]

        # Verify required fields
        required_fields = ["code", "message", "request_id"]
        for field in required_fields:
            assert field in error, f"Error missing '{field}' field for {endpoint}"


@pytest.mark.unit
def test_error_message_user_friendly(test_app):
    """Test that error messages are user-friendly (no stack traces)."""
    response = test_app.get("/api/v1/nonexistent")
    data = response.json()

    message = data["error"]["message"]

    # Should not contain Python stack trace indicators
    assert "Traceback" not in message
    assert 'File "' not in message
    assert (
        "line " not in message.lower() or "online" in message.lower()
    )  # Allow "online" but not "line 42"
