# OpenAI Responses API & Agent SDK Implementation - Product Requirements Document v1.0

## Overview

Comprehensive documentation of the **OpenAI Responses API and Agent SDK integration** in the code45 platform, covering both standalone AI chat functionality and sophisticated agentic systems with tool execution, structured outputs, and multi-specialist orchestration.

**Key Architecture**: This implementation provides TWO interaction patterns:

1. **Responses API** (non-agentic): Direct structured LLM completions for query
   generation and analysis
2. **Agent SDK** (agentic): Autonomous agents with tool-calling capabilities,
   decision-making, and multi-specialist orchestration

Both patterns leverage **agent-user authentication** (created during user signup) to enforce RLS boundaries and provide secure, user-scoped database access for AI operations.

## Business Context

- **Problem**: Modern applications need AI capabilities ranging from simple
  structured queries to complex autonomous operations, with secure database
  access and user-scoped permissions
- **Solution**: Dual-mode AI integration using OpenAI's Responses API for
  structured interactions and Agent SDK for autonomous tool execution, both
  authenticated via agent-user service accounts with RLS enforcement
- **Value**: Production-ready AI capabilities with multiple use cases, secure
  permissions model, autonomous database operations, and foundation for
  sophisticated multi-agent systems

## Implementation Scope

This PRD documents the complete AI agent architecture including:

1. **Backend AI Infrastructure**: OpenAI SDK setup, structured output validation, tool specification patterns
2. **Agent-User Authentication**: Service account creation, credential encryption, agent-specific RLS enforcement
3. **Responses API Integration**: Structured LLM completions for database queries and analysis
4. **Agent SDK Integration**: Autonomous agents with tool-calling, decision boundaries, and orchestration
5. **Frontend Chat Interface**: User-facing chat UI with message history, action indicators, and responsive design
6. **Production Safeguards**: Rate limiting, timeouts, cost tracking, error handling, and observability

## AI Coding Agent (GitHub Copilot or similar) Instructions

**IMPORTANT**: In this PRD document, prompts aimed at the AI coding assistant to
start or continue the implementation of this PRD end-to-end (in conjunction with
the learner and via the GitHub Copilot Chat) will be marked with `## AI PROMPT`
headings.

- **The learner** pastes the prompt into the chat to initiate the start or the continuation of the code implementation led by the AI coding assistant.
- **AI Coding Assistant** reads and executes on the prompt IF not provided by the learner. The AI Coding Assistant should execute the tasks specified under each unit and - upon completion - mark off each task with [x] = completed or [~] = in progress depending on status. Sections (---) marked with "PAUSE" are
  milestone points where the AI Coding Assistant should check in with the learner, ensure all checklists in this PRD reflect the latest progress, and await the next learner instructions OR - after approval - move to reading the next `## AI PROMPT` and start execution.

## Prerequisites: Environment Setup (Before Unit 1)

### Backend Setup

- [ ] Python 3.12+ installed
- [ ] Conda (or venv) environment active: from backend/ in terminal run `conda activate ideas` (or [command to activate venv])
- [ ] Backend .env file with existing Supabase credentials from Session 2
- [ ] OpenAI API key obtained from platform.openai.com
- [ ] Add to backend/.env:
      `OPENAI_API_KEY=sk-proj-... OPENAI_MODEL=gpt-5.1-mini OPENAI_MAX_TOKENS=4096`
- [ ] Install base AI dependencies: `pip install openai pydantic cryptography`

### Frontend Setup

- [ ] Sessions 1-3 complete (app bootstrapped, auth working, UI components available)
- [ ] Frontend running: `npm run dev` from /frontend
- [ ] Verify dev server runs on http://localhost:5173
- [ ] shadcn/ui components installed (from Session 2)

### Supabase & Auth Setup

- [ ] Session 2 auth complete (user authentication working)
- [ ] Supabase project accessible
- [ ] Test user account exists for testing
- [ ] Verify existing RLS policies on items/tags tables

### Development Workflow

- [ ] Two terminals: backend/ (`python -m uvicorn app.main:app --reload --log-level info`), frontend/ (`npm run dev`)
- [ ] Backend runs on http://localhost:8000
- [ ] Frontend runs on http://localhost:5173
- [ ] OpenAI API key secured (never commit to repo)

## Architecture Overview

### Dual-Mode AI Pattern

This implementation provides two complementary AI interaction patterns:

**Pattern 1: Responses API (Non-Agentic)**

```
User Query → Backend Endpoint → OpenAI Responses API → Structured Output → Database Query → Results
```

Use for: SQL generation, data analysis, structured queries without autonomous
actions

**Pattern 2: Agent SDK (Agentic)**

```
User Message → Orchestrator Agent → Decision (which specialist?) → Specialist Agent → Tool Call → Database Action → Response
```

Use for: Autonomous operations, multi-step workflows, tool execution with
decision-making

### Agent-User Authentication Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   User      │         │   Backend    │         │  Agent-User  │         │   Supabase   │
│   (Human)   │         │   FastAPI    │         │   Service    │         │   Database   │
└──────┬──────┘         └───────┬──────┘         └───────┬──────┘         └──────┬───────┘
       │                        │                        │                       │
       │  1. Navigate to /chat  │                        │                       │
       │───────────────────────>│                        │                       │
       │                        │  2. Get agent creds    │                       │
       │                        │     from user_profile  │                       │
       │                        │───────────────────────>│                       │
       │                        │  3. Decrypt password   │                       │
       │                        │<───────────────────────│                       │
       │                        │                        │                       │
       │                        │  4. Auth agent-user    │                       │
       │                        │     sign_in_with_pwd() │                       │
       │                        │───────────────────────────────────────────────>│
       │                        │  5. Agent session      │                       │
       │                        │<───────────────────────────────────────────────│
       │                        │                        │                       │
       │  6. Chat interface     │                        │                       │
       │<───────────────────────│                        │                       │
       │                        │                        │                       │
       │  7. User sends message │                        │                       │
       │───────────────────────>│                        │                       │
       │                        │  8. Call OpenAI Agent  │                       │
       │                        │     with context       │                       │
       │                        │                        │                       │
       │                        │  9. Agent decides:     │                       │
       │                        │     create_tag tool    │                       │
       │                        │                        │                       │
       │                        │  10. Execute via       │                       │
       │                        │      agent client+RLS  │                       │
       │                        │───────────────────────────────────────────────>│
       │                        │  11. RLS checks        │                       │
       │                        │      agent-user perms  │                       │
       │                        │<───────────────────────────────────────────────│
       │                        │                        │                       │
       │  12. Response + action │                        │                       │
       │<───────────────────────│                        │                       │
       ▼                        ▼                        ▼                       ▼
```

### Multi-Specialist Agent Architecture

```
                              ┌─────────────────┐
                              │   Orchestrator  │
                              │     Agent       │
                              └────────┬────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
        ┌───────────────┐      ┌──────────────┐     ┌──────────────┐
        │ Items         │      │ Tags         │     │ Web Search   │
        │ Specialist    │      │ Specialist   │     │ Tool         │
        └───────┬───────┘      └──────┬───────┘     └──────┬───────┘
                │                     │                    │
                │                     │                    │
        ┌───────▼───────┐     ┌───────▼──────┐     ┌───────▼──────┐
        │ create_item   │     │ create_tag   │     │ search_web   │
        │ update_item   │     │ search_tags  │     │ (built-in)   │
        │ delete_item   │     │ delete_tag   │     └──────────────┘
        └───────────────┘     └──────────────┘
                │                     │
                └──────────┬──────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │    Supabase    │
                  │    (via RLS)   │
                  └────────────────┘
```

## Core Goals and Objectives

### Goal 1: OpenAI Agent SDK Integration

**Install and integrate the OpenAI Agent SDK** with:

- **Orchestrator agent** (decides which specialist to call)
- **2 specialist agents** (Items Agent, Tags Agent)
- **Built-in tools** (e.g., web search for context)
- **Custom Supabase tools** (CRUD on `items` table)
- **Chat interface** (basic UI for user-agent interaction)

**Learning Focus**: Agent architecture, tool delegation, decision boundaries

---

### Goal 2: OpenAI Responses API Integration

**Implement the Responses API** (separate from Agent SDK) for:

- **Structured LLM interactions** (not agentic, just completions)
- **Reuse chat interface** and custom tools
- **Database queries** via natural language
- **Comparison point**: When to use Responses vs. Agents

**Learning Focus**: API differences, use case selection, structured outputs

---

### Goal 3: Agent User Authentication

**Extend signup to create agent users**:

- **Generate agent credentials** for each human user signup
- **Encrypt and store** in `user_profile` table
- **Associate agent-user with human user** (1:1 relationship)
- **Use admin_client** for privileged operations
- **Extend `user_profile` schema** as needed

**Learning Focus**: Service accounts, credential management, security patterns

---

### Goal 4: Agent-User RLS Integration

**Authenticate agents using existing RLS**:

- **Trigger on navigation to "/"** (or chat routes)
- **Use stored credentials** to authenticate agent-user
- **Leverage existing endpoints** via `user_scoped_client`
- **Agent operates under user's permissions** (RLS enforces boundaries)

**Learning Focus**: RLS with service accounts, scoped auth, audit trails

---

## Principles Carried Over from Session 3

1. **AI-first workflow**: Plan-first, diff-only, approve per step
2. **Least-privilege data access**: User-scoped for user actions, admin only for
   system operations
3. **Auditability**: Request IDs, error normalization, structured logging
4. **Design consistency**: shadcn/ui components, Tailwind patterns
5. **Testing mindset**: QA checklists, error scenarios, manual validation

---

## Agent-User Pattern & Security Model

### Agent-User Architecture

**Why Agent-Users?**

1. **RLS Enforcement**: Agents operate within same security boundaries as human
   users
2. **Audit Trail**: All agent actions traceable to specific user via agent-user
   ID
3. **Permission Scoping**: Agents cannot escalate privileges beyond user's
   access
4. **Standard Auth**: Reuse existing Supabase auth flow, no custom JWT logic

**Creation Flow** (extends Session 2 signup):

1. Human user signs up → creates `auth.users` record
2. Backend generates agent credentials:
   - `agent_email` = `agent_{user_id}@code45.internal`
   - `agent_password` = cryptographically secure random password
3. Backend creates second `auth.users` record for agent (using admin client)
4. Backend encrypts agent password with Fernet (key from env)
5. Backend stores in `user_profile` table:
   ```sql
   user_profile:
     user_id: uuid (FK to human user)
     agent_user_id: uuid (FK to agent auth.users)
     agent_credentials_encrypted: text (encrypted password)
   ```

**Authentication Flow** (on /chat access):

1. User navigates to `/chat` → ProtectedRoute validates human user session
2. Backend retrieves `agent_credentials_encrypted` for this user
3. Backend decrypts agent password
4. Backend calls `auth.sign_in_with_password(agent_email, agent_password)`
5. Backend gets agent session (access_token, refresh_token)
6. Backend creates `user_scoped_client` with agent's token
7. Agent operations execute via this client → RLS enforces user boundaries

**Security Properties**:

- Agent credentials stored encrypted at rest
- Agent password never sent to frontend
- Agent session expires like human sessions
- RLS policies apply identically to agent operations
- All database writes logged with agent-user ID
- Agent cannot access other users' data (RLS enforced)

### Tool Execution Security

**RLS Enforcement Example** (create_tag tool):

```python
# Tool receives agent_client (already authenticated as agent-user)
def create_tag(agent_client, item_id: str, label: str):
    # This query automatically scoped to agent-user's permissions via RLS
    result = agent_client.table("tags").insert({
        "item_id": item_id,
        "label": label,
        "created_by": agent_client.user_id  # Agent-user ID
    }).execute()
    return result.data

