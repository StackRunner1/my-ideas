# Supabase Authentication Implementation - Product Requirements Document v1.1

## Overview

Comprehensive documentation of the **standard Supabase authentication integration** in the code45 platform, covering frontend and backend implementation with secure token management, automatic refresh, and user lifecycle flows.

**Key Architecture**: This implementation follows **Supabase best practices** with zero custom JWT logic. The only enhancement: when a user signs up, we automatically create an **agent-user** (a separate Supabase auth user) that acts on behalf of the user for AI-driven database operations. Both users authenticate via standard Supabase `sign_in_with_password`, and both use the same
RLS-enforced endpoints.

## Business Context

- **Problem**: Modern web applications require secure, scalable authentication with minimal custom infrastructure, PLUS AI agents need secure database access 
- **Solution**: Standard Supabase Auth integration with httpOnly cookie-based session management, automatic token refresh, and RLS-enforced data access. Agent-users leverage the same auth flow for autonomous operations.
- **Value**: Production-ready authentication with industry best practices, reduced development time, built-in security features, and secure AI agent access

## Implementation Scope

This PRD documents the complete authentication architecture including:

1. **Backend Infrastructure**: Supabase client setup, admin and user-scoped clients, dependency injection patterns
2. **Backend Auth Endpoints**: Signup, login, logout, token refresh, session management
3. **Frontend Infrastructure**: Enhanced API client with auto-refresh, Redux auth state management
4. **Frontend Auth UI**: Sign-in/sign-up modals, protected routes, auth status indicators
5. **Security Patterns**: httpOnly cookies, JWT token handling, automatic agent-user creation
6. **Integration Points**: RLS enforcement, user profile management, cross-service authentication

## AI Coding Agent (Hithub CoPilot or similar) Instructions
**IMPORTANT**: In this PRD document, prompts aimed at the AI coding assistant to strat or continue the implementaiton of this PRD end-to-end (in cinjunction with the learner and via the Github Copilot Chat) will be marked with `## AI PROMPT` headings.
- **The learner** pastes the prompt into the chat to initiate the start or the coninuation of the code implementation led by the ai coding assistant.
- **AI Coding Assistant** reads and executes on the prompt IF not provided by the learner. The AI Coding Assistant should execute the tasks specified uner each unit and - upon completion - mark off each task with [x] = completed or [~] = in progress depending on status. Sections (---) marked with "PAUSE" are milestone points where the AI Coding Assistant should check in with the learner, ensure all checklists in this PRD reflect the latest progress, and await the next learner instructions OR - after approval - move to readin the next `## AI PROMPT` and start execution.




## Prerequisites: Environment Setup (Before Unit 1)

### Backend Setup

- [ ] Python 3.12+ installed
- [ ] Create conda environment: `conda create -n ideas python=3.12`
- [ ] Activate environment: `conda activate ideas`
- [ ] Create backend/.env file with:
      SUPABASE_URL=https://your-project.supabase.co
      SUPABASE_SERVICE_ROLE_KEY=eyJ...
      SUPABASE_ANON_KEY=eyJ...
      ENV=development
- [ ] Install base dependencies: `pip install fastapi uvicorn python-dotenv`

### Setup

- [ ] Session 1 complete (app bootstrapped, FE and BE scaffold in place)
- [ ] Install FE base dependencies from /frontend: `npm install`, Verify dev server runs: `npm run dev`
- [ ] Install BE requirements from /backend: `pip install -re requirements.txt`, verify dev server runs: `python -m uvicorn app.main:app --reload --log-level info`

### Supabase Setup

- [ ] Create Supabase project at supabase.com
- [ ] Note project URL and anon key from Settings → API
- [ ] Note service role key from Settings → API (keep secret!)
- [ ] **CRITICAL**: Dashboard → Auth → Providers → Email → Disable "Confirm email"
- [ ] Create test user in Dashboard → Auth → Users (for testing)

### Development Workflow

- [ ] Two terminals: one for backend (`python -m uvicorn app.main:app --reload`), one for frontend (`npm run dev`)
- [ ] Backend runs on http://localhost:8000
- [ ] Frontend runs on http://localhost:5173
- [ ] API base URL in frontend .env: `VITE_API_BASE_URL=http://localhost:8000/api/v1`

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

### Complete Auth State Flow (Login/Signup → Authenticated UI)

**Step-by-Step Flow**:

1. **User Action**: Clicks "Sign In" button in Navigation (or PublicLayout)
2. **Modal Opens**: AuthModal component renders with sign-in/sign-up tabs
3. **User Submits**: Enters credentials and clicks "Sign In" or "Sign Up"
4. **API Call**: `authService.login()` or `authService.signup()` called
5. **Backend Response**: Returns `{ user: {...}, expiresAt: number }`
6. **Backend Sets Cookies**: httpOnly cookies with access_token and refresh_token
7. **Frontend Redux Update**: `dispatch(setSession({ expiresAt }))` sets:
   - `isAuthenticated: true`
   - `status: 'authenticated'`
   - `expiresAt: <timestamp>`
8. **Profile Fetch**: `dispatch(fetchUserProfile())` calls `/auth/me/profile`
9. **Redux Profile Update**: Stores `betaAccess`, `siteBeta` flags
10. **Modal Closes**: `onOpenChange(false)` dismisses AuthModal
11. **Navigation Re-renders**: Reads `isAuthenticated: true` from Redux
12. **UI Updates Immediately**:
    - "Sign In" button disappears
    - Avatar with user initial appears
    - Nav links change from "Home | About" to "Home | Dashboard | Ideas"
13. **User Sees Change**: Without route change, navigation reflects auth state
14. **Protected Routes Accessible**: User can now click Dashboard/Ideas links

**Critical Implementation Details**:

- **No route redirect needed**: User stays on current page (e.g., `/`)
- **Immediate visual feedback**: Navigation component observes Redux state changes
- **Both layouts identical**: PublicLayout and UserLayout use same Navigation component
- **Auth state in cookies + Redux**: Cookies for backend auth, Redux for UI state
- **Auto token refresh**: Backend `/auth/refresh` endpoint handles token renewal

**Logout Flow**:

1. User clicks avatar → dropdown → "Logout"
2. `authService.logout()` calls backend `/auth/logout`
3. Backend revokes tokens via `auth.sign_out()` and clears cookies
4. Frontend `dispatch(clearSession())` sets `isAuthenticated: false`
5. Frontend `setAuthToken(null)` clears in-memory state
6. Frontend `navigate('/')` redirects to home
7. Navigation re-renders showing "Sign In" button

---

## Redux State Reference

### Auth Slice State Shape

The authentication state is managed in Redux with the following structure:

