"""
Pytest configuration and shared fixtures for backend tests.

This module provides reusable fixtures for testing FastAPI endpoints,
authentication, and database interactions.
"""

import pytest
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture
def test_app():
    """
    Provides a FastAPI TestClient for making requests to the app.

    The TestClient automatically handles application lifespan events
    and provides a synchronous interface for testing async endpoints.

    Example:
        def test_health(test_app):
            response = test_app.get("/api/v1/health")
            assert response.status_code == 200
    """
    with TestClient(app) as client:
        yield client


@pytest.fixture
def auth_headers():
    """
    Provides authentication headers for testing protected endpoints.

    TODO: Replace with actual JWT token generation once auth is fully tested.
    For now, returns empty dict since Session 2 auth uses httpOnly cookies.

    Example:
        def test_protected_endpoint(test_app, auth_headers):
            response = test_app.get("/api/v1/protected", headers=auth_headers)
            assert response.status_code == 200
    """
    # TODO: Generate actual auth token or session cookie
    # For Session 3, we'll focus on non-auth endpoints
    return {}


@pytest.fixture
def mock_user():
    """
    Provides consistent test user data for fixtures and assertions.

    Returns:
        dict: User data matching the user_profiles table schema

    Example:
        def test_user_creation(mock_user):
            assert mock_user["email"] == "test@example.com"
    """
    return {
        "id": "test-user-123",
        "email": "test@example.com",
        "full_name": "Test User",
        "avatar_url": None,
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z",
    }


@pytest.fixture
def mock_request_id():
    """
    Provides a consistent request ID for testing request tracing.

    Example:
        def test_request_id_in_logs(test_app, mock_request_id):
            response = test_app.get(
                "/api/v1/health",
                headers={"x-request-id": mock_request_id}
            )
            assert response.headers["x-request-id"] == mock_request_id
    """
    return "test-request-id-12345"