# RLS policy on tags table:
# CREATE POLICY "Users can create tags for their items"
#   ON tags FOR INSERT
#   WITH CHECK (EXISTS (
#     SELECT 1 FROM items
#     WHERE items.id = tags.item_id
#     AND items.user_id = auth.uid()  # auth.uid() returns agent-user ID
#   ));
```

**What This Prevents**:

- ✗ Agent creating tags on other users' items
- ✗ Agent accessing data outside user scope
- ✗ Privilege escalation via tool manipulation
- ✗ Cross-user data leakage

**What This Enables**:

- ✓ Autonomous agent operations within user boundaries
- ✓ Full audit trail (agent-user ID in logs)
- ✓ Standard RLS policies apply to agent actions
- ✓ No custom permission logic needed

---

## Implementation Plan & Sequence

### Legend

- `[ ]` = Pending (not started)
- `[~]` = In Progress (partially implemented)
- `[x]` = Completed (fully implemented and tested)

---

## AI PROMPT:

Initial Engagement Prompt:

I need you to implement the OpenAI Responses API & Agent SDK PRD
(Beast_Mode_Agent_SDK_PRD.md) end-to-end.

EXECUTION REQUIREMENTS:

- Follow the unit sequence exactly as documented (Units 1-28)
- Mark deliverables as [x] in the PRD as you complete them
- Ask for my approval before proceeding to each new unit OR at key milestones
  preceded with sections 'PAUSE'
- Run validation tests after each major phase (backend foundation, Responses
  API, Agent SDK, frontend, production)
- Flag any missing dependencies or unclear requirements immediately

TECHNICAL CONSTRAINTS:

- Backend: Python 3.12+, FastAPI, Supabase Python SDK, OpenAI SDK
- Frontend: React 18.2, TypeScript, Vite, Redux Toolkit, shadcn/ui
- Auth: Extends Session 2 auth with agent-user pattern
- AI: OpenAI Responses API + Agent SDK (dual-mode integration)
- Security: Encrypted agent credentials, RLS enforcement for all tools

PREREQUISITES:

- Session 2 complete (auth working with user signup/login)
- OpenAI API key obtained and added to backend .env
- Verify existing RLS policies on items/tags tables

START WITH:

- Unit 1: Pydantic Structured Output Validation
- Confirm you understand the agent-user pattern before implementing Units 3-6
- Verify OpenAI API key is valid before testing SDK integration

Begin with Unit 1.

---

# PART A: RESPONSES API IMPLEMENTATION (Units 1-14)

**Goal**: Implement standalone AI chat with OpenAI Responses API for structured
database queries

**Outcome**: Working chat interface where users can ask natural language
questions about their data, receive SQL queries, and see results - all without
agentic tool-calling

**Why This First**: Simpler pattern (no tool execution), establishes foundation
(OpenAI SDK, chat UI, agent-user auth) that Agent SDK builds upon

---

## Phase 1: OpenAI Integration & Agent-User Foundation

### Unit 1: OpenAI SDK Setup & Configuration

**Goal**: Install and configure OpenAI Python SDK with proper API key management
and cost tracking

**Prerequisites**:

- Python 3.12+ environment active
- OpenAI API key obtained from platform.openai.com
- Backend .env file accessible

**Deliverables**:

- [ ] Install `openai` Python package and add to requirements.txt
- [ ] Extend `backend/app/core/config.py` with OpenAI settings (API key, model, max tokens, temperature, timeout)
- [ ] Create `backend/app/services/openai_service.py` module
- [ ] Implement `get_openai_client()` function that returns configured OpenAI client with timeout and retry settings
- [ ] Implement `estimate_tokens(text: str)` utility using tiktoken for accurate token counting
- [ ] Implement `calculate_cost(prompt_tokens, completion_tokens, model)` utility with current GPT-4 pricing
- [ ] Add error handling for OpenAI API failures, rate limits, and timeouts
- [ ] Add logging for all OpenAI API calls including model, tokens, cost, and latency
- [ ] Create health check endpoint `GET /api/v1/ai/health` that tests OpenAI connectivity and returns model availability

**Success Criteria**:

- OpenAI client initializes successfully with valid API key
- Token counting accurate within 5% margin
- Cost calculation matches OpenAI pricing
- Health check endpoint confirms API connectivity
- All API calls logged with complete metadata

**Estimated Effort**: 1-2 hours

---

### Unit 2: Agent-User Database Schema Extension

**Goal**: Extend `user_profile` table to store encrypted agent-user credentials

**Prerequisites**:

- Session 2 auth complete with existing `user_profile` table
- Understanding of Supabase migration system

**Deliverables**:

- [ ] Create Supabase migration file with timestamp naming convention
- [ ] Add columns to `user_profile`: `agent_user_id` (UUID FK),
      `agent_credentials_encrypted` (TEXT), `agent_created_at` (TIMESTAMP),
      `agent_last_used_at` (TIMESTAMP)
- [ ] Add index on `agent_user_id` for performant lookups
- [ ] Add NOT NULL constraint on `agent_user_id` ensuring every user has agent
- [ ] Add CHECK constraint validating encrypted credentials minimum length
- [ ] Update RLS policies allowing users to read their agent metadata but not
      decrypt credentials
- [ ] Create RLS policy restricting credential writes to service role only
- [ ] Write migration rollback script for safe reversal
- [ ] Document schema changes in project database documentation
- [ ] Update TypeScript types excluding sensitive fields from frontend

**Success Criteria**:

- Migration applies without errors on clean database
- Existing user profiles remain functional
- RLS policies prevent credential exposure to unauthorized access
- Rollback migration tested and working
- Schema documentation updated

**Estimated Effort**: 1-2 hours

---

### Unit 3: Credential Encryption Service

**Goal**: Implement Fernet encryption for secure agent password storage at rest

**Prerequisites**:

- Unit 2 completed (schema ready)
- `cryptography` package installed

**Deliverables**:

- [ ] Install cryptography package and add to requirements.txt
- [ ] Extend `backend/app/core/config.py` with `ENCRYPTION_KEY` setting
      (base64-encoded Fernet key from environment)
- [ ] Create script to generate secure encryption key
      (`scripts/generate_encryption_key.py`)
- [ ] Create `backend/app/core/encryption.py` module
- [ ] Implement `get_fernet()` function returning cached Fernet cipher instance
- [ ] Implement `encrypt_password(password: str)` function returning
      base64-encoded ciphertext
- [ ] Implement `decrypt_password(encrypted: str)` function returning plaintext
      password
- [ ] Implement `rotate_encryption(old_key, new_key)` function for future key
      rotation scenarios
- [ ] Add comprehensive error handling for invalid ciphertexts and key errors
- [ ] Implement logging that never exposes plaintext passwords or encryption
      keys
- [ ] Write unit tests for encrypt/decrypt round-trips and error scenarios

**Security Checklist**:

- [ ] Encryption key stored only in environment variable
- [ ] Encryption key never logged or exposed in error messages
- [ ] Plaintext passwords never logged anywhere
- [ ] Fernet provides authenticated encryption preventing tampering

**Success Criteria**:

- Passwords encrypt and decrypt successfully
- Each encryption produces different ciphertext (nonce included)
- Invalid ciphertexts handled gracefully without crashes
- Key rotation function works correctly
- Zero plaintext password leaks in logs or errors

**Estimated Effort**: 1-2 hours

---

### Unit 4: Agent-User Creation on Signup

**Goal**: Extend Session 2 signup endpoint to automatically create agent-user
account for each human user

**Prerequisites**:

- Units 1-3 completed
- Session 2 auth endpoints working
- Understanding of transaction patterns

**Deliverables**:

- [ ] Extend `backend/app/api/routes/auth.py` signup endpoint with agent
      creation logic
- [ ] After human user creation, generate agent email using pattern
      `agent_{user_id}@code45.internal`
- [ ] Generate cryptographically secure random password for agent (32+
      characters)
- [ ] Use Supabase admin client to create agent auth account via
      `auth.sign_up()`
- [ ] Encrypt agent password using encryption service from Unit 3
- [ ] Store encrypted credentials in `user_profile` table using admin client to
      bypass RLS
- [ ] Implement transaction wrapper ensuring atomicity (rollback human user if
      agent creation fails)
- [ ] Add comprehensive audit logging for successful and failed agent creations
- [ ] Update signup response model to include `agentCreated: boolean` field
- [ ] Add error handling with safe messages that never expose credentials
- [ ] Write integration test verifying two auth.users created and credentials
      stored encrypted

**Success Criteria**:

- Every new user signup creates both human and agent auth accounts
- Agent credentials stored encrypted in database
- Transaction rollback works correctly on failures
- Audit trail complete with user_id and agent_user_id logged
- No plaintext passwords appear in logs or error responses

**Estimated Effort**: 2-3 hours

---

### Unit 5: Agent Authentication Service

**Goal**: Implement service to authenticate agent-user and create RLS-scoped
Supabase client

**Prerequisites**:

- Unit 4 completed (agent-users exist in database)
- Understanding of Session 2 user_scoped_client pattern

**Deliverables**:

- [ ] Create `backend/app/services/agent_auth.py` module
- [ ] Implement `authenticate_agent_user(user_id: str)` function that retrieves
      and decrypts agent credentials then authenticates via Supabase
- [ ] Implement session caching using in-memory dictionary with expiry tracking
- [ ] Implement `get_agent_client(user_id: str)` function returning RLS-enforced
      Supabase client with agent token
- [ ] Attach `user_id` and `agent_user_id` attributes to client for audit
      logging
- [ ] Implement automatic token refresh when cached session expires
- [ ] Implement `revoke_agent_session(user_id)` function for logout scenarios
- [ ] Update `agent_last_used_at` timestamp in user_profile on each
      authentication
- [ ] Add comprehensive logging including authentication attempts, successes,
      failures with request IDs
- [ ] Add error handling for missing credentials, decryption failures, auth
      failures
- [ ] Write integration tests verifying agent authentication and RLS enforcement

**Success Criteria**:

- Agent-user authenticates successfully using stored encrypted credentials
- RLS-scoped client created with agent's access token
- Session caching reduces authentication overhead
- All agent operations logged with full audit trail
- Error handling prevents credential exposure

**Estimated Effort**: 2-3 hours

---

PAUSE

## AI PROMPT:

Validate Phase 1 (OpenAI Integration & Agent-User Foundation) completion:

VALIDATION CHECKLIST:

- Start backend: `python -m uvicorn app.main:app --reload`
- Test OpenAI connectivity: `curl http://localhost:8000/api/v1/ai/health`
- Test encryption service: Run unit tests in `tests/test_encryption.py`
- Test signup with agent creation:
  ```bash
  curl -X POST http://localhost:8000/api/v1/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"email":"aitest@example.com","password":"testpass123"}'
  ```