```
isAuthenticated: boolean     - UI auth state, drives Navigation component rendering
expiresAt: number | null     - Token expiry timestamp (epoch milliseconds)
status: 'idle' | 'authenticated' | 'guest' - Overall auth status
betaAccess: boolean | null   - Future feature flag for beta access
siteBeta: boolean | null     - Future feature flag for site-wide beta
loadingProfile: boolean      - Loading state during profile fetch
```

### Critical State Transitions

**Login/Signup Flow:**

- Action: `dispatch(setSession({ expiresAt }))`
- Result: `isAuthenticated: true`, `status: 'authenticated'`
- Effect: Navigation component re-renders to show avatar and auth links

**Profile Fetch:**

- Action: `dispatch(fetchUserProfile())`
- Result: Loads `betaAccess` and `siteBeta` from backend
- Effect: Profile data available for conditional UI features

**Logout Flow:**

- Action: `dispatch(clearSession())`
- Result: `isAuthenticated: false`, `status: 'guest'`, all flags reset to null
- Effect: Navigation component re-renders to show "Sign In" button

**Auto-Refresh:**

- Backend handles token refresh automatically via httpOnly cookies
- Redux state remains `isAuthenticated: true` during refresh
- Frontend apiClient retries failed requests after refresh

### Where State is Used

**Navigation Component:**

- Reads `isAuthenticated` to conditionally render avatar vs "Sign In" button
- Switches nav links between public (Home, About) and auth (Home, Dashboard, Ideas)

**ProtectedRoute Component:**

- Reads `isAuthenticated` to allow access or redirect to home
- Wraps Dashboard, Ideas, Profile pages

**AuthModal Component:**

- Dispatches `setSession()` after successful login/signup
- Dispatches `fetchUserProfile()` to load user data

---

## Unit Dependencies & Critical Path

### Unit Dependency Graph

```
Phase 1: Backend Foundation
│
├─ Unit 1 (Supabase Client)
│   └─> Unit 2 (Auth Utils)
│        └─> Unit 3 (User-Scoped Client)
│             └─> Unit 4 (Signup)
│                  ├─> Unit 5 (Login)
│                  │    └─> Unit 6 (Logout/Refresh)
│                  │         └─> Unit 7 (Profile)
│                  │              └─> Unit 8 (Agent Service)
│                  │
│                  └─> [Agent-user creation happens in Unit 4]

Phase 2: Frontend Foundation
│
├─ Unit 9 (API Client with auto-refresh)
│   └─> Unit 10 (Redux Auth Slice)
│        └─> Unit 11 (Auth Service Layer)
│             └─> Unit 11.5 (shadcn/ui Setup)
│                  └─> Unit 12 (AuthModal)

Phase 3: Routing & Navigation
│
├─ Unit 13 (Protected Routes)
│   └─> Unit 13.5 (Routing Infrastructure + Layouts)
│        └─> Unit 14 (Navigation Component)

Phase 4: Integration & Polish
│
├─ Unit 15 (Session Restoration)
│   └─> Unit 16 (Token Refresh Scheduler)
│        └─> Unit 17 (E2E Testing)
```

### Critical Path for Basic Auth

**Minimum units required for working signup/login/logout:**

1. Unit 1 → Supabase client setup
2. Unit 2 → Auth dependencies and token extraction
3. Unit 4 → Signup endpoint (includes agent-user creation)
4. Unit 5 → Login endpoint
5. Unit 6 → Logout endpoint
6. Unit 9 → Frontend API client with auto-refresh
7. Unit 10 → Redux auth state management
8. Unit 11 → Auth service functions
9. Unit 12 → AuthModal UI component
10. Unit 14 → Navigation component

**Optional but recommended:**

- Unit 3: User-scoped client (needed for profile endpoints)
- Unit 7: Profile endpoint (enables betaAccess features)
- Unit 8: Agent service (only if using AI features)
- Unit 13: Protected routes (recommended for production)
- Unit 13.5: Routing infrastructure (best practice for scalable routing)

**Skippable for initial testing:**

- Unit 15-17: These enhance UX but aren't required for basic auth flow

---

## Project File Structure

### Backend Structure (After Completion)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app with CORS, auth routes mounted
│   │
│   ├── core/
│   │   └── config.py                # Pydantic settings for Supabase credentials (Unit 1)
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   └── supabase_client.py       # get_admin_client(), get_user_client(jwt) (Unit 1)
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth_utils.py            # get_current_user(), auto-refresh logic (Unit 2)
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── auth.py              # POST /signup, /login, /logout, /refresh (Units 4-6)
│   │                                # GET /me, /me/profile (Unit 7)
│   │
│   └── services/
│       ├── __init__.py
│       ├── agent_credentials.py     # In-memory agent password storage (Unit 8)
│       └── agent_service.py         # get_agent_session(), session caching (Unit 8)
│
├── requirements.txt                 # FastAPI, supabase, pydantic-settings, uvicorn
└── .env                             # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.
```

### Frontend Structure (After Completion)

```
frontend/
├── src/
│   ├── main.tsx                     # App entry with BrowserRouter, Redux Provider
│   │
│   ├── config/
│   │   └── paths.ts                 # PATHS constants for type-safe routing (Unit 13.5)
│   │
│   ├── lib/
│   │   └── apiClient.ts             # Axios instance with auto-refresh, httpOnly cookies (Unit 9)
│   │
│   ├── store/
│   │   ├── index.ts                 # Redux store configuration (Unit 10)
│   │   ├── authSlice.ts             # Auth state: isAuthenticated, expiresAt, etc. (Unit 10)
│   │   └── hooks.ts                 # useAppDispatch, useAppSelector (Unit 10)
│   │
│   ├── services/
│   │   └── authService.ts           # signup(), login(), logout(), etc. (Unit 11)
│   │
│   ├── components/
│   │   ├── AuthModal.tsx            # Sign in/up modal with tabs (Unit 12)
│   │   ├── Navigation.tsx           # Adaptive nav: public vs auth state (Unit 14)
│   │   ├── ProtectedRoute.tsx       # Route guard component (Unit 13)
│   │   └── ui/                      # shadcn/ui components (Unit 11.5)
│   │       ├── dialog.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── avatar.tsx
│   │       ├── dropdown-menu.tsx
│   │       └── ... (other shadcn components)
│   │
│   ├── hooks/
│   │   └── useRequireAuth.ts        # Auth hook alternative to ProtectedRoute (Unit 13)
│   │
│   ├── layouts/
│   │   ├── PublicLayout.tsx         # Layout with Navigation for public routes (Unit 13.5)
│   │   └── UserLayout.tsx           # Layout with Navigation for auth routes (Unit 13.5)
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx            # Centralized route configuration (Unit 13.5)
│   │
│   └── pages/
│       ├── Home.tsx                 # Landing page (public)
│       ├── About.tsx                # About page (public)
│       ├── Dashboard.tsx            # Protected dashboard
│       ├── Ideas.tsx                # Protected ideas list
│       └── Profile.tsx              # Protected user profile
│
├── package.json                     # Dependencies: react, redux, axios, shadcn/ui
├── tsconfig.json                    # TypeScript config with path aliases (@/*)
├── vite.config.js                   # Vite config with path resolution
├── tailwind.config.cjs              # Tailwind + shadcn/ui theme
├── components.json                  # shadcn/ui configuration
└── .env.local                       # VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Key File Relationships

