# Supabase Authentication Implementation - Product Requirements Document v1.1

## Overview

Comprehensive documentation of the **standard Supabase authentication
integration** in the code45 platform, covering frontend and backend
implementation with secure token management, automatic refresh, and user
lifecycle flows.

**Key Architecture**: This implementation follows **Supabase best practices**
with zero custom JWT logic. The only enhancement: when a user signs up, we
automatically create an **agent-user** (a separate Supabase auth user) that acts
on behalf of the user for AI-driven database operations. Both users authenticate
via standard Supabase `sign_in_with_password`, and both use the same
RLS-enforced endpoints.

## Business Context

- **Problem**: Modern web applications require secure, scalable authentication
  with minimal custom infrastructure, PLUS AI agents need secure database access
- **Solution**: Standard Supabase Auth integration with httpOnly cookie-based
  session management, automatic token refresh, and RLS-enforced data access.
  Agent-users leverage the same auth flow for autonomous operations.
- **Value**: Production-ready authentication with industry best practices,
  reduced development time, built-in security features, and secure AI agent
  access

## Implementation Scope

This PRD documents the complete authentication architecture including:

1. **Backend Infrastructure**: Supabase client setup, admin and user-scoped
   clients, dependency injection patterns
2. **Backend Auth Endpoints**: Signup, login, logout, token refresh, session
   management
3. **Frontend Infrastructure**: Enhanced API client with auto-refresh, Redux
   auth state management
4. **Frontend Auth UI**: Sign-in/sign-up modals, protected routes, auth status
   indicators
5. **Security Patterns**: httpOnly cookies, JWT token handling, automatic
   agent-user creation
6. **Integration Points**: RLS enforcement, user profile management,
   cross-service authentication

## Architecture Overview

### Authentication Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend  │         │   Backend    │         │   Supabase   │
│             │         │   FastAPI    │         │   Auth       │
└──────┬──────┘         └───────┬──────┘         └──────┬───────┘
       │                        │                       │
       │  1. POST /auth/signup  │                       │
       │───────────────────────>│  2. signup(email, pw) │
       │                        │──────────────────────>│
       │                        │  3. user session      │
       │                        │<──────────────────────│
       │                        │                       │
       │                        │  4. Create agent auth │
       │                        │     user via admin    │
       │                        │     signup(agent@...) │
       │                        │──────────────────────>│
       │                        │  5. agent session     │
       │                        │<──────────────────────│
       │                        │                       │
       │                        │  6. Store agent       │
       │                        │     credentials       │
       │                        │     (email + pw)      │
       │                        │                       │
       │  7. Set httpOnly       │                       │
       │     cookies (user)     │                       │
       │<───────────────────────│                       │
       │                        │                       │
       │  8. Store in Redux     │                       │
       │                        │                       │
       ▼                        ▼                       ▼

Later: User instructs AI agent to perform DB operation

┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  Frontend   │         │   Backend    │         │   Supabase   │
└──────┬──────┘         └───────┬──────┘         └──────┬───────┘
       │                        │                       │
       │  POST /units (create)  │                       │
       │───────────────────────>│  1. Login agent-user  │
       │                        │     with stored creds │
       │                        │──────────────────────>│
       │                        │  2. agent session     │
       │                        │<──────────────────────│
       │                        │                       │
       │                        │  3. Create client     │
       │                        │     with agent token  │
       │                        │                       │
       │                        │  4. CRUD via RLS      │
       │                        │     (same endpoint)   │
       │                        │                       │
       │  Response              │                       │
       │<───────────────────────│                       │
       ▼                        ▼                       ▼
```

### Logout Flow (Best Practice)

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  Frontend   │         │   Backend    │         │   Supabase   │
│             │         │   FastAPI    │         │   Auth       │
└──────┬──────┘         └───────┬──────┘         └──────┬───────┘
       │                        │                       │
       │  1. User clicks Logout │                       │
       │                        │                       │
       │  2. POST /auth/logout  │                       │
       │  (with access_token    │                       │
       │   in cookie)           │                       │
       │───────────────────────>│                       │
       │                        │  3. sign_out()        │
       │                        │     Revoke refresh    │
       │                        │     token server-side │
       │                        │──────────────────────>│
       │                        │  4. Token revoked     │
       │                        │<──────────────────────│
       │                        │                       │
       │                        │  5. Optional: logout  │
       │                        │     agent-user too    │
       │                        │──────────────────────>│
       │                        │<──────────────────────│
       │                        │                       │
       │  6. Clear cookies      │                       │
       │     Set max-age=0      │                       │
       │<───────────────────────│                       │
       │                        │                       │
       │  7. Frontend cleanup:  │                       │
       │     - Clear Redux      │                       │
       │     - Clear in-memory  │                       │
       │     - Invalidate cache │                       │
       │                        │                       │
       │  8. Redirect to /      │                       │
       │                        │                       │
       ▼                        ▼                       ▼

Critical: auth.sign_out() MUST be called server-side to revoke refresh tokens.
Without this, old tokens can be reused even after "logout".
```

### Token Management Strategy (Standard Supabase)

1. **Access Token**: Short-lived Supabase JWT stored in httpOnly cookie + Redux
   state (for display only)
2. **Refresh Token**: Long-lived Supabase token stored in httpOnly cookie only
3. **Auto-Refresh**: Backend automatically refreshes expired access tokens using
   Supabase's `refresh_session()` API