- Verify in Supabase Studio → Authentication → Users: Two records (human + agent
  with pattern `agent_{uuid}@code45.internal`)
- Verify in Supabase Studio → user_profile table: agent_user_id populated and
  credentials encrypted
- Test agent authentication via Python REPL:
  ```python
  from app.services.agent_auth import get_agent_client
  client = get_agent_client("user_id_here")
  print(client.user_id, client.agent_user_id)
  ```

Confirm all tests pass before proceeding to Phase 2 (Responses API
Implementation).

---

## Phase 2: Responses API & Structured Query Generation

### Unit 6: Pydantic Models for Responses API

**Goal**: Define type-safe models for AI-generated database queries and analysis

**Prerequisites**:

- Pydantic installed and understanding of validation patterns

**Deliverables**:

- [ ] Create `backend/app/models/responses_api.py` module
- [ ] Define `QueryType` enum with values: `sql_generation`, `data_analysis`,
      `summarization`
- [ ] Define `ResponsesAPIOutput` Pydantic model with fields: `query_type`,
      `generated_sql`, `explanation`, `safety_check`, `confidence`
- [ ] Add field validators ensuring generated_sql required when query_type is
      sql_generation
- [ ] Add validator for safety_check ensuring dangerous SQL patterns rejected
- [ ] Implement `validate_sql_safety()` method checking for DROP, DELETE without
      WHERE, ALTER, CREATE statements
- [ ] Define `SQLQueryRequest` model for user queries with natural language
      question and optional schema context
- [ ] Define `QueryResult` model for response including results, explanation,
      token usage, cost
- [ ] Add JSON schema export for OpenAI structured outputs configuration
- [ ] Write unit tests for all validation rules and safety checks

**Success Criteria**:

- Pydantic models enforce strict type safety for Responses API outputs
- SQL safety validation prevents dangerous query patterns
- Invalid responses raise clear validation errors
- JSON schema compatible with OpenAI structured outputs

**Estimated Effort**: 1-2 hours

---

### Unit 7: Responses API Service Implementation

**Goal**: Implement service layer for OpenAI Responses API with SQL generation
and safety validation

**Prerequisites**:

- Unit 6 completed (models defined)
- Unit 1 completed (OpenAI client available)

**Deliverables**:

- [ ] Create `backend/app/services/responses_service.py` module
- [ ] Implement `build_schema_context(agent_client)` function extracting
      relevant table schemas for prompt context
- [ ] Implement `generate_sql_query(user_query: str, schema_context: dict)`
      function calling OpenAI Chat Completions with structured output
- [ ] Design system prompt for SQL generation emphasizing safety (SELECT only,
      require WHERE for deletions, add LIMIT if missing)
- [ ] Configure OpenAI request to return JSON matching ResponsesAPIOutput schema
- [ ] Implement `validate_and_sanitize_sql(sql: str)` function with
      comprehensive safety checks
- [ ] Implement `execute_generated_query(agent_client, sql: str)` function
      running validated SQL via RLS-enforced client
- [ ] Add result formatting converting database response to user-friendly format
- [ ] Implement error handling for OpenAI API failures, unsafe SQL generation,
      query execution errors
- [ ] Add logging for all API calls including tokens, cost, query types, safety
      violations
- [ ] Write comprehensive tests for SQL generation, safety validation, execution
      with RLS

**Success Criteria**:

- Responses API generates accurate SQL for natural language queries
- Safety validation blocks all dangerous SQL patterns
- RLS enforcement prevents cross-user data access
- Token usage and costs tracked accurately
- All error scenarios handled gracefully

**Estimated Effort**: 3-4 hours

---

### Unit 8: Responses API Endpoint

**Goal**: Create FastAPI endpoint exposing Responses API functionality to
frontend

**Prerequisites**:

- Unit 7 completed (service layer working)
- Unit 5 completed (agent authentication available)

**Deliverables**:

- [ ] Create `POST /api/v1/ai/query` endpoint in `backend/app/api/routes/ai.py`
- [ ] Implement request handling extracting user query and optional schema hints
      from body
- [ ] Get authenticated user from session (Session 2 auth dependency)
- [ ] Get agent client using `get_agent_client(user_id)` for RLS-enforced
      database access
- [ ] Call responses service to generate and execute SQL query
- [ ] Return normalized response including results, explanation, tokens, cost
- [ ] Implement rate limiting (10 queries per minute per user) using middleware
      or decorator
- [ ] Add request ID tracking for full audit trail
- [ ] Implement error responses with consistent format matching Session 3
      patterns
- [ ] Add endpoint documentation with OpenAPI schema
- [ ] Write endpoint tests covering success cases, rate limiting, RLS
      enforcement, error scenarios

**Success Criteria**:

- Endpoint successfully handles natural language queries
- Rate limiting prevents abuse (tested)
- RLS prevents users accessing other users' data
- Errors returned in consistent normalized format
- Full audit trail with request IDs

**Estimated Effort**: 2-3 hours

---

PAUSE

## AI PROMPT:

Validate Phase 2 (Responses API Implementation) completion:

VALIDATION CHECKLIST:

- Test SQL generation:
  ```bash
  curl -X POST http://localhost:8000/api/v1/ai/query \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"query":"Show me all items created this week"}'
  ```
- Verify response includes: generated_sql, explanation, safety_check: true,
  results array
- Test safety validation - try unsafe query:
  ```bash
  curl -X POST http://localhost:8000/api/v1/ai/query \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"query":"Delete all items"}'
  ```
- Expected: 400 error with safety violation message
- Test RLS enforcement: Query should only return authenticated user's data
- Test rate limiting: Send 11 requests rapidly, verify 11th is rate-limited
- Check logs: Verify token usage and cost tracking working

Confirm all tests pass before proceeding to Phase 3 (Frontend Chat Interface).

---

## Phase 3: Frontend Chat Interface for Responses API

### Unit 9: Redux Chat Slice

**Goal**: Create Redux state management for AI chat interactions

**Prerequisites**:

- Redux Toolkit configured from Session 2
- Understanding of async thunks

**Deliverables**:

- [ ] Create `frontend/src/store/chatSlice.ts` module
- [ ] Define `ChatState` interface with messages array, loading state, error,
      token usage
- [ ] Define `Message` type with id, role (user/assistant), content, timestamp,
      metadata (tokens, cost)
- [ ] Create slice with reducers: `addMessage`, `setLoading`, `setError`,
      `clearMessages`, `updateTokenUsage`
- [ ] Create `sendQuery` async thunk calling `/api/v1/ai/query` endpoint
- [ ] Implement optimistic update adding user message immediately before API
      call
- [ ] Implement thunk fulfilled handler adding assistant response to messages
- [ ] Implement error handling storing error message in state
- [ ] Add selectors for messages, loading state, total tokens used, total cost
- [ ] Export actions and reducer
- [ ] Integrate chat reducer into root store configuration
- [ ] Write tests for reducers and async thunk lifecycle

**Success Criteria**:

- Chat state accessible via `useSelector((s) => s.chat)`
- Messages persist during session (cleared on logout)
- Loading states update correctly during API calls
- Token usage and costs accumulate accurately
- Error states handled gracefully

**Estimated Effort**: 2-3 hours

---

### Unit 10: Chat Service Layer

**Goal**: Create service functions for chat API communication

**Prerequisites**:

- Unit 9 completed (Redux slice ready)
- apiClient from Session 2 available

**Deliverables**:

- [ ] Create `frontend/src/services/chatService.ts` module
- [ ] Define TypeScript interfaces matching backend models (QueryRequest,
      QueryResult)
- [ ] Implement `sendQuery(query: string)` function calling POST
      `/api/v1/ai/query`
- [ ] Implement response parsing and validation
- [ ] Add error handling with user-friendly error messages
- [ ] Implement `getConversationHistory()` function (placeholder for future
      persistence)
