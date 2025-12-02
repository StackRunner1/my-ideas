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

**⚠️ CRITICAL**: Only ONE apiClient.ts file should exist in the entire frontend codebase:

- ✅ `frontend/src/lib/apiClient.ts` - The ONLY configured axios instance
- ❌ DO NOT create `frontend/src/api/apiClient.ts` or any other apiClient file
- ✅ All imports MUST use the @ alias: `import apiClient from "@/lib/apiClient"`
- ❌ NEVER use relative imports: `import apiClient from "./apiClient"` or `import apiClient from "../lib/apiClient"`

**Why this matters**: Multiple apiClient files cause auth failures. Service files importing the wrong apiClient will send requests WITHOUT authentication headers or cookies, resulting in 401 errors that are difficult to debug.

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
│   │                                # ⚠️ THE ONLY apiClient.ts in the project!
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
- [x] **CRITICAL**: DO NOT set `domain` key in development cookie config
  - Without domain restriction, cookies work on both localhost AND 127.0.0.1
  - Setting `domain="localhost"` breaks requests to 127.0.0.1
  - Production can set domain explicitly if needed
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
  - [x] **CRITICAL**: Include `accessToken: str` field (with Field alias for camelCase)
  - This enables dual auth strategy: cookies (primary) + Authorization header (fallback)
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
- [x] **Step 7**: Return AuthResponse with accessToken in body:
  ```python
  return AuthResponse(
      user={"id": user_id, "email": user_email},
      expiresAt=expires_at,
      accessToken=access_token  # ← CRITICAL for dual auth strategy
  )
  ```
- [x] **Defense in Depth**: Tokens sent via BOTH cookies (httpOnly, secure) AND response body
  - Cookies: Primary auth mechanism, automatic, secure
  - Response token: Fallback for Authorization header, manual management
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
- [x] **CRITICAL**: Return `AuthResponse` with user, expiresAt, AND accessToken:
  ```python
  return AuthResponse(
      user={"id": user_id, "email": user_email},
      expiresAt=expires_at,
      accessToken=access_token  # ← Must return for frontend to store
  )
  ```
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

- [x] Install dependencies: `axios`
- [x] Create `frontend/src/lib/apiClient.ts` module
- [x] Configure base URL from environment: `VITE_API_BASE_URL` (default:
      `http://localhost:8000/api/v1`)
- [x] **CRITICAL FILE LOCATION**: Create ONLY in `frontend/src/lib/apiClient.ts`
  - ❌ DO NOT create `frontend/src/api/apiClient.ts` (common mistake!)
  - This file must be imported using @ alias: `import apiClient from "@/lib/apiClient"`
  - Any other apiClient.ts file will cause auth failures
- [x] Create Axios instance with `withCredentials: true` for cookie support
- [x] Set default timeout (30 seconds)
- [x] Add sanity check warning if base URL lacks version segment
- [x] Implement in-memory token storage: `inMemoryToken` variable
- [x] Export `setAuthToken(token)` function to update in-memory token
- [x] **Add debug logging** to setAuthToken for troubleshooting:
  ```typescript
  console.log(
    `[API Client] setAuthToken called with: ${
      token ? token.substring(0, 20) + "..." : "null"
    }`
  );
  ```
- [x] Export `setAllowAutoRefresh(allow)` function to toggle refresh behavior
- [x] Implement request interceptor:
  - [x] Add `Authorization: Bearer <token>` header if in-memory token exists
  - [x] **Add debug logging** for troubleshooting:
    ```typescript
    if (inMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
      console.log(
        `[API Client] ✅ Added Authorization header for ${config.method?.toUpperCase()} ${
          config.url
        }`
      );
    } else {
      console.warn(
        `[API Client] ⚠️ NO TOKEN available for ${config.method?.toUpperCase()} ${
          config.url
        }`
      );
    }
    ```
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
- [x] Install shadcn/ui (single command):
  - [x] Run: `npx shadcn@latest init`
  - [x] When the wizard prompts, select these options:
    - [x] **Style**: "New York" (Recommended) - press Enter for default
    - [x] **Base color**: "Neutral" - press Enter for default
    - [x] The wizard will automatically:
      - [x] Create `components.json`
      - [x] Update `tailwind.config.cjs` with theme configuration
      - [x] Update `src/index.css` with CSS variables
      - [x] Install dependencies (class-variance-authority, clsx, tailwind-merge, etc.)
  - [x] After init completes, install all required components in one command:
    - [x] Run: `npx shadcn@latest add dialog button input label tabs card checkbox avatar dropdown-menu navigation-menu separator`
    - [x] Components needed:
      - [x] `dialog, button, input, label, tabs, card, checkbox` - Auth modal and forms
      - [x] `avatar` - User display in navigation
      - [x] `dropdown-menu` - Simple logout dropdown
      - [x] `navigation-menu` - Main nav structure
      - [x] `separator` - Visual dividers
    - [x] This downloads and installs all components to `src/components/ui/`
