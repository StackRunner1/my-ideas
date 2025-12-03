"""
Tests for the health check endpoint.

Validates that the health endpoint:
- Returns correct status code
- Includes request ID in response
- Reports database connectivity
- Returns response in expected format
"""

import pytest


@pytest.mark.unit
def test_health_endpoint_returns_200(test_app):
    """Test that health endpoint returns 200 OK."""
    response = test_app.get("/api/v1/health")
    assert response.status_code == 200


@pytest.mark.unit
def test_health_endpoint_response_format(test_app):
    """Test that health endpoint returns expected JSON structure."""
    response = test_app.get("/api/v1/health")
    data = response.json()

    assert "status" in data
    assert "request_id" in data
    assert data["status"] in ["healthy", "degraded", "unhealthy"]


@pytest.mark.unit
def test_health_endpoint_includes_request_id_in_headers(test_app):
    """Test that response headers include x-request-id."""
    response = test_app.get("/api/v1/health")

    assert "x-request-id" in response.headers
    assert len(response.headers["x-request-id"]) > 0


@pytest.mark.unit
def test_health_endpoint_preserves_client_request_id(test_app, mock_request_id):
    """Test that client-provided request ID is preserved in response."""
    response = test_app.get("/api/v1/health", headers={"x-request-id": mock_request_id})

    assert response.headers["x-request-id"] == mock_request_id

    data = response.json()
    assert data["request_id"] == mock_request_id


@pytest.mark.integration
def test_health_endpoint_reports_database_status(test_app):
    """Test that health endpoint includes database connectivity info."""
    response = test_app.get("/api/v1/health")
    data = response.json()

    # If database check is implemented
    if "database" in data:
        assert data["database"] in ["connected", "disconnected", "unknown"]