- [ ] Add logging for debugging (client-side console logs in development only)
- [ ] Export all service functions
- [ ] Write service layer tests mocking apiClient

**Success Criteria**:

- Service functions cleanly wrap API calls
- Errors transformed to user-friendly messages
- TypeScript types ensure type safety
- Service layer testable independently of React components

**Estimated Effort**: 1-2 hours

---

### Unit 11: ChatInterface Component

**Goal**: Build main chat UI component with message display and input

**Prerequisites**:

- Units 9-10 completed (state and service layer ready)
- shadcn/ui components available from Session 2

**Deliverables**:

- [ ] Create `frontend/src/components/chat/ChatInterface.tsx` component
- [ ] Implement layout with message list area and input area using shadcn Card
      and ScrollArea
- [ ] Create `useChat()` custom hook wrapping Redux actions and selectors
- [ ] Implement message rendering with distinct styling for user vs assistant
      messages
- [ ] Create input field using shadcn Textarea with send button
- [ ] Implement send handler dispatching `sendQuery` thunk and clearing input
- [ ] Add loading indicator during API call (disable input, show thinking
      animation)
- [ ] Implement auto-scroll to latest message on new message arrival
- [ ] Add empty state when no messages exist with helpful prompt examples
- [ ] Implement error display using shadcn Alert component
- [ ] Add keyboard shortcut (Cmd/Ctrl+Enter) to send message
- [ ] Make component responsive for mobile screens
- [ ] Write component tests for user interactions

**Success Criteria**:

- Chat interface renders messages clearly
- User can send queries and see responses
- Loading states provide clear feedback
- Errors displayed in user-friendly manner
- Component works on desktop and mobile
- Keyboard shortcuts functional

**Estimated Effort**: 3-4 hours

---

### Unit 12: Message Display Components

**Goal**: Create reusable components for rendering different message types

**Prerequisites**:

- Unit 11 completed (ChatInterface exists)

**Deliverables**:

- [ ] Create `frontend/src/components/chat/MessageCard.tsx` component
- [ ] Implement different layouts for user vs assistant messages (alignment,
      colors)
- [ ] Add avatar or icon indicating message sender
- [ ] Display timestamp in relative format (e.g., "2 minutes ago")
- [ ] Show SQL query in code block with syntax highlighting for assistant
      responses
- [ ] Display explanation text clearly separated from query
- [ ] Show metadata (tokens used, cost) in collapsed section expandable on click
- [ ] Add copy-to-clipboard button for SQL queries
- [ ] Create `frontend/src/components/chat/QueryResultsTable.tsx` for displaying
      data results
- [ ] Implement table with column headers from database response
- [ ] Add row limit with "show more" pagination if results exceed limit
- [ ] Style using shadcn Table component
- [ ] Make components accessible (ARIA labels, keyboard navigation)
- [ ] Write component tests

**Success Criteria**:

- Messages clearly distinguishable between user and assistant
- SQL queries formatted nicely with syntax highlighting
- Results table easy to read and navigate
- Metadata (cost, tokens) available but not obtrusive
- Components fully accessible

**Estimated Effort**: 2-3 hours

---

### Unit 13: Chat Route & Navigation Integration

**Goal**: Add chat page to routing and navigation

**Prerequisites**:

- Units 11-12 completed (chat components ready)
- Routing infrastructure from Session 2

**Deliverables**:

- [ ] Add `/chat` path to `frontend/src/config/paths.ts`
- [ ] Create `frontend/src/pages/Chat.tsx` page component
- [ ] Wrap ChatInterface in page layout with header showing "AI Assistant" title
- [ ] Add ProtectedRoute wrapper requiring authentication
- [ ] Update `frontend/src/routes/AppRoutes.tsx` adding chat route
- [ ] Update `frontend/src/components/Navigation.tsx` adding "Chat" link in
      authenticated nav
- [ ] Add icon for chat link (use lucide-react MessageSquare or similar)
- [ ] Implement page title and meta tags for SEO
- [ ] Add breadcrumb navigation if applicable
- [ ] Test route protection (redirect to login if not authenticated)
- [ ] Write routing tests

**Success Criteria**:

- Chat page accessible at /chat when authenticated
- Unauthenticated users redirected to login
- Chat link visible in navigation for authenticated users
- Page title and layout consistent with app design
- Route transitions smooth

**Estimated Effort**: 1-2 hours

---

### Unit 14: Responses API Polish & Testing

**Goal**: Add final touches and comprehensive testing for Responses API chat

**Prerequisites**:

- All previous Responses API units completed

**Deliverables**:

- [ ] Add conversation clearing button to chat interface
- [ ] Implement confirmation dialog before clearing chat history
- [ ] Add example queries as clickable chips when chat is empty
- [ ] Implement token/cost display in chat header showing session totals
- [ ] Add settings panel for adjusting query parameters (temperature, max
      tokens) - future enhancement hook
- [ ] Implement loading skeleton states for better perceived performance
- [ ] Add toast notifications for successful query execution and errors
- [ ] Write E2E test scenarios: send query, receive response, verify SQL
      generation, verify results display
- [ ] Write test for rate limiting behavior from user perspective
- [ ] Write test for RLS enforcement (user should only see their data)
- [ ] Create user documentation for chat feature
- [ ] Add inline help tooltips explaining how to ask questions effectively
- [ ] Performance test: measure and optimize for large result sets
- [ ] Accessibility audit and fixes

**Success Criteria**:

- Chat interface polished and professional
- All user interactions tested comprehensively
- Performance acceptable even with large responses
- Accessibility meets WCAG standards
- User documentation complete

**Estimated Effort**: 3-4 hours

---

PAUSE

## AI PROMPT:

Validate PART A (Responses API Implementation) completion:

COMPREHENSIVE VALIDATION:

1. **End-to-End Flow Test:**

   - Login as user
   - Navigate to /chat
   - Send query: "Show me all items I created this week"
   - Verify: SQL generated, results displayed, no errors
   - Verify: Token usage and cost shown
   - Send another query: "Analyze my productivity trends"
   - Verify: Results make sense, chat history preserved

2. **Security Test:**

   - As User A, send query about items
   - Verify results only include User A's items
   - Cannot see User B's data

3. **Safety Test:**

   - Try query: "Delete all my data"
   - Expected: Query rejected with safety error message

4. **Rate Limiting Test:**

   - Send 11 queries rapidly
   - Expected: 11th query returns rate limit error

5. **UI/UX Test:**

   - Test on mobile device
   - Test keyboard shortcuts
   - Test copy-to-clipboard
   - Test clearing conversation

6. **Error Handling Test:**

   - Disconnect network, send query
   - Expected: Graceful error message

7. **Performance Test:**
   - Query returning 100+ rows
   - Expected: Renders in < 2 seconds

All tests must pass before proceeding to PART B (Agent SDK Implementation).

---

---

# PART B: AGENT SDK IMPLEMENTATION (Units 15-28)

**Goal**: Implement autonomous agentic system with tool-calling,
multi-specialist architecture, and orchestration

**Outcome**: Working agent system where users can instruct AI to perform
database operations (create items, add tags), with agents making autonomous
decisions about when and how to act

**Why After Responses API**: Builds upon established foundation (OpenAI SDK,
chat UI, agent-user auth) and adds complexity (tool execution, decision
boundaries, orchestrator pattern)

---

## Phase 4: Tool Specification & Base Agent Infrastructure

### Unit 15: Tool Base Class & Contract Pattern

**Goal**: Define reusable base class and contract pattern for all agent tools

**Prerequisites**:

- Part A completed (Responses API working)
- Understanding of abstract base classes

**Deliverables**:

- [ ] Create `backend/app/services/tools/base.py` module
- [ ] Define `Tool` abstract base class with properties: name, description,
      parameters_schema
- [ ] Define abstract `execute(agent_client, **params)` method signature
- [ ] Define abstract `validate_parameters(**params)` method for parameter
      validation
- [ ] Implement `to_openai_function_schema()` method converting tool to OpenAI
      function calling format
- [ ] Define `ToolResult` dataclass for standardized tool execution responses
      with success status, data, errors
- [ ] Create `ToolExecutionError` custom exception for tool failures
- [ ] Add logging helper methods for tool invocation tracking
- [ ] Document tool contract requirements in docstrings
- [ ] Write tests for base class utility methods

**Success Criteria**:

- Base class provides clear contract for all tools
- OpenAI function schema generation works automatically
- Tool results standardized across all implementations
- Error handling consistent

**Estimated Effort**: 1-2 hours

---

### Unit 16: create_tag Tool Implementation

**Goal**: Implement first concrete tool following base class pattern

**Prerequisites**:

- Unit 15 completed (Tool base class ready)
- Understanding of RLS enforcement

**Deliverables**:

- [ ] Create `backend/app/services/tools/create_tag.py` module
- [ ] Define `CreateTagTool` class extending `Tool` base class
- [ ] Implement `name` property returning "create_tag"
- [ ] Implement `description` property with clear explanation of what tool does
- [ ] Define `parameters_schema` with item_id (UUID required) and label (string
      1-50 chars required)
- [ ] Implement `validate_parameters()` checking UUID format and label
      constraints
- [ ] Implement `execute(agent_client, item_id, label)` method performing
      database insert via RLS-enforced client