**Backend Auth Flow:**

- `main.py` → mounts `auth.py` routes at `/api/v1/auth`
- `auth.py` → uses `get_admin_client()` for signup/login
- `auth.py` → uses `get_current_user()` for protected endpoints
- `auth_utils.py` → extracts tokens, validates with Supabase, auto-refreshes
- `agent_service.py` → manages agent sessions for AI operations

**Frontend Auth Flow:**

- `main.tsx` → wraps app with Redux Provider and BrowserRouter
- `AppRoutes.tsx` → defines all routes with PublicLayout/UserLayout
- `Navigation.tsx` → reads `isAuthenticated` from Redux, shows in both layouts
- `AuthModal.tsx` → calls `authService.login()`, dispatches `setSession()`
- `authService.ts` → uses `apiClient` with auto-refresh
- `apiClient.ts` → intercepts 401s, calls `/auth/refresh`, retries request

---

## Token Management Strategy (Standard Supabase)

1. **Access Token**: Short-lived Supabase JWT stored in httpOnly cookie + Redux state (for display only)
2. **Refresh Token**: Long-lived Supabase token stored in httpOnly cookie only
3. **Auto-Refresh**: Backend automatically refreshes expired access tokens using Supabase's `refresh_session()` API
4. **Fallback**: Frontend can trigger refresh on 401 responses
5. **No Custom Logic**: All tokens generated and validated by Supabase Auth service

### Client Types

- **Admin Client**: Uses service role key, bypasses RLS, for:
  - Creating agent-user auth accounts during user signup
  - Admin operations (feedback summaries, course management)
- **User-Scoped Client**: Bound to user's Supabase JWT, enforces RLS, for:
  - All regular user operations
  - All agent-user operations (agent authenticates, gets its own JWT)

### Agent-User Pattern

1. **Creation**: When user signs up, backend creates a second Supabase auth user (agent-user) via admin client using
   `signup(email=agent_<uuid>@..., password=random)`
2. **Storage**: Agent email + password stored in secure backend store (NOT in database)
3. **Login**: When AI needs to perform DB operations, backend:
   - Calls `sign_in_with_password(agent_email, agent_password)` via admin client
   - Gets agent's Supabase session (access_token, refresh_token)
   - Creates user-scoped client with agent's token
   - Performs CRUD via standard endpoints with RLS enforcement
4. **Security**: Agent credentials never sent to frontend; agent operations logged for audit

---

## Implementation Plan & Sequence

### Legend

- `[ ]` = Pending (not started)
- `[~]` = In Progress (partially implemented)
- `[ ]` = Completed (fully implemented and tested)

---

## AI PROMPT:
Initial Engagement Prompt: 

I need you to implement the Supabase Authentication PRD (Beast_Mode_SB_Auth_PRD.md) end-to-end.

EXECUTION REQUIREMENTS:
- Follow the unit sequence exactly as documented (Units 1-17)
- Mark deliverables as [x] in the PRD as you complete them
- Ask for my approval before proceeding to each new unit OR at key milestones preceeded with sections 'PAUSE'
- Run validation tests after each major phase (backend, frontend, integration)
- Flag any missing dependencies or unclear requirements immediately

TECHNICAL CONSTRAINTS:
- Backend: Python 3.12+, FastAPI, Supabase Python SDK
- Frontend: React 18.2, TypeScript, Vite, Redux Toolkit, shadcn/ui
- Auth: Standard Supabase Auth (no custom JWT logic)
- Cookies: httpOnly cookies for tokens (set by backend)
- State: Redux for UI auth state, cookies for backend auth

START WITH:
- Unit 1: Supabase Client Setup
- Confirm you understand the agent-user pattern before implementing Unit 8
- Verify Supabase email confirmation is disabled before testing signup

Begin with Unit 1.

## Phase 1: Backend Foundation

### Unit 1: Supabase Client Setup & Configuration

**Goal**: Install Supabase Python SDK and establish admin/user client factory functions

**Prerequisites**:

- Python 3.12+ environment
- Supabase project created with URL and service role key
- **Supabase Settings**: Disable email confirmation for development
  - Go to Supabase Dashboard → Authentication → Providers → Email
  - Toggle OFF "Confirm email" (allows immediate login after signup)
  - This prevents `session=None` errors during signup

**Deliverables**:

- [ ] Install `supabase` Python package via pip/requirements.txt
- [ ] Install `pydantic-settings` package via pip/requirements.txt
- [ ] Add environment variables to `.env`: `SUPABASE_URL`,
      `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- [ ] Create `backend/app/core/config.py` with Supabase settings using Pydantic
      BaseSettings
- [ ] Create `backend/app/db/supabase_client.py` module
- [ ] Implement `get_admin_client()` function that returns service role client
- [ ] Implement `get_user_client(jwt)` function that returns RLS-scoped client
- [ ] Add JWT binding logic with version-agnostic fallback for
      `postgrest.auth(token)`
- [ ] Add error handling for missing environment variables
- [ ] Add `SupabaseNotInstalledError` custom exception
- [ ] Document client usage patterns in module docstrings

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

- [ ] Create `backend/app/api/auth_utils.py` module
- [ ] Implement `_extract_token_from_request(request)` helper function
- [ ] Support token extraction from two sources (priority order):
  - [ ] `access_token` httpOnly cookie (primary, Supabase-generated token)
  - [ ] `Authorization: Bearer <token>` header (fallback for API clients)
- [ ] Implement `_cookie_config()` helper for environment-aware cookie settings
- [ ] Configure `secure=True` for production, `secure=False` for local/dev
- [ ] Configure `samesite="none"` for production (cross-origin),
      `samesite="lax"` for local
- [ ] Implement `_set_auth_cookies(response, access_token, refresh_token, ...)`
      helper
- [ ] Set httpOnly cookies with appropriate max-age from token expiry
- [ ] Implement `get_current_user(request, response)` dependency
- [ ] Validate token using Supabase `auth.get_user(token)`
- [ ] Implement automatic token refresh on expiry using refresh_token cookie
- [ ] Handle version differences in Supabase refresh_session API
- [ ] Return user dict: `{"user": {"id": str, "email": str, "token": str}}`
- [ ] Raise 401 HTTPException if authentication fails

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

- [ ] Add `get_user_scoped_client(request, response)` dependency to
      `auth_utils.py`
- [ ] Call `get_current_user()` to validate session and get user data
- [ ] Create user-scoped client using `get_user_client(user["token"])`
- [ ] Attach `user_id` attribute to client for convenience:
      `client.user_id = user_id`
- [ ] Attach `token` attribute to client: `client.token = token`
- [ ] Return client object with RLS enforcement active
- [ ] Document that client is type `Any` (no SupabaseClient class)
- [ ] Document expected attributes: `client.table()`, `client.auth`,
      `client.user_id`, `client.token`
- [ ] Add usage example in docstring

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

- [ ] Create `backend/app/api/routes/auth.py` module
- [ ] Create FastAPI router with `tags=["auth"]`
- [ ] Define `SignupRequest` Pydantic model with `email` and `password` fields
- [ ] Add password validation (min 8 chars, complexity rules optional)
- [ ] Define `AuthResponse` Pydantic model with camelCase serialization
- [ ] Implement `POST /auth/signup` endpoint:
  - [ ] **Step 1**: Call Supabase
        `auth.sign_up(email=user_email, password=user_password)` via admin
        client
  - [ ] Extract user `access_token`, `refresh_token`, expiry, and `user_id` from
        response
  - [ ] **Step 2**: Generate agent-user credentials:
    - [ ] `agent_email` = `agent_{user_id}@code45.internal` (or similar pattern)
    - [ ] `agent_password` = securely generated random password (store in
          secrets manager)
  - [ ] **Step 3**: Call Supabase
        `auth.sign_up(email=agent_email, password=agent_password)` via admin
        client to create agent auth account
  - [ ] **Step 4**: Store agent credentials securely (NOT in database, use
        secrets manager or encrypted config) mapped to `user_id`
  - [ ] **Step 5**: Calculate `expiresAt` timestamp (now + expires_in)
  - [ ] **Step 6**: Call `_set_auth_cookies()` to store user tokens in httpOnly
        cookies
- [ ] Return user data: `{"user": {"id": ..., "email": ...}, "expiresAt": ...}`
- [ ] Handle duplicate email error (400)
- [ ] Handle Supabase API errors (500)
- [ ] Add logging for successful signups (user AND agent creation)

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

- [ ] Define `LoginRequest` Pydantic model with `email` and `password`
- [ ] Implement `POST /auth/login` endpoint
- [ ] Call Supabase `auth.sign_in_with_password(email=..., password=...)`
- [ ] Extract tokens and expiry from response
- [ ] Set httpOnly cookies using `_set_auth_cookies()`
- [ ] Return `AuthResponse` with user and expiresAt
- [ ] Handle invalid credentials (401)
- [ ] Handle account locked/disabled errors (403)
- [ ] Add logging for login attempts (success and failure)

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

- [ ] Implement `POST /auth/logout` endpoint
- [ ] Extract access_token from request (cookie or header)
- [ ] Call Supabase `auth.sign_out()` with user's token (REQUIRED for
      server-side invalidation)
  - [ ] This revokes the refresh token in Supabase's database
  - [ ] Prevents token reuse even if cookies leaked
- [ ] Delete `access_token` and `refresh_token` httpOnly cookies
  - [ ] Set `max_age=0` to expire immediately
  - [ ] Set same `path`, `domain`, `samesite` as when created
- [ ] Optional: Sign out agent-user session if tracking active sessions
  - [ ] Retrieve agent credentials for this user
  - [ ] Call Supabase `auth.sign_out()` for agent session
  - [ ] Clean up any cached agent tokens
- [ ] Return success response: `{"message": "Logged out successfully"}`
- [ ] Handle already-logged-out case gracefully (don't error)
- [ ] Implement `POST /auth/refresh` endpoint
- [ ] Extract refresh_token from cookie
- [ ] Call Supabase `auth.refresh_session(refresh_token)`
- [ ] Set new cookies with refreshed tokens
- [ ] Return new expiresAt timestamp
- [ ] Handle missing/invalid refresh token (401)
- [ ] Implement refresh cooldown to prevent abuse (5-second minimum between
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

- [ ] Implement `GET /auth/me` endpoint using `get_current_user` dependency
- [ ] Return user data with automatic token refresh if needed
- [ ] Implement `GET /me/profile` endpoint using `get_user_scoped_client`
- [ ] Query user metadata from Supabase auth user metadata or app-specific
      user_profiles table (if exists)
- [ ] Return profile data: `{id, email, name, beta_access, created_at, ...}`
- [ ] Use camelCase serialization for frontend compatibility
- [ ] Add profile data to response

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

- [ ] Create `backend/app/services/agent_service.py` module
- [ ] Implement `get_agent_session(user_id)` function:
  - [ ] Retrieve agent email + password from secure storage (mapped to user_id)
  - [ ] Call Supabase `auth.sign_in_with_password(agent_email, agent_password)`
        via admin client
  - [ ] Return agent session (access_token, refresh_token)
  - [ ] Cache session for duration of access token validity
- [ ] Implement `get_agent_client(user_id)` function:
  - [ ] Get agent session via `get_agent_session(user_id)`
  - [ ] Create user-scoped client with agent's access_token:
        `get_user_client(agent_token)`
  - [ ] Return client with RLS enforcement (agent's permissions)
- [ ] Update relevant endpoints to support agent operations:
  - [ ] Add optional `agent_mode: bool = False` parameter to endpoints
  - [ ] If `agent_mode=True`, use `get_agent_client(user_id)` instead of
        `get_user_scoped_client()`
  - [ ] Agent operations use SAME endpoints with SAME RLS policies
- [ ] Example: `POST /units` endpoint:
  - [ ] User request: uses user's token → user's RLS context
  - [ ] Agent request: uses agent's token → agent's RLS context (potentially
        broader permissions)
- [ ] Add audit logging for agent operations:
  - [ ] Log agent actions separately for security review
  - [ ] Include user_id, agent_id, operation, table, timestamp
- [ ] Implement agent session refresh before expiry
- [ ] Handle agent auth failures gracefully (re-authenticate or alert)

**Success Criteria**:

- Agent can authenticate using stored credentials
- Agent operations use standard user-scoped client pattern
- No custom JWT logic; all tokens from Supabase
- RLS enforced for agent operations
- Agent actions auditable and traceable to originating user
- Same endpoints serve both user and agent requests

**Estimated Effort**: 3-4 hours

---
PAUSE

## AI PROMPT:

Run the validation checks below.

VALIDATION CHECKLIST:
- Start backend: python -m uvicorn app.main:app --reload
- Test signup: curl -X POST http://localhost:8000/api/v1/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpass123"}'
- Verify two users created in Supabase Studio (user + agent_user)
- Test login returns session with expiresAt
- Test /auth/me returns user data

Confirm all tests pass, then proceed to Unit 9 (Frontend Setup).

---

## Phase 3: Frontend Infrastructure

### Unit 9: Enhanced API Client with Auto-Refresh

**Goal**: Create Axios client with automatic token refresh and httpOnly cookie
support

**Prerequisites**:

- Backend auth endpoints (Phase 2) completed
- React + TypeScript project setup

**Deliverables**:

- [ ] Install dependencies: `axios`
- [ ] Create `frontend/src/lib/apiClient.ts` module
- [ ] Configure base URL from environment: `VITE_API_BASE_URL` (default:
      `http://localhost:8000/api/v1`)
