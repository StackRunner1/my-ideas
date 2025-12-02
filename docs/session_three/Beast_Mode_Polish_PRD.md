# Production Reliability & Design Systems - Product Requirements Document v1.0

> **📌 SOURCE OF TRUTH**: This is the AUTHORITATIVE version of the Session 3 PRD, updated throughout implementation with all improvements, bug fixes, and lessons learned. See `README.md` in this directory for version history.

## Overview

Comprehensive documentation for **Session 3: Production Polish & Developer
Workflow Mastery** in the code45 platform. This session transforms the
application from functional to production-ready by implementing
industry-standard logging, error handling, testing infrastructure, and a
professional design system.

**Key Focus**: After establishing authentication (Session 2), this session
teaches learners to work effectively with AI coding assistants to implement
production-grade reliability features and professional UI/UX patterns.

## Business Context

- **Problem**: Applications fresh from initial development lack production
  readiness (inconsistent errors, no observability, untested code) and
  professional design consistency
- **Solution**: Systematic implementation of structured logging, standardized
  error responses, comprehensive testing, and a documented design system using
  shadcn/ui
- **Value**: Production-ready application with debugging capabilities, test
  coverage, and maintainable UI patterns that scale

## Implementation Scope

This PRD documents the complete production polish architecture including:

1. **AI-Assisted Development Loops**: Plan-first, diff-only workflow patterns
   for working effectively with GitHub Copilot
2. **Backend Observability**: Request ID tracing, structured JSON logging,
   comprehensive error handling
3. **Testing Infrastructure**: pytest configuration (backend), Vitest + React
   Testing Library (frontend), E2E test patterns
4. **Design System Foundation**: shadcn/ui component library, design tokens,
   interactive style guide
5. **Data Visualization**: Recharts integration with database views for
   analytics
6. **Production Readiness**: Accessibility audits, optimistic updates, PR
   hygiene, deployment checklists

## AI Coding Agent (GitHub Copilot or similar) Instructions

**IMPORTANT**: In this PRD document, prompts aimed at the AI coding assistant to
start or continue the implementation of this PRD end-to-end (in conjunction with
the learner and via the GitHub Copilot Chat) will be marked with `## AI PROMPT`
headings.

- **The learner** pastes the prompt into the chat to initiate the start or the
  continuation of the code implementation led by the AI coding assistant.
- **AI Coding Assistant** reads and executes on the prompt. The AI Coding
  Assistant should execute the tasks specified under each unit and - upon
  completion - mark off each task with [x] = completed or [~] = in progress
  depending on status. Sections (---) marked with "PAUSE" are milestone points
  where the AI Coding Assistant should check in with the learner, ensure all
  checklists in this PRD reflect the latest progress, and await the next learner
  instructions OR - after approval - move to reading the next `## AI PROMPT` and
  start execution.

## Session 2 Completion Verification (MANDATORY)

**CRITICAL**: This section MUST be completed before starting Unit 1. Session 3 builds directly on Session 2's authentication foundation. Incomplete Session 2 will cause cascading failures.

### Backend Verification Checklist

- [ ] **Supabase Configuration Working**

  - Run: `python -c "from app.core.config import settings; print(settings.supabase_url)"`
  - Verify: Prints your Supabase project URL (not None or error)
  - File check: `backend/.env` exists with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

- [ ] **Authentication Endpoints Functional**

  - Run backend: `python -m uvicorn app.main:app --reload --log-level info`
  - Test signup: `curl -X POST http://localhost:8000/api/v1/auth/signup -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpass123"}'`
  - Expected: 200/201 response with user data (or 409 if user exists)
  - Test login: `curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"testpass123"}'`
  - Expected: 200 response with cookies set
  - Test me endpoint: `curl http://localhost:8000/api/v1/auth/me` (with cookies from login)
  - Expected: 200 response with user profile data

- [ ] **Database Tables Exist**

  - Open Supabase dashboard → SQL Editor
  - Run: `SELECT * FROM user_profiles LIMIT 1;`
  - Verify: Query succeeds (returns data or empty result, not error)
  - Run: `SELECT * FROM auth.users LIMIT 1;`
  - Verify: At least one test user exists

- [ ] **RLS Policies Configured**
  - In Supabase dashboard → Authentication → Policies
  - Verify: user_profiles table has RLS enabled
  - Verify: At least one policy exists for user_profiles

### Frontend Verification Checklist

- [ ] **Dependencies Installed**

  - Run: `cd frontend && npm list react redux @reduxjs/toolkit react-router-dom axios`
  - Verify: All packages installed without peer dependency errors
  - Check versions: React 18.2+, Redux Toolkit 2.0+, React Router 6+

- [ ] **Development Server Runs**

  - Run: `npm run dev`
  - Expected: Server starts on http://localhost:5173 without errors
  - Open browser: Navigate to http://localhost:5173
  - Verify: App loads (no white screen or console errors)

- [ ] **Redux Store Configured**

  - File check: `frontend/src/store/index.ts` exists
  - File check: `frontend/src/store/authSlice.ts` exists
  - Browser DevTools → Redux tab (if Redux DevTools installed)
  - Verify: auth slice visible with state: { isAuthenticated, expiresAt, status }

- [ ] **Authentication Flow Working**

  - Open app in browser: http://localhost:5173
  - Click "Sign In" button → Modal opens
  - Enter test credentials and submit
  - Expected: Modal closes, navigation shows user avatar/menu
  - Refresh page
  - Expected: User remains logged in (session restored)

- [ ] **Protected Routes Working**

  - While logged out: Navigate to http://localhost:5173/dashboard
  - Expected: Redirected to home page
  - While logged in: Navigate to http://localhost:5173/dashboard
  - Expected: Dashboard page loads

- [ ] **shadcn/ui Basics Present** (if partially configured in S2)
  - File check: `frontend/components.json` exists (optional, will create in Unit 3 if missing)
  - File check: `frontend/tailwind.config.ts` or `frontend/tailwind.config.cjs` exists
  - Verify: Tailwind CSS working (elements have styles, not unstyled)

### Code Quality Baseline

- [ ] **No Console Errors**

  - Backend console: No errors during startup or test requests
  - Frontend console: No errors on page load or navigation
  - Browser console: No React warnings about keys, hooks, or deprecated APIs

- [ ] **Git Clean State**
  - Run: `git status`
  - Verify: No uncommitted Session 2 changes
  - All S2 work committed with clear messages
  - Working directory clean (can create new branch)

### Troubleshooting Failed Verification

**If any checklist item fails:**

1. **Review Session 2 PRD**: `docs/session_two/SupabaseAuth_Implementation_PRD_v1.0.md`
2. **Check AUTH_DEVELOPER_GUIDE**: `docs/session_two/AUTH_DEVELOPER_GUIDE.md` → Troubleshooting section
3. **Common fixes**:

   - Backend not starting: Check .env file exists and has correct Supabase credentials
   - 401 errors: Verify cookies being set (check Network tab), verify Supabase service role key correct
   - Redux state not updating: Check Redux Provider wraps app in main.tsx
   - Routes not working: Verify BrowserRouter in main.tsx, verify AppRoutes component structure

4. **Ask AI for help**:
   ```
   "Session 2 verification failing at step [X]. Error message: [paste error].
   Help me debug this before starting Session 3."
   ```

### Success Criteria

✅ **ALL checklist items above pass**  
✅ **Test user can signup, login, access protected route, and logout successfully**  
✅ **No errors in backend or frontend console**  
✅ **Git working directory clean**

---

## Prerequisites: Environment Setup (Before Unit 1)

### Backend Setup

- [ ] Python 3.12+ installed and conda environment active: `conda activate ideas`
- [ ] Session 2 verification PASSED (see above section)
- [ ] Backend runs successfully: `python -m uvicorn app.main:app --reload --log-level info`
- [ ] Backend .env file has all Supabase credentials (verified in S2 checklist)
- [ ] Base dependencies installed: `pip install fastapi uvicorn supabase pydantic-settings`

### Frontend Setup

- [ ] Node.js 18+ and npm installed
- [ ] Session 2 verification PASSED (see above section)
- [ ] Frontend runs successfully: `npm run dev`
- [ ] Vite config has path aliases configured (`@/*` imports working)
- [ ] Tailwind CSS configured and working

### Development Workflow

- [ ] Two terminals: backend (`uvicorn`) + frontend (`npm run dev`)
- [ ] Backend runs on http://localhost:8000, API docs at http://localhost:8000/docs
- [ ] Frontend runs on http://localhost:5173
- [ ] Git working directory clean with all S2 work committed
- [ ] New feature branch created: `git checkout -b s3-production-polish`
- [ ] Test user account exists in Supabase for testing (created during S2 verification)

## Architecture Overview

### Three-Layer Observability Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ User Action  │→ │ Redux Action │→ │ API Call     │       │
│  │ (Click)      │  │ (Track)      │  │ (+ Req ID)   │       │
│  └──────────────┘  └──────────────┘  └───────┬──────┘       │
│         ↓ Log to Console                     ↓              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                  HTTP Request (x-request-id header)
                                               │
┌──────────────────────────────────────────────┼──────────────┐
│                       Backend Layer          ↓              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Middleware   │→ │ Route        │→ │ Service      │       │
│  │ (Extract ID) │  │ Handler      │  │ Logic        │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         ↓ Log              ↓ Log             ↓ Log          │
│  ┌─────────────────────────────────────────────────┐        │
│  │   Structured JSON Logger (request_id context)   │        │
│  │   {method, path, status, duration_ms, req_id}   │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                ↓
                        Logs to console (dev)
                        → Future: CloudWatch/Datadog
```

### Error Response Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  Frontend   │         │   Backend    │         │   Database   │
│   Request   │         │   Exception  │         │   Error      │
└──────┬──────┘         └───────┬──────┘         └──────┬───────┘
       │                        │                       │
       │  POST /api/v1/items    │                       │
       │  x-request-id: abc123  │                       │
       │───────────────────────>│                       │
       │                        │  DB query fails       │
       │                        │──────────────────────>│
       │                        │  Constraint violation │
       │                        │<──────────────────────│
       │                        │                       │
       │                        │  Exception caught     │
       │                        │  Log: ERROR with ID   │
       │                        │                       │
       │  422 Unprocessable     │                       │
       │  {                     │                       │
       │    "error": {          │                       │
       │      "code":           │                       │
       │        "validation",   │                       │
       │      "message": "...", │                       │
       │      "details": {},    │                       │
       │      "request_id":     │                       │
       │        "abc123"        │                       │
       │    }                   │                       │
       │  }                     │                       │
       │<───────────────────────│                       │
       │                        │                       │
       │  Display toast error   │                       │
       │  "Something went       │                       │
       │   wrong (abc123)"      │                       │
       ▼                        ▼                       ▼
```

### Design System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tailwind Config Layer                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  tailwind.config.ts                                  │   │
│  │  - Theme tokens (colors, spacing, typography)        │   │
│  │  - shadcn/ui plugin configuration                    │   │
│  │  - Custom utilities and component classes            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  Design System CSS Layer                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  src/styles/design-system.css                        │   │
│  │  - CSS custom properties (--color-primary-500)       │   │
│  │  - Component base styles                             │   │
│  │  - Utility classes (.text-balance, .container-lg)    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                Component Library Layer                      │
│  ┌────────────────────┐    ┌────────────────────────────┐   │
│  │  shadcn/ui         │    │  Custom Components         │   │
│  │  components/ui/    │    │  components/app/           │   │
│  │  - Button          │    │  - ItemCard                │   │
│  │  - Card            │    │  - SessionProgress         │   │
│  │  - Input           │    │  - UnitBadge               │   │
│  │  - Dialog          │    │  - NavMenu                 │   │
│  └────────────────────┘    └────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│             Style Guide Documentation Layer                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /style-guide route                                  │   │
│  │  - Interactive component demos                       │   │
│  │  - Code examples with copy-to-clipboard              │   │
│  │  - Design token reference                            │   │
│  │  - Accessibility guidelines                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Goals and Objectives

### Goal 1: Master AI-Assisted Development Workflow

Learners will internalize the plan-first, diff-only workflow pattern essential
for effective GitHub Copilot collaboration, including breaking down tasks,
requesting minimal diffs, and validating incrementally.

**Success Metrics**:

- Learner can articulate a 3-step plan before requesting code
- Each code change is < 50 lines and focused on single responsibility
- All changes validated with manual testing before next step

### Goal 2: Implement Production-Grade Observability

Establish comprehensive logging and error handling that enables debugging in
production environments through request tracing and standardized error formats.

**Success Metrics**:

- Every API request logged with unique request ID
- Error responses follow consistent `{code, message, details, request_id}`
  schema
- Logs structured as JSON for programmatic parsing
- 100% of HTTP status codes (2xx, 4xx, 5xx) handled with appropriate messages

### Goal 3: Establish Testing Foundation

Create comprehensive testing infrastructure for both backend and frontend, with
learners understanding how to write, run, and maintain tests using AI
assistance.

**Success Metrics**:

- Backend: pytest suite with > 70% endpoint coverage
- Frontend: Vitest + RTL with component and integration tests
- All tests pass in CI/CD pipeline
- Learner can write new test cases independently with AI guidance

### Goal 4: Build Professional Design System

Implement a documented, reusable design system using shadcn/ui with interactive
documentation that accelerates future UI development.

**Success Metrics**:

- shadcn/ui components integrated and customized
- Style guide page accessible at `/style-guide` with all patterns documented
- Design tokens (colors, spacing, typography) defined and used consistently
- Learner can add new components following established patterns

---

## Principles from Previous Sessions

This session builds on established patterns from Sessions 1-2:

- **S1**: FastAPI backend scaffold, React + Vite frontend, Tailwind CSS, basic
  routing
- **S2**: Supabase authentication, Redux state management, protected routes,
  httpOnly cookies

**Critical Continuity**:

- Use existing `apiClient.ts` for all HTTP requests (already has auth tokens)
- Extend existing Redux store (don't create parallel state)
- Follow established file structure (`backend/app/`, `frontend/src/`)
- Maintain Session 2's error handling patterns (build on them, don't replace)

---

## Unit Dependencies & Critical Path

### Unit Dependency Graph

```
Phase 1: Request Tracing & Logging (Units 1-2)
│
├─ Unit 1 (Request ID Middleware)
│   └─> Unit 2 (Structured Logging)

Phase 2: Error Handling & Debugging (Units 3-4)
│
├─ Unit 3 (Error Response Standard)
│   └─> Unit 4 (Timeout & Retry Config)

Phase 3: Design System Foundation (Units 5-6)
│
├─ Unit 5 (shadcn/ui Installation)
│   └─> Unit 6 (Design System Architecture)
│        └─> [Continues in Part 2...]
```

### Critical Path for Part 1

**Minimum units required for production-ready backend:**

1. Unit 1 → Request ID tracking end-to-end
2. Unit 2 → Structured logging with context
3. Unit 3 → Standardized error responses
4. Unit 4 → Timeout/retry for resilience

**Design system foundation:**

5. Unit 5 → shadcn/ui component library
6. Unit 6 → Design tokens and style guide structure

---

## Project File Structure

### Backend Structure (After Part 1)

```
backend/
├── app/
│   ├── main.py                      # FastAPI app with request ID middleware (Unit 1)
│   │
│   ├── core/
│   │   ├── config.py                # Settings extended with timeout configs (Unit 4)
│   │   ├── logging.py               # Structured JSON logger (Unit 2)
│   │   └── errors.py                # Custom exception classes (Unit 3)
│   │
│   ├── middleware/
│   │   └── request_id.py            # Request ID extraction/generation (Unit 1)
│   │
│   ├── api/
│   │   ├── error_handlers.py        # Global exception handlers (Unit 3)
│   │   └── routes/
│   │       ├── items.py             # Updated with structured logging (Unit 2)
│   │       ├── sessions.py          # Updated with error handling (Unit 3)
│   │       └── health.py            # Health check with timeout test (Unit 4)
│   │
│   └── services/
│       └── supabase_client.py       # Extended with retry logic (Unit 4)
│
├── tests/
│   ├── conftest.py                  # pytest fixtures (Part 2)
│   ├── test_logging.py              # Logging tests (Part 2)
│   └── test_error_handling.py       # Error response tests (Part 2)
│
└── pytest.ini                       # pytest configuration (Part 2)
```

### Frontend Structure (After Part 1)

```
frontend/
├── src/
│   ├── main.tsx                     # App entry with design system CSS import (Unit 6)
│   │
│   ├── styles/
│   │   ├── index.css                # Existing Tailwind imports
│   │   └── design-system.css        # Design tokens and custom utilities (Unit 6)
│   │
│   ├── components/
│   │   └── ui/                      # shadcn/ui components (Unit 5)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── toast.tsx
│   │       ├── alert.tsx
│   │       └── ... (other shadcn components)
│   │
│   ├── pages/
│   │   └── StyleGuide.tsx           # Design system documentation page (Unit 6)
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx            # Updated with /style-guide route (Unit 6)
│   │
│   └── lib/
│       └── apiClient.ts             # Extended with request ID header (Unit 1)
│
├── components.json                  # shadcn/ui configuration (Unit 5)
├── tailwind.config.ts               # Extended with design tokens (Unit 6)
├── vitest.config.ts                 # Vitest configuration (Part 2)
└── tsconfig.json                    # Path aliases for @/* imports
```