- [x] Verify installation:
  - [x] `components.json` created in project root
  - [x] `frontend/src/components/ui/` directory exists with components
  - [x] Radix UI packages in `package.json` (@radix-ui/react-\*)
- [x] Document component import pattern: `import { Button } from "@/components/ui/button"`

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
  - [x] **CRITICAL**: Dispatch `setSession({ expiresAt })` to Redux - sets `isAuthenticated: true`
  - [x] **CRITICAL**: Store accessToken in memory via `setAuthToken(response.accessToken)`
    - Backend returns accessToken in response body (dual auth strategy)
    - Must call setAuthToken() to enable Authorization header fallback
    - Add debug logging: `console.log('[AuthModal] Storing access token')`
  - [x] **CRITICAL**: Dispatch `fetchUserProfile()` thunk to load user data
  - [x] Close modal on success
  - [x] Display error on failure
  - [x] **Result**: Redux `isAuthenticated` becomes `true`, Navigation component re-renders
- [x] Implement sign-up handler:
  - [x] Validate password match
  - [x] Validate password length (min 8 chars)
  - [x] Validate terms acceptance
  - [x] Call `authService.signup(credentials)`
  - [x] **CRITICAL**: Dispatch `setSession({ expiresAt })` to Redux - sets `isAuthenticated: true`
  - [x] **CRITICAL**: Store accessToken via `setAuthToken(response.accessToken)`
    - Required for Authorization header to work
    - Add debug logging for troubleshooting
  - [x] **CRITICAL**: Dispatch `fetchUserProfile()` thunk
  - [x] Close modal on success
  - [x] Display error (e.g., "Email already exists")
  - [x] **Result**: Redux `isAuthenticated` becomes `true`, Navigation component re-renders
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

   - [x] Add AuthModal to a test page temporarily
   - [x] Open modal and test sign-up with new email
   - [x] Verify backend creates user + agent-user (check Supabase auth.users)
   - [x] Verify cookies set (check browser DevTools → Application → Cookies)
   - [x] Verify Redux state updated (check Redux DevTools)
   - [x] Test sign-in with existing credentials
   - [x] Verify error handling (wrong password, existing email)

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
   - [x] Open Supabase Studio → Authentication → Users
   - [x] Verify two users created per signup (user + agent_user)
   - [x] Agent emails should match pattern: `agent_{user_id}@code45.internal`
   - [x] Confirm email confirmation is disabled (prevents `session=None` errors)

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

- [x] Create `frontend/src/components/ProtectedRoute.tsx` component
- [x] Accept `children` prop (React nodes to render if authenticated)
- [x] Read auth state from Redux:
      `const { isAuthenticated } = useSelector(s => s.auth)`
- [x] If authenticated, render children
- [x] If not authenticated, redirect to `/` (home page)
- [x] Preserve intended destination via location state
- [x] Create `frontend/src/hooks/useRequireAuth.ts` hook (alternative approach):
  - [x] Check `isAuthenticated`
  - [x] Redirect if false using `navigate('/')`
  - [x] Support optional `redirectTo` parameter
  - [x] Return auth state for component use
- [x] Document both patterns (component wrapper vs hook)

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

- [x] Create `frontend/src/config/paths.ts`:
  - [x] Export `PATHS` object with route constants (HOME, ABOUT, DASHBOARD, IDEAS, PROFILE)
  - [x] Use TypeScript `as const` for type safety
  - [x] Document purpose: single source of truth for all route paths
  - [x] Export `AppPath` type helper
- [x] Create `frontend/src/routes/AppRoutes.tsx`:
  - [x] Import `PATHS` from config
  - [x] Define all application routes using `<Routes>` and `<Route>`
  - [x] Use nested routes with layouts (PublicLayout, UserLayout)
  - [x] Import and use `ProtectedRoute` for authenticated routes
- [x] Create `frontend/src/layouts/PublicLayout.tsx`:
  - [x] **CRITICAL**: Use shared `Navigation` component (not custom header)
  - [x] Import `Navigation` from `@/components/Navigation`
  - [x] Render `<Outlet />` for child routes
  - [x] Footer with copyright
  - [x] Navigation component adapts automatically based on Redux `isAuthenticated` state
