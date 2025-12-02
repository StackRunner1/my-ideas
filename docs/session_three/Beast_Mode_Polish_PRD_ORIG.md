# Production Reliability & Design Systems - Product Requirements Document v1.0

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

## Prerequisites: Environment Setup (Before Unit 1)

### Backend Setup

- [ ] Python 3.12+ installed and conda environment active
- [ ] Session 2 complete (Supabase auth working)
- [ ] Backend runs successfully: `python -m uvicorn app.main:app --reload`
- [ ] Backend .env file has all Supabase credentials
- [ ] pytest installed: `pip install pytest pytest-asyncio httpx`

### Frontend Setup

- [ ] Session 2 complete (Auth UI, Redux, routing working)
- [ ] Frontend runs successfully: `npm run dev`
- [ ] shadcn/ui CLI installed: `npx shadcn-ui@latest init` (will be done in
      Unit 4)
- [ ] Vite config has path aliases configured (`@/*`)

### Development Workflow

- [ ] Two terminals: backend (`uvicorn`) + frontend (`npm run dev`)
- [ ] Backend runs on http://localhost:8000
- [ ] Frontend runs on http://localhost:5173
- [ ] Git working directory clean with all S2 work committed
- [ ] New feature branch ready: `git checkout -b s3-production-polish`

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
Phase 1: Development Loops & Logging (Units 1-3)
│
├─ Unit 1 (AI Loop Re-Run)
│   └─> Unit 2 (Request ID Middleware)
│        └─> Unit 3 (Structured Logging)

Phase 2: Error Handling & Debugging (Units 4-5)
│
├─ Unit 4 (Error Response Standard)
│   └─> Unit 5 (Timeout & Retry Config)

Phase 3: Design System Foundation (Units 6-7)
│
├─ Unit 6 (shadcn/ui Installation)
│   └─> Unit 7 (Design System Architecture)
│        └─> [Continues in Part 2...]
```

### Critical Path for Part 1

**Minimum units required for production-ready backend:**

1. Unit 2 → Request ID tracking end-to-end
2. Unit 3 → Structured logging with context
3. Unit 4 → Standardized error responses
4. Unit 5 → Timeout/retry for resilience

**Design system foundation:**

5. Unit 6 → shadcn/ui component library
6. Unit 7 → Design tokens and style guide structure

---

## Project File Structure

### Backend Structure (After Part 1)

```
backend/
├── app/
│   ├── main.py                      # FastAPI app with request ID middleware (Unit 2)
│   │
│   ├── core/
│   │   ├── config.py                # Settings extended with timeout configs (Unit 5)
│   │   ├── logging.py               # Structured JSON logger (Unit 3)
│   │   └── errors.py                # Custom exception classes (Unit 4)
│   │
│   ├── middleware/
│   │   └── request_id.py            # Request ID extraction/generation (Unit 2)
│   │
│   ├── api/
│   │   ├── error_handlers.py        # Global exception handlers (Unit 4)
│   │   └── routes/
│   │       ├── items.py             # Updated with structured logging (Unit 3)
│   │       ├── sessions.py          # Updated with error handling (Unit 4)
│   │       └── health.py            # Health check with timeout test (Unit 5)
│   │
│   └── services/
│       └── supabase_client.py       # Extended with retry logic (Unit 5)
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
│   ├── main.tsx                     # App entry with design system CSS import (Unit 7)
│   │
│   ├── styles/
│   │   ├── index.css                # Existing Tailwind imports
│   │   └── design-system.css        # Design tokens and custom utilities (Unit 7)
│   │
│   ├── components/
│   │   └── ui/                      # shadcn/ui components (Unit 6)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── toast.tsx
│   │       ├── alert.tsx
│   │       └── ... (other shadcn components)
│   │
│   ├── pages/
│   │   └── StyleGuide.tsx           # Design system documentation page (Unit 7)
│   │
│   ├── routes/
│   │   └── AppRoutes.tsx            # Updated with /style-guide route (Unit 7)
│   │
│   └── lib/
│       └── apiClient.ts             # Extended with request ID header (Unit 2)
│
├── components.json                  # shadcn/ui configuration (Unit 6)
├── tailwind.config.ts               # Extended with design tokens (Unit 7)
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