- [ ] Create Axios instance with `withCredentials: true` for cookie support
- [ ] Set default timeout (30 seconds)
- [ ] Add sanity check warning if base URL lacks version segment
- [ ] Implement in-memory token storage: `inMemoryToken` variable
- [ ] Export `setAuthToken(token)` function to update in-memory token
- [ ] Export `setAllowAutoRefresh(allow)` function to toggle refresh behavior
- [ ] Implement request interceptor:
  - [ ] Add `Authorization: Bearer <token>` header if in-memory token exists
  - [ ] Never read token from localStorage (security)
- [ ] Implement response interceptor for 401 errors:
  - [ ] Track refresh state to coalesce multiple 401s into single refresh
  - [ ] Call `POST /auth/refresh` on first 401
  - [ ] Update in-memory token from response
  - [ ] Retry original request with new token
  - [ ] Only retry once (set `_retry` flag)
  - [ ] Don't retry if request was to `/auth/refresh` itself
  - [ ] Clear token and reject if refresh fails
- [ ] Implement refresh cooldown (5 seconds between attempts)
- [ ] Export configured Axios instance as `apiClient`
- [ ] Add TypeScript types for common response shapes

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

- [ ] Install dependencies: `@reduxjs/toolkit`, `react-redux`
- [ ] Create `frontend/src/store/index.ts` for store configuration
- [ ] Create `frontend/src/store/authSlice.ts` module
- [ ] Define `AuthState` interface:
  - [ ] `isAuthenticated: boolean`
  - [ ] `expiresAt: number | null` (epoch ms)
  - [ ] `status: 'idle' | 'authenticated' | 'guest'`
  - [ ] `betaAccess: boolean | null`
  - [ ] `siteBeta: boolean | null`
  - [ ] `loadingProfile: boolean`
- [ ] Create slice with `createSlice`:
  - [ ] `setSession` reducer: sets auth state and expiresAt
  - [ ] `clearSession` reducer: resets to guest state
- [ ] Create `fetchUserProfile` async thunk:
  - [ ] Call `GET /me/profile`
  - [ ] Extract `betaUser` and `siteBeta` flags
  - [ ] Handle snake_case and camelCase response variations
  - [ ] Add guards to prevent stale responses from overwriting
        `betaAccess: true`
- [ ] Add extra reducers for thunk lifecycle:
  - [ ] `pending`: set `loadingProfile = true`
  - [ ] `fulfilled`: update betaAccess and siteBeta
  - [ ] `rejected`: set `loadingProfile = false`
- [ ] Export actions: `setSession`, `clearSession`
- [ ] Export thunk: `fetchUserProfile`
- [ ] Export reducer as `authReducer`
- [ ] Configure Redux store with auth slice
- [ ] Wrap app in `<Provider store={store}>`

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

- [ ] Create `frontend/src/services/authService.ts` module
- [ ] Define TypeScript interfaces:
  - [ ] `AuthResponse { user: {id, email}, expiresAt: number }`
  - [ ] `SignupCredentials { email, password }`
  - [ ] `LoginCredentials { email, password }`
- [ ] Implement `signup(credentials)` function:
  - [ ] Call `POST /auth/signup` via apiClient
  - [ ] Return `AuthResponse`
  - [ ] Don't store token in localStorage
- [ ] Implement `login(credentials)` function:
  - [ ] Call `POST /auth/login`
  - [ ] Return `AuthResponse`
- [ ] Implement `logout()` function:
  - [ ] Call `POST /auth/logout` via apiClient
  - [ ] Clear in-memory token via `setAuthToken(null)`
  - [ ] Clear any localStorage auth data (if any exists)
  - [ ] Return success/error status
- [ ] Implement `refreshSession()` function:
  - [ ] Call `POST /auth/refresh`
  - [ ] Return new `expiresAt`
- [ ] Implement `checkAuthStatus()` function:
  - [ ] Call `GET /auth/me`
  - [ ] Return user data
  - [ ] Handle 401 gracefully (return null)
- [ ] Add error handling and logging
- [ ] Export all functions

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

- [ ] Configure TypeScript path alias:
  - [ ] Add to `tsconfig.json` compilerOptions:
    ```json
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
    ```
  - [ ] Add to `vite.config.js`:
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
  - [ ] After init completes, install all required components in one command:
    - [ ] Run: `npx shadcn@latest add dialog button input label tabs card checkbox avatar dropdown-menu navigation-menu separator`
    - [ ] Components needed:
      - [ ] `dialog, button, input, label, tabs, card, checkbox` - Auth modal and forms
      - [ ] `avatar` - User display in navigation
      - [ ] `dropdown-menu` - Simple logout dropdown
      - [ ] `navigation-menu` - Main nav structure
      - [ ] `separator` - Visual dividers
    - [ ] This downloads and installs all components to `src/components/ui/`
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

- [ ] Create `frontend/src/components/AuthModal.tsx` using shadcn/ui Dialog
- [ ] Implement modal with Tabs component: "Sign In" and "Sign Up"
- [ ] Create sign-in form using shadcn/ui components:
  - [ ] Email Input component (type=email, required)
  - [ ] Password Input component (type=password, required, min 8 chars)
  - [ ] "Forgot password?" link (placeholder for future)
  - [ ] Button component with loading state
  - [ ] Error message display
- [ ] Create sign-up form using shadcn/ui components:
  - [ ] Email Input component (type=email, required)
  - [ ] Password Input component (type=password, required, min 8 chars)
  - [ ] Confirm password Input component (must match)
  - [ ] Checkbox component for terms acceptance (required)
  - [ ] Button component with loading state
  - [ ] Error message display
- [ ] Implement sign-in handler:
  - [ ] Call `authService.login(credentials)`
  - [ ] **CRITICAL**: Dispatch `setSession({ expiresAt })` to Redux - sets `isAuthenticated: true`
  - [ ] Set token in memory via `setAuthToken(null)` (cookies handle auth, not in-memory tokens)
  - [ ] **CRITICAL**: Dispatch `fetchUserProfile()` thunk to load user data
  - [ ] Close modal on success
  - [ ] Display error on failure
  - [ ] **Result**: Redux `isAuthenticated` becomes `true`, Navigation component re-renders
