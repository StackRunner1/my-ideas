"""
Tests for request ID middleware.

Validates that request IDs:
- Are generated when not provided
- Are preserved when provided by client
- Appear in response headers
- Are included in logs (integration test)
"""

import uuid

import pytest


@pytest.mark.unit
def test_request_id_generated_when_not_provided(test_app):
    """Test that middleware generates request ID if client doesn't provide one."""
    response = test_app.get("/api/v1/health")

    assert "x-request-id" in response.headers
    request_id = response.headers["x-request-id"]

    # Verify it's a valid UUID format
    try:
        uuid.UUID(request_id)
        assert True
    except ValueError:
        pytest.fail(f"Generated request ID is not a valid UUID: {request_id}")


@pytest.mark.unit
def test_request_id_preserved_when_provided(test_app):
    """Test that client-provided request ID is preserved."""
    client_request_id = str(uuid.uuid4())

    response = test_app.get(
        "/api/v1/health", headers={"x-request-id": client_request_id}
    )

    assert response.headers["x-request-id"] == client_request_id


@pytest.mark.unit
def test_request_id_in_response_body(test_app):
    """Test that request ID appears in response body for endpoints that include it."""
    response = test_app.get("/api/v1/health")
    data = response.json()

    if "request_id" in data:
        assert data["request_id"] == response.headers["x-request-id"]


@pytest.mark.unit
def test_request_id_unique_per_request(test_app):
    """Test that each request gets a unique ID."""
    response1 = test_app.get("/api/v1/health")
    response2 = test_app.get("/api/v1/health")

    request_id1 = response1.headers["x-request-id"]
    request_id2 = response2.headers["x-request-id"]

    assert request_id1 != request_id2
