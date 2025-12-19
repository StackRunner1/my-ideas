"""Authentication endpoints.

Provides signup, login, logout, token refresh, and user profile endpoints
following Supabase authentication best practices.
"""

import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field, field_validator

from ...db.supabase_client import get_admin_client
from ...services.agent_credentials import (generate_agent_email,
                                           generate_secure_password,
                                           get_agent_credentials,
                                           store_agent_credentials)
from ..auth_utils import (_cookie_config, _set_auth_cookies, get_current_user,
                          get_user_scoped_client)

router = APIRouter(prefix="/auth", tags=["auth"])


# Pydantic Models
class SignupRequest(BaseModel):
    """User signup request."""

    email: str = Field(..., description="User email address")
    password: str = Field(
        ..., min_length=8, description="User password (min 8 characters)"
    )

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Basic email validation."""
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email format")
        return v.lower()


class LoginRequest(BaseModel):
    """User login request."""

    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class AuthResponse(BaseModel):
    """Authentication response with camelCase serialization."""

    user: dict = Field(..., description="User data with id and email")
    expires_at: int = Field(
        ..., alias="expiresAt", description="Token expiry timestamp (epoch ms)"
    )
    access_token: str = Field(
        ...,
        alias="accessToken",
        description="JWT access token for Authorization header",
    )

    class Config:
        populate_by_name = True


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str


@router.post("/signup", response_model=AuthResponse)
async def signup(credentials: SignupRequest, response: Response):
    """Create new user account with automatic agent-user creation.

    This endpoint:
    1. Creates a Supabase auth user account for the user
    2. Creates a separate Supabase auth account for the user's AI agent
    3. Stores agent credentials securely for future AI operations
    4. Sets httpOnly cookies for session management

    Args:
        credentials: Email and password
        response: FastAPI response object for setting cookies

    Returns:
        AuthResponse with user data and token expiry

    Raises:
        400: Email already exists
        500: Supabase API error
    """
    try:
        admin_client = get_admin_client()

        # Step 1: Create user account
        print(f"[SIGNUP] ========== NEW USER SIGNUP INITIATED ==========")
        print(f"[SIGNUP] Email: {credentials.email}")
        try:
            signup_response = admin_client.auth.sign_up(
                {"email": credentials.email, "password": credentials.password}
            )
            print(f"[SIGNUP] ✅ Human user created in auth.users")
        except Exception as e:
            print(
                f"[SIGNUP] ❌ Failed to create human user: {type(e).__name__}: {str(e)}"
            )
            error_msg = str(e).lower()
            if "already registered" in error_msg or "already exists" in error_msg:
                raise HTTPException(status_code=400, detail="Email already exists")
            raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")

        if not signup_response or not signup_response.user:
            print(f"[SIGNUP] ❌ No user returned from signup")
            raise HTTPException(status_code=500, detail="Failed to create user account")

        user = signup_response.user
        session = signup_response.session

        if not session:
            print(f"[SIGNUP] ❌ No session returned from signup")
            raise HTTPException(
                status_code=500, detail="No session returned from signup"
            )

        user_id = user.id
        access_token = session.access_token
        refresh_token = session.refresh_token
        expires_in = session.expires_in or 3600
        print(f"[SIGNUP] Human user ID: {user_id}")
        print(f"[SIGNUP] Session expires in: {expires_in}s")

        # Step 2: Create user_profiles record
        print(f"[SIGNUP] Creating user_profiles record...")
        try:
            admin_client.table("user_profiles").insert(
                {
                    "id": user_id,
                    "email": user.email,
                    "display_name": None,
                    "avatar_url": None,
                    "beta_access": False,
                    "site_beta": False,
                }
            ).execute()
            print(f"[SIGNUP] ✅ user_profiles record created")
        except Exception as profile_error:
            # Log but don't fail if profile already exists
            print(
                f"[SIGNUP] ⚠️  user_profiles creation failed (may already exist): {str(profile_error)}"
            )

        # Step 3: Generate agent credentials
        print(f"[AGENT_CREATE] Generating agent credentials...")
        agent_email = generate_agent_email(user_id)
        agent_password = generate_secure_password()
        print(f"[AGENT_CREATE] Agent email: {agent_email}")
        print(
            f"[AGENT_CREATE] Agent password generated (length: {len(agent_password)})"
        )

        # Step 4: Create agent-user auth account
        print(f"[AGENT_CREATE] Creating agent-user in auth.users...")
        agent_user_id = None
        try:
            agent_signup_response = admin_client.auth.sign_up(
                {"email": agent_email, "password": agent_password}
            )

            if not agent_signup_response or not agent_signup_response.user:
                print(f"[AGENT_CREATE] ❌ Failed to create agent-user auth account")
            else:
                agent_user_id = agent_signup_response.user.id
                print(f"[AGENT_CREATE] ✅ Agent user created in auth.users")
                print(f"[AGENT_CREATE] Agent user ID: {agent_user_id}")
        except Exception as agent_error:
            print(
                f"[AGENT_CREATE] ❌ Exception creating agent-user: {str(agent_error)}"
            )

        # Step 5: Store agent credentials securely (only if agent was created)
        if agent_user_id:
            print(f"[AGENT_CREATE] Storing encrypted credentials in user_profiles...")
            try:
                store_agent_credentials(user_id, agent_user_id, agent_password)
                print(f"[AGENT_CREATE] ✅ Agent credentials encrypted and stored")
                print(
                    f"[SIGNUP] ========== SIGNUP COMPLETE: Human + Agent created =========="
                )
            except Exception as store_error:
                print(
                    f"[AGENT_CREATE] ❌ Failed to store credentials: {str(store_error)}"
                )
                print(
                    f"[SIGNUP] ========== SIGNUP COMPLETE: Human created, Agent FAILED =========="
                )
        else:
            print(
                f"[SIGNUP] ========== SIGNUP COMPLETE: Human created, no Agent =========="
            )

        # Step 6: Calculate expiresAt timestamp
        expires_at = int((time.time() + expires_in) * 1000)  # Convert to epoch ms

        # Step 7: Set httpOnly cookies
        _set_auth_cookies(response, access_token, refresh_token, expires_in)

        # Step 8: Return user data with access token
        return AuthResponse(
            user={"id": user_id, "email": user.email},
            expiresAt=expires_at,
            accessToken=access_token,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup error: {str(e)}")


@router.post("/login", response_model=AuthResponse)
async def login(credentials: LoginRequest, response: Response):
    """Authenticate user and establish session.

    Args:
        credentials: Email and password
        response: FastAPI response object for setting cookies

    Returns:
        AuthResponse with user data and token expiry

    Raises:
        401: Invalid credentials
        403: Account locked or disabled
        500: Authentication error
    """
    try:
        admin_client = get_admin_client()

        # Sign in with password
        try:
            signin_response = admin_client.auth.sign_in_with_password(
                {"email": credentials.email, "password": credentials.password}
            )
        except Exception as e:
            error_msg = str(e).lower()
            if "invalid" in error_msg or "incorrect" in error_msg:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            if "locked" in error_msg or "disabled" in error_msg:
                raise HTTPException(
                    status_code=403, detail="Account is locked or disabled"
                )
            raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

        if not signin_response or not signin_response.session:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = signin_response.user
        session = signin_response.session

        access_token = session.access_token
        refresh_token = session.refresh_token
        expires_in = session.expires_in or 3600

        # Calculate expiresAt
        expires_at = int((time.time() + expires_in) * 1000)

        # Set cookies
        _set_auth_cookies(response, access_token, refresh_token, expires_in)

        print(f"[AUTH] Login successful for user {user.id}")
        print(f"[AUTH] Returning accessToken: {access_token[:30]}...")
        print(f"[AUTH] Cookies set: access_token, refresh_token")

        return AuthResponse(
            user={"id": user.id, "email": user.email},
            expiresAt=expires_at,
            accessToken=access_token,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@router.post("/logout", response_model=MessageResponse)
async def logout(request: Request, response: Response):
    """End user session and revoke tokens.

    This endpoint:
    1. Revokes the user's refresh token in Supabase (server-side invalidation)
    2. Optionally revokes the agent-user's session
    3. Clears httpOnly cookies

    Args:
        request: FastAPI request object
        response: FastAPI response object

    Returns:
        Success message
    """
    access_token = request.cookies.get("access_token")

    # Even if no token, clear cookies (idempotent)
    cookie_config = _cookie_config()
    response.set_cookie(key="access_token", value="", max_age=0, **cookie_config)
    response.set_cookie(key="refresh_token", value="", max_age=0, **cookie_config)

    if access_token:
        try:
            admin_client = get_admin_client()
            # Get user to find their agent
            user_response = admin_client.auth.get_user(access_token)

            if user_response and user_response.user:
                user_id = user_response.user.id

                # Sign out user (revokes refresh token server-side)
                try:
                    admin_client.auth.sign_out(access_token)
                except Exception as e:
                    print(f"Warning: Failed to sign out user: {str(e)}")

                # Optional: Sign out agent-user
                agent_creds = get_agent_credentials(user_id)
                if agent_creds:
                    agent_email, agent_password = agent_creds
                    try:
                        # Sign in agent to get their token, then sign out
                        agent_signin = admin_client.auth.sign_in_with_password(
                            {"email": agent_email, "password": agent_password}
                        )
                        if agent_signin and agent_signin.session:
                            admin_client.auth.sign_out(
                                agent_signin.session.access_token
                            )
                    except Exception as e:
                        print(f"Warning: Failed to sign out agent: {str(e)}")
        except Exception as e:
            # Log but don't fail logout
            print(f"Error during logout: {str(e)}")

    return MessageResponse(message="Logged out successfully")


@router.post("/refresh", response_model=dict)
async def refresh_session(request: Request, response: Response):
    """Proactively refresh access token using refresh token.

    Args:
        request: FastAPI request object
        response: FastAPI response object

    Returns:
        New expiresAt timestamp

    Raises:
        401: Missing or invalid refresh token
    """
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token available")

    try:
        admin_client = get_admin_client()

        # Refresh session
        try:
            refresh_response = admin_client.auth.refresh_session(refresh_token)
        except AttributeError:
            # Fallback for older API
            refresh_response = admin_client.auth.refresh_session(
                {"refresh_token": refresh_token}
            )

        if not refresh_response or not refresh_response.session:
            raise HTTPException(status_code=401, detail="Failed to refresh session")

        session = refresh_response.session
        new_access_token = session.access_token
        new_refresh_token = session.refresh_token
        expires_in = session.expires_in or 3600

        # Calculate new expiresAt
        expires_at = int((time.time() + expires_in) * 1000)

        # Set new cookies
        _set_auth_cookies(response, new_access_token, new_refresh_token, expires_in)

        return {"expiresAt": expires_at}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Refresh failed: {str(e)}")


@router.get("/me", response_model=dict)
async def get_auth_status(current_user=Depends(get_current_user)):
    """Get current authenticated user data.

    Automatically refreshes token if expired.

    Args:
        current_user: Injected by get_current_user dependency

    Returns:
        User data with id and email
    """
    return current_user


@router.get("/me/profile", response_model=dict)
async def get_user_profile(client=Depends(get_user_scoped_client)):
    """Get user profile and metadata.

    Args:
        client: User-scoped Supabase client (injected)

    Returns:
        User profile data with camelCase keys
    """
    try:
        # Get user metadata from auth
        user_response = client.auth.get_user(client.token)

        if not user_response or not user_response.user:
            raise HTTPException(status_code=404, detail="User not found")

        user = user_response.user
        user_metadata = user.user_metadata or {}

        # Build profile response
        profile = {
            "id": user.id,
            "email": user.email,
            "betaAccess": user_metadata.get(
                "beta_access", user_metadata.get("betaAccess", False)
            ),
            "siteBeta": user_metadata.get(
                "site_beta", user_metadata.get("siteBeta", False)
            ),
            "createdAt": user.created_at,
        }

        return profile

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch profile: {str(e)}"
        )