- [ ] Implement sign-up handler:
  - [ ] Validate password match
  - [ ] Validate password length (min 8 chars)
  - [ ] Validate terms acceptance
  - [ ] Call `authService.signup(credentials)`
  - [ ] **CRITICAL**: Dispatch `setSession({ expiresAt })` to Redux - sets `isAuthenticated: true`
  - [ ] Set token in memory via `setAuthToken(null)` (cookies handle auth)
  - [ ] **CRITICAL**: Dispatch `fetchUserProfile()` thunk
  - [ ] Close modal on success
  - [ ] Display error (e.g., "Email already exists")
  - [ ] **Result**: Redux `isAuthenticated` becomes `true`, Navigation component re-renders
- [ ] Add client-side validation feedback (real-time)
- [ ] Make modal dismissible via ESC key or backdrop click (shadcn/ui Dialog default)
- [ ] Add keyboard navigation support (tab order) (shadcn/ui Dialog default)

**Success Criteria**:

- Modal opens and displays sign-in/sign-up tabs
- Form validation provides immediate feedback
- Successful auth closes modal and updates Redux state
- Errors displayed clearly to user
- Accessible via keyboard

**Testing & Validation (After Unit 12)**:

---
PAUSE

## AI PROMPT:
The Auth components are created, run these validation checks.

VALIDATION:
- Run npm run dev
- Verify AuthModal renders with sign-in/sign-up tabs
- Test form validation (password match, min length, terms checkbox)
- Verify shadcn/ui components render with proper styling
- Test modal keyboard navigation (ESC to close, Tab order)

Before proceeding to Unit 13, validate the auth flow and guide me through the manual tests:

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

Confirm components work, then proceed to Unit 13 (Protected Routes).

---

### Temporary vs. Production Frontend Structure

**Current State (Temporary Testing Setup)**:

- `src/AuthTest.tsx` - Isolated auth modal testing component
- `src/main.tsx` - Imports `AuthTest` instead of `App`
- Purpose: Allows focused testing of auth flows without routing/nav complexity

**Transition to Production** (After Unit 14 completion):

1. Revert `main.tsx` to import `App.tsx`
2. Create layout components to visually demonstrate auth state:
   - `src/layouts/PublicLayout.tsx` - For unauthenticated users (shows "Sign In" in header)
   - `src/layouts/UserLayout.tsx` - For authenticated users (shows UserMenu, logout)
3. Integrate `AuthModal` into PublicLayout header
4. Implement `UserMenu` (Unit 14) in UserLayout header
5. Use layouts in routing structure to automatically switch UI based on auth state
6. Remove `AuthTest.tsx` (no longer needed)

**Layout Implementation Benefits**:

- **Educational**: Clearly demonstrates public vs authenticated UI patterns
- **Visual Feedback**: Learners see immediate UI changes when auth state changes
- **Best Practice**: Teaches separation of concerns (public vs authenticated experiences)
- **Reusable**: Layouts can wrap multiple routes, reducing duplication

**Recommended Implementation** (Unit 15 or earlier):

- Create `PublicLayout` with header showing "Sign In" button (triggers AuthModal)
- Create `UserLayout` with header showing UserMenu dropdown
- Both layouts should render `<Outlet />` for child routes
- Use in router: public routes → PublicLayout, protected routes → UserLayout

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
- [ ] If not authenticated, redirect to `/` (home page)
- [ ] Preserve intended destination via location state
- [ ] Create `frontend/src/hooks/useRequireAuth.ts` hook (alternative approach):
  - [ ] Check `isAuthenticated`
  - [ ] Redirect if false using `navigate('/')`
  - [ ] Support optional `redirectTo` parameter
  - [ ] Return auth state for component use
- [ ] Document both patterns (component wrapper vs hook)

**Success Criteria**:

- Unauthenticated users redirected from protected pages
- Authenticated users see protected content
- No flash of protected content before redirect
- Redirect preserves intended destination (return URL)

**Estimated Effort**: 2 hours

---

### Unit 13.5: Routing Infrastructure & Path Management

**Goal**: Establish centralized routing patterns and type-safe path constants

**Prerequisites**:

- Unit 13 completed
- React Router installed

**Deliverables**:

- [ ] Create `frontend/src/config/paths.ts`:
  - [ ] Export `PATHS` object with route constants (HOME, ABOUT, DASHBOARD, IDEAS, PROFILE)
  - [ ] Use TypeScript `as const` for type safety
  - [ ] Document purpose: single source of truth for all route paths
  - [ ] Export `AppPath` type helper
- [ ] Create `frontend/src/routes/AppRoutes.tsx`:
  - [ ] Import `PATHS` from config
  - [ ] Define all application routes using `<Routes>` and `<Route>`
  - [ ] Use nested routes with layouts (PublicLayout, UserLayout)
  - [ ] Import and use `ProtectedRoute` for authenticated routes
- [ ] Create `frontend/src/layouts/PublicLayout.tsx`:
  - [ ] **CRITICAL**: Use shared `Navigation` component (not custom header)
  - [ ] Import `Navigation` from `@/components/Navigation`
  - [ ] Render `<Outlet />` for child routes
  - [ ] Footer with copyright
  - [ ] Navigation component adapts automatically based on Redux `isAuthenticated` state
- [ ] Create `frontend/src/layouts/UserLayout.tsx`:
  - [ ] **CRITICAL**: Use same shared `Navigation` component as PublicLayout
  - [ ] Import `Navigation` from `@/components/Navigation`
  - [ ] Render `<Outlet />` for child routes
  - [ ] Footer with copyright
  - [ ] Both layouts should be structurally identical (Navigation handles auth state differences)
- [ ] Create placeholder page components:
  - [ ] `frontend/src/pages/Home.tsx` - Landing page
  - [ ] `frontend/src/pages/About.tsx` - About page
  - [ ] `frontend/src/pages/Dashboard.tsx` - Dashboard with stats
  - [ ] `frontend/src/pages/Ideas.tsx` - Ideas list
  - [ ] `frontend/src/pages/Profile.tsx` - User profile
- [ ] Update `frontend/src/main.tsx`:
  - [ ] Import `AppRoutes` instead of `AuthTest`
  - [ ] Remove AuthTest import and usage
  - [ ] Keep BrowserRouter and Redux Provider wrapper

**Example Structure**:

```tsx
// paths.ts
export const PATHS = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
} as const;

// AppRoutes.tsx
<Routes>
  <Route element={<PublicLayout />}>
    <Route path={PATHS.HOME} element={<Home />} />
  </Route>
  <Route element={<UserLayout />}>
    <Route
      path={PATHS.DASHBOARD}
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
  </Route>
</Routes>;
```