4. **Fallback**: Frontend can trigger refresh on 401 responses
5. **No Custom Logic**: All tokens generated and validated by Supabase Auth
   service

### Client Types

- **Admin Client**: Uses service role key, bypasses RLS, for:
  - Creating agent-user auth accounts during user signup
  - Admin operations (feedback summaries, course management)
- **User-Scoped Client**: Bound to user's Supabase JWT, enforces RLS, for:
  - All regular user operations
  - All agent-user operations (agent authenticates, gets its own JWT)

### Agent-User Pattern

1. **Creation**: When user signs up, backend creates a second Supabase auth user
   (agent-user) via admin client using
   `signup(email=agent_<uuid>@..., password=random)`
2. **Storage**: Agent email + password stored in secure backend store (NOT in
   database)
3. **Login**: When AI needs to perform DB operations, backend:
   - Calls `sign_in_with_password(agent_email, agent_password)` via admin client
   - Gets agent's Supabase session (access_token, refresh_token)
   - Creates user-scoped client with agent's token
   - Performs CRUD via standard endpoints with RLS enforcement
4. **Security**: Agent credentials never sent to frontend; agent operations
   logged for audit

---

## Implementation Plan & Sequence

### Legend

- `[ ]` = Pending (not started)
- `[~]` = In Progress (partially implemented)
- `[x]` = Completed (fully implemented and tested)

---

## Phase 1: Backend Foundation

### Unit 1: Supabase Client Setup & Configuration

**Goal**: Install Supabase Python SDK and establish admin/user client factory
functions

**Prerequisites**:

- Python 3.12+ environment
- Supabase project created with URL and service role key
- **Supabase Settings**: Disable email confirmation for development
  - Go to Supabase Dashboard → Authentication → Providers → Email
  - Toggle OFF "Confirm email" (allows immediate login after signup)
  - This prevents `session=None` errors during signup

**Deliverables**:

- [x] Install `supabase` Python package via pip/requirements.txt
- [x] Install `pydantic-settings` package via pip/requirements.txt
- [x] Add environment variables to `.env`: `SUPABASE_URL`,
      `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- [x] Create `backend/app/core/config.py` with Supabase settings using Pydantic
      BaseSettings
- [x] Create `backend/app/db/supabase_client.py` module
- [x] Implement `get_admin_client()` function that returns service role client
- [x] Implement `get_user_client(jwt)` function that returns RLS-scoped client
- [x] Add JWT binding logic with version-agnostic fallback for
      `postgrest.auth(token)`
- [x] Add error handling for missing environment variables
- [x] Add `SupabaseNotInstalledError` custom exception
- [x] Document client usage patterns in module docstrings

**Success Criteria**:

- Admin client can query any table bypassing RLS
- User client enforces RLS when JWT provided
- Graceful error messages if supabase-py not installed

**Estimated Effort**: 1-2 hours

---

### Unit 2: Auth Dependency Injection & Token Extraction

**Goal**: Create reusable FastAPI dependencies for extracting and validating
user tokens from requests

**Prerequisites**:

- Unit 1 completed
- FastAPI application structure in place

**Deliverables**:

- [x] Create `backend/app/api/auth_utils.py` module
- [x] Implement `_extract_token_from_request(request)` helper function
- [x] Support token extraction from two sources (priority order):
  - [x] `access_token` httpOnly cookie (primary, Supabase-generated token)
  - [x] `Authorization: Bearer <token>` header (fallback for API clients)
- [x] Implement `_cookie_config()` helper for environment-aware cookie settings
- [x] Configure `secure=True` for production, `secure=False` for local/dev
- [x] Configure `samesite="none"` for production (cross-origin),
      `samesite="lax"` for local
- [x] Implement `_set_auth_cookies(response, access_token, refresh_token, ...)`
      helper
- [x] Set httpOnly cookies with appropriate max-age from token expiry
- [x] Implement `get_current_user(request, response)` dependency
- [x] Validate token using Supabase `auth.get_user(token)`
- [x] Implement automatic token refresh on expiry using refresh_token cookie
- [x] Handle version differences in Supabase refresh_session API
- [x] Return user dict: `{"user": {"id": str, "email": str, "token": str}}`
- [x] Raise 401 HTTPException if authentication fails

**Success Criteria**:

- Token successfully extracted from cookies or headers
- Expired tokens automatically refreshed
- New tokens set in httpOnly cookies on response
- User ID and email returned for valid sessions

**Estimated Effort**: 2-3 hours

---

### Unit 3: User-Scoped Client Dependency

**Goal**: Create FastAPI dependency that provides authenticated Supabase client
with user context

**Prerequisites**:

- Unit 1 & 2 completed

**Deliverables**:

- [x] Add `get_user_scoped_client(request, response)` dependency to
      `auth_utils.py`
- [x] Call `get_current_user()` to validate session and get user data
- [x] Create user-scoped client using `get_user_client(user["token"])`
- [x] Attach `user_id` attribute to client for convenience:
      `client.user_id = user_id`
- [x] Attach `token` attribute to client: `client.token = token`
- [x] Return client object with RLS enforcement active
- [x] Document that client is type `Any` (no SupabaseClient class)
- [x] Document expected attributes: `client.table()`, `client.auth`,
      `client.user_id`, `client.token`
- [x] Add usage example in docstring

**Success Criteria**:

- Dependency can be injected into route handlers:
  `client=Depends(get_user_scoped_client)`
- Client enforces RLS based on user's JWT
- `client.user_id` accessible for business logic
- Client automatically uses refreshed tokens if auto-refresh occurred

**Estimated Effort**: 1 hour

---

## Phase 2: Backend Auth Endpoints

### Unit 4: Signup Endpoint & Agent-User Creation

**Goal**: Implement user registration with automatic Supabase signup for both
user AND agent-user (two separate Supabase auth accounts)

**Prerequisites**:

- Phase 1 completed
- Secure credential storage mechanism for agent passwords (env var, secrets
  manager)

**Deliverables**:

- [x] Create `backend/app/api/routes/auth.py` module
- [x] Create FastAPI router with `tags=["auth"]`
- [x] Define `SignupRequest` Pydantic model with `email` and `password` fields
- [x] Add password validation (min 8 chars, complexity rules optional)
- [x] Define `AuthResponse` Pydantic model with camelCase serialization
- [x] Implement `POST /auth/signup` endpoint:
  - [x] **Step 1**: Call Supabase
        `auth.sign_up(email=user_email, password=user_password)` via admin
        client
  - [x] Extract user `access_token`, `refresh_token`, expiry, and `user_id` from
        response
  - [x] **Step 2**: Generate agent-user credentials:
    - [x] `agent_email` = `agent_{user_id}@code45.internal` (or similar pattern)
    - [x] `agent_password` = securely generated random password (store in
          secrets manager)
  - [x] **Step 3**: Call Supabase
        `auth.sign_up(email=agent_email, password=agent_password)` via admin
        client to create agent auth account
  - [x] **Step 4**: Store agent credentials securely (NOT in database, use
        secrets manager or encrypted config) mapped to `user_id`
  - [x] **Step 5**: Calculate `expiresAt` timestamp (now + expires_in)
  - [x] **Step 6**: Call `_set_auth_cookies()` to store user tokens in httpOnly
        cookies
- [x] Return user data: `{"user": {"id": ..., "email": ...}, "expiresAt": ...}`
- [x] Handle duplicate email error (400)
- [x] Handle Supabase API errors (500)
- [x] Add logging for successful signups (user AND agent creation)

**Success Criteria**:

- User created in Supabase auth.users (user account)
- Agent-user created in Supabase auth.users (agent account)
- Agent credentials stored securely and retrievable by user_id
- User cookies set on response
- Frontend receives user data and expiry
- No custom JWT logic used

**Estimated Effort**: 2-3 hours

---

### Unit 5: Login Endpoint

**Goal**: Implement user authentication with session cookie management

**Prerequisites**:

- Unit 4 completed

**Deliverables**:

- [x] Define `LoginRequest` Pydantic model with `email` and `password`
- [x] Implement `POST /auth/login` endpoint
- [x] Call Supabase `auth.sign_in_with_password(email=..., password=...)`
- [x] Extract tokens and expiry from response
- [x] Set httpOnly cookies using `_set_auth_cookies()`
- [x] Return `AuthResponse` with user and expiresAt
- [x] Handle invalid credentials (401)
- [x] Handle account locked/disabled errors (403)
- [x] Add logging for login attempts (success and failure)

**Success Criteria**:

- Valid credentials return user data and set cookies
- Invalid credentials return 401 error
- Cookies automatically sent on subsequent requests

**Estimated Effort**: 1-2 hours

---

### Unit 6: Logout & Token Refresh Endpoints

**Goal**: Implement session termination and proactive token refresh

**Prerequisites**:

- Unit 5 completed

**Deliverables**:

- [x] Implement `POST /auth/logout` endpoint
- [x] Extract access_token from request (cookie or header)
- [x] Call Supabase `auth.sign_out()` with user's token (REQUIRED for
      server-side invalidation)
  - [x] This revokes the refresh token in Supabase's database
  - [x] Prevents token reuse even if cookies leaked
- [x] Delete `access_token` and `refresh_token` httpOnly cookies
  - [x] Set `max_age=0` to expire immediately
  - [x] Set same `path`, `domain`, `samesite` as when created
- [x] Optional: Sign out agent-user session if tracking active sessions
  - [x] Retrieve agent credentials for this user
  - [x] Call Supabase `auth.sign_out()` for agent session
  - [x] Clean up any cached agent tokens
- [x] Return success response: `{"message": "Logged out successfully"}`
- [x] Handle already-logged-out case gracefully (don't error)
- [x] Implement `POST /auth/refresh` endpoint
- [x] Extract refresh_token from cookie
- [x] Call Supabase `auth.refresh_session(refresh_token)`
- [x] Set new cookies with refreshed tokens
- [x] Return new expiresAt timestamp
- [x] Handle missing/invalid refresh token (401)
- [x] Implement refresh cooldown to prevent abuse (5-second minimum between
      refreshes)

**Success Criteria**:

- Logout clears both httpOnly cookies (access_token, refresh_token)
- Logout calls Supabase `auth.sign_out()` to revoke refresh token server-side
- Old tokens cannot be reused after logout (verified via `/auth/me`
  returning 401)
- Frontend state completely cleared (Redux, in-memory token, caches)
- User redirected to public page after logout
- Logout works even if already logged out (idempotent)
- Refresh returns new tokens before access token expires
- Frontend can proactively refresh without waiting for 401

**Estimated Effort**: 1-2 hours

---

### Unit 7: Auth Status & Profile Endpoints

**Goal**: Provide endpoints for checking auth status and fetching user
profile/metadata

**Prerequisites**:

- Unit 3 completed

**Deliverables**:

- [x] Implement `GET /auth/me` endpoint using `get_current_user` dependency
- [x] Return user data with automatic token refresh if needed
- [x] Implement `GET /me/profile` endpoint using `get_user_scoped_client`
- [x] Query user metadata from Supabase auth user metadata or app-specific
      user_profiles table (if exists)
- [x] Return profile data: `{id, email, name, beta_access, created_at, ...}`
- [x] Use camelCase serialization for frontend compatibility
- [x] Add profile data to response

**Success Criteria**:

- `/auth/me` returns current user without frontend needing to decode JWT
- `/me/profile` returns user profile/metadata
- Both endpoints auto-refresh expired tokens
- No custom JWT decoding required

**Estimated Effort**: 1-2 hours

---

### Unit 8: Agent-User Database Operations

**Goal**: Enable AI agent to perform CRUD operations on behalf of user using
standard Supabase auth and RLS

**Prerequisites**:

- Unit 4 completed (agent-user created during signup)
- Agent credentials stored securely

**Deliverables**:

- [x] Create `backend/app/services/agent_service.py` module
- [x] Implement `get_agent_session(user_id)` function:
  - [x] Retrieve agent email + password from secure storage (mapped to user_id)
  - [x] Call Supabase `auth.sign_in_with_password(agent_email, agent_password)`
        via admin client
  - [x] Return agent session (access_token, refresh_token)
  - [x] Cache session for duration of access token validity
- [x] Implement `get_agent_client(user_id)` function:
  - [x] Get agent session via `get_agent_session(user_id)`
  - [x] Create user-scoped client with agent's access_token:
        `get_user_client(agent_token)`
  - [x] Return client with RLS enforcement (agent's permissions)
- [x] Update relevant endpoints to support agent operations:
  - [x] Add optional `agent_mode: bool = False` parameter to endpoints
  - [x] If `agent_mode=True`, use `get_agent_client(user_id)` instead of
        `get_user_scoped_client()`
  - [x] Agent operations use SAME endpoints with SAME RLS policies
- [x] Example: `POST /units` endpoint:
  - [x] User request: uses user's token → user's RLS context
  - [x] Agent request: uses agent's token → agent's RLS context (potentially
        broader permissions)
- [x] Add audit logging for agent operations:
  - [x] Log agent actions separately for security review
  - [x] Include user_id, agent_id, operation, table, timestamp
- [x] Implement agent session refresh before expiry
- [x] Handle agent auth failures gracefully (re-authenticate or alert)

**Success Criteria**:

- Agent can authenticate using stored credentials
- Agent operations use standard user-scoped client pattern
- No custom JWT logic; all tokens from Supabase
- RLS enforced for agent operations
- Agent actions auditable and traceable to originating user
- Same endpoints serve both user and agent requests

**Estimated Effort**: 3-4 hours

---

## Phase 3: Frontend Infrastructure

### Unit 9: Enhanced API Client with Auto-Refresh

**Goal**: Create Axios client with automatic token refresh and httpOnly cookie
support

**Prerequisites**:

- Backend auth endpoints (Phase 2) completed
- React + TypeScript project setup

**Deliverables**:

- [x] Install dependencies: `axios`
- [x] Create `frontend/src/lib/apiClient.ts` module
- [x] Configure base URL from environment: `VITE_API_BASE_URL` (default:
      `http://localhost:8000/api/v1`)