---

## Implementation Plan & Sequence

### Legend

- `[ ]` = Pending (not started)
- `[~]` = In Progress (partially implemented)
- `[x]` = Completed (fully implemented and tested)

---

## AI STARTER PROMPT (Session 3 Full Context)

**Copy and paste this entire prompt to GitHub Copilot Chat to begin Session 3:**

---

I am ready to implement **Session 3: Production Polish & Design Systems** for my my-ideas app. This session builds directly on Session 2 (Supabase authentication with httpOnly cookies, Redux state management, protected routes).

**PROJECT CONTEXT:**

- **App**: my-ideas (personal idea management tool)
- **Backend**: FastAPI (Python 3.12+), Supabase (auth + database), running on `http://localhost:8000`
- **Frontend**: React 18.2 + TypeScript, Vite, Redux Toolkit, Tailwind CSS, running on `http://localhost:5173`
- **Current State**: Session 2 complete (auth working, protected routes, token refresh, session restoration)
- **Session 3 Goals**: Add production-grade logging, error handling, testing infrastructure, design system (shadcn/ui), data visualization (Recharts), and complete profile feature

**EXECUTION RULES:**

1. **Plan-First Workflow**: Before any code changes, provide a 3-5 step plan for my approval
2. **Diff-Only Changes**: Generate minimal, focused diffs (< 50 lines when possible)
3. **Sequential Units**: Implement units in order (1 → 14), marking deliverables [x] as completed
4. **PAUSE at Checkpoints**: Stop and wait for my explicit approval at all PAUSE sections
5. **Validation Required**: Run tests/manual checks after each phase before proceeding
6. **Flag Issues Immediately**: If dependencies missing or requirements unclear, ask rather than assume

**TECHNICAL STACK (Session 3 Additions):**

- **Testing**: pytest + pytest-asyncio + httpx (backend), Vitest + React Testing Library (frontend)
- **Design System**: shadcn/ui (New York style, Slate base color, CSS variables)
- **Visualization**: Recharts for analytics charts
- **Logging**: Structured JSON logging with request ID tracing
- **Avatar**: react-avatar library with automatic initials fallback

**FILE STRUCTURE REFERENCE:**

Backend:

```
backend/
├── app/
│   ├── main.py                    # FastAPI app entry
│   ├── core/
│   │   ├── config.py              # Settings (will add timeout configs)
│   │   ├── logging.py             # (To create: structured JSON logger)
│   │   └── errors.py              # (To create: custom exceptions)
│   ├── middleware/
│   │   └── request_id.py          # (To create: request ID middleware)
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py            # Session 2 auth endpoints
│   │   │   ├── items.py           # Existing items CRUD
│   │   │   ├── analytics.py       # (To create: analytics endpoints)
│   │   │   └── profile.py         # (To create: profile endpoints)
│   │   └── error_handlers.py      # (To create: global exception handlers)
│   └── db/
│       └── supabase_client.py     # Existing Supabase client
└── tests/                         # (To create: pytest test suite)
```

Frontend:

```
frontend/
├── src/
│   ├── main.tsx                   # App entry
│   ├── components/
│   │   ├── ui/                    # (To create: shadcn/ui components)
│   │   └── UserAvatar.tsx         # (To create: react-avatar wrapper)
│   ├── pages/
│   │   ├── StyleGuide.tsx         # (To create: design system docs)
│   │   ├── Analytics.tsx          # (To create: charts dashboard)
│   │   └── Profile.tsx            # (To create: user profile page)
│   ├── lib/
│   │   ├── apiClient.ts           # Existing axios client (will extend)
│   │   └── logger.ts              # (To create: frontend logger)
│   ├── services/
│   │   └── analyticsService.ts    # (To create: analytics API calls)
│   ├── store/
│   │   └── authSlice.ts           # Existing Redux auth slice
│   └── test/
│       ├── setup.ts               # (To create: Vitest setup)
│       └── utils.tsx              # (To create: renderWithProviders)
├── components.json                # (To create: shadcn/ui config)
└── vitest.config.ts               # (To create: Vitest config)
```

**SESSION 3 UNIT OVERVIEW (14 Units):**

- **Part 1 (Units 1-6)**: Request ID tracking, structured logging, error handling, timeout/retry, shadcn/ui setup, design system foundation
- **Part 2 (Units 7-13)**: Backend/frontend testing setup, interactive style guide, Recharts integration, optimistic updates, QA/deployment prep
- **Part 3 (Unit 14)**: Complete profile feature (backend endpoints, UI, avatar, settings)

**YOUR FIRST TASK:**

Read the full Session 3 PRD at `docs/session_three/Beast_Mode_Polish_PRD.md` and confirm:

1. You understand the project structure from Sessions 1-2
2. You're ready to start with **Unit 1: Request ID Implementation**
3. You'll follow the plan-first, diff-only workflow
4. You'll PAUSE at validation checkpoints for my approval

**AFTER CONFIRMATION**, provide a 3-step plan for Unit 1 implementation.

---

## AI PROMPT (Part 1 Start):

I need you to implement **Part 1** of the Session 3 Production Polish PRD (Units
1-6: Request Tracing, Logging, Error Handling, Design System Foundation).

**EXECUTION REQUIREMENTS:**

- Follow the unit sequence exactly as documented (Units 1-6)
- Mark deliverables as [x] in the PRD as you complete them
- Ask for my approval at PAUSE sections before proceeding to next phase
- Run validation tests after each phase
- Flag any missing dependencies or unclear requirements immediately

**TECHNICAL CONSTRAINTS:**

- Backend: Python 3.12+, FastAPI, existing Supabase integration from S2
- Frontend: React 18.2, TypeScript, Vite, Redux Toolkit, Tailwind CSS
- Testing: pytest (backend), Vitest + React Testing Library (frontend)
- Design: shadcn/ui components, CSS custom properties

**START WITH UNIT 1 (Request ID Implementation)** - Please confirm you understand the requirements before
proceeding.

---

# PART 1: REQUEST TRACING, LOGGING & DESIGN FOUNDATION (Units 1-6)

---

## Phase 1: Request Tracing & Structured Logging

### Unit 1: Request ID Implementation (End-to-End Tracing)

**Goal**: Implement unique request IDs that flow from frontend → backend → logs
→ error responses for complete request tracing

**Prerequisites**:

- Unit 1 completed (workflow pattern internalized)
- Understanding of HTTP headers and middleware patterns

**Deliverables**:

**Backend**:

- [x] Create `backend/app/middleware/request_id.py` module
- [x] Implement middleware that extracts `x-request-id` from incoming headers or
      generates UUID if missing
- [x] Store request ID in request state for access in route handlers and logging
- [x] Include request ID in all response headers as `x-request-id`
- [x] Register middleware in `main.py` before route handlers
- [x] Update health check endpoint to return request ID in response body for
      testing

**Frontend**:

- [x] Extend `apiClient.ts` to generate UUID for each request and add as
      `x-request-id` header
- [x] Store request ID in interceptor for correlation with responses
- [x] Log request ID to console in development mode for debugging

**Validation**:

- [x] Manual test: Make API call, verify `x-request-id` appears in response
      headers
- [x] Manual test: Check backend console logs include same request ID
- [x] Manual test: Check frontend console shows same request ID
- [ ] Document request ID flow in architecture diagram

**Success Criteria**:

- Request IDs generated uniquely for each HTTP request
- Same ID visible in frontend logs, backend logs, and HTTP response headers
- Request ID accessible in error responses (will be used in Unit 4)
- No performance degradation from middleware overhead

**Estimated Effort**: 1-2 hours

---

### Unit 2: Structured Logging Service (JSON Logs with Context)

**Goal**: Replace print statements with production-grade structured logging that
includes request context and enables programmatic log analysis

**Prerequisites**:

- Unit 1 completed (request IDs available)
- Understanding of Python logging module and log levels

**Deliverables**:

**Backend**:

- [x] Create `backend/app/core/logging.py` module
- [x] Implement `get_logger(name: str)` function returning configured logger
      instance
- [x] Configure JSON log formatter with fields: timestamp, level, logger_name,
      message, request_id, extra_data
- [x] Set log level based on environment (DEBUG for dev, INFO for prod)
- [x] Create context manager or helper to attach request ID to log records
      automatically
- [x] Update all route handlers to use structured logger instead of print
      statements
- [x] Log key events: request_start (method, path), request_end (status,
      duration_ms), errors (exception type, traceback)
- [x] Implement log level filtering (INFO+WARN+ERROR in prod,
      DEBUG+INFO+WARN+ERROR in dev)

**Frontend**:

- [x] Create `frontend/src/lib/logger.ts` utility module
- [x] Implement console logger wrapper that includes request ID and timestamp
- [x] Add log levels: debug, info, warn, error
- [x] Use logger in Redux actions, API calls, and error boundaries
- [x] Suppress logs in production builds (check `import.meta.env.PROD`)

**Validation**:

- [x] Make authenticated API request, verify logs include request ID, method,
      path, status, duration
- [x] Trigger error scenario, verify error logs include exception details and
      request ID
- [x] Check log format is valid JSON (can be parsed programmatically)
- [x] Verify frontend logs appear in browser console during development only

**Success Criteria**:

- All backend logs structured as JSON with consistent schema
- Request ID included in every log record automatically
- Log levels appropriately used (DEBUG for verbose, INFO for key events, ERROR
  for exceptions)
- Frontend logging present in dev, absent in production builds
- Performance impact negligible (< 5ms per request)

**Estimated Effort**: 2-3 hours

---

PAUSE

## AI PROMPT:

Validate Phase 1 (Development Loops & Logging) completion:

**VALIDATION CHECKLIST**:

- Run backend: `python -m uvicorn app.main:app --reload --log-level debug`
- Run frontend: `npm run dev`
- Make authenticated request (e.g., GET /api/v1/sessions)
- Check backend console: Should see JSON log with request_id, method, path,
  status_code, duration_ms
- Check frontend console: Should see request ID logged
- Check network tab: Response headers should include `x-request-id`
- Trigger error (e.g., request non-existent resource): Verify error log includes
  request_id and exception details
- Verify: Same request ID appears in frontend log, backend log, and response
  header

**Confirm all tests pass before proceeding to Phase 2 (Error Handling).**

---

## Phase 2: Error Handling & API Resilience

### Unit 3: Standardized Error Response Schema

**Goal**: Implement consistent error response format across all HTTP status
codes with educational debugging context

**Prerequisites**:

- Unit 2 completed (structured logging working)
- Understanding of HTTP status codes and FastAPI exception handling

**Deliverables**:

**Backend**:

- [x] Create `backend/app/core/errors.py` module with custom exception classes
- [x] Define base `APIError` exception with code, message, details, status_code
      attributes
- [x] Define specific exceptions: `NotFoundError(404)`, `ValidationError(422)`,
      `UnauthorizedError(401)`, `ForbiddenError(403)`, `ServerError(500)`
- [x] Create `backend/app/api/error_handlers.py` with global exception handlers
- [x] Implement exception handler returning standardized JSON:
      `{"error": {"code": "...", "message": "...", "details": {}, "request_id": "..."}}`
- [x] Register handlers in `main.py` for each exception type
- [x] Include request ID from middleware in all error responses
- [x] Add handler for uncaught exceptions (500) with generic message (never
      expose stack traces to client)
- [x] Log all errors with ERROR level including full exception traceback
      server-side

**Educational Content**:

- [x] Document common HTTP status codes with when/why they occur:
  - 200: Success
  - 201: Created
  - 400: Bad request (malformed JSON, missing required fields)
  - 401: Unauthorized (no auth token or expired token)
  - 403: Forbidden (authenticated but insufficient permissions)
  - 404: Not found (resource doesn't exist)
  - 422: Unprocessable entity (validation failed)
  - 500: Server error (uncaught exception, database down, etc.)
- [x] Create debugging guide: manual approaches (check logs with request ID,
      inspect network tab, verify auth token) and AI-assisted approaches (paste
      error to Copilot, describe symptoms for troubleshooting suggestions)

**Frontend**:

- [x] Extend `apiClient.ts` error interceptor to parse standardized error shape
- [x] Create `frontend/src/lib/errorHandler.ts` utility to extract user-friendly
      message from error response
- [ ] Update Redux error handling to store error code + message + request_id in
      state
- [ ] Display request ID in error toasts for user to report issues: "Something
      went wrong (Request ID: abc123)"
- [x] Add development-only console.error showing full error details

**Validation**:

- [x] Test 404: Request non-existent endpoint, verify error response matches
      schema with request_id
- [ ] Test 401: Make request without auth token, verify unauthorized error
- [ ] Test 422: Send invalid data (e.g., create item with missing required
      field), verify validation error with details
- [ ] Test 500: Temporarily break database connection, verify generic error
      without exposing internals
- [x] Verify all errors logged server-side with request ID for correlation

**Success Criteria**:

- 100% of error responses follow consistent
  `{error: {code, message, details, request_id}}` schema
- Error messages user-friendly (no stack traces or sensitive data exposed)
- Request IDs included in errors enable tracing to server logs
- Frontend gracefully handles all error types with appropriate UI feedback
- Debugging guide helps learners troubleshoot common issues independently

**Estimated Effort**: 3-4 hours

---

### Unit 4: Timeout & Retry Configuration

**Goal**: Add resilience to external API calls (Supabase) with timeout limits
and retry logic for transient failures

**Prerequisites**:

- Unit 3 completed (error handling standardized)
- Understanding of network failures and retry strategies

**Deliverables**:

**Backend**:

- [x] Extend `backend/app/core/config.py` with timeout settings:
      `SUPABASE_TIMEOUT_SECONDS` (default 10), `SUPABASE_RETRY_ATTEMPTS`
      (default 3)
- [x] Update `backend/app/db/supabase_client.py` to configure Supabase client
      with timeout
- [x] Implement retry decorator or wrapper for Supabase API calls with
      exponential backoff
- [x] Retry only on transient errors (network timeout, 503 service
      unavailable) - NOT on 4xx client errors
- [x] Log retry attempts with request ID and attempt number
- [ ] Add circuit breaker pattern (optional advanced): stop retrying if Supabase
      consistently down

**Frontend**:

- [x] Configure axios timeout in `apiClient.ts` (default 30 seconds for all
      requests)
- [x] Implement retry logic in interceptor for 5xx errors and network timeouts
      (max 2 retries)
- [x] Add exponential backoff delay between retries (1s, 2s, 4s)
- [x] Never retry on 4xx errors (these require user action, not retries)
- [x] Display retry attempt count in development logs

**Health Check Enhancement**:

- [x] Update `/api/v1/health` endpoint to test Supabase connection with timeout
- [x] Return health status:
      `{"status": "healthy", "database": "connected", "latency_ms": 45}`
- [x] If Supabase unreachable within timeout, return degraded status with
      details

**Validation**:

- [ ] Temporarily set very low timeout (e.g., 1ms), verify timeout error occurs
      and is retried
- [ ] Simulate network failure (disconnect internet), verify graceful error
      handling
- [ ] Test health check reports database status accurately
- [ ] Verify no infinite retry loops (max attempts enforced)
- [ ] Check logs show retry attempts with backoff delays

**Success Criteria**:

- All Supabase API calls have timeout protection (no hanging requests)
- Transient failures automatically retried with exponential backoff
- Client errors (4xx) not retried wastefully
- Health check provides visibility into system dependencies
- Retry logic does not mask underlying issues (logged clearly)

**Estimated Effort**: 2-3 hours

---

PAUSE - CHECKPOINT: PHASE 2 COMPLETE

## AI PROMPT:

**Before proceeding to Phase 3 (Design System), stop and provide a summary of achievements:**

**Units 1-4 Completion Summary:**

Provide a brief summary including:

- What was implemented in each unit (1-2 sentences per unit)
- Key files created or modified
- Success metrics achieved
- Any issues encountered and how they were resolved

**Request user confirmation to proceed to Phase 3 (Design System Foundation).**

---

## AI PROMPT:

Validate Phase 2 (Error Handling & Resilience) completion:

**VALIDATION CHECKLIST**:

- Test error responses: `curl http://localhost:8000/api/v1/nonexistent` - verify
  404 with standardized error schema + request_id
- Test timeout: Temporarily set `SUPABASE_TIMEOUT_SECONDS=0.001`, make
  authenticated request, verify timeout error handled gracefully
- Test retry: Use network throttling or mock to simulate transient failure,
  verify retry attempts logged
- Test health check: `curl http://localhost:8000/api/v1/health` - verify status
  includes database connectivity
- Frontend: Trigger error in UI (e.g., create item with invalid data), verify
  error toast shows request ID
- Check logs: All errors include request_id, exception details, retry attempts
  where applicable

**Confirm all tests pass before proceeding to Phase 3 (Design System).**

---

## Phase 3: Design System Foundation

### Unit 5: shadcn/ui Installation & Component Exploration

**Goal**: Verify shadcn/ui component library configuration and understand how to add,
customize, and use components. Note: shadcn/ui components are built on top of Radix UI
primitives and installed as source code (not npm packages).

**Prerequisites**:

- Tailwind CSS configured from Session 1
- TypeScript path aliases set up (`@/*` imports)
- Understanding of React component composition

**Deliverables**:

**Verify Existing Configuration**:

- [x] Check if `components.json` already exists in frontend directory
- [x] If exists, verify configuration matches:
  - **Style**: `New York` (cleaner, more modern aesthetic)
  - **Base color**: `neutral` or `slate` (neutral, professional)
  - **CSS variables**: `true` (enables theme customization)
  - **Import aliases**: `@/components`, `@/lib`, `@/ui` configured in tsconfig.json
  - **Tailwind config**: `tailwind.config.cjs` or `tailwind.config.ts`
  - **CSS file**: `src/index.css`
- [x] Verify `components.json` structure (should exist from previous setup):
  ```json
  {
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": false,
    "tsx": true,
    "tailwind": {
      "config": "tailwind.config.ts",
      "css": "src/styles/index.css",
      "baseColor": "slate",
      "cssVariables": true
    },
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils"
    }
  }
  ```

**Verify Existing Components**:

- [x] Check `frontend/src/components/ui/` directory for already installed components
- [x] Confirm these core components exist: button, card, input, dialog, dropdown-menu, avatar, tabs, separator, checkbox, label, navigation-menu
- [x] Verify `src/lib/utils.ts` exists with cn() utility function for className merging

**Install Additional Components (if needed)**:

- [ ] ONLY IF missing: Install toast component:
  ```bash
  cd frontend
  npx shadcn@latest add toast
  ```
- [ ] ONLY IF missing: Install alert component:
  ```bash
  npx shadcn@latest add alert
  ```
- [ ] Note: Components are installed as TypeScript source files in `src/components/ui/`, NOT as npm packages
- [ ] Note: Each component brings its own Radix UI dependencies which ARE npm packages (e.g., `@radix-ui/react-dialog`)

**Understanding Component Structure**:

- [x] Review component files (e.g., `button.tsx`, `card.tsx`) and understand pattern: - Built on Radix UI primitives (headless, accessible) - Styled with Tailwind CSS classes - Use class-variance-authority for variant management - Customizable via className prop and CSS variables
- [x] Identify customization points: variant props, className overrides, CSS
      variable theming
- [x] Document file organization: `/components/ui` for shadcn/ui, `/components` for custom app components

**How to Add More Components Later**:

- [ ] Document the pattern: `cd frontend && npx shadcn@latest add <component-name>`
- [ ] Note: This downloads component source code, NOT an npm package
- [ ] Example: `npx shadcn@latest add select` adds Select component
- [ ] Component list: https://ui.shadcn.com/docs/components

**Success Criteria**:

- shadcn/ui configuration verified (components.json exists and correct)
- Core components already exist in `src/components/ui/`
- Learner understands shadcn/ui uses Radix UI + Tailwind CSS, NOT npm packages for components
- Learner can add new components using `npx shadcn@latest add <component>`
- Component file structure clear and organized

**Estimated Effort**: 1 hour

---

### Unit 6: Design System Architecture & Style Guide Page

**Goal**: Establish design system foundation with CSS custom properties, design
tokens, and create initial style guide documentation page

**Prerequisites**:

- Unit 5 completed (shadcn/ui installed)
- Understanding of CSS custom properties and Tailwind configuration

**Deliverables**:

**Design Tokens**:

- [x] Create `frontend/src/styles/design-system.css` file
- [x] Define CSS custom properties for extended design tokens: - Typography scale (font-size, line-height, font-weight for xs through 5xl) - Spacing scale (complementing Tailwind: xs, sm, md, lg, xl, 2xl, 3xl) - Shadow tokens (sm, md, lg, xl, 2xl) - Z-index scale (dropdown, sticky, fixed, modal, popover, tooltip) - Utility classes (text-balance, container sizes, focus-ring, truncate)
- [x] Note: Color tokens already defined in `src/index.css` by shadcn/ui (background, foreground, primary, secondary, muted, accent, destructive, border, input, ring, card, popover)
- [x] Import design-system.css **inside** `index.css` using `@import './styles/design-system.css';` (not in main.tsx)
- [x] **IMPORTANT**: The import must be in `index.css` after `@tailwind` directives so PostCSS processes it correctly. Importing in `main.tsx` causes `@layer base` error because the file is processed separately without access to Tailwind's layer definitions.

**CSS Import Pattern** (in `src/index.css`):

```css
@import "./styles/design-system.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Rest of your CSS */
```

**Note**: `@import` must come **BEFORE** `@tailwind` directives per CSS specification.

**Tailwind Configuration**:

- [x] Verify `tailwind.config.cjs` already extended with shadcn/ui CSS variables
- [x] Confirm color system uses `hsl(var(--<color>))` pattern for theme support
- [x] Verify borderRadius uses `var(--radius)` for consistent rounding
- [x] Confirm `tailwindcss-animate` plugin installed for animations
- [x] Note: No additional Tailwind config changes needed - shadcn/ui setup is complete

**Style Guide Page**:

- [x] Create `frontend/src/pages/StyleGuide.tsx` component
- [x] Create page layout with header "Design System" and Tabs navigation
- [x] Add route `/style-guide` in `AppRoutes.tsx` (public route, no auth required)
- [x] Create sections: Colors, Typography, Spacing, Components
- [x] Style page with clean, documentation-focused design

  ```typescript
  import type { Config } from "tailwindcss";

  export default {
    darkMode: ["class"],
    content: [
      "./pages/**/*.{ts,tsx}",
      "./components/**/*.{ts,tsx}",
      "./app/**/*.{ts,tsx}",
      "./src/**/*.{ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // shadcn/ui CSS variable colors (auto-added by init)
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          // Add custom design system colors
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        // Add custom utilities
      },
    },
    plugins: [require("tailwindcss-animate")],
  } satisfies Config;
  ```

- [ ] Verify Tailwind config imports design system variables (shadcn/ui init should add this automatically)
- [ ] Add any custom utility classes needed for your design system (e.g., `.text-balance`, `.container-lg`)

**Style Guide Page**:

- [ ] Create `frontend/src/pages/StyleGuide.tsx` component
- [ ] Create basic page layout with header "Design System" and navigation
      tabs/sections
- [ ] Add route `/style-guide` in `AppRoutes.tsx` (public route, no auth
      required for easy access)
- [ ] Create sections structure: Colors, Typography, Spacing, Components (to be
      populated in next units)
- [ ] Style page with clean, documentation-focused design (minimal distractions)

**Color Section Content**:

- [x] Display color swatches for shadcn/ui theme colors with HSL values and CSS variable names
- [x] Make swatches clickable to copy HSL value to clipboard
- [x] Show visual feedback when color copied ("Copied!" message)
- [x] Include colors: background, foreground, primary, secondary, muted, accent, destructive, border, input, ring, card, popover

**Typography Section Content**:

- [x] Display all heading levels (h1-h6) with live examples showing size, weight, line-height
- [x] Include sample text for each heading level
- [x] Display actual font rendering using design system typography scale
- [x] Show semantic heading hierarchy

**Spacing Section Content**:

- [x] Display custom spacing scale with visual representation
- [x] Include spacing tokens: xs, sm, md, lg, xl, 2xl, 3xl
- [x] Show actual spacing measurements with colored blocks

**Components Section Content**:

- [x] Display Button component variations (default, secondary, destructive, outline, ghost, link)
- [x] Display Input component with Label
- [x] Display Card component with header, content, footer
- [x] All components use shadcn/ui from src/components/ui/

**Navigation**:

- [x] Add "Style Guide" link to main navigation (visible to all users)
- [x] Make style guide page easily accessible at `/style-guide` route
- [x] Add "View Style Guide" button to Home page for easy testing access
- [x] Add "Back to Home" button on Style Guide page for easy navigation during testing

**Success Criteria**:

- Design tokens defined as CSS custom properties and integrated with Tailwind
- Style guide page accessible at `/style-guide` route
- Color palette fully documented with visual swatches and clipboard copy
- Typography scale demonstrated with live heading examples
- Spacing scale visualized with measurements
- Component demos show shadcn/ui components in use
- Page serves as single source of truth for design decisions

**Estimated Effort**: 3-4 hours

---

PAUSE

## AI PROMPT TO USER/LEARNER:

**Part 1 (Units 1-6) implementation complete!**

Before proceeding to Part 2, **please test the design system implementation in your browser:**

### Frontend Testing Checklist

**Start the development server** (if not already running):

```bash
cd frontend
npm run dev
```

**Navigate to the Style Guide**:

1. Open browser to `http://localhost:5173/style-guide`
2. Verify page loads without errors

**Test Colors Tab**:

- [ ] Click "Colors" tab - section displays color swatches
- [ ] Verify all shadcn/ui theme colors shown (background, foreground, primary, secondary, muted, accent, destructive, border, input, ring, card, popover)
- [ ] Click any color swatch - "Copied!" message appears
- [ ] Open browser DevTools (F12), check Console - verify HSL value logged
- [ ] Paste from clipboard - verify HSL value copied correctly (e.g., `210 40% 98%`)

**Test Typography Tab**:

- [ ] Click "Typography" tab - section displays heading examples
- [ ] Verify all heading levels h1-h6 render with correct sizes
- [ ] Check visual hierarchy (h1 largest → h6 smallest)
- [ ] Verify sample text appears under each heading

**Test Spacing Tab**:

- [ ] Click "Spacing" tab - section displays spacing scale
- [ ] Verify spacing tokens shown: xs, sm, md, lg, xl, 2xl, 3xl
- [ ] Check visual spacing blocks render correctly

**Test Components Tab**:

- [ ] Click "Components" tab - section displays component demos
- [ ] Verify Button variations render (default, secondary, destructive, outline, ghost, link)
- [ ] Verify Input with Label renders
- [ ] Verify Card renders with header, content, footer sections
- [ ] Click buttons - verify they respond to interaction

**Browser Console Check**:

- [ ] Open DevTools Console (F12 → Console tab)
- [ ] Verify NO errors shown (red messages)
- [ ] Verify NO warnings about missing modules or failed imports
- [ ] Copy color swatch - verify console logs HSL value (expected in development mode)

**Navigation Check**:

- [ ] Verify "Style Guide" link appears in main navigation
- [ ] Click link - navigates to `/style-guide` correctly
- [ ] Navigate to Home page - verify you can return to style guide

---

**IMPORTANT**: Please confirm:

✅ "I have tested the style guide in my browser and all sections work correctly"

OR

❌ "I encountered issues: [describe what failed]"

**Once you confirm testing is complete, I will proceed with Part 2 (Testing Infrastructure & Visualization).**

---

## Summary of Part 1 Accomplishments

**Units Completed**: 1-7

**Backend Improvements**:

- ✅ Request ID middleware for end-to-end tracing
- ✅ Structured JSON logging with request context
- ✅ Standardized error response schema across all endpoints
- ✅ Timeout and retry configuration for Supabase API resilience
- ✅ Health check endpoint with database connectivity test

**Frontend Improvements**:

- ✅ Request ID generation and correlation
- ✅ Frontend logging utility for debugging
- ✅ shadcn/ui component library installed and configured
- ✅ Design system CSS with tokens for colors, typography, spacing
- ✅ Style guide page with color and typography documentation

**Ready for Part 2**: Testing infrastructure, Recharts visualization, UX polish

---

**END OF PART 1**

**Next**: Part 2 will cover Units 8-11 (Testing Suite, Recharts, UX Polish, QA)

---

---

# PART 2: TESTING INFRASTRUCTURE & VISUALIZATION (Units 7-13)

---

## AI TRANSITION PROMPT (Part 1 → Part 2)

**Before starting Part 2, validate Part 1 completion with this checklist:**

**Part 1 Validation Checklist:**

- [ ] **Unit 1 (Request ID)**: Request IDs flow from frontend → backend → logs → error responses
  - Test: Make API request, verify same request ID in frontend console, backend logs, and response headers
- [ ] **Unit 2 (Structured Logging)**: All logs structured as JSON with request_id, timestamp, level, message
  - Test: Check backend console output is valid JSON format, includes request_id
- [ ] **Unit 3 (Error Handling)**: All errors follow standardized schema with request_id
  - Test: Trigger 404, 401, 422, 500 errors, verify consistent error response shape
- [ ] **Unit 4 (Timeout/Retry)**: Supabase calls have timeout protection and retry logic
  - Test: Health check returns database status, retry logic works for transient failures
- [ ] **Unit 5 (shadcn/ui)**: Core shadcn/ui components installed and working
  - Test: Button, Card, Dialog, Toast components render correctly
- [ ] **Unit 6 (Design System)**: Style guide page accessible at /style-guide with color palette and typography
  - Test: Navigate to http://localhost:5173/style-guide, verify sections render

**If ALL checklist items pass**, proceed to Part 2 with this prompt:

---

## AI PROMPT (Part 2 Start):

I need you to implement **Part 2** of the Session 3 Production Polish PRD (Units
7-13: Testing Infrastructure, Interactive Style Guide, Data Visualization, UX
Polish).

**PART 1 STATUS**: ✅ Complete (Request tracing, logging, error handling, design system foundation all working)

**EXECUTION REQUIREMENTS:**

- Follow the unit sequence exactly as documented (Units 7-13)
- Mark deliverables as [x] in the PRD as you complete them
- Ask for my approval at PAUSE sections before proceeding to next phase
- Run all tests to ensure passing test suites (pytest and Vitest)
- Flag any missing dependencies or unclear requirements immediately

**TECHNICAL CONSTRAINTS:**

- Backend Testing: pytest==8.0.0, pytest-asyncio==0.23.0, httpx==0.26.0, pytest-cov==4.1.0
- Frontend Testing: Vitest 1.2.0, @testing-library/react 14.1.2, jsdom 24.0.0
- Visualization: Recharts library with Supabase database views (SQL provided in Unit 11)
- Accessibility: WCAG 2.1 AA standards, keyboard navigation, ARIA labels

**PART 2 OVERVIEW (7 Units):**

- Unit 7: Backend testing setup (pytest configuration, fixtures, test patterns)
- Unit 8: Frontend testing setup (Vitest configuration, test utilities)
- Unit 9: Interactive style guide for native HTML elements
- Unit 10: shadcn/ui component gallery with interactive playground
- Unit 11: Recharts integration with analytics dashboard
- Unit 12: Optimistic updates and advanced UX patterns
- Unit 13: Final QA, PR hygiene, deployment preparation

**START WITH UNIT 7 (Backend Testing Setup)** - Please confirm you understand the requirements and provide a 3-step plan for implementing pytest infrastructure.

---

## Phase 4: Testing Infrastructure & Coverage

### Unit 7: Backend Testing Setup with pytest

**Goal**: Establish comprehensive backend testing infrastructure with pytest,
fixtures, and async testing support

**Prerequisites**:

- Units 1-6 completed (backend with logging, errors, health checks)
- Understanding of pytest patterns and fixtures
- Familiarity with FastAPI testing using TestClient

**Deliverables**:

**Pytest Installation**:

- [ ] Install testing dependencies:
  ```bash
  pip install pytest pytest-asyncio httpx pytest-cov
  ```
- [ ] Add testing dependencies to `backend/requirements.txt`:
  ```
  pytest
  pytest-asyncio
  httpx
  pytest-cov
  coverage
  ```

**Pytest Configuration**:

- [ ] Create or update `backend/pytest.ini` with the following configuration:
  ```ini
  [pytest]
  testpaths = tests
  python_files = test_*.py
  python_classes = Test*
  python_functions = test_*
  markers =
      unit: Unit tests (fast, no external dependencies)
      integration: Integration tests (may hit database or external APIs)
      slow: Tests that take > 1 second to run
  asyncio_mode = auto
  addopts =
      -v
      --strict-markers
      --tb=short
      --cov=app
      --cov-report=term-missing
      --cov-report=html
      --cov-fail-under=70
  ```
- [ ] Install testing dependencies with specific versions:
  ```bash
  pip install pytest==8.0.0 pytest-asyncio==0.23.0 httpx==0.26.0 pytest-cov==4.1.0
  ```
- [ ] Add dependencies to `requirements.txt` under a `[test]` section or create `requirements-dev.txt`:
  ```
  # Testing dependencies
  pytest==8.0.0
  pytest-asyncio==0.23.0
  httpx==0.26.0
  pytest-cov==4.1.0
  ```
- [ ] Verify pytest discovers tests: Run `pytest --collect-only` to see test discovery without execution
- [ ] Configure IDE/editor to recognize pytest (VS Code: Python extension auto-detects pytest.ini)

**Test Fixtures**:

- [ ] Create `backend/tests/conftest.py` with shared fixtures:

  ```python
  import pytest
  from fastapi.testclient import TestClient
  from app.main import app

  @pytest.fixture
  def test_app():
      """Provides FastAPI TestClient for endpoint testing."""
      return TestClient(app)

  @pytest.fixture
  def auth_headers(test_user_token):
      """Provides authentication headers for protected endpoints."""
      return {"Authorization": f"Bearer {test_user_token}"}

  @pytest.fixture
  def test_user_token():
      """Generates a valid test user token (mock or real)."""
      # Implementation: Use Supabase test user or JWT mock
      return "test-token-12345"

  @pytest.fixture
  def mock_user():
      """Provides test user data for assertions."""
      return {
          "id": "test-user-id",
          "email": "test@example.com",
          "created_at": "2024-01-01T00:00:00Z"
      }
  ```

- [ ] Implement `test_app` fixture providing FastAPI TestClient instance (see code above)
- [ ] Implement `test_db` fixture if needed for database-isolated tests (optional: use Supabase test project or mock)
- [ ] Implement `auth_headers` fixture generating valid authentication headers for protected endpoints
- [ ] Implement `mock_user` fixture providing consistent test user data
- [ ] Add cleanup logic if needed (pytest automatically cleans up fixtures after each test)

**Core Test Patterns**:

- [ ] Create `backend/tests/test_health.py` testing health check endpoint
- [ ] Test health endpoint returns correct status and database connectivity info
- [ ] Create `backend/tests/test_middleware.py` testing request ID middleware
- [ ] Test request ID generated when not provided by client
- [ ] Test request ID preserved when provided by client
- [ ] Test request ID appears in response headers

**Error Handling Tests**:

- [ ] Create `backend/tests/test_error_handling.py`
- [ ] Test 404 error returns standardized error schema with request_id
- [ ] Test 401 error for missing authentication token
- [ ] Test 422 validation error for invalid request body
- [ ] Test 500 error handling for uncaught exceptions (mock exception scenario)
- [ ] Verify all errors include request_id in response

**Logging Tests**:

- [ ] Create `backend/tests/test_logging.py`
- [ ] Test structured logger produces valid JSON output
- [ ] Test request ID included in log records
- [ ] Test log levels filtered correctly based on configuration
- [ ] Capture log output and assert on log message content

**Authentication Tests** (extending S2):

- [ ] Create `backend/tests/test_auth_endpoints.py` if not exists
- [ ] Test signup endpoint creates user successfully
- [ ] Test login endpoint returns valid session
- [ ] Test logout endpoint clears session
- [ ] Test protected endpoints reject unauthenticated requests

**Running Tests**:

- [ ] Document how to run tests: `pytest` (all tests),
      `pytest tests/test_health.py` (specific file), `pytest -v` (verbose),
      `pytest --cov=app` (with coverage)
- [ ] Create test script in `package.json` or `Makefile` for convenience
- [ ] Ensure all tests pass before proceeding

**Success Criteria**:

- pytest configured and running successfully
- Test fixtures provide reusable test infrastructure
- All existing endpoints have basic test coverage
- Tests isolated (no state leakage between tests)
- Test suite runs in < 10 seconds for fast feedback
- Coverage report shows > 70% line coverage

**Estimated Effort**: 3-4 hours

---

### Unit 8: Frontend Testing Setup with Vitest

**Goal**: Establish frontend testing infrastructure with Vitest and React
Testing Library for component and integration testing

**Prerequisites**:

- Unit 8 completed (backend testing patterns established)
- Understanding of React Testing Library principles (test behavior, not
  implementation)
- Familiarity with Vitest as Vite-native test runner

**Deliverables**:

**Vitest Installation**:

- [ ] **AI ASSISTANT**: Provide this install command to the user:
  ```bash
  npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom
  ```
- [ ] **AI ASSISTANT**: Prompt user to run the command in the `/frontend` terminal and confirm when complete
- [ ] **AI ASSISTANT**: After user confirmation, add test scripts to `package.json`:
  ```json
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
  ```

**Vitest Configuration**:

- [ ] Create `frontend/vitest.config.ts` with the following configuration:

  ```typescript
  import { defineConfig } from "vitest/config";
  import react from "@vitejs/plugin-react";
  import path from "path";

  export default defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "json"],
        exclude: [
          "node_modules/",
          "src/test/",
          "**/*.d.ts",
          "**/*.config.*",
          "**/mockData",
          "src/main.tsx",
        ],
        all: true,
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
  ```

- [ ] Verify configuration: Run `npx vitest --version` to confirm installation
- [ ] Ensure path aliases (`@/*`) match Vite config for consistent imports

**Test Utilities Setup**:

- [ ] Create `frontend/src/test/setup.ts` for global test setup:

  ```typescript
  import "@testing-library/jest-dom";
  import { afterEach } from "vitest";
  import { cleanup } from "@testing-library/react";

  // Cleanup after each test automatically
  afterEach(() => {
    cleanup();
  });
  ```

- [ ] Create `frontend/src/test/utils.tsx` with custom render function:

  ```typescript
  import { render, RenderOptions } from "@testing-library/react";
  import { Provider } from "react-redux";
  import { BrowserRouter } from "react-router-dom";
  import { configureStore } from "@reduxjs/toolkit";
  import authReducer from "@/store/authSlice";

  export function renderWithProviders(
    ui: React.ReactElement,
    {
      preloadedState = {},
      store = configureStore({
        reducer: { auth: authReducer },
        preloadedState,
      }),
      ...renderOptions
    }: any = {}
  ) {
    function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <Provider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
        </Provider>
      );
    }
    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
  }

  export * from "@testing-library/react";
  ```

- [ ] Create mock API client in `frontend/src/test/mocks.ts` for service testing:

  ```typescript
  import { vi } from "vitest";

  export const mockApiClient = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  ```

**Component Tests**:

- [ ] Create `frontend/src/components/__tests__/` directory
- [ ] Create `Button.test.tsx` testing shadcn Button component variants and
      click handlers
- [ ] Create `Navigation.test.tsx` testing navigation shows correct links based
      on auth state
- [ ] Test navigation renders "Sign In" when unauthenticated
- [ ] Test navigation renders avatar and user links when authenticated

**Page Tests**:

- [ ] Create `frontend/src/pages/__tests__/` directory
- [ ] Create `StyleGuide.test.tsx` testing style guide page renders sections
      correctly
- [ ] Test color palette section displays swatches
- [ ] Test typography section displays heading samples

**Service Layer Tests**:

- [ ] Create `frontend/src/services/__tests__/` directory
- [ ] Create `authService.test.ts` testing auth service functions
- [ ] Mock apiClient to avoid real HTTP requests
- [ ] Test login() calls correct endpoint with credentials
- [ ] Test logout() clears session correctly
- [ ] Test error handling when API returns error response

**Redux Tests**:

- [ ] Create `frontend/src/store/__tests__/` directory
- [ ] Create `authSlice.test.ts` testing Redux auth slice reducers and actions
- [ ] Test setSession() updates isAuthenticated state
- [ ] Test clearSession() resets state to initial
- [ ] Test async thunks (if using Redux Toolkit Query or custom thunks)

**Running Tests**:

- [ ] Add test script to `package.json`: `"test": "vitest"`,
      `"test:ui": "vitest --ui"`, `"test:coverage": "vitest --coverage"`
- [ ] Document testing commands in README or testing guide
- [ ] Ensure all tests pass before proceeding

**Success Criteria**:

- Vitest configured and running successfully with jsdom environment
- React Testing Library integrated for component testing
- Test utilities provide easy Redux and Router context setup
- Component tests verify UI behavior without implementation details
- Service and Redux tests verify logic without real API calls
- All tests pass and coverage report shows > 60% component coverage

**Estimated Effort**: 3-4 hours

---

PAUSE

## AI PROMPT:

Validate Phase 4 (Testing Infrastructure) completion:

**VALIDATION CHECKLIST**:

**Backend**:

- Run `pytest` from backend directory
- Verify all tests pass
- Run `pytest --cov=app` and check coverage > 70%
- Verify tests run in < 10 seconds
- Check test output shows request IDs in error tests
- Verify fixtures work correctly (no test isolation issues)

**Frontend**:

- Run `npm test` from frontend directory
- Verify all tests pass
- Run `npm run test:coverage` and check coverage > 60%
- Verify component tests render without errors
- Check Redux tests verify state changes correctly
- Verify service tests use mocked API client (no real HTTP)

**Confirm both test suites passing before proceeding to Phase 5 (Interactive
Components).**

---

## Phase 5: Interactive Style Guide & Component Gallery

### Unit 9: Interactive Style Guide - Native HTML Elements

**Goal**: Expand style guide with interactive demonstrations of native HTML
elements (typography, forms, semantic tags) with live customization controls

**Prerequisites**:

- Unit 7 completed (style guide page exists with colors and typography)
- Understanding of semantic HTML and accessibility

**Deliverables**:

**Typography Section Enhancement**:

- [ ] Expand typography section with all native HTML text elements
- [ ] Display headings: `<h1>` through `<h6>` with sample content
- [ ] Display text elements: `<p>`, `<span>`, `<strong>`, `<em>`, `<small>`,
      `<mark>`, `<code>`, `<pre>`
- [ ] Display lists: `<ul>`, `<ol>`, `<dl>` with sample items
- [ ] Display blockquote and cite elements
- [ ] Make elements interactive: add controls to change font size, weight, color
      on-the-fly

**Form Elements Section**:

- [ ] Create new section "Form Elements" in style guide
- [ ] Display native form controls: `<input>` (text, email, password, number,
      date), `<textarea>`, `<select>`, `<checkbox>`, `<radio>`, `<button>`
- [ ] Show different button types: button, submit, reset
- [ ] Show input states: default, focused, disabled, error
- [ ] Include labels, placeholders, helper text, and error messages
- [ ] Add interactive controls to toggle disabled/error states

**Semantic Elements Section**:

- [ ] Create section "Semantic HTML" in style guide
- [ ] Display semantic containers: `<header>`, `<nav>`, `<main>`, `<section>`,
      `<article>`, `<aside>`, `<footer>`
- [ ] Show proper nesting and usage patterns
- [ ] Include accessibility notes for each element (when to use, ARIA
      considerations)

**Links and Navigation**:

- [ ] Create section for anchor tags `<a>` with different states: default,
      hover, active, visited, external
- [ ] Show navigation patterns: horizontal nav, vertical nav, breadcrumbs
- [ ] Include accessibility examples: skip links, focus visible, keyboard
      navigation

**Interactive Controls Panel**:

- [ ] Add sidebar or floating panel with controls to modify elements in
      real-time
- [ ] Controls for: font size (slider), color (color picker), spacing (preset
      options), border radius (slider)
- [ ] Use React state to apply changes to displayed elements
- [ ] Add "Reset" button to restore defaults
- [ ] Add "Copy CSS" button to copy generated CSS custom properties

**Code Examples**:

- [ ] Show HTML code for each element type with syntax highlighting
- [ ] Add copy-to-clipboard button for code snippets
- [ ] Include both HTML and corresponding CSS for styling

**Success Criteria**:

- All native HTML elements documented with visual examples
- Interactive controls allow real-time customization
- Code examples accurate and copy-able
- Accessibility best practices documented for each element
- Style guide serves as learning tool for HTML semantics

**Estimated Effort**: 4-5 hours

---

### Unit 10: Interactive Style Guide - shadcn/ui Component Gallery

**Goal**: Create comprehensive gallery of shadcn/ui components with variant
demonstrations and interactive customization

**Prerequisites**:

- Unit 6 completed (shadcn/ui components installed)
- Unit 10 completed (native HTML section established pattern)

**Deliverables**:

**Button Component Section**:

- [ ] Create "shadcn/ui Components" section in style guide
- [ ] Display all Button variants: default, destructive, outline, secondary,
      ghost, link
- [ ] Display all Button sizes: default, sm, lg, icon
- [ ] Show Button states: default, hover, active, disabled, loading
- [ ] Add interactive controls to switch variants and sizes
- [ ] Include code examples with import statements and props

**Card Component Section**:

- [ ] Display Card component with all parts: CardHeader, CardTitle,
      CardDescription, CardContent, CardFooter
- [ ] Show Card variations: default, with image, with actions, interactive hover
- [ ] Demonstrate nesting patterns (cards in grids)

**Form Components Section**:

- [ ] Display Input component with label, placeholder, helper text, error state
- [ ] Display Textarea component with character counter
- [ ] Display Select/Dropdown component with options
- [ ] Display Checkbox and Radio components with labels
- [ ] Show form validation patterns with error messages

**Dialog/Modal Section**:

- [ ] Display Dialog component with trigger, content, header, footer
- [ ] Show different dialog sizes and styles
- [ ] Include accessibility notes (focus trap, keyboard close with Escape)

**Toast/Alert Section**:

- [ ] Display Toast component with different variants: default, destructive,
      success
- [ ] Add demo buttons to trigger toasts with different messages
- [ ] Display Alert component with variants: default, destructive, warning, info
- [ ] Show icons in alerts

**Dropdown Menu Section**:

- [ ] Display DropdownMenu component with items, separators, sub-menus
- [ ] Show trigger variations (button, icon, avatar)
- [ ] Demonstrate keyboard navigation (arrow keys, Enter, Escape)

**Avatar Component Section**:

- [ ] Display Avatar with image, fallback initials, different sizes
- [ ] Show AvatarGroup pattern (overlapping avatars)

**Navigation Components**:

- [ ] If NavigationMenu installed, display with items and sub-items
- [ ] Show active state styling
- [ ] Demonstrate responsive behavior (desktop vs mobile)

**Interactive Variant Switcher**:

- [ ] Add controls to switch component variants dynamically
- [ ] Use tabs or segmented control to choose component category
- [ ] Add "View Code" toggle to show/hide code examples inline
- [ ] Add theme switcher (light/dark mode) if using CSS variables for theming

**Component Playground**:

- [ ] Create interactive playground area where learners can modify component
      props via UI controls
- [ ] Allow adjusting: size, variant, disabled state, text content
- [ ] Show real-time preview of component with applied props
- [ ] Display generated JSX code below playground

**Usage Guidelines**:

- [ ] Add "When to Use" section for each component explaining appropriate use
      cases
- [ ] Include anti-patterns (when NOT to use component)
- [ ] Link to shadcn/ui official docs for detailed API reference

**Success Criteria**:

- All installed shadcn/ui components documented with visual examples
- Component variants and states clearly demonstrated
- Interactive playground enables hands-on experimentation
- Code examples include proper imports and TypeScript types
- Usage guidelines help learners choose right components

**Estimated Effort**: 5-6 hours

---

PAUSE

## AI PROMPT:

Validate Phase 5 (Interactive Style Guide) completion:

**VALIDATION CHECKLIST**:

- Navigate to `http://localhost:5173/style-guide`
- Verify "Native HTML" section shows all heading levels, text elements, form
  controls
- Test interactive controls: change font size, verify elements update in
  real-time
- Test "Copy Code" buttons: verify HTML snippets copy correctly
- Verify "shadcn/ui Components" section displays all installed components
- Test Button variants: click through all variants and sizes, verify rendering
- Test Dialog component: click trigger, verify modal opens with focus trap
- Test Toast demo: click button, verify toast appears with correct styling
- Test component playground: modify props via controls, verify preview updates
- Test theme switcher (if implemented): toggle light/dark, verify CSS variables
  change
- Verify all code examples have syntax highlighting
- Check accessibility: keyboard navigate through interactive elements, verify
  focus visible

**Confirm style guide is comprehensive and interactive before proceeding to
Phase 6 (Visualization).**

---

## Phase 6: Data Visualization & Analytics

### Unit 11: Recharts Integration & Analytics Dashboard

**Goal**: Integrate Recharts visualization library and create analytics
dashboard showing items and tags data with charts

**Prerequisites**:

- Units 1-10 completed (backend stable, frontend tested, style guide
  established)
- Understanding of data visualization best practices
- Familiarity with Supabase views for aggregated data

**Deliverables**:

**Recharts Installation**:

- [ ] Install Recharts: `npm install recharts`
- [ ] Install date utilities if needed: `npm install date-fns` (for date
      formatting in charts)
- [ ] Verify Recharts works with test chart component

**Supabase Database Views**:

- [ ] Open Supabase Dashboard → SQL Editor and create the following views:

- [ ] Create view `items_by_date` aggregating idea count by creation date (last 30 days):

  ```sql
  CREATE OR REPLACE VIEW items_by_date AS
  SELECT
    DATE(created_at) as date,
    COUNT(*) as count
  FROM ideas
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY DATE(created_at)
  ORDER BY date DESC;
  ```

- [ ] Create view `items_by_status` aggregating idea count by status:

  ```sql
  CREATE OR REPLACE VIEW items_by_status AS
  SELECT
    status,
    COUNT(*) as count
  FROM ideas
  GROUP BY status
  ORDER BY count DESC;
  ```

- [ ] Create view `tags_usage` aggregating tag usage from ideas.tags array (top 10 most used tags):

  ```sql
  CREATE OR REPLACE VIEW tags_usage AS
  SELECT
    unnest(tags) as label,
    COUNT(*) as usage_count
  FROM ideas
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  GROUP BY unnest(tags)
  ORDER BY usage_count DESC
  LIMIT 10;
  ```

  Note: This uses PostgreSQL's `unnest()` to extract individual tags from the `ideas.tags` TEXT[] array column.

- [ ] Create view `user_activity` aggregating user actions over time (ideas created per day):

  ```sql
  CREATE OR REPLACE VIEW user_activity AS
  SELECT
    DATE(created_at) as activity_date,
    user_id,
    COUNT(*) as items_created
  FROM ideas
  WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY DATE(created_at), user_id
  ORDER BY activity_date DESC, user_id;
  ```

- [ ] Test views return correct data via Supabase SQL Editor:

  ```sql
  SELECT * FROM items_by_date LIMIT 10;
  SELECT * FROM items_by_status;
  SELECT * FROM tags_usage;
  SELECT * FROM user_activity WHERE user_id = 'YOUR_TEST_USER_ID' LIMIT 10;
  ```

- [ ] **Important**: Ensure RLS policies are applied to views if accessing via API (views inherit permissions from underlying `ideas` table)

**Backend Analytics Endpoints**:

- [ ] Create `backend/app/api/routes/analytics.py` module
- [ ] Implement `GET /api/v1/analytics/items-by-date` endpoint querying
      items_by_date view
- [ ] Implement `GET /api/v1/analytics/items-by-status` endpoint querying
      items_by_status view
- [ ] Implement `GET /api/v1/analytics/tags-usage` endpoint querying tags_usage
      view
- [ ] Add authentication requirement (protected routes, user-scoped data)
- [ ] Add RLS enforcement ensuring users only see their own analytics
- [ ] Register analytics routes in `main.py`
- [ ] Add request logging for analytics endpoints

**Frontend Analytics Service**:

- [ ] Create `frontend/src/services/analyticsService.ts`
- [ ] Implement `getItemsByDate()` function calling analytics endpoint
- [ ] Implement `getItemsByStatus()` function calling analytics endpoint
- [ ] Implement `getTagsUsage()` function calling analytics endpoint
- [ ] Handle loading and error states
- [ ] Transform API response data to format expected by Recharts

**Analytics Dashboard Page**:

- [ ] Create `frontend/src/pages/Analytics.tsx` component
- [ ] Add route `/analytics` in `AppRoutes.tsx` (protected route)
- [ ] Add "Analytics" link to navigation for authenticated users
- [ ] Create page layout with header and grid layout for charts
- [ ] **Add centered loading state with Lucide Loader2 icon during data fetch** (animated spinner with "Loading Analytics" message)

**Line Chart - Items Created Over Time**:

- [ ] Implement LineChart component using Recharts
- [ ] Fetch data from `getItemsByDate()` service
- [ ] Display X-axis: dates (last 30 days), Y-axis: item count
- [ ] Add tooltip showing date and count on hover
- [ ] Add legend if showing multiple series (e.g., items by status)
- [ ] Style chart colors using design system tokens

**Bar Chart - Items by Status**:

- [ ] Implement BarChart component using Recharts
- [ ] Fetch data from `getItemsByStatus()` service
- [ ] Display X-axis: status labels (Todo, In Progress, Done), Y-axis: count
- [ ] Add tooltip and value labels on bars
- [ ] Color bars by status using semantic colors (todo: neutral, in_progress:
      warning, done: success)

**Pie Chart - Tag Usage Distribution**:

- [ ] Implement PieChart component using Recharts
- [ ] Fetch data from `getTagsUsage()` service
- [ ] Display top 10 tags by usage with percentage
- [ ] Add legend with tag names and counts
- [ ] Add tooltip on hover showing tag and percentage
- [ ] Use color palette from design system for slices

**Chart Components Best Practices**:

- [ ] Make charts responsive (use ResponsiveContainer from Recharts)
- [ ] Add loading skeletons while data fetching
- [ ] Add empty state when no data available
- [ ] Add error boundary catching chart rendering errors
- [ ] Ensure charts accessible (add ARIA labels, consider data table
      alternative)

**Dashboard Interactivity**:

- [ ] Add date range filter (last 7 days, last 30 days, last 90 days, custom
      range)
- [ ] Implement filter state with React state or query parameters
- [ ] Refetch chart data when filters change
- [ ] Add refresh button to manually reload analytics data
- [ ] Add export button to download chart data as CSV (optional enhancement)

**Testing**:

- [ ] Write test for analytics endpoints returning correct data structure
- [ ] Write test for analytics service transforming data correctly
- [ ] Write component test for chart rendering with mock data
- [ ] Manual test: verify charts display correctly with real user data
- [ ] Test edge cases: empty data, single data point, very large datasets

**Success Criteria**:

- Recharts integrated and charts rendering correctly
- Database views provide optimized aggregated data
- Analytics dashboard accessible to authenticated users
- All chart types (line, bar, pie) implemented and styled consistently
- Charts responsive and accessible
- Data filters work correctly
- Dashboard helps users understand their data at a glance

**Estimated Effort**: 5-6 hours

---

PAUSE

## AI PROMPT:

Validate Phase 6 (Data Visualization) completion:

**VALIDATION CHECKLIST**:

- Navigate to `http://localhost:5173/analytics` while authenticated
- Verify page loads without errors
- Verify Line Chart displays items created over last 30 days with correct data
- Hover over line chart, verify tooltip shows date and count
- Verify Bar Chart displays items grouped by status with correct counts
- Verify colors match semantic meanings (todo, in-progress, done)
- Verify Pie Chart displays top tags with percentages
- Test date range filter: select "Last 7 Days", verify charts update
- Test refresh button: click, verify data reloads
- Test responsive behavior: resize browser, verify charts adapt
- Test with empty data: clear all items, verify empty state shows
- Backend: Query analytics endpoints directly, verify JSON response correct
- Backend: Test RLS: user A should only see their analytics, not user B's
- Check logs: verify analytics requests logged with request IDs

**Confirm analytics dashboard fully functional before proceeding to seed data.**

---

### Unit 11.5: Seed Sample Data for Analytics Testing

**Goal**: Create a database migration to seed sample ideas data for testing analytics dashboard charts and validating data visualization

**Prerequisites**:

- Unit 11 completed (analytics dashboard loads successfully)
- Database schema verified (ideas table exists with correct columns)
- User authenticated and can access `/analytics` page

**Deliverables**:

**Schema Validation**:

- [ ] Query Supabase to verify `ideas` table exists with columns: id, user_id, title, description, status, tags, vote_count, created_at, updated_at
- [ ] Verify `status` column accepts values: 'draft', 'published', 'archived'
- [ ] Verify `tags` column is TEXT[] array type
- [ ] Confirm analytics views exist: items_by_date, items_by_status, tags_usage, user_activity

**Migration File Creation**:

- [ ] Create migration file: `supabase/migrations/20251203000001_seed_sample_ideas.sql`
- [ ] Add migration header with description and timestamp
- [ ] **CRITICAL**: Add conditional check to prevent duplicate seeding (use `SELECT EXISTS` to check if sample data already present)
- [ ] Seed exactly **5 sample ideas** with:
  - Varied statuses (mix of draft, published, archived)
  - Realistic titles and descriptions
  - Different creation dates (last 30 days) to populate time-series charts
  - Mix of tags (3-5 unique tags used across ideas) to populate tag usage chart
  - Varied vote_counts (0-10 range)
- [ ] Use parameterized user_id (either hardcoded test user or variable)
- [ ] Add comments explaining each sample idea's purpose for testing

**Migration Execution**:

- [ ] Run migration manually via Supabase dashboard SQL Editor OR `supabase db push`
- [ ] Verify migration completes without errors
- [ ] Query `ideas` table to confirm 5 rows inserted
- [ ] Refresh `/analytics` page and verify:
  - Line chart shows data points for seeded dates
  - Bar chart shows correct status distribution
  - Pie chart shows tag usage percentages
  - No empty states visible (charts display actual data)

**Cleanup Plan**:

- [ ] Document how to remove sample data (SQL DELETE command with WHERE clause matching sample titles)
- [ ] Add comment in migration file noting this is for testing only
- [ ] Consider adding `is_sample_data` BOOLEAN column for easy cleanup (optional)

**Success Criteria**:

- Migration runs successfully without errors
- Exactly 5 sample ideas inserted into database
- Analytics dashboard displays all three charts with real data
- Charts accurately reflect seeded data (counts, dates, tags match expectations)
- Sample data does not interfere with RLS policies (user can only see their own seeded ideas)
- No duplicate data on repeated migration runs

**Estimated Effort**: 30 minutes - 1 hour

---

PAUSE

## AI PROMPT:

Validate Unit 11.5 (Sample Data Seeding) completion:

**VALIDATION CHECKLIST**:

- Migration file exists at `supabase/migrations/20251203000001_seed_sample_ideas.sql`
- Migration has been run manually via Supabase dashboard
- Query ideas table: `SELECT COUNT(*) FROM ideas;` - returns 5 (or more if you had existing data)
- Navigate to `http://localhost:5173/analytics`
- Verify Line Chart displays data points (no "No data available" message)
- Verify Bar Chart shows bars for different statuses
- Verify Pie Chart shows colored segments for tags
- Query analytics views directly:
  - `SELECT * FROM items_by_date ORDER BY date DESC LIMIT 10;` - returns rows
  - `SELECT * FROM items_by_status;` - returns rows with counts
  - `SELECT * FROM tags_usage ORDER BY usage_count DESC LIMIT 10;` - returns rows
- Check RLS: sample ideas belong to authenticated test user only
- Verify migration idempotent (can run twice without duplicate data)

**Confirm sample data successfully seeded and analytics dashboard displays real charts before proceeding to Phase 7 (UX Polish).**

---

## Phase 7: UX Polish & Quality Assurance

### Unit 12: Optimistic Updates & Advanced UX Patterns

**Goal**: Implement optimistic UI updates for better perceived performance and
add advanced UX patterns (filters, search, accessibility improvements)

**Prerequisites**:

- Units 1-11 completed (full application with testing and visualization)
- Understanding of optimistic updates in Redux

**Deliverables**:

**Optimistic Updates - Items CRUD**:

- [ ] Update Redux `itemsSlice` to support optimistic updates
- [ ] When creating item: immediately add to Redux state with temporary ID
      before API response
- [ ] If API fails, remove optimistic item and show error
- [ ] If API succeeds, replace temporary ID with real ID from server
- [ ] When deleting item: immediately remove from Redux state before API
      confirmation
- [ ] If API fails, restore item and show error
- [ ] When updating item: immediately update in Redux state before API response
- [ ] If API fails, revert to previous state and show error
- [ ] Add visual indicator for pending operations (e.g., reduced opacity,
      loading spinner)

**Search & Filter UI - Items Page**:

- [ ] Add search input at top of items list
- [ ] Implement client-side filtering by title/description as user types
- [ ] Add filter dropdown for status (All, Todo, In Progress, Done)
- [ ] Add filter dropdown for tags (show all tags, allow multi-select)
- [ ] Combine search and filters (items match all active filters)
- [ ] Persist filter state in URL query parameters (enables bookmarking filtered
      views)
- [ ] Add "Clear Filters" button when any filter active

**Loading States & Skeletons**:

- [ ] Replace simple loading spinners with skeleton screens for items list
- [ ] Create skeleton components matching item card layout
- [ ] Show skeletons during initial data fetch
- [ ] Add loading states for individual actions (e.g., button shows spinner
      during submit)
- [ ] Implement progressive loading for large lists (load more on scroll or
      pagination)

**Empty States**:

- [ ] Design and implement empty state for items list when no items exist
- [ ] Include illustration or icon, helpful message, and CTA button to create
      first item
- [ ] Implement empty state for filtered results with "No items match your
      filters" message
- [ ] Add empty states for analytics charts when no data available

**Keyboard Navigation & Shortcuts**:

- [ ] Add keyboard shortcut to focus search input (e.g., `/` like GitHub)
- [ ] Implement arrow key navigation in items list (up/down to select, Enter to
      open)
- [ ] Add keyboard shortcut to create new item (e.g., `C`)
- [ ] Ensure all interactive elements keyboard accessible (Tab order logical)
- [ ] Add visible focus indicators for all focusable elements
- [ ] Document keyboard shortcuts in help modal or footer

**Accessibility Audit**:

- [ ] Run automated accessibility checker (e.g., axe DevTools) on all pages
- [ ] Fix all critical and serious issues reported
- [ ] Ensure all images have alt text
- [ ] Ensure all form inputs have associated labels
- [ ] Verify color contrast meets WCAG AA standards (4.5:1 for text)
- [ ] Test with keyboard only (no mouse): verify all features accessible
- [ ] Test with screen reader (NVDA or VoiceOver): verify announcements make
      sense
- [ ] Add skip links for keyboard users to jump to main content
- [ ] Ensure ARIA labels present where needed (icon buttons, complex widgets)

**Toast Notifications Refinement**:

- [ ] Ensure toasts appear for all important actions (create, update, delete,
      errors)
- [ ] Add success toasts with checkmark icon and green color
- [ ] Add error toasts with X icon and red color
- [ ] Add warning toasts with exclamation icon and yellow color
- [ ] Make toasts dismissible (close button)
- [ ] Auto-dismiss toasts after appropriate timeout (3-5 seconds)
- [ ] Stack multiple toasts gracefully (don't overlap)
- [ ] Ensure toasts accessible (announced by screen readers)

**Error Recovery UX**:

- [ ] When API call fails, show actionable error message with "Try Again" button
- [ ] Retry failed requests with same data when user clicks "Try Again"
- [ ] Add "Report Issue" link in error messages linking to support (or copying
      error details with request ID)
- [ ] For network errors, detect when connection restored and auto-retry

**Success Criteria**:

- Optimistic updates make UI feel instant and responsive
- Search and filters help users find items quickly
- Skeleton screens reduce perceived loading time
- Empty states guide users toward next action
- Keyboard navigation fully functional for power users
- Accessibility audit passes with zero critical issues
- Screen reader testing confirms usable experience for visually impaired users
- Error states provide clear recovery paths

**Estimated Effort**: 5-6 hours

---

### Unit 13: Final QA, PR Hygiene & Deployment Prep

**Goal**: Comprehensive quality assurance pass, clean commit history, and
prepare application for deployment

**Prerequisites**:

- Units 1-12 completed (all features implemented)
- Understanding of PR best practices and deployment checklists

**Deliverables**:

**QA Checklist - Functional Testing**:

- [ ] Test all user flows end-to-end: signup → login → create item → add tags →
      view analytics → logout
- [ ] Test error scenarios: invalid login, network failure, missing required
      fields
- [ ] Test edge cases: empty states, maximum length inputs, special characters,
      Unicode
- [ ] Test browser compatibility: Chrome, Firefox, Safari, Edge (latest
      versions)
- [ ] Test responsive design: mobile (375px), tablet (768px), desktop (1440px)
- [ ] Test with slow network (throttle to 3G in DevTools): verify loading states
- [ ] Test with ad blocker enabled: verify no broken functionality

**QA Checklist - Performance**:

- [ ] Check Lighthouse score for all major pages (aim for > 90 in all
      categories)
- [ ] Verify bundle size reasonable (< 500KB gzipped for main bundle)
- [ ] Check for memory leaks: open/close pages repeatedly, monitor memory
- [ ] Verify no console errors or warnings in production build
- [ ] Test API response times: all endpoints respond in < 500ms p95
- [ ] Verify database queries optimized (no N+1 queries)

**QA Checklist - Security**:

- [ ] Verify authentication required for all protected routes and endpoints
- [ ] Test RLS enforcement: user A cannot access user B's data
- [ ] Check for XSS vulnerabilities: try injecting `<script>` tags in inputs
- [ ] Verify CSRF protection (if applicable)
- [ ] Ensure sensitive data never logged (passwords, tokens, PII)
- [ ] Verify HTTPS enforced in production (if deploying)

**Code Quality Review**:

- [ ] Run linter: `npm run lint` (frontend), `black .` and `isort .` (backend)
- [ ] Fix all linting errors and warnings
- [ ] Run type checker: `npx tsc --noEmit` (frontend)
- [ ] Fix all type errors
- [ ] Remove commented-out code and console.logs
- [ ] Remove unused imports and variables
- [ ] Ensure consistent code formatting throughout

**Git Commit Hygiene**:

- [ ] Review commit history: ensure commits atomic and well-described
- [ ] Squash WIP commits or fix-up commits into logical units
- [ ] Write clear commit messages following conventional commits (feat:, fix:,
      docs:, style:, refactor:, test:, chore:)
- [ ] Ensure no sensitive data committed (check for .env files in history)
- [ ] Tag release version if applicable: `git tag v0.3.0`

**Pull Request Preparation**:

- [ ] Open PR from feature branch (`s3-production-polish`) to main
- [ ] Write comprehensive PR description with sections: What (summary), Why
      (rationale), How to Test (step-by-step), Screenshots (before/after)
- [ ] Add checklist in PR body: Breaking Changes, Migration Required,
      Documentation Updated, Tests Added
- [ ] Add reviewer checklist: Code Quality, Test Coverage, Accessibility,
      Performance
- [ ] Request review from teammate or self-review thoroughly
- [ ] Verify CI/CD pipeline passes (if configured)

**Documentation Updates**:

- [ ] Update README with new features (logging, testing, design system,
      analytics, profile management)
- [ ] Document environment variables needed for new features
- [ ] Update API documentation with new analytics endpoints and profile endpoints
- [ ] Add testing documentation: how to run tests, write new tests, interpret
      coverage reports
- [ ] Document style guide location (`/style-guide`) and usage patterns
- [ ] Add troubleshooting guide for common issues (logging, test failures, chart rendering)
- [ ] **Update AGENTS.md with Session 3 learnings**:
  - [ ] Add section on structured logging patterns and when to use request IDs
  - [ ] Add section on testing best practices (pytest fixtures, Vitest renderWithProviders)
  - [ ] Add section on design system usage (when to use shadcn/ui vs custom components)
  - [ ] Add examples of good AI prompts for testing and visualization tasks
  - [ ] Document the PAUSE-validate-continue workflow established in Session 3
  - [ ] Add troubleshooting tips for common Session 3 issues (database views, chart rendering, test configuration)

**Deployment Preparation**:

- [ ] Create production environment checklist: database migrations, environment
      variables, secrets management
- [ ] Verify database migrations run successfully against production schema
- [ ] Test production build locally: `npm run build && npm run preview`
      (frontend), run backend with ENV=production
- [ ] Create rollback plan: document how to revert deployment if issues found
- [ ] Prepare monitoring: ensure logs flowing to observability platform (if
      configured)
- [ ] Set up alerts for critical errors (if applicable)

**Success Criteria**:

- All QA checklist items verified and passing
- Zero linting or type errors
- Git history clean and atomic
- PR description comprehensive and helpful for reviewers
- Documentation up-to-date with all changes
- Production deployment plan documented and tested
- Application ready for production use

**Estimated Effort**: 4-5 hours

---

PAUSE

## AI PROMPT:

Validate Phase 7 (UX Polish & QA) completion:

**FINAL VALIDATION CHECKLIST**:

**Functional Testing**:

- Complete full user journey: signup → create items → filter/search → view
  analytics → logout
- Test optimistic updates: create item, verify appears instantly, disconnect
  network, verify error handling
- Test all filters: status, tags, search - verify results correct
- Test keyboard navigation: Tab through all pages, verify focus visible
- Test with screen reader: verify announcements logical

**Quality Checks**:

- Run `npm run lint` - zero errors
- Run `npx tsc --noEmit` - zero errors
- Run `pytest --cov=app` - > 70% coverage
- Run `npm run test:coverage` - > 60% coverage
- Run Lighthouse on `/`, `/style-guide`, `/analytics` - all > 90 score

**Git & Documentation**:

- Check commit history: `git log --oneline -20` - verify clean messages
- Read README: verify instructions up-to-date
- Check no .env files in git history:
  `git log --all --full-history -- "**/.env"`

**Deployment**:

- Run production build: `npm run build` - verify no errors
- Preview production build: verify works correctly
- Backend with ENV=production: verify correct log levels

**Confirm application production-ready before proceeding to Part 3.**

---

## Summary of Part 2 Accomplishments

**Units Completed**: 8-14

**Testing Infrastructure**:

- ✅ Backend pytest suite with > 70% coverage
- ✅ Frontend Vitest + RTL suite with > 60% coverage
- ✅ Test fixtures and utilities for easy test writing
- ✅ All existing features covered by tests

**Interactive Documentation**:

- ✅ Comprehensive style guide with native HTML elements
- ✅ shadcn/ui component gallery with all variants
- ✅ Interactive controls for real-time customization
- ✅ Code examples with copy-to-clipboard
- ✅ Component playground for experimentation

**Data Visualization**:

- ✅ Recharts integrated with three chart types
- ✅ Analytics dashboard with items and tags insights
- ✅ Supabase views for optimized aggregated data
- ✅ Responsive charts with accessibility

**UX Polish**:

- ✅ Optimistic updates for instant UI feedback
- ✅ Search and filter functionality
- ✅ Keyboard navigation and shortcuts
- ✅ Accessibility audit passed (WCAG AA)
- ✅ Loading skeletons and empty states
- ✅ Comprehensive error handling with recovery

**Production Readiness**:

- ✅ Full QA pass (functional, performance, security)
- ✅ Code quality checks passed
- ✅ Clean git history and PR preparation
- ✅ Documentation updated
- ✅ Deployment checklist complete

**Ready for Part 3**: "Taking it Further" - Building a complete feature
end-to-end

---

**END OF PART 2**

**Next**: Part 3 will cover Unit 15 (Optional Extended Learning - Building
Complete Feature from Idea to Deployment)

---

---

# PART 3: EXTENDED LEARNING - USER PROFILE FEATURE (Unit 14)

**Goal**: Apply all Session 3 learnings by building a complete feature
end-to-end, from user story through database schema, backend API, frontend UI,
testing, and deployment.

**Feature Overview**: User Profile Management - A protected page where
authenticated users can view and edit their profile information, including
setting a username, viewing account details, managing their avatar (using react-avatar with initials), and
deleting their account with proper safeguards.

---

## AI TRANSITION PROMPT (Part 2 → Part 3)

**Before starting Part 3 (complete profile feature), validate Part 2 completion:**

**Part 2 Validation Checklist:**

- [ ] **Unit 7 (Backend Testing)**: pytest suite configured and running with > 70% coverage
  - Test: Run `pytest --cov=app` from backend directory, verify all tests pass
- [ ] **Unit 8 (Frontend Testing)**: Vitest suite configured with test utilities
  - Test: Run `npm test` from frontend directory, verify all tests pass
- [ ] **Units 9-10 (Style Guide)**: Interactive style guide showing HTML elements and shadcn/ui components
  - Test: Navigate to /style-guide, verify all sections render with interactive controls
- [ ] **Unit 11 (Recharts)**: Analytics dashboard with charts using Supabase views
  - Test: Navigate to /analytics, verify charts display data from database views
- [ ] **Unit 12 (Optimistic Updates)**: UX patterns implemented (loading states, optimistic updates, keyboard shortcuts)
  - Test: Create/edit items, verify optimistic UI updates before server confirmation
- [ ] **Unit 13 (QA/Deployment)**: PR hygiene, documentation, deployment checklist complete
  - Test: README updated, code committed with good messages, deployment steps documented

**If ALL checklist items pass**, you are ready for Part 3 - building a complete feature using all learned patterns.

---

## AI PROMPT (Part 3 Start):

I need you to implement **Part 3** of the Session 3 Production Polish PRD (Unit
14: User Profile Feature End-to-End).

**PARTS 1-2 STATUS**: ✅ Complete (All infrastructure, testing, design system, and visualization patterns in place)

**EXECUTION REQUIREMENTS:**

- Build complete feature from scratch following all Session 3 best practices
- Apply logging (structured JSON with request ID), error handling (standardized errors), testing (pytest + Vitest), and design patterns (shadcn/ui) from Units 1-13
- Mark deliverables as [x] in the PRD as you complete them
- Validate at each sub-unit before proceeding
- Create production-ready, tested, accessible feature

**FEATURE SCOPE:**

- User profile page at `/profile` route (protected, authenticated users only)
- Display user data from `user_profiles` table (email, full_name, username, created_at, beta_access)
- CRUD operations: Create/update username and full_name, view profile, delete account
- react-avatar integration (automatic initials from full_name or email)
- Navigation from avatar dropdown menu in nav bar
- Warning modal for account deletion with confirmation
- Full test coverage (backend + frontend) and accessibility compliance (WCAG 2.1 AA)

**TECHNICAL CONSTRAINTS:**

- Follow Session 2's `user_profiles` schema structure (id, email, full_name, username, beta_access, created_at, updated_at)
- Use Session 3's logging patterns (structured JSON, request ID in all logs)
- Use Session 3's error handling (standardized error responses with request_id)
- Apply design system from style guide (shadcn/ui components, design tokens)
- Ensure RLS enforcement (users can only access/modify their own profile)

**SUB-UNITS OVERVIEW:**

- Sub-Unit 14.1: Mini-PRD (user stories, acceptance criteria)
- Sub-Unit 14.2: Database schema validation (ensure user_profiles table ready)
- Sub-Unit 14.3: Backend API endpoints (GET /profile, PUT /profile, DELETE /profile)
- Sub-Unit 14.4: react-avatar integration (avatar component with initials)
- Sub-Unit 14.5: Profile page UI (form, display, delete confirmation)
- Sub-Unit 14.6: Testing (backend tests, frontend tests, E2E validation)
- Sub-Unit 14.7: Documentation & deployment

**START WITH SUB-UNIT 14.1 (Mini-PRD)** - Please confirm you understand the requirements and provide a brief summary of the user stories we'll implement.

---

## Phase 8: Complete Feature Development (User Profile)

### Unit 14: User Profile Feature - End-to-End Implementation

**Goal**: Demonstrate mastery of AI-assisted development by building a complete
user profile management feature from ideation to deployment, incorporating all
Session 3 patterns and best practices

**Prerequisites**:

- Units 1-13 completed (all infrastructure, patterns, and tools in place)
- Session 2 authentication working with `user_profiles` table
- Understanding of full-stack feature development lifecycle
- Familiarity with React component libraries

**Learning Objectives**:

By completing this unit, learners will:

- Practice writing mini-PRDs for features
- Design database schema changes with migrations
- Implement secure backend APIs with RLS
- Build accessible, tested frontend UIs
- Apply logging, error handling, and monitoring throughout
- Execute complete QA and deployment workflow

---

### Sub-Unit 15.1: Mini-PRD & Feature Planning

**Goal**: Write a concise product requirements document defining the user
profile feature scope, user stories, technical requirements, and success
criteria

**Deliverables**:

**User Stories**:

- [ ] Document primary user story: "As an authenticated user, I want to view and
      edit my profile so I can personalize my account"
- [ ] Document secondary user stories:
  - "As a user, I want to set a unique username so others can identify me"
  - "As a user, I want to see my account creation date so I know how long I've
    been active"
  - "As a user, I want to delete my account so I can remove my data permanently"
  - "As a user, I want to see my avatar so I have visual identity in the app"

**Functional Requirements**:

- [ ] Profile page displays: email (read-only), name (editable), username
      (editable, unique), created_at (read-only), beta_access flag (read-only)
- [ ] Username validation: 3-20 characters, alphanumeric + underscore/dash,
      unique across users
- [ ] Username field optional (can be null initially)
- [ ] react-avatar displays initials from full_name or email (no storage needed)
- [ ] Account deletion requires confirmation modal with warning text
- [ ] Account deletion removes user from auth.users and cascades to
      user_profiles
- [ ] Profile accessible via avatar dropdown menu in navigation

**Non-Functional Requirements**:

- [ ] Page loads in < 500ms p95
- [ ] Form validation provides instant feedback
- [ ] All operations logged with request IDs
- [ ] Errors return standardized error responses
- [ ] Page passes WCAG AA accessibility standards
- [ ] Test coverage > 80% for profile-related code

**Out of Scope**:

- [ ] Profile image upload (future enhancement - react-avatar supports src prop for custom images)
- [ ] Email change functionality (handled by Supabase Auth settings)
- [ ] Password change (handled by Supabase Auth)
- [ ] Multi-factor authentication setup

**Technical Design Decisions**:

- [ ] Document database schema change: add `username` column to `user_profiles`
      table (VARCHAR(20), UNIQUE, NULLABLE)
- [ ] Document API endpoints needed:
  - GET `/api/v1/users/me/profile` - fetch current user profile
  - PATCH `/api/v1/users/me/profile` - update name and username
  - DELETE `/api/v1/users/me` - delete user account
- [ ] Document frontend components needed: ProfilePage, ProfileForm,
      DeleteAccountModal, AvatarDisplay
- [ ] Choose avatar background color (uses design system colors)

**Success Criteria Defined**:

- [ ] User can view all profile information
- [ ] User can successfully set/update username with validation
- [ ] Username uniqueness enforced (error shown if taken)
- [ ] Account deletion works with proper warnings
- [ ] Avatar displays consistently across app
- [ ] Navigation from avatar menu works
- [ ] All CRUD operations logged
- [ ] Full test coverage

**Estimated Effort**: 1 hour (planning only)

---

### Sub-Unit 15.2: Database Schema & Migration

**Goal**: Extend `user_profiles` table with `username` column and create
Supabase migration

**Prerequisites**:

- Sub-Unit 15.1 completed (requirements defined)
- Understanding of Supabase migrations from Session 2

**Deliverables**:

**Schema Design**:

- [ ] Review existing `user_profiles` table structure from Session 2
- [ ] Design `username` column: `VARCHAR(20)`, `UNIQUE`, `NULLABLE`, with index
      for performance
- [ ] Consider constraints: check length >= 3, alphanumeric pattern
- [ ] Plan RLS policies: users can only read/update their own username

**Migration File**:

- [ ] Create new migration file:
      `supabase/migrations/YYYYMMDDHHMMSS_add_username_to_user_profiles.sql`
- [ ] Write SQL to add `username` column with constraints
- [ ] Add unique index on `username` for fast lookups:
      `CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;`
- [ ] Add check constraint for username format:
      `CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$')`
- [ ] Update RLS policies if needed (ensure users can update their own username)
- [ ] Write rollback migration (DROP column) for safety

**Migration Testing**:

- [ ] Test migration on local Supabase instance: `supabase migration up`
- [ ] Verify column added with correct constraints
- [ ] Test inserting profile with valid username - should succeed
- [ ] Test inserting profile with invalid username (too short, special chars) -
      should fail
- [ ] Test inserting duplicate username - should fail with unique constraint
      error
- [ ] Verify RLS: user can update own username, cannot update others'
- [ ] Test rollback migration works correctly

**Documentation**:

- [ ] Document schema change in project documentation
- [ ] Note migration timestamp for deployment coordination
- [ ] Document any breaking changes or data migration needs (none expected)

**Success Criteria**:

- Migration runs successfully without errors
- `username` column exists with correct constraints and index
- RLS policies enforce user data isolation
- Rollback migration tested and working
- No breaking changes to existing functionality

**Estimated Effort**: 1-2 hours

---

### Sub-Unit 15.3: Backend Profile Endpoints

**Goal**: Implement backend API endpoints for profile read, update, and account
deletion with logging, error handling, and RLS enforcement

**Prerequisites**:

- Sub-Unit 15.2 completed (database schema ready)
- Understanding of FastAPI patterns from Sessions 2-3

**Deliverables**:

**Profile Service Layer**:

- [ ] Create `backend/app/services/profile_service.py` module
- [ ] Implement `get_user_profile(user_id: str, client)` function querying
      `user_profiles` table
- [ ] Implement
      `update_user_profile(user_id: str, name: str, username: str, client)`
      function with validation
- [ ] Username validation logic: check format (regex), check uniqueness (query
      existing usernames)
- [ ] Implement `delete_user_account(user_id: str, admin_client)` function
- [ ] Delete from `auth.users` using admin client (cascades to `user_profiles`
      via FK)
- [ ] Log all service operations with request ID and user ID
- [ ] Handle errors: username taken (409 Conflict), invalid format (422),
      database errors (500)

**Pydantic Models**:

- [ ] Create `backend/app/models/profile.py` module
- [ ] Define `UserProfileResponse` model with fields: id, email, name, username,
      beta_access, created_at
- [ ] Define `UpdateProfileRequest` model with fields: name (optional), username
      (optional)
- [ ] Add field validators for username: length 3-20, alphanumeric +
      underscore/dash only
- [ ] Use `camelCase` alias for JSON serialization (consistent with frontend)

**API Endpoints**:

- [ ] Create or extend `backend/app/api/routes/users.py` module
- [ ] Implement `GET /api/v1/users/me/profile` endpoint
  - Extract authenticated user from request (use `get_current_user` dependency)
  - Call `get_user_profile()` service function
  - Return `UserProfileResponse` model
  - Log request with user ID and request ID
- [ ] Implement `PATCH /api/v1/users/me/profile` endpoint
  - Extract authenticated user and request body
  - Validate request body with `UpdateProfileRequest` model
  - Call `update_user_profile()` service function
  - Handle username conflict error (return 409 with clear message)
  - Return updated `UserProfileResponse`
  - Log update with changed fields
- [ ] Implement `DELETE /api/v1/users/me` endpoint
  - Extract authenticated user
  - Show confirmation in API response documentation (frontend handles UI
    confirmation)
  - Call `delete_user_account()` service function
  - Return 204 No Content on success
  - Log deletion with user ID and timestamp
- [ ] Register routes in `main.py`

**Error Handling**:

- [ ] Handle username taken: return
      `{"error": {"code": "username_taken", "message": "Username already exists", "request_id": "..."}}`
- [ ] Handle invalid username format: return 422 with validation details
- [ ] Handle database errors: return 500 with generic message, log detailed
      error
- [ ] Include request ID in all error responses

**Testing**:

- [ ] Create `backend/tests/test_profile_endpoints.py`
- [ ] Test GET profile returns correct user data
- [ ] Test PATCH profile with valid username succeeds
- [ ] Test PATCH with duplicate username returns 409
- [ ] Test PATCH with invalid username format returns 422
- [ ] Test DELETE account succeeds (mock deletion, don't delete test user)
- [ ] Test RLS: user cannot access another user's profile
- [ ] Verify all operations logged with request IDs

**Success Criteria**:

- All endpoints implemented and registered
- Username validation works correctly (format and uniqueness)
- RLS prevents cross-user profile access
- Errors return standardized format with request IDs
- Test coverage > 80% for profile code
- All tests passing

**Estimated Effort**: 3-4 hours

---

### Sub-Unit 14.4: React Avatar Integration with Initials Fallback

**Goal**: Integrate react-avatar library for consistent user avatars with automatic initials fallback, no external API dependencies

**Prerequisites**:

- Profile endpoints working (Sub-Unit 14.3)
- Understanding of React component composition

**Deliverables**:

**Installation**:

- [ ] Install react-avatar library:
  ```bash
  npm install react-avatar
  ```

**Frontend Avatar Component Wrapper**:

- [ ] Create `frontend/src/components/UserAvatar.tsx` wrapping react-avatar with app-specific defaults:

  ```typescript
  import React from "react";
  import Avatar from "react-avatar";

  interface UserAvatarProps {
    name?: string;
    email?: string;
    src?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
  }

  const sizeMap = {
    sm: "32px",
    md: "48px",
    lg: "64px",
    xl: "96px",
  };

  export function UserAvatar({
    name,
    email,
    src,
    size = "md",
    className = "",
  }: UserAvatarProps) {
    return (
      <Avatar
        name={name || email}
        src={src}
        size={sizeMap[size]}
        round={true}
        className={className}
        alt={`Avatar for ${name || email}`}
        color="#6366f1" // Primary color from design system
        fgColor="#ffffff" // White text for initials
      />
    );
  }
  ```

- [ ] Component accepts props: `name`, `email`, `src` (optional image URL), `size`, `className`
- [ ] react-avatar automatically generates initials from `name` prop (e.g., "John Doe" → "JD")
- [ ] If no `name`, falls back to `email` (e.g., "john@example.com" → "JO")
- [ ] If `src` provided and loads successfully, displays image instead of initials
- [ ] Circular avatar with consistent sizing based on `size` prop
- [ ] Uses design system color for background (primary color)

**Avatar in Navigation**:

- [ ] Update `Navigation.tsx` component
- [ ] Replace existing avatar with `<UserAvatar>` component
- [ ] Pass current user's name and email from auth state:
  ```tsx
  <UserAvatar
    name={user.user_metadata?.full_name}
    email={user.email}
    size="sm"
  />
  ```
- [ ] Ensure avatar clickable to open dropdown menu
- [ ] Add loading state while user data fetching

**Avatar in Profile Page**:

- [ ] Display large avatar at top of profile page:
  ```tsx
  <UserAvatar
    name={profile.full_name}
    email={user.email}
    size="xl"
    className="mb-4"
  />
  ```
- [ ] Center avatar above profile information
- [ ] Consider adding hover effect or border using className

**Customization Options**:

- [ ] Use `color` and `fgColor` props to match design system colors
- [ ] Add className prop for additional styling (borders, shadows)
- [ ] Support both text initials (default) and image src (if user uploads avatar in future)

**Testing**:

- [ ] Create `frontend/src/components/__tests__/UserAvatar.test.tsx`
- [ ] Test UserAvatar renders with initials when only name provided
- [ ] Test initials generated correctly ("John Doe" → "JD")
- [ ] Test email fallback when no name provided
- [ ] Test different sizes render correctly (sm, md, lg, xl)
- [ ] Test alt text is present for accessibility
- [ ] Visual test: verify avatar looks good in navigation and profile page

**Success Criteria**:

- Avatar component reusable across app with consistent API
- Initials automatically generated from user name or email
- Avatar styles match design system colors
- No external API dependencies (works offline)
- Circular avatars with proper sizing
- Accessibility: alt text present
- Fast rendering (no network requests for initials)

**Estimated Effort**: 1 hour

---

### Sub-Unit 15.5: Profile Page UI Implementation

**Goal**: Build complete profile page UI with form for editing name/username,
account information display, and delete account functionality

**Prerequisites**:

- Sub-Units 15.3-15.4 completed (backend endpoints and avatar ready)
- shadcn/ui components available from Unit 6

**Deliverables**:

**Profile Page Component**:

- [ ] Create `frontend/src/pages/Profile.tsx` component
- [ ] Add route `/profile` in `AppRoutes.tsx` as protected route
- [ ] Fetch user profile on component mount using profile service
- [ ] Display loading skeleton while data fetching
- [ ] Handle error state if profile fetch fails

**Page Layout**:

- [ ] Create header section with large avatar (xl size) and user name/email
- [ ] Create main content section with profile form
- [ ] Create danger zone section at bottom for account deletion
- [ ] Use Card components from shadcn/ui for sections
- [ ] Apply consistent spacing using design system tokens
- [ ] Make layout responsive (stack on mobile, side-by-side on desktop)

**Profile Form**:

- [ ] Create form with fields: name (Input), username (Input)
- [ ] Display read-only fields: email, created_at, beta_access badge
- [ ] Use shadcn/ui Form components with react-hook-form for validation
- [ ] Add client-side validation matching backend rules:
  - Username: 3-20 chars, alphanumeric + underscore/dash
  - Name: max 100 chars
- [ ] Show validation errors inline below fields
- [ ] Display current values pre-populated in form
- [ ] Add "Save Changes" button (primary style)
- [ ] Disable save button if no changes made
- [ ] Show loading spinner on save button during submission

**Form Submission**:

- [ ] On submit, call `updateProfile()` service function
- [ ] Implement optimistic update: show new values immediately
- [ ] If API succeeds, show success toast: "Profile updated successfully"
- [ ] If API fails, revert to previous values and show error toast with request
      ID
- [ ] Handle specific errors:
  - Username taken: show error below username field "Username already taken"
  - Invalid format: show validation error below field
  - Network error: show generic error with retry option

**Profile Service**:

- [ ] Create `frontend/src/services/profileService.ts`
- [ ] Implement `getProfile()` function calling GET `/api/v1/users/me/profile`
- [ ] Implement `updateProfile(name, username)` function calling PATCH endpoint
- [ ] Implement `deleteAccount()` function calling DELETE endpoint
- [ ] Handle errors and return user-friendly messages

**Account Information Display**:

- [ ] Show email in read-only field or as text
- [ ] Show account created date formatted nicely (e.g., "Member since January
      2025")
- [ ] Show beta_access as badge if true (use shadcn/ui Badge component)
- [ ] Consider showing stats: total items created, tags used, etc. (optional
      enhancement)

**Account Deletion Section**:

- [ ] Create "Danger Zone" section with red border (using design system error
      color)
- [ ] Add heading "Delete Account" with warning icon
- [ ] Add description: "Permanently delete your account and all associated data.
      This action cannot be undone."
- [ ] Add "Delete Account" button (destructive variant, red)
- [ ] Button opens confirmation modal (don't delete directly)

**Delete Account Modal**:

- [ ] Create `DeleteAccountModal.tsx` component using shadcn/ui Dialog
- [ ] Modal title: "Delete Account"
- [ ] Modal content:
  - Warning message: "Are you sure you want to delete your account? This will
    permanently remove all your data including items, tags, and profile
    information."
  - Confirmation input: "Type DELETE to confirm" (user must type exact word)
  - Checkbox: "I understand this action cannot be undone"
- [ ] Disable "Delete Account" button until confirmation input matches and
      checkbox checked
- [ ] On delete confirmation:
  - Call `deleteAccount()` service
  - Show loading state
  - On success: log user out and redirect to home page with toast "Account
    deleted successfully"
  - On error: close modal, show error toast with request ID

**Navigation Integration**:

- [ ] Update `Navigation.tsx` avatar dropdown menu
- [ ] Add "Profile" menu item with user icon
- [ ] Menu items: Profile, Settings (if exists), Logout
- [ ] Link Profile to `/profile` route
- [ ] Ensure menu keyboard accessible (Tab, Enter, Escape)

**Success Criteria**:

- Profile page accessible at `/profile` for authenticated users
- Form displays current profile data correctly
- Form validation works client-side and server-side
- Profile updates saved successfully with optimistic UI
- Errors handled gracefully with clear messages
- Account deletion requires proper confirmation
- Avatar displays correctly
- Page responsive on all screen sizes
- Navigation integration seamless

**Estimated Effort**: 4-5 hours

---

### Sub-Unit 15.6: Profile Feature Testing

**Goal**: Write comprehensive tests for profile feature covering backend
endpoints, frontend components, and integration flows

**Prerequisites**:

- Sub-Units 15.2-15.5 completed (full feature implemented)
- Testing infrastructure from Units 8-9 in place

**Deliverables**:

**Backend Unit Tests**:

- [ ] Test `profile_service.py` functions:
  - `get_user_profile()` returns correct data
  - `update_user_profile()` updates successfully
  - `update_user_profile()` rejects duplicate username
  - `update_user_profile()` rejects invalid username format
  - `delete_user_account()` deletes user successfully
- [ ] Test RLS policies: user cannot access other user's profile
- [ ] Test error scenarios: database connection error, invalid user ID

**Backend Integration Tests**:

- [ ] Test GET `/api/v1/users/me/profile` endpoint
  - Returns 200 with correct profile data
  - Returns 401 when unauthenticated
- [ ] Test PATCH `/api/v1/users/me/profile` endpoint
  - Returns 200 and updates profile with valid data
  - Returns 409 when username already taken
  - Returns 422 when username invalid format
  - Returns 401 when unauthenticated
- [ ] Test DELETE `/api/v1/users/me` endpoint
  - Returns 204 and deletes user
  - Returns 401 when unauthenticated
- [ ] Verify all responses include request ID
- [ ] Verify all operations logged correctly

**Frontend Component Tests**:

- [ ] Test `Avatar.tsx` component:
  - Renders with initials from user name or email
  - Displays fallback when image fails
  - Renders correct size based on prop
  - Has proper alt text
- [ ] Test `Profile.tsx` page component:
  - Displays loading skeleton on mount
  - Renders profile data when loaded
  - Shows error message when fetch fails
- [ ] Test `ProfileForm` (if separate component):
  - Pre-populates with current values
  - Validates username format
  - Shows error for invalid username
  - Disables save when no changes
- [ ] Test `DeleteAccountModal.tsx`:
  - Requires typing "DELETE" to enable button
  - Requires checkbox confirmation
  - Calls deleteAccount service on confirm
  - Closes on cancel

**Frontend Integration Tests**:

- [ ] Test profile update flow:
  - User changes username
  - Clicks save
  - Success toast appears
  - Profile displays new username
- [ ] Test username conflict flow:
  - User enters taken username
  - Clicks save
  - Error message appears below username field
  - Form not cleared (values preserved)
- [ ] Test delete account flow:
  - User clicks delete button
  - Modal opens
  - User types "DELETE" and checks confirmation
  - Account deleted
  - User logged out and redirected

**Manual E2E Testing**:

- [ ] Complete profile journey:
  - Login
  - Click avatar → Profile
  - Update name and username
  - Verify changes saved
  - Refresh page, verify changes persisted
  - Delete account
  - Verify redirect to home and logged out
- [ ] Test edge cases:
  - Very long username (20 chars)
  - Special characters in username (should reject)
  - Empty username (should accept, field is nullable)
  - Rapid multiple saves (test debouncing/loading states)

**Accessibility Testing**:

- [ ] Run axe DevTools on profile page - zero critical/serious issues
- [ ] Keyboard navigate entire profile flow (Tab, Enter, Escape)
- [ ] Screen reader test: verify form labels announced correctly
- [ ] Verify focus management in delete modal (trapped, returns on close)
- [ ] Test color contrast on all text elements

**Test Coverage Verification**:

- [ ] Run `pytest --cov=app/services/profile_service` - aim for > 90%
- [ ] Run `pytest --cov=app/api/routes/users` - aim for > 90%
- [ ] Run `npm run test:coverage` for profile components - aim for > 80%
- [ ] Review coverage report and add tests for uncovered branches

**Success Criteria**:

- All backend tests passing with > 90% coverage
- All frontend tests passing with > 80% coverage
- Manual E2E flow works flawlessly
- Accessibility tests pass with zero critical issues
- No regressions in existing features
- Test suite runs in < 15 seconds

**Estimated Effort**: 3-4 hours

---

### Sub-Unit 15.7: Profile Feature Polish & Documentation

**Goal**: Final polish, logging verification, documentation, and prepare feature
for production deployment

**Prerequisites**:

- Sub-Units 15.1-15.6 completed (feature fully tested)

**Deliverables**:

**Logging Verification**:

- [ ] Verify all profile operations logged with structured format
- [ ] Check logs include:
  - Profile view:
    `{"action": "profile_viewed", "user_id": "...", "request_id": "..."}`
  - Profile update:
    `{"action": "profile_updated", "user_id": "...", "changes": {"username": "new_value"}, "request_id": "..."}`
  - Delete account:
    `{"action": "account_deleted", "user_id": "...", "request_id": "..."}`
- [ ] Verify errors logged with ERROR level and full context
- [ ] Verify request IDs flow through entire profile request lifecycle

**Error Handling Audit**:

- [ ] Verify all error scenarios return standardized error responses
- [ ] Test error messages user-friendly (no technical jargon or stack traces)
- [ ] Verify request ID included in all error responses
- [ ] Test error recovery: retry after failure works correctly

**Performance Optimization**:

- [ ] Run Lighthouse on `/profile` page - aim for > 90 in all categories
- [ ] Check profile load time: should be < 500ms p95
- [ ] Verify avatar renders instantly (no network request for initials)
- [ ] Check bundle size impact: profile code should add < 50KB gzipped
- [ ] Optimize any slow queries (check database query explain plans)

**UI/UX Polish**:

- [ ] Add smooth transitions when profile data updates
- [ ] Add subtle hover effects on form fields
- [ ] Ensure loading states professional (skeleton screens, not just spinners)
- [ ] Verify empty states helpful (e.g., "No username set yet")
- [ ] Add micro-interactions: success checkmark on save, smooth modal animations
- [ ] Verify design system consistency (colors, spacing, typography)

**Documentation**:

- [ ] Update README with profile feature description
- [ ] Document API endpoints in API documentation:
  - GET `/api/v1/users/me/profile` - Returns user profile
  - PATCH `/api/v1/users/me/profile` - Updates profile
  - DELETE `/api/v1/users/me` - Deletes account
- [ ] Document username validation rules for other developers
- [ ] Document react-avatar integration and how initials are generated
- [ ] Add profile feature to user guide or help documentation
- [ ] Document database migration and deployment notes

**Feature Flag / Gradual Rollout** (optional):

- [ ] Consider adding feature flag for profile feature (if deploying to
      production incrementally)
- [ ] Document rollback procedure if issues found in production

**Code Review Checklist**:

- [ ] Review all profile-related code for quality and consistency
- [ ] Ensure consistent naming conventions (camelCase in frontend, snake_case in
      backend)
- [ ] Remove console.logs and debug code
- [ ] Ensure no hardcoded values (use environment variables or constants)
- [ ] Verify code comments clear and helpful
- [ ] Check for potential security issues (SQL injection, XSS) - should be
      protected by frameworks

**Git & PR**:

- [ ] Create feature branch if not already:
      `git checkout -b feature/user-profile`
- [ ] Commit changes with clear messages:
      `feat(profile): add user profile management`
- [ ] Write comprehensive PR description:
  - **What**: User profile page with edit and delete capabilities
  - **Why**: Users need ability to manage their account information
  - **How to Test**: Step-by-step testing instructions
  - **Screenshots**: Include before/after of profile page
  - **Database Changes**: Note username column migration
- [ ] Self-review PR diff for any issues
- [ ] Tag PR with labels: feature, needs-review, backend, frontend

**Deployment Checklist**:

- [ ] Verify migration file ready:
      `YYYYMMDDHHMMSS_add_username_to_user_profiles.sql`
- [ ] Plan migration execution: run on staging first, then production
- [ ] Verify no breaking changes for existing users (username nullable)
- [ ] Prepare rollback migration in case of issues
- [ ] Document deployment steps:
  1. Run database migration
  2. Deploy backend code
  3. Deploy frontend code
  4. Verify profile page loads
  5. Monitor logs for errors

**Success Criteria**:

- Logs structured and informative
- Errors handled gracefully with clear messages
- Performance meets targets (< 500ms load, Lighthouse > 90)
- UI polished and professional
- Documentation complete and accurate
- Code quality high (passes review)
- PR ready for merge
- Deployment plan documented and tested

**Estimated Effort**: 2-3 hours

---

PAUSE

## AI PROMPT:

Validate Unit 15 (User Profile Feature) completion:

**COMPREHENSIVE FEATURE VALIDATION**:

**Database & Backend**:

- Verify migration applied: query `user_profiles` table, confirm `username`
  column exists
- Test GET `/api/v1/users/me/profile` - returns profile with all fields
- Test PATCH with valid username - updates successfully
- Test PATCH with duplicate username - returns 409 error
- Test DELETE `/api/v1/users/me` - deletes account (test on non-production user)
- Check backend logs: verify all operations logged with request IDs
- Run `pytest tests/test_profile_endpoints.py` - all tests pass

**Frontend**:

- Navigate to `http://localhost:5173/profile` while authenticated
- Verify avatar displays with initials or custom image
- Verify form pre-populated with current profile data
- Change username and save - verify success toast appears
- Try duplicate username - verify error message shows
- Click "Delete Account" - verify modal opens with confirmation
- Type "DELETE" and check confirmation - verify button enables
- Test keyboard navigation: Tab through all form fields and buttons
- Run `npm run test` for profile tests - all pass
- Run Lighthouse on profile page - verify > 90 in all categories

**Integration**:

- Click avatar in navigation - verify dropdown shows "Profile" option
- Click "Profile" - verify navigates to `/profile`
- Update profile - refresh page - verify changes persisted
- Test on mobile viewport (375px) - verify responsive layout
- Run axe DevTools - verify zero accessibility issues

**Documentation**:

- Read updated README - verify profile feature documented
- Check API docs - verify profile endpoints listed
- Review PR description - verify comprehensive

**Confirm feature complete, tested, and ready for production deployment.**

---

## Summary of Part 3 Accomplishments

**Unit Completed**: 15 (User Profile Feature End-to-End)

**Planning & Design**:

- ✅ Mini-PRD written with user stories and technical requirements
- ✅ Database schema designed with username column and constraints
- ✅ API endpoints planned with error handling strategy

**Database Layer**:

- ✅ Supabase migration created for username column
- ✅ Unique index and constraints implemented
- ✅ RLS policies verified for data isolation

**Backend Implementation**:

- ✅ Profile service layer with get, update, delete operations
- ✅ API endpoints with authentication and RLS enforcement
- ✅ Username validation (format and uniqueness)
- ✅ Comprehensive error handling with standardized responses
- ✅ Structured logging with request ID tracing
- ✅ Full test coverage (> 90%)

**Frontend Implementation**:

- ✅ react-avatar component integrated with automatic initials fallback
- ✅ Profile page with responsive layout
- ✅ Profile form with validation and optimistic updates
- ✅ Delete account modal with confirmation safeguards
- ✅ Navigation integration (avatar dropdown menu)
- ✅ Comprehensive component and integration tests (> 80% coverage)
- ✅ Accessibility compliant (WCAG AA)

**Production Readiness**:

- ✅ Performance optimized (< 500ms load time)
- ✅ Logging verified throughout feature
- ✅ Error handling tested comprehensively
- ✅ Documentation complete (README, API docs, user guide)
- ✅ PR prepared with deployment checklist
- ✅ Feature ready for production deployment

---

**END OF PART 3**

---

---

# AI CONTINUATION PROMPT (For Future Implementation)

**Use this self-contained prompt if starting Session 3 fresh or resuming after a break:**

---

I am implementing **Session 3: Production Polish & Design Systems** for my my-ideas application. This is a comprehensive session that adds production-grade infrastructure, testing, design system, and a complete profile feature.

**PROJECT BACKGROUND:**

- **App Name**: my-ideas (personal idea management tool)
- **Tech Stack**:
  - Backend: FastAPI (Python 3.12+), Supabase (PostgreSQL + Auth), running on localhost:8000
  - Frontend: React 18.2 + TypeScript, Vite, Redux Toolkit, Tailwind CSS, running on localhost:5173
- **Prior Sessions Complete**:
  - Session 1: Basic CRUD for ideas/items, FastAPI backend scaffold, React frontend with routing
  - Session 2: Supabase authentication (signup/login/logout), httpOnly cookies, protected routes, Redux state management, token refresh

**SESSION 3 GOALS (14 Units):**

1. **Production Observability** (Units 1-4): Request ID tracing, structured JSON logging, standardized error handling, timeout/retry patterns
2. **Design System** (Units 5-6): shadcn/ui integration, CSS custom properties, design tokens, style guide page
3. **Testing Infrastructure** (Units 7-8): pytest (backend), Vitest + React Testing Library (frontend), fixtures, test patterns
4. **Interactive Documentation** (Units 9-10): Native HTML elements style guide, shadcn/ui component gallery with playground
5. **Data Visualization** (Unit 11): Recharts integration, Supabase database views, analytics dashboard
6. **UX Polish** (Units 12-13): Optimistic updates, loading states, keyboard shortcuts, QA/deployment prep
7. **Complete Feature** (Unit 14): User profile page (view/edit profile, avatar, delete account) built end-to-end with all patterns

**CRITICAL FILES TO REFERENCE:**

- **PRD**: `docs/session_three/Beast_Mode_Polish_PRD.md` (this document - contains all unit specifications)
- **Session 2 Auth Docs**: `docs/session_two/AUTH_DEVELOPER_GUIDE.md`, `docs/session_two/SupabaseAuth_Implementation_PRD_v1.0.md`
- **Project Conventions**: `AGENTS.md` (AI-assisted workflow guidelines)

**IMPLEMENTATION RULES:**

1. **Read the Full PRD First**: Open `docs/session_three/Beast_Mode_Polish_PRD.md` and familiarize yourself with all 14 units
2. **Sequential Execution**: Implement units in order (1 → 14), do not skip ahead
3. **Plan Before Code**: Provide 3-5 step plan for each unit before writing code
4. **Minimal Diffs**: Generate focused, small code changes (< 50 lines when possible)
5. **Mark Progress**: Update PRD deliverables with [x] as you complete them
6. **PAUSE at Checkpoints**: Stop at all PAUSE sections and wait for learner approval
7. **Validate Thoroughly**: Run tests, manual checks, and validation steps after each phase
8. **Ask When Unclear**: If requirements ambiguous or dependencies missing, ask rather than assume

**TECHNICAL DETAILS:**

**Dependencies to Install:**

- Backend: `pytest==8.0.0 pytest-asyncio==0.23.0 httpx==0.26.0 pytest-cov==4.1.0`
- Frontend: `npm install -D vitest@1.2.0 @testing-library/react@14.1.2 @testing-library/jest-dom@6.1.5 jsdom@24.0.0 @vitest/ui@1.2.0`
- Frontend: `npm install recharts date-fns react-avatar`
- Frontend: `npx shadcn-ui@latest init` (interactive setup - choose "New York" style, "Slate" base color)

**Key Patterns from Session 3:**

- **Request Tracing**: Every HTTP request gets unique UUID in `x-request-id` header, flows through frontend → backend → logs
- **Structured Logging**: All logs JSON format with fields: `{timestamp, level, message, request_id, ...}`
- **Error Responses**: Standardized shape: `{error: {code, message, details, request_id}}`
- **Testing**: pytest fixtures for backend (test_app, auth_headers), Vitest renderWithProviders for frontend
- **Design System**: CSS custom properties in `design-system.css`, Tailwind config extends with design tokens, shadcn/ui components in `/components/ui`
- **Charts**: Recharts ResponsiveContainer + LineChart/BarChart/PieChart, data from Supabase views

**WHERE TO START:**

1. Confirm you have Session 2 complete (auth working, protected routes functional)
2. Create feature branch: `git checkout -b s3-production-polish`
3. Start with **Unit 1: Request ID Implementation** (backend middleware + frontend apiClient extension)
4. Follow the PRD exactly, implementing each unit's deliverables sequentially

**YOUR FIRST ACTION:**

Please confirm:

- You understand this is a 14-unit session building on Sessions 1-2
- You'll read the full PRD before starting
- You'll implement units sequentially with plan-first approach
- You're ready to start with Unit 1 (Request ID Implementation)

**After confirmation**, provide a 3-step plan for Unit 1.

---

# Appendices

## Appendix A: Common Patterns & Recipes

### Adding a New Protected Route

1. **Create page component**: `frontend/src/pages/NewPage.tsx`
2. **Add route**: In `AppRoutes.tsx`, wrap with `<ProtectedRoute>`
3. **Add navigation link**: Update `Navigation.tsx` for authenticated users
4. **Test**: Verify auth required, redirect to home when unauthenticated

### Implementing Optimistic Updates

1. **Update Redux slice**: Add optimistic state (e.g., `pendingItems`)
2. **On action**: Immediately update optimistic state before API call
3. **On success**: Replace optimistic data with server response
4. **On failure**: Revert optimistic state, show error toast
5. **UI indicator**: Show reduced opacity or spinner for pending items

### Adding a New Chart

1. **Create database view**: Aggregate data in Supabase view or endpoint
2. **Backend endpoint**: Create GET endpoint returning chart data
3. **Frontend service**: Create function to fetch and transform data
4. **Chart component**: Use Recharts ResponsiveContainer + chart type
5. **Styling**: Apply design system colors to chart elements
6. **Accessibility**: Add ARIA labels and data table alternative

### Writing Effective AI Prompts

**Good Prompt Pattern**:

```
I need to add [feature]. Here's the plan:
1. [Step 1 with specific file/location]
2. [Step 2 with specific change]
3. [Step 3 with validation]

For step 1, please generate the code for [specific component/function].
Keep changes minimal (< 50 lines).
```

**Bad Prompt Pattern**:

```
Build me a profile page with all features
```

## Appendix B: Debugging Prompts for AI Assistant

### When Logs Not Showing Request IDs

**Prompt to AI**:

```
I'm not seeing request IDs in my logs. Can you:
1. Check that request ID middleware is registered in main.py before routes
2. Verify the logger is using the request ID from request.state
3. Show me an example log output and what it should look like
```

### When RLS Blocking Legitimate Access

**Prompt to AI**:

```
User cannot access their own data. Help me debug RLS:
1. Show me the current RLS policy for [table_name]
2. Explain what the policy allows/blocks
3. Suggest how to fix if policy too restrictive
4. Provide SQL to test policy with sample user ID
```

### When Tests Failing Unexpectedly

**Prompt to AI**:

```
Test [test_name] is failing. Here's the error: [paste error].
Can you:
1. Explain what the error means
2. Identify which part of the test is failing
3. Suggest how to fix the test or the code
4. Show me the corrected test code
```

### When Frontend Component Not Rendering

**Prompt to AI**:

```
Component [ComponentName] not rendering. Help me debug:
1. Check imports are correct
2. Verify component exported properly
3. Check for console errors (show me what to look for)
4. Verify props passed correctly from parent
5. Suggest adding console.log for debugging
```

## Appendix C: Troubleshooting Common Issues

### Issue: "TypeError: Cannot read property 'id' of undefined"

**Cause**: Trying to access user data before it's loaded

**Solution**:

- Add loading check: `if (!user) return <LoadingSkeleton />`
- Use optional chaining: `user?.id`
- Verify Redux state initialized properly

### Issue: 401 Unauthorized on Authenticated Request

**Cause**: Auth token not being sent or expired

**Solution**:

- Check `apiClient.ts` sends token in headers or cookies
- Verify token not expired (check Redux `expiresAt`)
- Check backend `get_current_user()` extracting token correctly
- Test with Postman: manually send token, verify it works

### Issue: Database Migration Fails

**Cause**: Schema conflict or syntax error in migration SQL

**Solution**:

- Check error message for specific SQL syntax issue
- Verify no conflicting migrations (same column added twice)
- Test migration SQL in Supabase SQL editor first
- Check for typos in table/column names

### Issue: Avatar Not Loading

**Cause**: DiceBear API unavailable or CORS issue

**Solution**:

- Check network tab for failed image request
- Verify URL format correct:
  `https://api.dicebear.com/7.x/{style}/svg?seed={id}`
- Test URL directly in browser
- Implement fallback to initials if image fails

### Issue: Username Uniqueness Not Enforced

**Cause**: Unique constraint missing or not working

**Solution**:

- Verify migration created unique index: `\d user_profiles` in psql
- Check RLS policies not bypassing constraint
- Ensure service layer querying for duplicates correctly
- Test directly in database: try inserting duplicate username

## Appendix D: Success Metrics & KPIs

### Backend Observability Metrics

- **Log Coverage**: 100% of endpoints log requests with request IDs
- **Error Rate**: < 1% of requests return 5xx errors
- **Response Time**: p95 < 500ms for all endpoints
- **Test Coverage**: > 70% line coverage for backend code

### Frontend Quality Metrics

- **Lighthouse Scores**: > 90 in Performance, Accessibility, Best Practices, SEO
- **Bundle Size**: < 500KB gzipped for main bundle
- **Test Coverage**: > 60% component coverage
- **Accessibility**: Zero critical WCAG violations

### User Experience Metrics

- **Time to Interactive**: < 3 seconds on average network
- **Error Recovery**: 100% of errors have clear user-facing messages
- **Keyboard Navigation**: 100% of features accessible via keyboard
- **Mobile Usability**: All features work on 375px viewport

### Development Productivity Metrics

- **Test Suite Speed**: All tests run in < 15 seconds
- **Build Time**: Production build completes in < 2 minutes
- **PR Review**: Average 80% of code covered by automated tests (manual review
  focuses on logic)

## Appendix E: Future Enhancements (Out of Scope for Session 3)

### Testing Enhancements

- [ ] E2E testing with Playwright or Cypress
- [ ] Visual regression testing for UI components
- [ ] Performance testing and benchmarking
- [ ] Load testing for backend endpoints

### Monitoring & Observability Enhancements

- [ ] Integrate with external logging service (Datadog, Sentry)
- [ ] Set up error alerting and notifications
- [ ] Add performance monitoring (APM)
- [ ] Create observability dashboard

### Design System Enhancements

- [ ] Dark mode support with theme toggle
- [ ] Additional shadcn/ui components (Carousel, Command, Popover)
- [ ] Animation library integration (Framer Motion)
- [ ] Responsive typography utilities

### Profile Feature Enhancements

- [ ] Profile image upload (S3 or Supabase Storage)
- [ ] Bio/description field
- [ ] Privacy settings (public/private profile)
- [ ] Profile viewing by other users (if social features added)
- [ ] Activity history on profile page
- [ ] Account export functionality (GDPR compliance)

---

## Appendix F: Optional Avatar Enhancement with DiceBear

**Note**: The main PRD uses react-avatar with initials fallback (Sub-Unit 14.4). This appendix describes an optional enhancement using DiceBear for generated avatar images.

### What is DiceBear?

DiceBear is a free avatar placeholder service that generates consistent, deterministic avatars from a seed string (like user ID or email). It provides various artistic styles without requiring image uploads or storage.

**Pros**:

- Visually interesting avatar styles (bottts, avataaars, pixel-art, etc.)
- Deterministic (same seed = same avatar)
- No storage required (generated on-the-fly via CDN)
- Easy to implement (just use URL pattern)

**Cons**:

- External API dependency (requires internet connection)
- Potential privacy concern (user ID sent to third-party service)
- Slower than initials (network request required)
- Service availability dependency

### Implementation Guide

**1. Generate DiceBear Avatar URL**:

Create a utility function:

```typescript
// frontend/src/lib/dicebear.ts
export function getDiceBearUrl(
  seed: string,
  style: "bottts" | "avataaars" | "pixel-art" | "initials" = "bottts"
): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(
    seed
  )}`;
}
```

**2. Use in UserAvatar Component**:

Modify `UserAvatar.tsx` to optionally use DiceBear:

```typescript
import { getDiceBearUrl } from "@/lib/dicebear";

export function UserAvatar({
  name,
  email,
  src,
  useDiceBear = false,
  diceBearStyle = "bottts",
  size = "md",
}: UserAvatarProps) {
  const avatarSrc = useDiceBear
    ? getDiceBearUrl(email || name || "", diceBearStyle)
    : src;

  return (
    <Avatar
      name={name || email}
      src={avatarSrc}
      size={sizeMap[size]}
      round={true}
      // ... rest of props
    />
  );
}
```

**3. Manually Seed DiceBear URLs in Database (Testing)**:

If you want test users to have DiceBear avatars, manually add URLs to `user_profiles.avatar_url`:

```sql
-- Open Supabase SQL Editor
UPDATE user_profiles
SET avatar_url = 'https://api.dicebear.com/7.x/bottts/svg?seed=' || id
WHERE email = 'test@example.com';
```

This sets a DiceBear URL for a specific test user, which react-avatar will display via the `src` prop.

**4. Allow Users to Choose Avatar Style (Advanced)**:

Add a dropdown in profile settings to let users choose DiceBear style:

```tsx
<select value={avatarStyle} onChange={(e) => updateAvatarStyle(e.target.value)}>
  <option value="initials">Initials (default)</option>
  <option value="bottts">Bottts (robots)</option>
  <option value="avataaars">Avataaars (cartoon)</option>
  <option value="pixel-art">Pixel Art</option>
</select>
```

Save the choice in `user_profiles.avatar_preferences` JSON field, then generate DiceBear URL accordingly.

### When to Use DiceBear

- **Use DiceBear** if: Visual variety is important, users won't mind third-party service, internet connection guaranteed
- **Use react-avatar initials** if: Offline support needed, privacy important, simplicity preferred, fast rendering critical

### Testing DiceBear Integration

- [ ] Visit DiceBear playground: https://www.dicebear.com/playground
- [ ] Test different styles and seeds to preview avatars
- [ ] Copy URL pattern and test in browser
- [ ] Add fallback handling if DiceBear API unavailable

---

## Document Metadata

- **Version**: 2.0
- **Status**: Enhanced Draft (Ready for Implementation)
- **Last Updated**: 2025-01-XX
- **Authors**: AI Coding Assistant + Learner
- **Session**: Session 3 - Production Polish & Design Systems
- **Prerequisites**: Sessions 1-2 complete (Bootstrap + Supabase Auth)
- **Estimated Total Effort**: 32-42 hours
- **Units**: 14 (6 foundation + 7 polish + 1 complete feature)
- **Related Documents**:
  - `SupabaseAuth_Implementation_PRD_v1.0.md` - Session 2 authentication reference
  - `AUTH_DEVELOPER_GUIDE.md` - Session 2 developer documentation
  - `AGENTS.md` - General coding conventions

---

**END OF SESSION 3 BEAST MODE PRD**

**Next Session**: Session 4 - OpenAI Responses API & Agent SDK Integration