**Success Criteria**:

- All routes centralized in `AppRoutes.tsx`
- Navigation uses `PATHS` constants, not hardcoded strings
- **Both PublicLayout and UserLayout use the shared Navigation component**
- **Navigation component displays different UI based on Redux `isAuthenticated` state**
- After login/signup, navigation switches immediately (no route change needed)
- `<Outlet />` correctly renders child components
- No TypeScript errors for route paths

**Implementation Notes**:

- **Layout Pattern**: Both layouts are structurally identical and use the same Navigation component
- **Why This Works**: Navigation component reads `isAuthenticated` from Redux and conditionally renders:
  - Public state: "Home | About | Sign In" button
  - Auth state: "Home | Dashboard | Ideas | Avatar dropdown"
- **UX Benefit**: User sees immediate visual feedback after login without forced redirect
- **Auth State Flow**:
  1. User clicks "Sign In" → AuthModal opens
  2. Login succeeds → `dispatch(setSession())` sets `isAuthenticated: true`
  3. Navigation component re-renders with auth state
  4. User sees avatar dropdown, Dashboard/Ideas links appear
  5. User can navigate to protected routes or stay on current page

**Educational Value**:

- Teaches type-safe routing patterns
- Demonstrates layout composition with `<Outlet />`
- Shows separation of public vs authenticated UI
- Reinforces best practices for scalable routing

**Estimated Effort**: 2-3 hours

---

### Unit 14: Navigation Bar & Logout

**Goal**: Create navigation that displays auth state and provides proper logout functionality

**Prerequisites**:

- Unit 11.5 completed (shadcn/ui components installed)
- Unit 13.5 completed (layouts created)

**Deliverables**:

- [ ] Create `frontend/src/components/Navigation.tsx` component
- [ ] **CRITICAL**: Component must read `isAuthenticated` from Redux using `useAppSelector`
- [ ] **CRITICAL**: Component must conditionally render based on `isAuthenticated` state
- [ ] Use shadcn/ui `avatar`, `dropdown-menu`, `button` components
- [ ] Use lucide-react icons (`LogOut`, `Loader2`)
- [ ] Import and manage `AuthModal` state within Navigation (for public users)
- [ ] Public state (`isAuthenticated === false`):
  - [ ] Show logo/brand on left
  - [ ] Show main nav links (Home, About)
  - [ ] Show "Sign In" button on right that triggers `AuthModal`
- [ ] Authenticated state:
  - [ ] Show logo/brand on left
  - [ ] Show main nav links (Home, Dashboard, Ideas)
  - [ ] Show user avatar with email initial on right
  - [ ] Avatar opens dropdown menu with:
    - [ ] Email display at top (with `separator` below)
    - [ ] "Logout" button with icon
- [ ] Implement logout handler:
  - [ ] Set loading state to true
  - [ ] Call `authService.logout()` (async) - **Critical: clears httpOnly cookies server-side**
  - [ ] Wait for backend logout completion (revokes refresh token)
  - [ ] Dispatch `clearSession()` to reset Redux auth state
  - [ ] Clear in-memory token via `setAuthToken(null)`
  - [ ] Clear localStorage (if any auth data stored there in future)
  - [ ] Redirect to home page `/`
  - [ ] Handle logout errors gracefully (still clear local state on error)
- [ ] Show loading state during logout (disable dropdown, show spinner on avatar)
- [ ] Disable logout button while loading (prevent double-click)
- [ ] Handle missing user email gracefully (show generic avatar)
- [ ] Update `UserLayout.tsx` to use Navigation component

**Why Proper Logout Matters**:

- **httpOnly cookies cannot be cleared from JavaScript** - must call backend endpoint
- Backend `/auth/logout` calls Supabase `auth.admin.signOut()` to revoke refresh token
- Prevents token reuse and ensures complete session termination
- Clearing Redux + in-memory token prevents stale UI state

**Success Criteria**:

- Public nav shows "Sign In" button
- Authenticated nav shows avatar with dropdown
- Logout calls backend, clears all state, redirects to home
- Loading states prevent duplicate requests
- Navigation switches automatically when auth state changes

**Testing Instructions**:

- [ ] **Test Public Navigation** (Unit 13.5 + 14):
  - [ ] Run `npm run dev` in frontend terminal
  - [ ] Visit http://localhost:5173
  - [ ] Verify PublicLayout displays with "Sign In" button in header
  - [ ] Click navigation links (Home, About) - pages should load
  - [ ] Click "Sign In" button - AuthModal should open
- [ ] **Test Signup Flow**:
  - [ ] In AuthModal, switch to "Sign Up" tab
  - [ ] Enter email (e.g., `test@example.com`) and password (min 8 chars)
  - [ ] Check "I agree to terms" checkbox
  - [ ] Click "Sign Up" button
  - [ ] Verify success: modal closes, navigation switches to UserLayout
  - [ ] Verify avatar appears in header with email initial
- [ ] **Test Authenticated Navigation**:
  - [ ] After signup, verify nav links changed to: Home, Dashboard, Ideas
  - [ ] Click Dashboard - should show protected dashboard page
  - [ ] Click Ideas - should show protected ideas page
  - [ ] Click avatar - dropdown should open showing email and "Logout" button
- [ ] **Test Logout Flow**:
  - [ ] Click avatar dropdown, then "Logout"
  - [ ] Verify loading spinner appears on avatar during logout
  - [ ] Verify redirect to home page (/)
  - [ ] Verify navigation switches back to PublicLayout with "Sign In" button
  - [ ] Verify cannot access /dashboard directly (should redirect to /)
- [ ] **Test Login Flow**:
  - [ ] Click "Sign In" button
  - [ ] Switch to "Sign In" tab in modal
  - [ ] Enter same credentials used for signup
  - [ ] Click "Sign In" button
  - [ ] Verify modal closes and UserLayout appears with avatar
- [ ] **Test Protected Routes**:
  - [ ] While logged out, manually navigate to http://localhost:5173/dashboard
  - [ ] Verify automatic redirect to home page (/)
  - [ ] Login, then navigate to /dashboard - should load successfully

**Educational Value**:

- Teaches proper logout implementation with httpOnly cookies
- Demonstrates auth state visual feedback
- Shows loading state management for async operations
- Reinforces separation of public vs authenticated UI

**Estimated Effort**: 2-3 hours

---
PAUSE
## AI PROMPT:
Navigation and logout is implemented.RUn critical end-to-end test and explain to me the outcomes and findings:

FULL AUTH FLOW TEST:
1. Clear cookies in browser DevTools
2. Visit http://localhost:5173
3. Verify PublicLayout with "Sign In" button
4. Sign up with new account
5. EXPECTED: Modal closes, navigation switches to show avatar + Dashboard/Ideas links
6. Click avatar → verify dropdown shows email and Logout
7. Click Logout → verify redirect to home + navigation switches back to "Sign In"
8. Sign in with same credentials → verify navigation switches back to auth state
9. Try accessing /dashboard while logged out → verify redirect to /
10. Log in → access /dashboard → verify page loads

If all steps pass, we have working auth. Proceed to Unit 15 (Session Restoration).

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

### Unit 17: Manual Testing & Documentation

**Goal**: Validate auth flows end-to-end through manual testing and create developer documentation

**Note**: This unit focuses on **manual validation** and **documentation** to establish Definition of Done for Session 2. Automated testing frameworks (Jest, Pytest, Playwright) will be covered in future sessions.

**Prerequisites**:

- All implementation units completed

**Deliverables**:

- [ ] **Manual Testing Validation** - Execute comprehensive testing checklist (SKIPPED - will be done by user):
  - [ ] Sign up new user → verify both user and agent-user auth accounts created in Supabase
  - [ ] Login existing user → verify cookies set in browser DevTools
  - [ ] Access protected route while authenticated → confirm allowed
  - [ ] Access protected route while guest → confirm redirected to home
  - [ ] Logout → verify cookies cleared, redirected to home
  - [ ] Proactive token refresh → verify new expiry set ~55 min after login (check console logs)
  - [ ] Let token expire manually → verify auto-refresh on next request
  - [ ] Close tab and reopen → verify session restored automatically
  - [ ] Invalid credentials → verify error message displayed in UI
  - [ ] Network error simulation → verify graceful error handling (disconnect network during login)
  - [ ] Multiple browser windows → verify refresh works across tabs
  - [ ] Tab inactive for 60+ min → verify refresh on visibility change
- [ ] **Developer Documentation** - Create comprehensive guide:
  - [ ] Create `AUTH_DEVELOPER_GUIDE.md` with usage patterns
  - [ ] Backend: how to use `get_user_client` in new endpoints (with code examples)
  - [ ] Backend: when to use admin vs user client (decision tree)
  - [ ] Frontend: how to protect new routes (ProtectedRoute vs useRequireAuth)
  - [ ] Frontend: how to access current user in components (Redux selectors)
  - [ ] Token lifecycle and refresh strategy (timeline diagram)
  - [ ] Cookie security settings by environment (local vs production)
  - [ ] Common troubleshooting scenarios (401 errors, cookie issues, CORS)
- [ ] **Code Quality** - Enhance maintainability:
  - [ ] Review and add inline comments to complex auth logic (auth_utils.py, apiClient.ts, useInitAuth.ts)
  - [ ] Add detailed inline comments explaining refresh cooldown, coalescing, JWT parsing
  - [ ] Add comments for cookie handling, session restoration, error scenarios
- [ ] **Project Documentation** - Update root README:
  - [ ] Add "Authentication" section to README.md
  - [ ] Link to AUTH_DEVELOPER_GUIDE.md
  - [ ] Document environment setup for new developers
  - [ ] Add "Running the Project" section with auth context
  - [ ] Add troubleshooting quick reference

**Success Criteria**:

- All manual test cases pass without errors
- Developer documentation covers common use cases with code examples
- New developers can implement auth-protected features without confusion
- README clearly explains auth architecture and setup

**Estimated Effort**: 3-4 hours (primarily manual testing and documentation writing)

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

1. **httpOnly Cookies**: Access/refresh tokens never exposed to JavaScript, preventing XSS theft
2. **Secure Flag**: Cookies use `secure=true` in production (HTTPS only)
3. **SameSite Policy**: `none` for cross-origin production, `lax` for same-origin dev
4. **No localStorage**: Tokens never stored in localStorage (vulnerable to XSS)
5. **In-Memory Only**: Frontend stores token in memory (lost on refresh, restored from cookie via backend)
6. **Service Role Protection**: Service role key only on backend, never exposed to frontend
7. **RLS Enforcement**: All user operations use user-scoped client with JWT-based RLS
8. **Agent-User Tracking**: Every Supabase user has corresponding agent_user record for app-level permissions

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
4. **Developer Experience**: <5 minutes to protect new route or add authenticated endpoint
5. **Session Duration**: Users remain logged in for full token lifetime (configurable, typically 1 hour with auto-refresh)

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

### Debugging Prompts

#### If Auth State Not Updating:
Navigation not changing after login. Debug checklist:

1. Check Redux DevTools: Is isAuthenticated true after login?
2. Check Network tab: Does /auth/login return 200 with expiresAt?
3. Check Application tab: Are cookies set (access_token, refresh_token)?
4. Check AuthModal handlers: Are setSession() and fetchUserProfile() dispatched?
5. Check Navigation component: Is useAppSelector reading isAuthenticated?
6. Check console: Any errors in Redux state updates?

Report findings for each check.

#### If Cookies Not Set:
Cookies not appearing after login. Verify:

1. Backend auth.py: Does /auth/login call _set_auth_cookies()?
2. Backend response: Are Set-Cookie headers present in response?
3. Frontend apiClient: Is withCredentials: true set?
4. CORS settings: Is credentials allowed in backend CORS config?
5. Domain mismatch: Are frontend (localhost:5173) and backend (localhost:8000) both localhost?

Show me the relevant code sections.



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
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);

  if (!isAuthenticated) return <SignInPrompt />;

  return <div>Welcome, User!</div>;
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

**Critical Architecture Note**: All authentication is handled by Supabase's standard auth service. The
only enhancement is the agent-user pattern, where each user has a corresponding
agent auth account that uses the same Supabase authentication flow.

This PRD serves as both implementation guide for future similar integrations and reference documentation for the standard Supabase auth pattern with agent-user enhancement.

---

## Appendix A: Common Issues & Solutions

### Issue: "session=None" after signup

**Cause**: Supabase email confirmation enabled
**Solution**: Dashboard → Auth → Providers → Email → Disable "Confirm email"

### Issue: Navigation doesn't update after login

**Cause**: Redux state not updating or Navigation not reading state
**Checks**:

1. Redux DevTools: `isAuthenticated` should be `true`
2. AuthModal: `dispatch(setSession())` called after login?
3. Navigation: `useAppSelector((state) => state.auth)` present?

### Issue: Cookies not set

**Cause**: Missing CORS credentials or withCredentials
**Solution**: Verify apiClient has `withCredentials: true` and backend CORS allows credentials

### Issue: Auto-refresh not working

**Cause**: Backend refresh endpoint not handling expired tokens
**Solution**: Check auth_utils.py - refresh should call Supabase `refresh_session()`