- [x] Create Axios instance with `withCredentials: true` for cookie support
- [x] Set default timeout (30 seconds)
- [x] Add sanity check warning if base URL lacks version segment
- [x] Implement in-memory token storage: `inMemoryToken` variable
- [x] Export `setAuthToken(token)` function to update in-memory token
- [x] Export `setAllowAutoRefresh(allow)` function to toggle refresh behavior
- [x] Implement request interceptor:
  - [x] Add `Authorization: Bearer <token>` header if in-memory token exists
  - [x] Never read token from localStorage (security)
- [x] Implement response interceptor for 401 errors:
  - [x] Track refresh state to coalesce multiple 401s into single refresh
  - [x] Call `POST /auth/refresh` on first 401
  - [x] Update in-memory token from response
  - [x] Retry original request with new token
  - [x] Only retry once (set `_retry` flag)
  - [x] Don't retry if request was to `/auth/refresh` itself
  - [x] Clear token and reject if refresh fails
- [x] Implement refresh cooldown (5 seconds between attempts)
- [x] Export configured Axios instance as `apiClient`
- [x] Add TypeScript types for common response shapes

**Success Criteria**:

- API calls automatically include auth token when available
- 401 errors trigger automatic token refresh
- Subsequent requests use refreshed token
- Multiple simultaneous 401s only trigger one refresh

**Estimated Effort**: 3-4 hours

---

### Unit 10: Redux Auth State Management

**Goal**: Create centralized auth state with Redux Toolkit

**Prerequisites**:

- Unit 8 completed
- Redux Toolkit installed

**Deliverables**:

- [x] Install dependencies: `@reduxjs/toolkit`, `react-redux`
- [x] Create `frontend/src/store/index.ts` for store configuration
- [x] Create `frontend/src/store/authSlice.ts` module
- [x] Define `AuthState` interface:
  - [x] `isAuthenticated: boolean`
  - [x] `expiresAt: number | null` (epoch ms)
  - [x] `status: 'idle' | 'authenticated' | 'guest'`
  - [x] `betaAccess: boolean | null`
  - [x] `siteBeta: boolean | null`
  - [x] `loadingProfile: boolean`