- [x] Create `frontend/src/layouts/UserLayout.tsx`:
  - [x] **CRITICAL**: Use same shared `Navigation` component as PublicLayout
  - [x] Import `Navigation` from `@/components/Navigation`
  - [x] Render `<Outlet />` for child routes
  - [x] Footer with copyright
  - [x] Both layouts should be structurally identical (Navigation handles auth state differences)
- [x] Create placeholder page components:
  - [x] `frontend/src/pages/Home.tsx` - Landing page
  - [x] `frontend/src/pages/About.tsx` - About page
  - [x] `frontend/src/pages/Dashboard.tsx` - Dashboard with stats
  - [x] `frontend/src/pages/Ideas.tsx` - Ideas list
  - [x] `frontend/src/pages/Profile.tsx` - User profile
- [x] Update `frontend/src/main.tsx`:
  - [x] Import `AppRoutes` instead of `AuthTest`
  - [x] Remove AuthTest import and usage
  - [x] Keep BrowserRouter and Redux Provider wrapper

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

- [x] Create `frontend/src/components/Navigation.tsx` component
- [x] **CRITICAL**: Component must read `isAuthenticated` from Redux using `useAppSelector`
- [x] **CRITICAL**: Component must conditionally render based on `isAuthenticated` state
- [x] Use shadcn/ui `avatar`, `dropdown-menu`, `button` components
- [x] Use lucide-react icons (`LogOut`, `Loader2`)
- [x] Import and manage `AuthModal` state within Navigation (for public users)
- [x] Public state (`isAuthenticated === false`):
  - [x] Show logo/brand on left
  - [x] Show main nav links (Home, About)
  - [x] Show "Sign In" button on right that triggers `AuthModal`
- [x] Authenticated state:
  - [x] Show logo/brand on left
  - [x] Show main nav links (Home, Dashboard, Ideas)
  - [x] Show user avatar with email initial on right
  - [x] Avatar opens dropdown menu with:
    - [x] Email display at top (with `separator` below)
    - [x] "Logout" button with icon
- [x] Implement logout handler:
  - [x] Set loading state to true
  - [x] Call `authService.logout()` (async) - **Critical: clears httpOnly cookies server-side**
  - [x] Wait for backend logout completion (revokes refresh token)
  - [x] Dispatch `clearSession()` to reset Redux auth state
  - [x] Clear in-memory token via `setAuthToken(null)`
  - [x] Clear localStorage (if any auth data stored there in future)
  - [x] Redirect to home page `/`
  - [x] Handle logout errors gracefully (still clear local state on error)
- [x] Show loading state during logout (disable dropdown, show spinner on avatar)
- [x] Disable logout button while loading (prevent double-click)
- [x] Handle missing user email gracefully (show generic avatar)
- [x] Update `UserLayout.tsx` to use Navigation component

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

- [x] **Test Public Navigation** (Unit 13.5 + 14):
  - [x] Run `npm run dev` in frontend terminal
  - [x] Visit http://localhost:5173
  - [x] Verify PublicLayout displays with "Sign In" button in header
  - [x] Click navigation links (Home, About) - pages should load
  - [x] Click "Sign In" button - AuthModal should open
- [x] **Test Signup Flow**:
  - [x] In AuthModal, switch to "Sign Up" tab
  - [x] Enter email (e.g., `test@example.com`) and password (min 8 chars)
  - [x] Check "I agree to terms" checkbox
  - [x] Click "Sign Up" button
  - [x] Verify success: modal closes, navigation switches to UserLayout
  - [x] Verify avatar appears in header with email initial
- [x] **Test Authenticated Navigation**:
  - [x] After signup, verify nav links changed to: Home, Dashboard, Ideas
  - [x] Click Dashboard - should show protected dashboard page
  - [x] Click Ideas - should show protected ideas page
  - [x] Click avatar - dropdown should open showing email and "Logout" button
- [x] **Test Logout Flow**:
  - [x] Click avatar dropdown, then "Logout"
  - [x] Verify loading spinner appears on avatar during logout
  - [x] Verify redirect to home page (/)
  - [x] Verify navigation switches back to PublicLayout with "Sign In" button
  - [x] Verify cannot access /dashboard directly (should redirect to /)
- [x] **Test Login Flow**:
  - [x] Click "Sign In" button
  - [x] Switch to "Sign In" tab in modal
  - [x] Enter same credentials used for signup
  - [x] Click "Sign In" button
  - [x] Verify modal closes and UserLayout appears with avatar
- [x] **Test Protected Routes**:
  - [x] While logged out, manually navigate to http://localhost:5173/dashboard
  - [x] Verify automatic redirect to home page (/)
  - [x] Login, then navigate to /dashboard - should load successfully

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