## AI PROMPT (Part 1 Start):

I need you to implement **Part 1** of the Session 3 Production Polish PRD (Units
1-7: Development Loops, Logging, Error Handling, Design System Foundation).

**EXECUTION REQUIREMENTS:**

- Follow the unit sequence exactly as documented (Units 1-7)
- Mark deliverables as [x] in the PRD as you complete them
- Ask for my approval at PAUSE sections before proceeding to next phase
- Run validation tests after each phase
- Flag any missing dependencies or unclear requirements immediately

**TECHNICAL CONSTRAINTS:**

- Backend: Python 3.12+, FastAPI, existing Supabase integration from S2
- Frontend: React 18.2, TypeScript, Vite, Redux Toolkit, Tailwind CSS
- Testing: pytest (backend), Vitest + React Testing Library (frontend)
- Design: shadcn/ui components, CSS custom properties

**START WITH UNIT 1** - Please confirm you understand the requirements before
proceeding.

---

# PART 1: DEVELOPMENT LOOPS, LOGGING & DESIGN FOUNDATION (Units 1-7)

---

## Phase 1: Development Workflow Mastery

### Unit 1: "Work-with-AI" Loop Re-Run

**Goal**: Practice and reinforce the plan-first, diff-only workflow pattern
using a small UI improvement as hands-on exercise

**Prerequisites**:

- Session 2 complete with working authentication
- Items page functional with list display
- Understanding of basic GitHub Copilot chat interaction

**Deliverables**:

- [ ] Document the 3-step loop pattern: Plan → Request Minimal Diff → Validate
- [ ] Choose small enhancement (e.g., add search/filter to Items page, improve
      loading states, add empty state message)
- [ ] Write clear plan with 3-5 discrete steps before any code changes
- [ ] For each step, request GitHub Copilot to generate diff-only changes (< 50
      lines)
- [ ] Validate each change manually before proceeding (check UI, check console,
      check network tab)
- [ ] Document any "bad" requests (where AI generated too much code or wrong
      approach) and how to course-correct
- [ ] Create markdown guide capturing lessons learned about effective AI
      prompting
- [ ] Commit changes with descriptive message following conventional commits
      format

**Success Criteria**:

- Enhancement implemented successfully through iterative AI-assisted workflow
- Each step isolated and validated independently
- Learner can articulate why small diffs are better than large generated code
  blocks
- Guide document useful for future reference

**Estimated Effort**: 1-2 hours

---

### Unit 2: Request ID Implementation (End-to-End Tracing)

**Goal**: Implement unique request IDs that flow from frontend → backend → logs
→ error responses for complete request tracing

**Prerequisites**:

- Unit 1 completed (workflow pattern internalized)
- Understanding of HTTP headers and middleware patterns

**Deliverables**:

**Backend**:

- [ ] Create `backend/app/middleware/request_id.py` module
- [ ] Implement middleware that extracts `x-request-id` from incoming headers or
      generates UUID if missing
- [ ] Store request ID in request state for access in route handlers and logging
- [ ] Include request ID in all response headers as `x-request-id`
- [ ] Register middleware in `main.py` before route handlers
- [ ] Update health check endpoint to return request ID in response body for
      testing

**Frontend**:

- [ ] Extend `apiClient.ts` to generate UUID for each request and add as
      `x-request-id` header
- [ ] Store request ID in interceptor for correlation with responses
- [ ] Log request ID to console in development mode for debugging

**Validation**:

- [ ] Manual test: Make API call, verify `x-request-id` appears in response
      headers
- [ ] Manual test: Check backend console logs include same request ID
- [ ] Manual test: Check frontend console shows same request ID
- [ ] Document request ID flow in architecture diagram

**Success Criteria**:

- Request IDs generated uniquely for each HTTP request
- Same ID visible in frontend logs, backend logs, and HTTP response headers
- Request ID accessible in error responses (will be used in Unit 4)
- No performance degradation from middleware overhead