- [x] Create slice with `createSlice`:
  - [x] `setSession` reducer: sets auth state and expiresAt
  - [x] `clearSession` reducer: resets to guest state
- [x] Create `fetchUserProfile` async thunk:
  - [x] Call `GET /me/profile`
  - [x] Extract `betaUser` and `siteBeta` flags
  - [x] Handle snake_case and camelCase response variations
  - [x] Add guards to prevent stale responses from overwriting
        `betaAccess: true`
- [x] Add extra reducers for thunk lifecycle:
  - [x] `pending`: set `loadingProfile = true`
  - [x] `fulfilled`: update betaAccess and siteBeta
  - [x] `rejected`: set `loadingProfile = false`
- [x] Export actions: `setSession`, `clearSession`
- [x] Export thunk: `fetchUserProfile`
- [x] Export reducer as `authReducer`
- [x] Configure Redux store with auth slice
- [x] Wrap app in `<Provider store={store}>`

**Success Criteria**:

- Auth state accessible via `useSelector((s) => s.auth)`
- Session can be set/cleared via dispatched actions
- User profile fetched and beta flags stored
- Loading state tracked during profile fetch

**Estimated Effort**: 2-3 hours

---

### Unit 11: Auth Service Layer

**Goal**: Create service functions for signup, login, logout, and session
management

**Prerequisites**:

- Unit 8 & 9 completed

**Deliverables**:

- [x] Create `frontend/src/services/authService.ts` module
- [x] Define TypeScript interfaces:
  - [x] `AuthResponse { user: {id, email}, expiresAt: number }`
  - [x] `SignupCredentials { email, password }`
  - [x] `LoginCredentials { email, password }`
- [x] Implement `signup(credentials)` function:
  - [x] Call `POST /auth/signup` via apiClient
  - [x] Return `AuthResponse`
  - [x] Don't store token in localStorage
- [x] Implement `login(credentials)` function:
  - [x] Call `POST /auth/login`
  - [x] Return `AuthResponse`
- [x] Implement `logout()` function:
  - [x] Call `POST /auth/logout` via apiClient
  - [x] Clear in-memory token via `setAuthToken(null)`
  - [x] Clear any localStorage auth data (if any exists)
  - [x] Return success/error status
- [x] Implement `refreshSession()` function:
  - [x] Call `POST /auth/refresh`
  - [x] Return new `expiresAt`
- [x] Implement `checkAuthStatus()` function:
  - [x] Call `GET /auth/me`
  - [x] Return user data
  - [x] Handle 401 gracefully (return null)
- [x] Add error handling and logging
- [x] Export all functions

**Success Criteria**:

- Signup/login return user data and set cookies
- Logout clears session
- Refresh returns new expiry time
- Auth status check works without errors

**Estimated Effort**: 2 hours

---

## Phase 4: Frontend Auth UI

### Unit 11.5: shadcn/ui Setup with Radix

**Goal**: Install and configure shadcn/ui component library with Radix UI primitives

**Prerequisites**:

- Tailwind CSS configured
- TypeScript setup complete

**Deliverables**:

- [x] Configure TypeScript path alias:
  - [x] Add to `tsconfig.json` compilerOptions:
    ```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    ```
  - [x] Add to `vite.config.js`:
    ```javascript
    import path from "path";
    // ... in defineConfig:
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    }
    ```
- [ ] Install shadcn/ui (single command):
  - [ ] Run: `npx shadcn@latest init`
  - [ ] When the wizard prompts, select these options:
    - [ ] **Style**: "New York" (Recommended) - press Enter for default
    - [ ] **Base color**: "Neutral" - press Enter for default
    - [ ] The wizard will automatically:
      - [ ] Create `components.json`
      - [ ] Update `tailwind.config.cjs` with theme configuration
      - [ ] Update `src/index.css` with CSS variables
      - [ ] Install dependencies (class-variance-authority, clsx, tailwind-merge, etc.)
  - [ ] After init completes, install all auth components in one command:
    - [ ] Run: `npx shadcn@latest add dialog button input label tabs card checkbox`
    - [ ] This downloads and installs all required components to `src/components/ui/`
- [ ] Verify installation:
  - [ ] `components.json` created in project root
  - [ ] `frontend/src/components/ui/` directory exists with components
  - [ ] Radix UI packages in `package.json` (@radix-ui/react-\*)
- [ ] Document component import pattern: `import { Button } from "@/components/ui/button"`

**Success Criteria**:

- shadcn/ui components accessible via `@/components/ui/*`
- Radix UI primitives installed as dependencies
- Components render with Tailwind styling

**Estimated Effort**: 15-30 minutes

---

### Unit 12: Auth Modal Component

**Goal**: Create reusable modal for sign-in and sign-up with form validation using shadcn/ui

**Prerequisites**:

- Unit 11.5 completed (shadcn/ui installed)
- Phase 3 completed

**Deliverables**:

- [x] Create `frontend/src/components/AuthModal.tsx` using shadcn/ui Dialog
- [x] Implement modal with Tabs component: "Sign In" and "Sign Up"
- [x] Create sign-in form using shadcn/ui components:
  - [x] Email Input component (type=email, required)
  - [x] Password Input component (type=password, required, min 8 chars)
  - [x] "Forgot password?" link (placeholder for future)
  - [x] Button component with loading state
  - [x] Error message display