- [x] Create `frontend/src/hooks/useInitAuth.ts` hook
- [x] Call on app mount (in root component or layout)
- [x] Check for existing session via `authService.checkAuthStatus()`
- [x] If session valid:
  - [x] Dispatch `setSession(expiresAt)`
  - [x] Store token in memory
  - [x] Dispatch `fetchUserProfile()`
- [x] If session expired:
  - [x] Attempt auto-refresh via `authService.refreshSession()`
  - [x] If refresh succeeds, restore session
  - [x] If refresh fails, dispatch `clearSession()`
- [x] If no session, leave as guest
- [x] Add loading state during initialization
- [x] Show loading spinner in root layout until auth check complete
- [x] Prevent rendering protected routes until check complete
- [x] Add error handling for network failures
- [x] Implement retry logic for transient failures (optional)

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

- [x] Create `frontend/src/hooks/useTokenRefresh.ts` hook
- [x] Read `expiresAt` from Redux auth state
- [x] Calculate time until expiry
- [x] Schedule refresh 5 minutes before expiry using `setTimeout`
- [x] Call `authService.refreshSession()` when scheduled
- [x] Update Redux with new `expiresAt` on successful refresh
- [x] Clear session if refresh fails (user needs to re-login)
- [x] Clear timeout on component unmount
- [x] Reschedule if `expiresAt` changes (user action triggered refresh)
- [x] Add visibility change handler:
  - [x] Check expiry when tab becomes visible
  - [x] Refresh immediately if expired while tab was hidden
- [x] Add logging for refresh events (success/failure)
- [x] Use hook in root layout component

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

#### If 401 Errors on Protected Routes (Critical!):

**Symptom**: Login works, but accessing protected routes (e.g., /ideas) returns 401 Unauthorized.

**Root Cause Analysis**:

1. **Check backend logs**: Do they show "NO TOKEN found in cookies or Authorization header"?
2. **Check browser Network tab**: Does the failed request show:
   - Cookie header present? (Should have access_token)
   - Authorization header present? (Should have Bearer token)
3. **If BOTH missing**, likely causes:
   - Wrong apiClient being used (multiple apiClient.ts files!)
   - Request interceptor not running (import path issue)
   - Token not stored after login (setAuthToken not called)

**Diagnostic Steps**:

```bash
# 1. Search for multiple apiClient files (CRITICAL!)
find frontend/src -name "apiClient.ts"
# Expected: Only frontend/src/lib/apiClient.ts
# If multiple found: DELETE all except lib/apiClient.ts

# 2. Check imports in service files
grep -r "import.*apiClient" frontend/src/api/
grep -r "import.*apiClient" frontend/src/services/
# All should use: import apiClient from "@/lib/apiClient"
# NOT: import apiClient from "./apiClient" or "../lib/apiClient"

# 3. Verify token storage in AuthModal
grep -A 5 "setAuthToken" frontend/src/components/AuthModal.tsx
# Should call: setAuthToken(response.accessToken)
```

**Fix Priority**:

1. ✅ Ensure ONLY ONE apiClient.ts exists (in lib/)
2. ✅ All imports use @ alias: `import apiClient from "@/lib/apiClient"`
3. ✅ AuthModal calls setAuthToken(response.accessToken) after login/signup
4. ✅ Backend returns accessToken in AuthResponse
5. ✅ Cookie config has NO domain key in development

#### If Auth State Not Updating:

Navigation not changing after login. Debug checklist:

1. Check Redux DevTools: Is isAuthenticated true after login?
2. Check Network tab: Does /auth/login return 200 with expiresAt AND accessToken?
3. Check Application tab: Are cookies set (access_token, refresh_token)?
4. Check AuthModal handlers: Are setSession() and fetchUserProfile() dispatched?
5. Check Navigation component: Is useAppSelector reading isAuthenticated?
6. Check console: Any errors in Redux state updates?
7. **NEW**: Check console for "[AuthModal] Storing access token" log
8. **NEW**: Check console for "[API Client] setAuthToken called" log

Report findings for each check.

#### If Cookies Not Set:

Cookies not appearing after login. Verify:

1. Backend auth.py: Does /auth/login call \_set_auth_cookies()?
2. Backend response: Are Set-Cookie headers present in response?
3. Frontend apiClient: Is withCredentials: true set?
4. CORS settings: Is credentials allowed in backend CORS config?
5. Domain mismatch: Are frontend (localhost:5173) and backend (localhost:8000) both localhost?
6. **NEW**: Backend \_cookie_config(): Does it omit the 'domain' key in development?

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