**Estimated Effort**: 1-2 hours

---

### Unit 3: Structured Logging Service (JSON Logs with Context)

**Goal**: Replace print statements with production-grade structured logging that
includes request context and enables programmatic log analysis

**Prerequisites**:

- Unit 2 completed (request IDs available)
- Understanding of Python logging module and log levels

**Deliverables**:

**Backend**:

- [ ] Create `backend/app/core/logging.py` module
- [ ] Implement `get_logger(name: str)` function returning configured logger
      instance
- [ ] Configure JSON log formatter with fields: timestamp, level, logger_name,
      message, request_id, extra_data
- [ ] Set log level based on environment (DEBUG for dev, INFO for prod)
- [ ] Create context manager or helper to attach request ID to log records
      automatically
- [ ] Update all route handlers to use structured logger instead of print
      statements
- [ ] Log key events: request_start (method, path), request_end (status,
      duration_ms), errors (exception type, traceback)
- [ ] Implement log level filtering (INFO+WARN+ERROR in prod,
      DEBUG+INFO+WARN+ERROR in dev)

**Frontend**:

- [ ] Create `frontend/src/lib/logger.ts` utility module
- [ ] Implement console logger wrapper that includes request ID and timestamp
- [ ] Add log levels: debug, info, warn, error
- [ ] Use logger in Redux actions, API calls, and error boundaries
- [ ] Suppress logs in production builds (check `import.meta.env.PROD`)

**Validation**:

- [ ] Make authenticated API request, verify logs include request ID, method,
      path, status, duration
- [ ] Trigger error scenario, verify error logs include exception details and
      request ID
- [ ] Check log format is valid JSON (can be parsed programmatically)
- [ ] Verify frontend logs appear in browser console during development only

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

### Unit 4: Standardized Error Response Schema

**Goal**: Implement consistent error response format across all HTTP status
codes with educational debugging context

**Prerequisites**:

- Unit 3 completed (structured logging working)
- Understanding of HTTP status codes and FastAPI exception handling

**Deliverables**:

**Backend**:

- [ ] Create `backend/app/core/errors.py` module with custom exception classes
- [ ] Define base `APIError` exception with code, message, details, status_code
      attributes
- [ ] Define specific exceptions: `NotFoundError(404)`, `ValidationError(422)`,
      `UnauthorizedError(401)`, `ForbiddenError(403)`, `ServerError(500)`
- [ ] Create `backend/app/api/error_handlers.py` with global exception handlers
- [ ] Implement exception handler returning standardized JSON:
      `{"error": {"code": "...", "message": "...", "details": {}, "request_id": "..."}}`
- [ ] Register handlers in `main.py` for each exception type
- [ ] Include request ID from middleware in all error responses
- [ ] Add handler for uncaught exceptions (500) with generic message (never
      expose stack traces to client)
- [ ] Log all errors with ERROR level including full exception traceback
      server-side

**Educational Content**:

- [ ] Document common HTTP status codes with when/why they occur:
  - 200: Success
  - 201: Created
  - 400: Bad request (malformed JSON, missing required fields)
  - 401: Unauthorized (no auth token or expired token)
  - 403: Forbidden (authenticated but insufficient permissions)
  - 404: Not found (resource doesn't exist)
  - 422: Unprocessable entity (validation failed)
  - 500: Server error (uncaught exception, database down, etc.)
- [ ] Create debugging guide: manual approaches (check logs with request ID,
      inspect network tab, verify auth token) and AI-assisted approaches (paste
      error to Copilot, describe symptoms for troubleshooting suggestions)

**Frontend**:

- [ ] Extend `apiClient.ts` error interceptor to parse standardized error shape
- [ ] Create `frontend/src/lib/errorHandler.ts` utility to extract user-friendly
      message from error response
- [ ] Update Redux error handling to store error code + message + request_id in
      state
- [ ] Display request ID in error toasts for user to report issues: "Something
      went wrong (Request ID: abc123)"
- [ ] Add development-only console.error showing full error details

**Validation**:

- [ ] Test 404: Request non-existent endpoint, verify error response matches
      schema with request_id
- [ ] Test 401: Make request without auth token, verify unauthorized error
- [ ] Test 422: Send invalid data (e.g., create item with missing required
      field), verify validation error with details
- [ ] Test 500: Temporarily break database connection, verify generic error
      without exposing internals
- [ ] Verify all errors logged server-side with request ID for correlation

**Success Criteria**:

- 100% of error responses follow consistent
  `{error: {code, message, details, request_id}}` schema
- Error messages user-friendly (no stack traces or sensitive data exposed)
- Request IDs included in errors enable tracing to server logs
- Frontend gracefully handles all error types with appropriate UI feedback
- Debugging guide helps learners troubleshoot common issues independently

**Estimated Effort**: 3-4 hours

---

### Unit 5: Timeout & Retry Configuration

**Goal**: Add resilience to external API calls (Supabase) with timeout limits
and retry logic for transient failures

**Prerequisites**:

- Unit 4 completed (error handling standardized)
- Understanding of network failures and retry strategies

**Deliverables**:

**Backend**:

- [ ] Extend `backend/app/core/config.py` with timeout settings:
      `SUPABASE_TIMEOUT_SECONDS` (default 10), `SUPABASE_RETRY_ATTEMPTS`
      (default 3)
- [ ] Update `backend/app/db/supabase_client.py` to configure Supabase client
      with timeout
- [ ] Implement retry decorator or wrapper for Supabase API calls with
      exponential backoff
- [ ] Retry only on transient errors (network timeout, 503 service
      unavailable) - NOT on 4xx client errors
- [ ] Log retry attempts with request ID and attempt number
- [ ] Add circuit breaker pattern (optional advanced): stop retrying if Supabase
      consistently down

**Frontend**:

- [ ] Configure axios timeout in `apiClient.ts` (default 30 seconds for all
      requests)
- [ ] Implement retry logic in interceptor for 5xx errors and network timeouts
      (max 2 retries)
- [ ] Add exponential backoff delay between retries (1s, 2s, 4s)
- [ ] Never retry on 4xx errors (these require user action, not retries)
- [ ] Display retry attempt count in development logs

**Health Check Enhancement**:

- [ ] Update `/api/v1/health` endpoint to test Supabase connection with timeout
- [ ] Return health status:
      `{"status": "healthy", "database": "connected", "latency_ms": 45}`
- [ ] If Supabase unreachable within timeout, return degraded status with
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

PAUSE

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

### Unit 6: shadcn/ui Installation & Component Exploration

**Goal**: Install shadcn/ui component library and understand how to add,
customize, and use components

**Prerequisites**:

- Tailwind CSS configured from Session 1
- TypeScript path aliases set up (`@/*` imports)
- Understanding of React component composition

**Deliverables**:

**Installation**:

- [ ] Run shadcn/ui init wizard: `npx shadcn-ui@latest init`
- [ ] Select configuration options: TypeScript, Tailwind, CSS variables for
      theming, `@/` import alias
- [ ] Verify `components.json` file created with correct configuration
- [ ] Install core components:
      `npx shadcn-ui@latest add button card input dialog toast alert dropdown-menu avatar`
- [ ] Verify components created in `frontend/src/components/ui/` directory

**Understanding Component Structure**:

- [ ] Review generated component files and understand pattern:
      composition-based, Radix UI primitives, Tailwind styling
- [ ] Identify customization points: variant props, className overrides, CSS
      variable theming
- [ ] Document file organization: `/components/ui` for shadcn, `/components/app`
      for custom app components

**Quick Verification**:

- [ ] Create test page temporarily to verify Button component renders with all
      variants (default, destructive, outline, secondary, ghost, link)
- [ ] Test Dialog component opens and closes correctly
- [ ] Test Toast notifications appear with proper styling
- [ ] Remove test page after verification

**Documentation**:

- [ ] Document how to add new shadcn/ui components:
      `npx shadcn-ui@latest add <component-name>`
- [ ] Document customization approach: modify component file directly or use
      className prop
- [ ] List all installed components with brief description of use case

**Success Criteria**:

- shadcn/ui initialized with correct Tailwind and TypeScript configuration
- Core components installed and verified working
- Learner understands how to add additional components independently
- Component file structure clear and organized

**Estimated Effort**: 1 hour

---

### Unit 7: Design System Architecture & Style Guide Page

**Goal**: Establish design system foundation with CSS custom properties, design
tokens, and create initial style guide documentation page

**Prerequisites**:

- Unit 6 completed (shadcn/ui installed)
- Understanding of CSS custom properties and Tailwind configuration

**Deliverables**:

**Design Tokens**:

- [ ] Create `frontend/src/styles/design-system.css` file
- [ ] Define CSS custom properties for color palette (primary, secondary,
      accent, neutral, success, warning, error with shades 50-900)
- [ ] Define typography scale variables (font-size, line-height, font-weight for
      heading-1 through heading-6, body, small, caption)
- [ ] Define spacing scale (using Tailwind's spacing as base but exposed as CSS
      variables for documentation)
- [ ] Define border radius tokens (rounded-sm, rounded-md, rounded-lg,
      rounded-full)
- [ ] Define shadow tokens (shadow-sm, shadow-md, shadow-lg, shadow-xl)
- [ ] Import design-system.css in `main.tsx` after Tailwind imports

**Tailwind Configuration**:

- [ ] Extend `tailwind.config.ts` to use design system CSS variables
- [ ] Configure theme colors to reference custom properties:
      `primary: 'var(--color-primary-500)'`
- [ ] Add custom utility classes for common patterns (e.g., `.text-balance`,
      `.container-lg`, `.card-shadow`)

**Style Guide Page**:

- [ ] Create `frontend/src/pages/StyleGuide.tsx` component
- [ ] Create basic page layout with header "Design System" and navigation
      tabs/sections
- [ ] Add route `/style-guide` in `AppRoutes.tsx` (public route, no auth
      required for easy access)
- [ ] Create sections structure: Colors, Typography, Spacing, Components (to be
      populated in next units)
- [ ] Style page with clean, documentation-focused design (minimal distractions)

**Color Palette Section**:

- [ ] Display color swatches for each color with hex values and CSS variable
      names
- [ ] Make swatches clickable to copy hex value to clipboard
- [ ] Show color accessibility ratings (WCAG contrast for text on backgrounds)

**Typography Section**:

- [ ] Display all heading levels (h1-h6) with sample text showing size, weight,
      line-height
- [ ] Display body text variations (regular, bold, italic)
- [ ] Display utility text (small, caption, code)
- [ ] Include copy-to-clipboard for CSS class names

**Navigation**:

- [ ] Add "Style Guide" link to main navigation (visible to all users)
- [ ] Make style guide page easily accessible for developers and designers

**Success Criteria**:

- Design tokens defined as CSS custom properties and integrated with Tailwind
- Style guide page accessible at `/style-guide` route
- Color palette fully documented with visual swatches
- Typography scale demonstrated with live examples
- Page serves as single source of truth for design decisions

**Estimated Effort**: 3-4 hours

---

PAUSE

## AI PROMPT:

Validate Phase 3 (Design System Foundation) completion:

**VALIDATION CHECKLIST**:

- Navigate to `http://localhost:5173/style-guide`
- Verify color palette section displays all color swatches with proper values
- Click color swatch, verify hex value copied to clipboard
- Verify typography section shows all heading levels and text variations with
  correct styling
- Check `design-system.css`: Verify CSS custom properties defined for colors,
  typography, spacing
- Check `tailwind.config.ts`: Verify theme extended to use custom properties
- Test Button component uses design system colors correctly
- Verify "Style Guide" link appears in navigation

**Confirm style guide displays correctly before proceeding to Part 2.**

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

# PART 2: TESTING INFRASTRUCTURE & VISUALIZATION (Units 8-11)

---

## AI PROMPT (Part 2 Start):

I need you to implement **Part 2** of the Session 3 Production Polish PRD (Units
8-11: Testing Infrastructure, Interactive Style Guide, Data Visualization, UX
Polish).

**EXECUTION REQUIREMENTS:**

- Follow the unit sequence exactly as documented (Units 8-11)
- Mark deliverables as [x] in the PRD as you complete them
- Ask for my approval at PAUSE sections before proceeding to next phase
- Run all tests to ensure passing test suites
- Flag any missing dependencies or unclear requirements immediately

**TECHNICAL CONSTRAINTS:**

- Backend Testing: pytest, pytest-asyncio, httpx for async testing
- Frontend Testing: Vitest, React Testing Library, jsdom
- Visualization: Recharts library with Supabase materialized views
- Accessibility: WCAG 2.1 AA standards, keyboard navigation, ARIA labels

**START WITH UNIT 8** - Please confirm you understand the requirements before
proceeding.

---

## Phase 4: Testing Infrastructure & Coverage

### Unit 8: Backend Testing Setup with pytest

**Goal**: Establish comprehensive backend testing infrastructure with pytest,
fixtures, and async testing support

**Prerequisites**:

- Units 1-7 completed (backend with logging, errors, health checks)
- Understanding of pytest patterns and fixtures
- Familiarity with FastAPI testing using TestClient

**Deliverables**:

**Pytest Configuration**:

- [ ] Update `backend/pytest.ini` with comprehensive settings: test paths,
      markers, async mode, coverage options
- [ ] Install testing dependencies:
      `pip install pytest pytest-asyncio httpx pytest-cov`
- [ ] Add dependencies to `requirements.txt` under test section
- [ ] Configure pytest to discover tests in `backend/tests/` directory
- [ ] Set up coverage reporting with minimum threshold (70% for initial setup)

**Test Fixtures**:

- [ ] Create `backend/tests/conftest.py` with shared fixtures
- [ ] Implement `test_app` fixture providing FastAPI TestClient instance
- [ ] Implement `test_db` fixture providing isolated test database connection
      (or mock Supabase client)
- [ ] Implement `auth_headers` fixture generating valid authentication tokens
      for protected endpoints
- [ ] Implement `mock_user` fixture providing test user data
- [ ] Implement `cleanup` fixture ensuring test isolation (reset state between
      tests)

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

### Unit 9: Frontend Testing Setup with Vitest

**Goal**: Establish frontend testing infrastructure with Vitest and React
Testing Library for component and integration testing

**Prerequisites**:

- Unit 8 completed (backend testing patterns established)
- Understanding of React Testing Library principles (test behavior, not
  implementation)
- Familiarity with Vitest as Vite-native test runner

**Deliverables**:

**Vitest Installation**:

- [ ] Install testing dependencies:
      `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
- [ ] Create `frontend/vitest.config.ts` extending Vite config
- [ ] Configure jsdom environment for DOM testing
- [ ] Set up test path aliases matching Vite config (`@/*`)
- [ ] Configure coverage reporting with istanbul/v8

**Test Utilities Setup**:

- [ ] Create `frontend/src/test/setup.ts` for global test setup
- [ ] Import and configure `@testing-library/jest-dom` matchers
- [ ] Create `frontend/src/test/utils.tsx` with custom render function
- [ ] Implement `renderWithProviders()` wrapping components with Redux Provider,
      Router, and other context
- [ ] Create mock store helper for testing Redux-connected components
- [ ] Create mock API client for testing service layers without real HTTP calls

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

### Unit 10: Interactive Style Guide - Native HTML Elements

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

### Unit 11: Interactive Style Guide - shadcn/ui Component Gallery

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

### Unit 12: Recharts Integration & Analytics Dashboard

**Goal**: Integrate Recharts visualization library and create analytics
dashboard showing items and tags data with charts

**Prerequisites**:

- Units 1-11 completed (backend stable, frontend tested, style guide
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

- [ ] Create Supabase migration for materialized views or regular views
- [ ] Create view `items_by_date` aggregating item count by creation date (last
      30 days)
- [ ] Create view `items_by_status` aggregating item count by status (todo,
      in_progress, done)
- [ ] Create view `tags_usage` aggregating tag count by label (top 10 most used
      tags)
- [ ] Create view `user_activity` aggregating user actions over time (items
      created per day)
- [ ] Test views return correct data via Supabase SQL editor

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

**Confirm analytics dashboard fully functional before proceeding to Phase 7 (UX
Polish).**

---

## Phase 7: UX Polish & Quality Assurance

### Unit 13: Optimistic Updates & Advanced UX Patterns

**Goal**: Implement optimistic UI updates for better perceived performance and
add advanced UX patterns (filters, search, accessibility improvements)

**Prerequisites**:

- Units 1-12 completed (full application with testing and visualization)
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

### Unit 14: Final QA, PR Hygiene & Deployment Prep

**Goal**: Comprehensive quality assurance pass, clean commit history, and
prepare application for deployment

**Prerequisites**:

- Units 1-13 completed (all features implemented)
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
      analytics)
- [ ] Document environment variables needed for new features
- [ ] Update API documentation with new analytics endpoints
- [ ] Add testing documentation: how to run tests, write new tests, interpret
      coverage
- [ ] Document style guide location and usage
- [ ] Add troubleshooting guide for common issues

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

# PART 3: EXTENDED LEARNING - USER PROFILE FEATURE (Unit 15)

**Goal**: Apply all Session 3 learnings by building a complete feature
end-to-end, from user story through database schema, backend API, frontend UI,
testing, and deployment.

**Feature Overview**: User Profile Management - A protected page where
authenticated users can view and edit their profile information, including
setting a username, viewing account details, managing their DiceBear avatar, and
deleting their account with proper safeguards.

---

## AI PROMPT (Part 3 Start):

I need you to implement **Part 3** of the Session 3 Production Polish PRD (Unit
15: User Profile Feature End-to-End).

**EXECUTION REQUIREMENTS:**

- Build complete feature from scratch following all Session 3 best practices
- Apply logging, error handling, testing, and design patterns from Units 1-14
- Mark deliverables as [x] in the PRD as you complete them
- Validate at each sub-phase before proceeding
- Create production-ready, tested, accessible feature

**FEATURE SCOPE:**

- User profile page at `/profile` route (protected)
- Display user data from `user_profiles` table (email, name, username,
  created_at, beta_access)
- CRUD operations: Create/update username, view profile, delete account
- DiceBear avatar integration (generated from user_id or email, no upload)
- Navigation from avatar menu in nav bar
- Warning modal for account deletion
- Full test coverage and accessibility compliance

**TECHNICAL CONSTRAINTS:**

- Follow Session 2's `user_profiles` schema structure
- Use Session 3's logging, error handling, and testing patterns
- Apply design system from style guide
- Ensure RLS enforcement and security best practices

**START WITH MINI-PRD (Sub-Unit 15.1)** - Please confirm you understand the
requirements before proceeding.

---

## Phase 8: Complete Feature Development (User Profile)

### Unit 15: User Profile Feature - End-to-End Implementation

**Goal**: Demonstrate mastery of AI-assisted development by building a complete
user profile management feature from ideation to deployment, incorporating all
Session 3 patterns and best practices

**Prerequisites**:

- Units 1-14 completed (all infrastructure, patterns, and tools in place)
- Session 2 authentication working with `user_profiles` table
- Understanding of full-stack feature development lifecycle
- Familiarity with DiceBear avatar generation

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
- [ ] DiceBear avatar generated from user_id (consistent, no storage needed)
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

- [ ] Profile image upload (using DiceBear avatars only)
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
- [ ] Choose DiceBear style (e.g., "bottts", "avataaars", "pixel-art")

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

### Sub-Unit 15.4: DiceBear Avatar Integration

**Goal**: Integrate DiceBear avatar generation for consistent user avatars
without image uploads

**Prerequisites**:

- Understanding of DiceBear API or libraries
- Profile endpoints working (Sub-Unit 15.3)

**Deliverables**:

**Backend Avatar Utility** (optional, can be frontend-only):

- [ ] Create `backend/app/utils/avatar.py` module (if serving avatar URLs from
      backend)
- [ ] Implement `generate_avatar_url(user_id: str, style: str = "bottts")`
      function
- [ ] Use DiceBear API URL pattern:
      `https://api.dicebear.com/7.x/{style}/svg?seed={user_id}`
- [ ] Support multiple avatar styles: bottts, avataaars, pixel-art, initials
- [ ] Return deterministic URL (same user_id always generates same avatar)
- [ ] No storage needed (avatars generated on-the-fly by DiceBear)

**Frontend Avatar Component**:

- [ ] Create `frontend/src/components/Avatar.tsx` reusable component
- [ ] Component accepts props: `userId` (required), `size` (sm, md, lg, xl),
      `style` (avatar style)
- [ ] Generate DiceBear URL client-side using user ID as seed
- [ ] Render as `<img>` with src pointing to DiceBear API
- [ ] Add fallback if DiceBear image fails to load (show initials from name)
- [ ] Add proper alt text for accessibility: "Avatar for {username}"
- [ ] Style avatar: circular, border, shadow using design system tokens
- [ ] Make avatar responsive to size prop (32px for sm, 48px for md, 64px for
      lg, 96px for xl)

**Avatar in Navigation**:

- [ ] Update `Navigation.tsx` component
- [ ] Replace existing avatar placeholder with `<Avatar>` component
- [ ] Pass current user's ID to Avatar component
- [ ] Size: sm (32px) for nav bar
- [ ] Ensure avatar clickable to open dropdown menu
- [ ] Add loading state while user data fetching

**Avatar in Profile Page**:

- [ ] Display large avatar at top of profile page (size: xl, 96px)
- [ ] Center avatar above profile information
- [ ] Add subtle animation or border effect
- [ ] Consider allowing user to change avatar style (dropdown selector)

**Caching & Performance**:

- [ ] DiceBear API is CDN-backed, no caching needed client-side
- [ ] Add loading="lazy" to avatar images for performance
- [ ] Verify avatar loads quickly (should be < 100ms from DiceBear CDN)

**Testing**:

- [ ] Create `frontend/src/components/__tests__/Avatar.test.tsx`
- [ ] Test Avatar component renders with correct DiceBear URL
- [ ] Test different sizes render correctly
- [ ] Test fallback displays when image fails
- [ ] Test alt text is present for accessibility
- [ ] Visual test: verify avatar looks good in navigation and profile page

**Success Criteria**:

- Avatar component reusable across app
- Avatars render consistently (same user ID = same avatar)
- Avatar styles match design system
- Fallback works when DiceBear unavailable
- Performance acceptable (< 100ms load time)
- Accessibility: alt text and keyboard navigable

**Estimated Effort**: 1-2 hours

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
  - Renders with correct DiceBear URL
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
- [ ] Verify avatar image loads quickly (DiceBear CDN)
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
- [ ] Document DiceBear avatar integration and how to change styles
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
- Verify avatar displays (DiceBear image loads)
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

- ✅ DiceBear avatar component integrated
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

## Document Metadata

- **Version**: 1.0
- **Status**: Complete
- **Last Updated**: 2025-12-01
- **Authors**: AI Coding Assistant + Learner
- **Session**: Session 3 - Production Reliability & Design Systems
- **Prerequisites**: Sessions 1-2 complete (Bootstrap + Auth)
- **Estimated Total Effort**: 35-45 hours
- **Units**: 15 (7 foundation + 7 polish + 1 complete feature)
- **Related Documents**:
  - `Beast_Mode_SB_Auth_PRD.md` - Session 2 authentication reference
  - `Beast_Mode_Agent_SDK_PRD.md` - Session 4 AI/agents reference
  - `AGENTS.md` - General coding conventions

---

**END OF SESSION 3 BEAST MODE PRD**

**Next Session**: Session 4 - OpenAI Responses API & Agent SDK Integration