- [x] Create sign-up form using shadcn/ui components:
  - [x] Email Input component (type=email, required)
  - [x] Password Input component (type=password, required, min 8 chars)
  - [x] Confirm password Input component (must match)
  - [x] Checkbox component for terms acceptance (required)
  - [x] Button component with loading state
  - [x] Error message display
- [x] Implement sign-in handler:
  - [x] Call `authService.login(credentials)`
  - [x] Dispatch `setSession(expiresAt)`
  - [x] Store token in memory via `setAuthToken()`
  - [x] Dispatch `fetchUserProfile()` thunk
  - [x] Close modal on success
  - [x] Display error on failure
- [x] Implement sign-up handler:
  - [x] Validate password match
  - [x] Call `authService.signup(credentials)`
  - [x] Dispatch `setSession(expiresAt)`
  - [x] Store token in memory
  - [x] Dispatch `fetchUserProfile()`
  - [x] Close modal on success
  - [x] Display error (e.g., "Email already exists")
- [x] Add client-side validation feedback (real-time)
- [x] Make modal dismissible via ESC key or backdrop click (shadcn/ui Dialog default)
- [x] Add keyboard navigation support (tab order) (shadcn/ui Dialog default)

**Success Criteria**:

- Modal opens and displays sign-in/sign-up tabs
- Form validation provides immediate feedback
- Successful auth closes modal and updates Redux state
- Errors displayed clearly to user
- Accessible via keyboard

**Testing & Validation (After Unit 12)**:

Before proceeding to Unit 13, validate the auth flow:

1. **Frontend Testing** (manual):
   - [ ] Add AuthModal to a test page temporarily
   - [ ] Open modal and test sign-up with new email
   - [ ] Verify backend creates user + agent-user (check Supabase auth.users)
   - [ ] Verify cookies set (check browser DevTools → Application → Cookies)
   - [ ] Verify Redux state updated (check Redux DevTools)
   - [ ] Test sign-in with existing credentials
   - [ ] Verify error handling (wrong password, existing email)

2. **Backend Testing** (via terminal in `backend/` directory):
   ```bash
   # Ensure backend server is running
   python -m uvicorn app.main:app --reload
   
   # Test health endpoint
   curl http://localhost:8000/health
   
   # Test signup (replace with your test email)
   curl -X POST http://localhost:8000/api/v1/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}'
   
   # Test login
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass123"}' \
     -c cookies.txt
   
   # Test auth status (using cookies from login)
   curl http://localhost:8000/api/v1/auth/me -b cookies.txt
   ```

3. **Database Verification** (Supabase Studio):
   - [ ] Open Supabase Studio → Authentication → Users
   - [ ] Verify two users created per signup (user + agent_user)
   - [ ] Agent emails should match pattern: `agent_{user_id}@code45.internal`
   - [ ] Confirm email confirmation is disabled (prevents `session=None` errors)

**Estimated Effort**: 4-5 hours

---

### Temporary vs. Production Frontend Structure

**Current State (Temporary Testing Setup)**:
- `src/AuthTest.tsx` - Isolated auth modal testing component
- `src/main.tsx` - Imports `AuthTest` instead of `App`
- Purpose: Allows focused testing of auth flows without routing/nav complexity

**Transition to Production** (After Unit 14 completion):
1. Revert `main.tsx` to import `App.tsx`
2. Integrate `AuthModal` into production layout:
   - Add modal trigger to header/navbar in `App.tsx`
   - Wire auth state to UI (show login button when logged out, user menu when logged in)
3. Implement `UserMenu` (Unit 14) in actual app header
4. Add protected routes (Unit 13) to real routing structure
5. Remove `AuthTest.tsx` (no longer needed)

**When to Transition**:
- After Unit 13 (Protected Routes) and Unit 14 (User Menu) are complete
- After validating auth flows work in isolation
- Before Phase 3 (Comprehensive Testing)

This approach allows thorough testing of auth components in isolation before integrating into production routing and layout.

---

### Unit 13: Protected Routes & Auth Guards

**Goal**: Implement route protection to redirect unauthenticated users

**Prerequisites**:

- Unit 11 completed
- React Router configured

**Deliverables**:

- [ ] Create `frontend/src/components/ProtectedRoute.tsx` component
- [ ] Accept `children` prop (React nodes to render if authenticated)
- [ ] Read auth state from Redux:
      `const { isAuthenticated } = useSelector(s => s.auth)`
- [ ] If authenticated, render children
- [ ] If not authenticated, redirect to `/login` or show auth modal
- [ ] Add optional `redirectTo` prop to customize redirect path
- [ ] Wrap protected pages in router:
  - [ ] Dashboard/courses pages
  - [ ] Profile page
  - [ ] Progress tracking pages
- [ ] Create `frontend/src/hooks/useRequireAuth.ts` hook (alternative approach):
  - [ ] Check `isAuthenticated`
  - [ ] Redirect if false using `navigate('/login')`
  - [ ] Return user data if authenticated
- [ ] Document both patterns (component wrapper vs hook)

**Success Criteria**:

- Unauthenticated users redirected from protected pages
- Authenticated users see protected content
- No flash of protected content before redirect
- Redirect preserves intended destination (return URL)

**Estimated Effort**: 2 hours

---

### Unit 14: Auth Status Indicator & User Menu

**Goal**: Display current user and provide logout functionality in app header

**Prerequisites**:

- Unit 12 completed

**Deliverables**:

- [ ] Create `frontend/src/components/UserMenu.tsx` component
- [ ] Display user email or "Sign In" button
- [ ] Show avatar/icon for authenticated users
- [ ] Implement dropdown menu on click:
  - [ ] Profile option (navigate to `/profile`)
  - [ ] Settings option (placeholder)
  - [ ] Logout option
- [ ] Implement logout handler:
  - [ ] Set loading state to true
  - [ ] Call `authService.logout()` (async)
  - [ ] Wait for backend logout completion
  - [ ] Dispatch `clearSession()` to reset Redux auth state
  - [ ] Clear in-memory token via `setAuthToken(null)`
  - [ ] Clear any cached user profile data
  - [ ] Invalidate React Query caches (if applicable)
  - [ ] Redirect to home page `/` or login page `/login`
  - [ ] Handle logout errors gracefully (still clear local state)
- [ ] Show loading spinner during logout
- [ ] Disable logout button while loading (prevent double-click)
- [ ] Add user menu to app header/navbar
- [ ] Make "Sign In" button open AuthModal
- [ ] Add beta badge if `betaAccess === true`
- [ ] Handle missing user data gracefully

**Success Criteria**:

- Authenticated users see their email in header
- Dropdown menu provides navigation and logout
- Logout successfully terminates session
- Sign-in button opens modal for guests

**Estimated Effort**: 2-3 hours

---

## Phase 5: Integration & Polish

### Unit 15: App Initialization & Session Restoration

**Goal**: Restore user session on app load and handle expired sessions

**Prerequisites**:

- All previous units completed

**Deliverables**:

- [ ] Create `frontend/src/hooks/useInitAuth.ts` hook
- [ ] Call on app mount (in root component or layout)
- [ ] Check for existing session via `authService.checkAuthStatus()`
- [ ] If session valid:
  - [ ] Dispatch `setSession(expiresAt)`
  - [ ] Store token in memory
  - [ ] Dispatch `fetchUserProfile()`
- [ ] If session expired:
  - [ ] Attempt auto-refresh via `authService.refreshSession()`
  - [ ] If refresh succeeds, restore session
  - [ ] If refresh fails, dispatch `clearSession()`
- [ ] If no session, leave as guest
- [ ] Add loading state during initialization
- [ ] Show loading spinner in root layout until auth check complete
- [ ] Prevent rendering protected routes until check complete
- [ ] Add error handling for network failures
- [ ] Implement retry logic for transient failures (optional)

**Success Criteria**:

- User remains logged in after page refresh
- Expired sessions automatically refresh if possible
- Invalid sessions clear gracefully
- No flash of login modal for authenticated users

**Estimated Effort**: 2-3 hours

---

### Unit 16: Token Refresh Scheduler & Expiry Monitoring

**Goal**: Proactively refresh tokens before expiry to prevent interruptions

**Prerequisites**:

- Unit 14 completed

**Deliverables**:

- [ ] Create `frontend/src/hooks/useTokenRefresh.ts` hook
- [ ] Read `expiresAt` from Redux auth state
- [ ] Calculate time until expiry
- [ ] Schedule refresh 5 minutes before expiry using `setTimeout`
- [ ] Call `authService.refreshSession()` when scheduled
- [ ] Update Redux with new `expiresAt` on successful refresh
- [ ] Clear session if refresh fails (user needs to re-login)
- [ ] Clear timeout on component unmount
- [ ] Reschedule if `expiresAt` changes (user action triggered refresh)
- [ ] Add visibility change handler:
  - [ ] Check expiry when tab becomes visible
  - [ ] Refresh immediately if expired while tab was hidden
- [ ] Add logging for refresh events (success/failure)
- [ ] Use hook in root layout component

**Success Criteria**:

- Tokens refresh automatically before expiry
- User never experiences session interruption during active use
- Refresh triggered on tab visibility after long absence
- No unnecessary refresh calls (respect cooldown)

**Estimated Effort**: 2-3 hours

---

### Unit 17: Testing & Documentation

**Goal**: Ensure auth flows work end-to-end and document for future developers

**Prerequisites**:

- All implementation units completed

**Deliverables**:

- [ ] Manual testing checklist:
  - [ ] Sign up new user → both user and agent-user auth accounts created
  - [ ] Login existing user → cookies set
  - [ ] Access protected route while authenticated → allowed
  - [ ] Access protected route while guest → redirected
  - [ ] Logout → cookies cleared, redirected to home
  - [ ] Refresh token proactively → new expiry set
  - [ ] Let token expire → auto-refresh on next request
  - [ ] Close tab and reopen → session restored
  - [ ] Invalid credentials → error displayed
  - [ ] Network error during login → graceful handling
- [ ] Create developer documentation:
  - [ ] Architecture diagram (already provided above)
  - [ ] Backend: how to use `get_user_scoped_client` in new endpoints
  - [ ] Backend: when to use admin vs user client
  - [ ] Frontend: how to protect new routes
  - [ ] Frontend: how to access current user in components
  - [ ] Token lifecycle and refresh strategy
  - [ ] Cookie security settings by environment
  - [ ] Common troubleshooting scenarios
- [ ] Add inline code comments for complex auth logic
- [ ] Create this PRD as permanent reference
- [ ] Add README section on authentication

**Success Criteria**:

- All manual test cases pass
- Documentation covers common use cases
- New developers can implement auth-protected features without confusion