- [ ] Add duplicate tag checking (same item_id + label combination)
- [ ] Add item ownership verification via RLS (agent can only tag user's items)
- [ ] Return `ToolResult` with created tag data or error details
- [ ] Add comprehensive logging with user_id, agent_user_id, item_id, label
- [ ] Write tool tests: successful creation, duplicate prevention, RLS
      enforcement, validation errors

**Success Criteria**:

- Tool creates tags successfully for valid requests
- RLS prevents creating tags on other users' items
- Duplicate tags rejected with clear error message
- All error scenarios handled and logged
- Tests verify all success and error paths

**Estimated Effort**: 2-3 hours

---

### Unit 17: Pydantic Models for Agent Responses

**Goal**: Define type-safe models for agent decision-making and tool calls

**Prerequisites**:

- Understanding of agent decision patterns

**Deliverables**:

- [ ] Create `backend/app/models/agent.py` module
- [ ] Define `AgentAction` enum with values: create_tag, create_item,
      search_items, answer, clarify, refuse
- [ ] Define `AgentResponse` Pydantic model with fields: action, payload,
      rationale, confidence, suggested_clarification
- [ ] Add field validator ensuring payload required for tool-calling actions
- [ ] Add field validator ensuring suggested_clarification required when action
      is clarify
- [ ] Add confidence field validator ensuring range 0.0-1.0
- [ ] Define `AgentDecision` model for orchestrator routing decisions
- [ ] Add JSON schema export for OpenAI structured outputs
- [ ] Write validation tests for all field combinations and edge cases

**Success Criteria**:

- Models enforce strict typing for agent responses
- Invalid agent responses raise clear validation errors
- All action types validated correctly
- JSON schema works with OpenAI function calling

**Estimated Effort**: 1-2 hours

---

### Unit 18: Agent System Prompts

**Goal**: Design system prompts defining agent behavior and decision policies

**Prerequisites**:

- Understanding of prompt engineering for agents

**Deliverables**:

- [ ] Create `backend/app/agents/prompts.py` module
- [ ] Define `ITEMS_SPECIALIST_PROMPT` with role, responsibilities, tools,
      decision policy, safety constraints
- [ ] Document decision thresholds: act if confidence >= 0.8, clarify if < 0.8,
      refuse if unsafe
- [ ] Define output format requiring valid JSON matching AgentResponse schema
- [ ] Include examples of good decision-making in prompt
- [ ] Define `TAGS_SPECIALIST_PROMPT` following same pattern for tag operations
- [ ] Define `ORCHESTRATOR_PROMPT` for routing between specialists
- [ ] Create templates for common clarification questions
- [ ] Create templates for polite refusal messages
- [ ] Version all prompts for A/B testing capability
- [ ] Document prompt design rationale and tuning guidelines

**Success Criteria**:

- Prompts clearly define agent roles and boundaries
- Decision policies enforce safety through confidence thresholds
- JSON output format strictly specified
- Prompts versioned for tracking changes

**Estimated Effort**: 2-3 hours

---

PAUSE

## AI PROMPT:

Validate Phase 4 (Tool Specification & Base Infrastructure) completion:

VALIDATION CHECKLIST:

- Test tool base class: Verify OpenAI function schema generation works
- Test create_tag tool directly:

  ```python
  from app.services.tools.create_tag import CreateTagTool
  from app.services.agent_auth import get_agent_client

  client = get_agent_client("user_id")
  tool = CreateTagTool()
  result = tool.execute(client, item_id="item_uuid", label="test")
  print(result)
  ```

- Test validation: Try invalid item_id, empty label, verify errors
- Test RLS: Try tagging another user's item, verify blocked
- Test duplicate prevention: Create same tag twice, verify rejected
- Verify prompts well-structured and versioned

Confirm all tests pass before proceeding to Phase 5 (Agent SDK Integration).

---

## Phase 5: Agent SDK & Specialist Implementation

### Unit 19: Items Specialist Agent

**Goal**: Implement Items Specialist agent with tool-calling capabilities

**Prerequisites**:

- Units 15-18 completed
- OpenAI SDK configured (Unit 1)

**Deliverables**:

- [ ] Create `backend/app/agents/items_specialist.py` module
- [ ] Define `ItemsSpecialistAgent` class initialized with OpenAI client and
      system prompt
- [ ] Register available tools: create_item, update_item (placeholder for
      future), search_items (placeholder)
- [ ] Implement `process_request(user_message, context, agent_client)` method
      calling OpenAI Chat Completions
- [ ] Configure OpenAI request for structured output (JSON mode) matching
      AgentResponse schema
- [ ] Implement response parsing and validation using Pydantic models
- [ ] Implement confidence-based decision logic: act if >= 0.8, clarify if < 0.8
- [ ] Implement `execute_tool_call(action, payload, agent_client)` method
      routing to appropriate tool
- [ ] Add conversation history management (last N messages for context)
- [ ] Implement token limit trimming to stay within model context window
- [ ] Add comprehensive logging for all agent decisions, tool calls, confidence
      scores
- [ ] Write agent tests: tool execution, clarification requests, refusals,
      confidence scoring

**Success Criteria**:

- Agent successfully executes tools for clear requests
- Agent asks for clarification when ambiguous (confidence < 0.8)
- Agent refuses unsafe operations
- Tool execution enforces RLS correctly
- Conversation context maintained appropriately

**Estimated Effort**: 4-5 hours

---

### Unit 20: Tags Specialist Agent

**Goal**: Implement Tags Specialist agent handling tag operations

**Prerequisites**:

- Unit 19 completed (Items Specialist pattern established)

**Deliverables**:

- [ ] Create `backend/app/agents/tags_specialist.py` module
- [ ] Define `TagsSpecialistAgent` class following Items Specialist pattern
- [ ] Register create_tag tool from Unit 16
- [ ] Register search_tags tool (implement basic tag search functionality)
- [ ] Register delete_tag tool (implement with confirmation requirement)
- [ ] Implement `process_request()` with Tags Specialist system prompt
- [ ] Implement deletion confirmation logic (refuse without explicit user
      confirmation)
- [ ] Add tag suggestion capability (suggest tags based on item content)
- [ ] Implement all standard agent methods following established pattern
- [ ] Add comprehensive logging specific to tag operations
- [ ] Write tests for tag creation, search, deletion with confirmation

**Success Criteria**:

- Tags Specialist handles all tag-related operations
- Deletion requires explicit confirmation
- Tag suggestions helpful and relevant
- All operations RLS-enforced
- Consistent behavior with Items Specialist

**Estimated Effort**: 3-4 hours

---

### Unit 21: Orchestrator Agent Implementation

**Goal**: Implement orchestrator routing user requests to appropriate
specialists

**Prerequisites**:

- Units 19-20 completed (specialists ready)

**Deliverables**:

- [ ] Create `backend/app/agents/orchestrator.py` module
- [ ] Define `OrchestratorAgent` class managing specialist routing
- [ ] Initialize with references to Items and Tags Specialists
- [ ] Implement `route_request(user_message, context)` analyzing request and
      selecting specialist
- [ ] Implement routing logic: item operations → Items Specialist, tag
      operations → Tags Specialist
- [ ] Handle general questions by answering directly without specialist routing
- [ ] Implement ambiguous request handling asking user to clarify intent
- [ ] Add conversation memory tracking which specialist handled each turn
- [ ] Implement specialist response forwarding to user
- [ ] Add logging for routing decisions with rationale
- [ ] Write tests for routing logic covering all specialist scenarios and edge
      cases

**Success Criteria**:

- Orchestrator correctly routes item requests to Items Specialist
- Orchestrator correctly routes tag requests to Tags Specialist
- General questions answered without unnecessary routing
- Ambiguous requests handled with clarification
- Routing decisions logged for debugging

**Estimated Effort**: 3-4 hours

---

### Unit 22: Agent SDK Backend Endpoint

**Goal**: Create FastAPI endpoint exposing agent functionality

**Prerequisites**:

- Unit 21 completed (orchestrator ready)
- Agent authentication from Unit 5 working

**Deliverables**:

- [ ] Create `POST /api/v1/agent/chat` endpoint in
      `backend/app/api/routes/agent.py`
- [ ] Implement request handling accepting user message and optional
      conversation history
- [ ] Get authenticated user from session
- [ ] Get agent client for RLS-enforced operations
- [ ] Call orchestrator to process request and route to specialists
- [ ] If agent decides to execute tool, call tool execution handler
- [ ] Return agent response including action, rationale, tool results if
      applicable
- [ ] Implement rate limiting (20 agent requests per minute per user)
- [ ] Add request ID tracking through entire agent pipeline
- [ ] Implement error handling returning safe messages (never expose tool
      internals)
- [ ] Add endpoint documentation with request/response examples
- [ ] Write endpoint tests for all scenarios: tool execution, clarification,
      refusal, errors

**Success Criteria**:

- Endpoint successfully processes agent requests
- Tool executions work end-to-end with RLS
- Rate limiting prevents abuse
- Errors handled gracefully with safe messages
- Full audit trail maintained

**Estimated Effort**: 3-4 hours

---

PAUSE

## AI PROMPT:

Validate Phase 5 (Agent SDK Integration) completion:

VALIDATION CHECKLIST:

- Test Items Specialist directly via Python REPL
- Test Tags Specialist directly via Python REPL
- Test orchestrator routing:
  ```bash
  curl -X POST http://localhost:8000/api/v1/agent/chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{"message":"Create a tag called python for my latest item"}'
  ```
- Verify response includes: action (create_tag), payload, rationale, tool
  execution result
- Test clarification scenario: Send ambiguous message, verify agent asks for
  clarification
- Test refusal scenario: Request unsafe operation, verify polite refusal
- Test RLS: Agent should only operate on authenticated user's data
- Test rate limiting: Send 21 requests rapidly, verify 21st rate-limited
- Check logs: Verify routing decisions, tool executions, confidence scores
  logged

Confirm all tests pass before proceeding to Phase 6 (Frontend Agent
Integration).

---

## Phase 6: Frontend Agent Interface

### Unit 23: Redux Agent Slice Extension

**Goal**: Extend chat slice to handle agent-specific interactions and tool
results

**Prerequisites**:

- Unit 9 completed (existing chat slice)
- Understanding of agent response model

**Deliverables**:

- [ ] Extend `ChatState` interface with agent-specific fields: agent_status,
      current_action, tool_results
- [ ] Add `agentStatus` field with values: idle, thinking, acting,
      waiting_confirmation
- [ ] Add reducers: `setAgentStatus`, `addToolResult`, `requestConfirmation`
- [ ] Create `sendAgentMessage` async thunk calling `/api/v1/agent/chat`
- [ ] Implement thunk handling different agent actions: answer (add message),
      tool call (show action + result), clarify (show question)
- [ ] Add confirmation flow state management for operations requiring user
      approval
- [ ] Extend selectors for agent-specific state
- [ ] Write tests for new reducers and agent message thunk

**Success Criteria**:

- Chat state accommodates both Responses API and Agent SDK messages
- Agent actions (tool calls, clarifications) represented in state
- Confirmation flows trackable
- All state transitions tested

**Estimated Effort**: 2-3 hours

---

### Unit 24: Agent Message Components

**Goal**: Create components for displaying agent actions and tool results

**Prerequisites**:

- Unit 23 completed (agent state management ready)
- Unit 12 completed (base message components)

**Deliverables**:

- [ ] Extend MessageCard component to handle agent response types
- [ ] Create `ActionBadge` component showing tool execution indicators
      (create_tag, create_item)
- [ ] Create `ToolResultCard` component displaying tool execution results with
      success/error states
- [ ] Implement different styling for different agent actions (thinking, acting,
      clarifying, refusing)
- [ ] Add `ThinkingIndicator` animation component for when agent is processing
- [ ] Create `ClarificationPrompt` component displaying agent questions with
      suggested responses
- [ ] Create `ConfirmationDialog` component for operations requiring user
      approval
- [ ] Add confidence score display (optional, collapsible) for debugging
- [ ] Implement copy button for agent rationale text
- [ ] Make all components accessible with ARIA labels
- [ ] Write component tests

**Success Criteria**:

- Agent messages visually distinct from regular chat
- Tool executions clearly indicated with badges/icons
- Clarification questions prominent and easy to respond to
- Confirmation dialogs intuitive
- All components accessible

**Estimated Effort**: 3-4 hours

---

### Unit 25: Agent Chat Mode Toggle

**Goal**: Add UI toggle between Responses API mode and Agent SDK mode

**Prerequisites**:

- Units 11 & 23 completed (both chat modes working)

**Deliverables**:

- [ ] Add `chatMode` field to Redux chat state with values: responses_api,
      agent_sdk
- [ ] Add reducer for toggling chat mode
- [ ] Create `ChatModeToggle` component with segmented control or tabs UI
- [ ] Display mode descriptions: "Ask Questions" (Responses) vs "Take Actions"
      (Agent)
- [ ] Show appropriate icons for each mode
- [ ] Clear conversation when switching modes with user confirmation
- [ ] Update ChatInterface to call correct API based on mode
- [ ] Add helpful hints specific to each mode in UI
- [ ] Save mode preference to localStorage
- [ ] Write tests for mode switching behavior

**Success Criteria**:

- Users can easily switch between Responses and Agent modes
- Mode differences clearly explained in UI
- Conversation cleared appropriately when switching
- Mode preference persists across sessions
- No confusion about current mode

**Estimated Effort**: 2 hours

---

### Unit 26: Agent Integration Testing

**Goal**: Comprehensive testing of agent system end-to-end

**Prerequisites**:

- Units 15-25 completed (full agent system implemented)

**Deliverables**:

- [ ] Write E2E test: user asks agent to create tag, verify tag created in
      database
- [ ] Write test: agent asks for clarification when request ambiguous
- [ ] Write test: agent refuses unsafe operation politely
- [ ] Write test: orchestrator routes to correct specialist based on request
- [ ] Write test: RLS enforcement prevents cross-user operations
- [ ] Write test: conversation history maintained across multiple turns
- [ ] Write test: confidence thresholds work (low confidence → clarification)
- [ ] Write test: tool execution failures handled gracefully
- [ ] Write test: rate limiting works from user perspective
- [ ] Write accessibility test for all agent UI components
- [ ] Write performance test for agent response latency
- [ ] Create test data fixtures for reproducible testing

**Success Criteria**:

- All E2E scenarios pass consistently
- Security tests verify RLS enforcement
- Performance acceptable (< 3 second response time p95)
- Accessibility tests pass
- Test coverage > 80% for agent code

**Estimated Effort**: 4-5 hours

---

PAUSE

## AI PROMPT:

Validate Phase 6 (Frontend Agent Integration) completion:

COMPREHENSIVE AGENT SYSTEM VALIDATION:

1. **End-to-End Tool Execution:**

   - Login, switch to Agent mode
   - Message: "Create a tag called urgent for my latest item"
   - Verify: Tag created, success message shown, item updated in database

2. **Clarification Flow:**

   - Message: "Tag that thing"
   - Expected: Agent asks "Which item would you like to tag?"
   - Provide clarification, verify action completes

3. **Refusal Flow:**

   - Message: "Delete all my items without asking"
   - Expected: Polite refusal message

4. **Multi-Turn Conversation:**

   - Create item, then tag it in separate messages
   - Verify context maintained

5. **Mode Switching:**

   - Start in Responses mode, ask question
   - Switch to Agent mode, verify conversation cleared
   - Execute action

6. **Security:**
   - Verify agent can only act on authenticated user's items
   - Cannot affect other users' data

All tests must pass before proceeding to Phase 7 (Production Features).

---

## Phase 7: Production Features & Safeguards

### Unit 27: Built-in Web Search Integration

**Goal**: Enable agents to use OpenAI's built-in web search for external context

**Prerequisites**:

- Agents working (Unit 19-21)
- OpenAI SDK supports web search

**Deliverables**:

- [ ] Research OpenAI's current web search/browsing capabilities and API
- [ ] Update agent system prompts to include web search as available tool
- [ ] Configure OpenAI client to enable web search when supported
- [ ] Implement web search tool wrapper if needed following Tool base class
      pattern
- [ ] Add decision logic for when to search web vs use database
- [ ] Implement cost tracking for web search operations (may have different
      pricing)
- [ ] Add logging for web search invocations including queries and result usage
- [ ] Implement fallback behavior if web search unavailable
- [ ] Write tests for web search integration
- [ ] Document when agents use web search vs database

**Note**: Implementation depends on OpenAI's current API offerings. May need
adjustment based on actual capabilities.

**Success Criteria**:

- Agents can search web when needed for external information
- Web search used appropriately (not for database queries)
- Costs tracked separately for web operations
- Graceful fallback if feature unavailable

**Estimated Effort**: 2-3 hours (varies based on API complexity)

---

### Unit 28: Rate Limiting & Cost Controls

**Goal**: Implement comprehensive rate limiting and cost budgets

**Prerequisites**:

- All endpoints implemented (Units 8, 22)

**Deliverables**:

- [ ] Install rate limiting library (slowapi or similar)
- [ ] Implement per-user rate limits: 10 queries/min (Responses API), 20
      messages/min (Agent SDK)
- [ ] Implement per-user daily cost budget tracking
- [ ] Create `user_api_usage` table storing: user_id, date, total_tokens,
      total_cost, request_count
- [ ] Implement middleware updating usage on each API call
- [ ] Implement budget checking before expensive operations
- [ ] Return clear error messages when limits exceeded with reset time
- [ ] Add admin endpoint for viewing usage stats: `GET /api/v1/admin/usage`
- [ ] Implement usage dashboard component in frontend showing user's consumption
- [ ] Add alerts when user approaching limits (80% threshold)
- [ ] Write tests for rate limiting behavior
- [ ] Document rate limits in API documentation

**Success Criteria**:

- Rate limits prevent abuse effectively
- Cost budgets protect against runaway expenses
- Users informed of their usage clearly
- Admin can monitor overall system usage
- Limits configurable per environment

**Estimated Effort**: 3-4 hours

---

### Unit 29: Advanced Conversation Management

**Goal**: Add conversation persistence, history, and management features

**Prerequisites**:

- Chat interfaces complete (Units 11, 24)

**Deliverables**:

- [ ] Create `conversations` table: id, user_id, title, created_at, updated_at,
      mode (responses/agent)
- [ ] Create `conversation_messages` table: id, conversation_id, role, content,
      metadata (tokens, cost, tool_results), timestamp
- [ ] Implement conversation auto-saving on each message exchange
- [ ] Implement conversation listing endpoint: `GET /api/v1/conversations`
- [ ] Implement conversation loading endpoint: `GET /api/v1/conversations/{id}`
- [ ] Add conversation sidebar component showing user's history
- [ ] Implement conversation creation (start new chat)
- [ ] Implement conversation deletion with confirmation
- [ ] Add conversation renaming functionality
- [ ] Implement automatic title generation based on first message
- [ ] Add search across conversation history
- [ ] Implement export conversation as JSON or Markdown
- [ ] Add pagination for conversation lists
- [ ] Write tests for persistence and retrieval

**Success Criteria**:

- Conversations persist across sessions
- User can browse and load previous conversations
- Search helps find old conversations
- Export functionality works reliably
- Performance good even with many conversations

**Estimated Effort**: 4-5 hours

---

### Unit 30: Agent Observability & Monitoring

**Goal**: Add comprehensive logging and monitoring for agent operations

**Prerequisites**:

- All agent functionality complete

**Deliverables**:

- [ ] Enhance logging format to include: request_id, user_id, agent_user_id,
      specialist_type, action, confidence, tool_used, latency, tokens, cost
- [ ] Implement structured logging (JSON format) for easier parsing
- [ ] Create `agent_audit_log` table storing all agent decisions and actions
- [ ] Implement audit log writing on every agent interaction
- [ ] Create dashboard endpoint: `GET /api/v1/admin/agent-stats` returning
      aggregated metrics
- [ ] Implement metrics tracking: success rate, average confidence, tool usage
      distribution, error rates
- [ ] Add debug mode query parameter for verbose agent responses showing
      internal reasoning
- [ ] Create admin UI component displaying agent statistics and trends
- [ ] Implement alerting for anomalies (e.g., sudden spike in errors)
- [ ] Add ability to replay agent decisions from audit log for debugging
- [ ] Write documentation for monitoring and debugging agents
- [ ] Implement log retention policies

**Success Criteria**:

- All agent operations fully auditable
- Metrics provide insight into agent performance
- Debug mode helps troubleshoot issues
- Admins can monitor system health
- Compliance requirements met (audit trail)

**Estimated Effort**: 3-4 hours

---

### Unit 31: Error Handling & Failure Modes

**Goal**: Ensure graceful handling of all failure scenarios

**Prerequisites**:

- Full system implemented

**Deliverables**:

- [ ] Document all possible failure modes: OpenAI API down, rate limits, invalid
      responses, tool execution failures, RLS violations, database errors,
      timeout s
- [ ] Implement graceful degradation when OpenAI unavailable (show status
      message)
- [ ] Add retry logic with exponential backoff for transient failures
- [ ] Implement circuit breaker pattern for OpenAI API calls
- [ ] Add comprehensive error messages explaining what went wrong and suggested
      actions
- [ ] Implement error recovery: invalid JSON from agent → retry once with
      stricter prompt
- [ ] Add timeout handling for long-running operations (30 second max)
- [ ] Implement partial success handling (some tool operations succeed, some
      fail)
- [ ] Add user-facing error documentation explaining common issues
- [ ] Create error testing suite simulating all failure modes
- [ ] Implement error monitoring and alerting
- [ ] Write runbook for common error scenarios

**Success Criteria**:

- System remains stable under all failure conditions
- Users receive helpful error messages
- Transient errors recovered automatically
- Persistent errors escalated appropriately
- All failure modes tested

**Estimated Effort**: 3-4 hours

---

### Unit 32: Documentation & Deployment Guide

**Goal**: Create comprehensive documentation for the AI system

**Prerequisites**:

- Entire system implemented and tested

**Deliverables**:

- [ ] Write `docs/ai_system/architecture.md` explaining dual-mode pattern and
      agent architecture
- [ ] Write `docs/ai_system/responses_api_guide.md` documenting Responses API
      usage
- [ ] Write `docs/ai_system/agent_sdk_guide.md` documenting Agent SDK usage and
      specialist system
- [ ] Write `docs/ai_system/tools.md` documenting all tools with contracts and
      examples
- [ ] Write `docs/ai_system/prompts.md` documenting all system prompts and
      tuning guidelines
- [ ] Write `docs/ai_system/deployment.md` with environment setup,
      configuration, and deployment steps
- [ ] Create user guide for chat interface with screenshots
- [ ] Document rate limits, cost controls, and quotas
- [ ] Write API reference for all AI endpoints
- [ ] Create troubleshooting guide for common issues
- [ ] Write security documentation explaining RLS enforcement and agent-user
      pattern
- [ ] Create developer onboarding guide for extending the system
- [ ] Add inline code comments for complex logic
- [ ] Write CHANGELOG documenting all features

**Success Criteria**:

- New developers can understand system from documentation
- Users can effectively use both chat modes
- Deployment process clearly documented
- Troubleshooting guide helps resolve common issues
- API documentation complete and accurate

**Estimated Effort**: 4-5 hours

---

PAUSE

## AI PROMPT:

Final validation before completing Session 4:

COMPREHENSIVE SYSTEM VALIDATION:

1. **Full Responses API Flow**: Query generation, execution, results display
2. **Full Agent SDK Flow**: Tool execution end-to-end with all specialists
3. **Security Audit**: RLS enforcement verified across all operations
4. **Performance Testing**: Response times acceptable under load
5. **Error Handling**: All failure modes handled gracefully
6. **Documentation Review**: All docs complete and accurate
7. **Accessibility Audit**: WCAG compliance verified
8. **Cost Controls**: Rate limiting and budgets working
9. **Monitoring**: Logs and metrics collecting properly
10. **Deployment**: System deployable to production

Create deployment checklist and final sign-off document.

---

## Technical Specifications

### Environment Variables

**Backend** (extends Session 2 `.env`):

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=4096
OPENAI_TEMPERATURE=0.7
OPENAI_REQUEST_TIMEOUT=30

# Encryption
ENCRYPTION_KEY=<base64-encoded-32-byte-key>

# Rate Limiting
RATE_LIMIT_QUERIES_PER_MINUTE=10
RATE_LIMIT_AGENT_PER_MINUTE=20
DAILY_COST_BUDGET_USD=5.00
```

**Frontend** (extends Session 2 `.env.local`):

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### API Endpoint Summary

**AI Endpoints** (`/api/v1/ai` and `/api/v1/agent`):

- `GET /ai/health` - OpenAI connectivity check
- `POST /ai/query` - Responses API structured queries
- `POST /agent/chat` - Agent SDK tool-calling messages
- `GET /conversations` - List user conversations
- `GET /conversations/{id}` - Load specific conversation
- `DELETE /conversations/{id}` - Delete conversation
- `GET /admin/usage` - API usage statistics (admin only)
- `GET /admin/agent-stats` - Agent performance metrics (admin only)

### Data Models

**Conversations Table**:

```sql
conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  mode TEXT CHECK (mode IN ('responses_api', 'agent_sdk')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

**Conversation Messages Table**:

```sql
conversation_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  metadata JSONB, -- {tokens, cost, tool_results, confidence}
  created_at TIMESTAMP DEFAULT NOW()
)
```

**User API Usage Table**:

```sql
user_api_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE,
  total_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC(10,4) DEFAULT 0,
  request_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
)
```

**Agent Audit Log Table**:

```sql
agent_audit_log (
  id UUID PRIMARY KEY,
  request_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  agent_user_id UUID REFERENCES auth.users(id),
  specialist_type TEXT,
  action TEXT,
  confidence NUMERIC(3,2),
  tool_used TEXT,
  success BOOLEAN,
  latency_ms INTEGER,
  tokens_used INTEGER,
  cost_usd NUMERIC(10,4),
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## Success Metrics

1. **Responses API Performance**: < 2s p95 latency for SQL generation and
   execution
2. **Agent SDK Performance**: < 3s p95 latency for tool-calling operations
3. **Safety**: 100% dangerous SQL patterns blocked by validation
4. **Security**: 100% RLS enforcement preventing cross-user data access
5. **Accuracy**: > 90% agent tool execution success rate
6. **User Experience**: < 5% error rate in production
7. **Cost Efficiency**: Average cost per query < $0.05
8. **Adoption**: > 70% of active users engage with AI features weekly

---

## Future Enhancements (Out of Scope for Session 4)

- [ ] Multi-modal support (image analysis, document processing)
- [ ] Voice input/output for chat interface
- [ ] Agent memory and personalization (learning user preferences)
- [ ] Custom tool creation UI for power users
- [ ] Agent-to-agent communication for complex workflows
- [ ] Integration with external APIs (calendar, email, etc.)
- [ ] Fine-tuned models for domain-specific tasks
- [ ] Real-time collaborative chat (multiple users with shared agent)
- [ ] Mobile app with offline mode
- [ ] Advanced analytics and insights dashboard

---

## Appendix: Common Patterns

### Adding a New Tool

1. Create tool class extending `Tool` base class in
   `backend/app/services/tools/`
2. Implement required methods: `name`, `description`, `parameters_schema`,
   `validate_parameters()`, `execute()`
3. Register tool with appropriate specialist agent
4. Update specialist system prompt mentioning new tool
5. Add tool tests verifying success and error paths
6. Document tool contract in `docs/ai_system/tools.md`

### Debugging Agent Decisions

1. Enable debug mode: Add `?debug=true` to chat request
2. Check agent_audit_log table for decision trail
3. Review confidence scores for low-confidence scenarios
4. Examine system prompt if agent behavior unexpected
5. Test with explicit examples in unit tests
6. Adjust confidence thresholds if needed

### Tuning Agent Prompts

1. Version current prompt before changes
2. Modify prompt with clear intent
3. Test with 10+ diverse scenarios
4. Compare metrics vs previous version
5. Deploy to subset of users first (A/B test)
6. Monitor success rate, clarification rate, error rate
7. Iterate based on data

---

## Document Metadata

- **Version**: 1.0
- **Status**: Complete
- **Last Updated**: 2025-11-30
- **Authors**: AI Coding Assistant + Learner
- **Session**: Session 4 - OpenAI Responses API & Agent SDK
- **Prerequisites**: Sessions 1-3 complete
- **Estimated Total Effort**: 80-100 hours
- **Related Documents**:
  - `Beast_Mode_SB_Auth_PRD.md` - Session 2 authentication reference
  - `SESSION_4_STANDARDS.md` - Session 4 coding standards
  - Individual unit files for detailed implementation guides

---

**END OF BEAST MODE PRD - SESSION 4**

**Goal**: Frame the agent system architecture and success criteria

**Topics**:

- What are AI agents vs. LLM completions
- Tool-calling patterns (when to act vs. answer)
- Decision boundaries (confidence thresholds, safety constraints)
- Success criteria for minimal viable agent

**Outcome**: Clear mental model of agent architecture before implementing

---

### **S4U1 — Structured Outputs with Pydantic Validation**

**Goal**: Enforce type-safe agent responses

**Topics**:

- Define Pydantic models for agent responses
- Validation patterns (reject malformed JSON, re-prompt)
- Error handling (what to do when agent returns invalid structure)
- Testing structured outputs

**Example Model**:

```python
class AgentResponse(BaseModel):
    action: Literal["create_tag", "answer", "none"]
    payload: dict | None
    rationale: str
```

**Outcome**: Type-safe agent responses that frontend can trust

---

### **S4U2 — Tool Specification: create_tag (Contract-First)**

**Goal**: Design the first tool with clear contract

**Topics**:

- Tool schema definition (inputs, outputs, errors)
- FastAPI endpoint implementation
- Idempotency considerations
- Request ID logging
- User-scoped execution (RLS)

**Tool Contract**:

- Input: `{ item_id: str, label: str }`
- Output: `{ tag_id: str, created_at: datetime }`
- Errors: `item_not_found`, `duplicate_tag`, `validation_error`

**Outcome**: First production-ready tool with full error handling

---

### **S4U3 — OpenAI SDK Setup & Configuration**

**Goal**: Install and configure OpenAI SDK

**Topics**:

- Install OpenAI Python SDK
- API key management (environment variables)
- Client initialization
- Model selection (GPT-4 vs GPT-3.5 tradeoffs)
- Cost estimation and monitoring

**Outcome**: OpenAI client ready for agent implementation

---

### **S4U4 — Agent Definition & System Instructions**

**Goal**: Create the Items Agent with clear policy

**Topics**:

- System prompt design (enforce JSON, define tool use policy)
- Decision policy (when to create_tag vs. return guidance)
- Confidence thresholds
- Safety constraints (max tokens, timeout)

**System Prompt Example**:

```
You are an Items Assistant. When user requests to tag an item:
1. If request is clear and valid, call create_tag tool
2. If request is ambiguous, ask clarifying question
3. If request is unsafe, refuse politely
Always respond with JSON: {action, payload, rationale}
```

**Outcome**: Agent with clear behavioral boundaries

---

### **S4U5 — Backend Orchestrator (Agent → Tool → Response)**

**Goal**: Implement server-side agent orchestration

**Topics**:

- Agent call handler (`POST /agent/chat`)
- User context extraction (from auth token)
- Agent invocation with context
- Response validation (Pydantic)
- Tool execution (if action != "none")
- Error normalization (same format as Session 3)

**Flow**:

```
1. Receive user message
2. Get user context (user_id, permissions)
3. Call agent with context
4. Validate response structure
5. If action == "create_tag": execute tool
6. Return normalized response to frontend
```

**Outcome**: Complete backend orchestrator with error handling

---

### **S4U6 — Agent User Creation & Authentication**

**Goal**: Implement agent-user provisioning

**Topics**:

- Extend signup endpoint to create agent-user
- Generate secure credentials (UUID, random password)
- Encrypt credentials (Fernet or similar)
- Store in `user_profile` table
- Associate with human user

**Schema Extension**:

```python
user_profile:
  user_id: uuid (FK to auth.users)
  agent_user_id: uuid (FK to auth.users)
  agent_credentials_encrypted: text
  created_at: timestamp
```

**Outcome**: Every user has an associated agent-user

---

### **S4U7 — Agent Authentication & RLS Integration**

**Goal**: Enable agents to act on behalf of users

**Topics**:

- Decrypt agent credentials on chat route
- Authenticate agent-user via Supabase auth
- Use `user_scoped_client` with agent token
- RLS automatically enforces user boundaries
- Audit trail (request ID + agent-user ID in logs)

**Security Model**:

- Agent-user has **same permissions** as human user (RLS enforces)
- Agent cannot access other users' data
- All actions logged with agent-user ID

**Outcome**: Agents operate within user security boundaries

---

### **S4U8 — Frontend Chat Interface (Minimal MVP)**

**Goal**: Build basic chat UI for agent interaction

**Topics**:

- Chat component with shadcn/ui
- Message state management
- Send message mutation
- Display agent responses (action + rationale)
- Toast notifications for tool actions
- Loading states

**UI Elements**:

- Message input (Textarea)
- Send button
- Message history (ScrollArea)
- Agent response cards (Card component)
- Action indicators (Badge for tool calls)

**Outcome**: Functional chat interface integrated with backend

---

### **S4U9 — Guardrails & Safety (Rate Limits, Timeouts)**

**Goal**: Add production safety constraints

**Topics**:

- Rate limiting (per user, per endpoint)
- Request timeouts (prevent hanging)
- Cost budgets (track OpenAI API usage)
- Token limits (max input/output)
- Refusal paths (when to say no)

**Safety Layers**:

1. Input validation (block obvious malicious prompts)
2. Rate limits (max 10 requests/minute per user)
3. Timeouts (30 second max per agent call)
4. Cost tracking (log token usage)
5. Graceful failures (never expose errors to agent)

**Outcome**: Production-safe agent with resource constraints

---

### **S4U10 — Responses API Integration (Non-Agentic)**

**Goal**: Implement OpenAI Responses API for structured queries

**Topics**:

- Responses API vs Agent SDK (when to use each)
- Structured output without tool calling
- Database query generation from natural language
- Comparison with agent approach

**Use Case**: User asks: "Show me items created this week"

- Responses API generates SQL query
- Backend validates and executes
- Returns results (no tool calling needed)

**Outcome**: Alternative approach for non-agentic LLM use

---

### **S4U11 — Multi-Specialist Architecture (Orchestrator + Specialists)**

**Goal**: Expand to orchestrator with multiple specialists

**Topics**:

- Orchestrator agent (routes to specialists)
- Items Specialist (handles item CRUD)
- Tags Specialist (handles tag operations)
- Routing logic (which specialist for which request)
- Tool delegation

**Architecture**:

```
User → Orchestrator → [Items Specialist, Tags Specialist]
                    → [Web Search Tool]
                    → Response
```

**Outcome**: Scalable multi-agent system

---

### **S4U12 — Built-In Tools (Web Search Integration)**

**Goal**: Use OpenAI's built-in web search tool

**Topics**:

- Enable web search in agent configuration
- When to search (missing context, current events)
- Combine search results with database context
- Cost implications

**Example Flow**: User: "Tag this item with trending JavaScript frameworks"

1. Agent searches web for current trends
2. Agent creates tags based on results
3. Returns action with context

**Outcome**: Agents with external knowledge access

---

### **S4U13 — Failure Modes & Error Handling**

**Goal**: Handle common agent failures gracefully

**Topics**:

- Validation failures (malformed JSON)
- Tool execution failures (database errors)
- Agent timeouts (no response)
- Ambiguous requests (need clarification)
- Test all error paths

**Error Scenarios**:

1. Agent returns invalid JSON → re-prompt once, then fail gracefully
2. Tool execution fails → return error to agent, let it retry or explain
3. Timeout → return "Agent unavailable" with retry option
4. Ambiguous → agent asks clarifying question

**Outcome**: Robust error handling across agent lifecycle

---

### **S4U14 — Advanced Chat UI (History, Context)**

**Goal**: Enhance chat with conversation history

**Topics**:

- Persist conversation history (database)
- Load previous messages on mount
- Context window management (last N messages)
- Clear history action
- Responsive mobile design

**Outcome**: Full-featured chat interface

---

### **S4U15 — Agent Observability & Debugging**

**Goal**: Add logging and monitoring for agents

**Topics**:

- Request ID tracing through agent calls
- Log agent decisions (action, rationale, confidence)
- Token usage tracking
- Error rate monitoring
- Debug mode (show raw agent responses)

**Outcome**: Debuggable agent system with audit trail

---

### **S4U16 — Testing & QA (Agent-Specific Scenarios)**

**Goal**: Comprehensive testing of agent system

**Topics**:

- Test agent decision making (10+ scenarios)
- Test tool execution (success + errors)
- Test auth boundaries (RLS enforcement)
- Test rate limits and timeouts
- Load testing (concurrent requests)

**Test Scenarios**:

- ✅ Valid tag creation request
- ✅ Ambiguous request (agent asks for clarification)
- ✅ Invalid request (agent refuses)
- ✅ Tool failure (database error)
- ✅ Agent timeout
- ✅ Rate limit exceeded
- ✅ Wrong user context (RLS blocks)

**Outcome**: Tested, production-ready agent system

---

### **S4U17 — Commit & Documentation**

**Goal**: Document agent architecture and commit work

**Topics**:

- Write architecture overview
- Document agent prompts and policies
- Document tool contracts
- Create deployment guide
- Write PR description

**Documentation**:

- `docs/agents/architecture.md`
- `docs/agents/tools.md`
- `docs/agents/prompts.md`
- `docs/agents/deployment.md`

**Outcome**: Well-documented agent system ready for Session 5

---

## Deliverables by End of Session 4

### **Core Features**

- ✅ Items Agent with `create_tag` tool
- ✅ Tags Agent with `search_tags` tool
- ✅ Orchestrator routing between specialists
- ✅ Agent-user authentication and RLS integration
- ✅ Chat interface (basic + enhanced versions)
- ✅ Responses API integration for non-agentic queries

### **Infrastructure**

- ✅ Structured output validation (Pydantic)
- ✅ Rate limiting and timeouts
- ✅ Request ID tracing through agent calls
- ✅ Error normalization (same format as Session 3)
- ✅ Cost tracking and monitoring

### **Testing & Documentation**

- ✅ 10+ agent test scenarios
- ✅ Architecture documentation
- ✅ Tool contract specifications
- ✅ Deployment guide

---

## Session 4 Unit Summary

| Unit      | Title                 | Focus                        | Duration     | XP           |
| --------- | --------------------- | ---------------------------- | ------------ | ------------ |
| S4U0      | Pre-Brief             | Agent architecture overview  | 15 min       | 50           |
| S4U1      | Structured Outputs    | Pydantic validation          | 20 min       | 100          |
| S4U2      | Tool Spec: create_tag | First tool contract          | 30 min       | 150          |
| S4U3      | OpenAI SDK Setup      | SDK installation & config    | 15 min       | 75           |
| S4U4      | Agent Definition      | System prompts & policy      | 25 min       | 125          |
| S4U5      | Backend Orchestrator  | Server-side agent handler    | 40 min       | 200          |
| S4U6      | Agent User Creation   | Service account provisioning | 30 min       | 150          |
| S4U7      | Agent RLS Integration | Auth & permissions           | 30 min       | 150          |
| S4U8      | Chat Interface (MVP)  | Basic chat UI                | 35 min       | 175          |
| S4U9      | Guardrails & Safety   | Rate limits, timeouts        | 25 min       | 125          |
| S4U10     | Responses API         | Non-agentic LLM use          | 30 min       | 150          |
| S4U11     | Multi-Specialist      | Orchestrator pattern         | 40 min       | 200          |
| S4U12     | Built-In Tools        | Web search integration       | 25 min       | 125          |
| S4U13     | Failure Modes         | Error handling               | 35 min       | 175          |
| S4U14     | Advanced Chat UI      | History & context            | 40 min       | 200          |
| S4U15     | Observability         | Logging & monitoring         | 30 min       | 150          |
| S4U16     | Testing & QA          | Comprehensive testing        | 45 min       | 225          |
| S4U17     | Commit & Docs         | Documentation                | 20 min       | 100          |
| **Total** | **18 units**          |                              | **~530 min** | **~2600 XP** |

---

## Next Steps

1. **Review and approve** this enhanced overview
2. **Create unit files** following SESSION_4_STANDARDS.md
3. **Start with S4U0-S4U2** (foundation units)
4. **Iterative review** after each 3-4 units
5. **Adjust scope** based on learner feedback

---

**End of Enhanced Overview**