**Estimated Effort**: 3-4 hours

---

## Technical Specifications

### Environment Variables

**Backend (`backend/.env`)**:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Admin access, keep secret
SUPABASE_ANON_KEY=eyJhbGc...          # Public anon key for RLS
ENV=production                         # or 'local', 'dev'
```

**Frontend (`frontend/.env`)**:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1  # Backend base URL
```

### Security Considerations

1. **httpOnly Cookies**: Access/refresh tokens never exposed to JavaScript,
   preventing XSS theft
2. **Secure Flag**: Cookies use `secure=true` in production (HTTPS only)
3. **SameSite Policy**: `none` for cross-origin production, `lax` for
   same-origin dev
4. **No localStorage**: Tokens never stored in localStorage (vulnerable to XSS)
5. **In-Memory Only**: Frontend stores token in memory (lost on refresh,
   restored from cookie via backend)
6. **Service Role Protection**: Service role key only on backend, never exposed
   to frontend
7. **RLS Enforcement**: All user operations use user-scoped client with
   JWT-based RLS
8. **Agent-User Tracking**: Every Supabase user has corresponding agent_user
   record for app-level permissions

### API Endpoint Summary

**Backend Routes** (`/api/v1`):

- `POST /auth/signup` - Create new user, set cookies, create agent_user
- `POST /auth/login` - Authenticate user, set cookies
- `POST /auth/logout` - Clear cookies, end session
- `POST /auth/refresh` - Refresh access token using refresh token
- `GET /auth/me` - Get current user (auto-refreshes if needed)
- `GET /me/profile` - Get user profile from agent_user table

### Data Models

**Supabase auth.users** (managed by Supabase):

Contains **both user and agent-user accounts**:

- `id` (UUID, PK)
- `email` (string, unique)
  - User accounts: actual user email (e.g., `user@example.com`)
  - Agent accounts: generated email (e.g., `agent_{user_id}@code45.internal`)
- `encrypted_password` (string, Supabase-managed)
- `created_at`, `updated_at` (timestamps)
- `user_metadata` (JSONB, optional app-specific data)

**Agent Credential Mapping** (secure backend storage, NOT in database):

Secrets manager or encrypted config:

```json
{
  "user_123-abc": {
    "agent_email": "agent_123-abc@code45.internal",
    "agent_password": "securely-generated-random-password"
  }
}
```

### Frontend State Shape

**Redux `authSlice`**:

```typescript
{
  isAuthenticated: boolean,
  expiresAt: number | null,  // Epoch milliseconds
  status: 'idle' | 'authenticated' | 'guest',
  betaAccess: boolean | null,
  siteBeta: boolean | null,
  loadingProfile: boolean
}
```

---

## Success Metrics

1. **Security**: Zero XSS token theft incidents (httpOnly cookies)
2. **UX**: <100ms perceived latency for authenticated requests (token in memory)
3. **Reliability**: >99% session restoration success rate on page refresh
4. **Developer Experience**: <5 minutes to protect new route or add
   authenticated endpoint
5. **Session Duration**: Users remain logged in for full token lifetime
   (configurable, typically 1 hour with auto-refresh)

---

## Future Enhancements (Out of Scope)

- [ ] Social auth (Google, GitHub OAuth)
- [ ] Two-factor authentication (2FA)
- [ ] Password reset flow
- [ ] Email verification requirement
- [ ] Account deletion/deactivation
- [ ] Session management UI (view all active sessions, revoke)
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for security events
- [ ] Refresh token rotation (Supabase feature)
- [ ] Biometric authentication

---

## Appendix: Common Patterns

### Adding a New Protected Backend Endpoint

```python
from fastapi import APIRouter, Depends
from ...api.auth_utils import get_user_scoped_client

router = APIRouter(tags=["example"])

@router.get("/protected/data")
async def get_protected_data(client=Depends(get_user_scoped_client)):
    user_id = client.user_id  # Extract user ID
    # Query with RLS enforcement
    result = client.table("your_table").select("*").eq("user_id", user_id).execute()
    return result.data
```

### Adding a New Protected Frontend Route

```tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>;
```

### Accessing Current User in Component

```tsx
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

function MyComponent() {
  const { isAuthenticated, betaAccess } = useSelector((s: RootState) => s.auth);

  if (!isAuthenticated) return <SignInPrompt />;

  return <div>Welcome, {betaAccess ? "Beta User" : "User"}!</div>;
}
```

---

## Document Metadata

- **Version**: 1.1
- **Status**: Updated (Removed Custom JWT, Clarified Agent Pattern)
- **Last Updated**: 2025-11-27
- **Author**: AI Coding Assistant (documenting existing implementation)
- **Reviewers**: Development Team
- **Related Documents**:
  - `AGENTS.md` - Backend conventions
  - `UnitFeedback_PRD_v0.1.md` - Feature PRD template reference
  - Individual learning units for step-by-step implementation

---

## Implementation Status Summary

**Total Units**: 17  
**Completed**: Varies by deployment  
**In Progress**: Varies  
**Pending**: Varies

**Critical Architecture Note**: This implementation uses **ZERO custom JWT
logic**. All authentication is handled by Supabase's standard auth service. The
only enhancement is the agent-user pattern, where each user has a corresponding
agent auth account that uses the same Supabase authentication flow.

This PRD serves as both implementation guide for future similar integrations and
reference documentation for the standard Supabase auth pattern with agent-user
enhancement.