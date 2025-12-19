# OpenAI Responses API Implementation - PART A - Product Requirements Document v1.0

## Overview

**THIS IS PART A**: Comprehensive documentation of the **OpenAI Responses API integration** for multi-turn chat experiences with natural language database queries.

**PART B SEPARATE**: Agent SDK implementation (multi-specialist agents, CRUD operations, web search) is documented in `Beast_Mode_Agent_SDK_PRD_B.md` and is **out of scope** for Part A.

**What Part A Delivers**: Multi-turn conversational AI chat interface using OpenAI's Responses API for natural language to SQL query generation, with secure agent-user authentication and RLS enforcement.

**Key Pattern**:

- User asks question → LLM decides if database query needed → Calls query_database tool → Execute SQL via RLS-enforced agent client → LLM formats results → Natural language response

**Foundation for Part B**: This implementation establishes:

1. Agent-user authentication (encrypted credentials, service accounts)
2. OpenAI SDK integration (client setup, token tracking, cost calculation)
3. Chat interface foundation (Redux state, floating drawer UI, message components)
4. RLS enforcement patterns (user-scoped database access via agent clients)

## Business Context

- **Problem**: Users need to query their data using natural language without learning SQL or navigating complex UIs
- **Solution**: Multi-turn Responses API integration with function calling for database queries, authenticated via agent-user service accounts with RLS enforcement
- **Value**: Intuitive data access via chat interface, secure user-scoped queries, foundation for advanced agentic capabilities (Part B)

## Part A Implementation Scope

This PRD (Part A) documents **Responses API implementation only**:

1. **Backend AI Infrastructure**: OpenAI SDK setup, token estimation, cost tracking
2. **Agent-User Authentication**: Service account creation, credential encryption, RLS-enforced clients
3. **Responses API Integration**: Multi-turn function calling for database queries (SELECT only)
4. **Frontend Chat Interface**: Floating drawer chat UI with message history, SQL display, results tables
5. **Production Safeguards**: Rate limiting (10 queries/minute), error handling, request tracking

**NOT in Part A** (see Part B PRD):

- Agent SDK with multi-specialist orchestration
- CRUD operations (CREATE, UPDATE, DELETE)
- Web search tool integration
- Autonomous agent decision-making

## AI Coding Agent (GitHub Copilot or similar) Instructions

**IMPORTANT**: In this PRD document, prompts aimed at the AI coding assistant to start or continue the implementation of this PRD end-to-end (in conjunction with the learner and via the GitHub Copilot Chat) will be marked with `## AI PROMPT` (at Phase level) and `#### AI PROMPT` (at Unit level (if applicable)) headings.

- **The learner** pastes the prompt into the chat to initiate the start or the continuation of the code implementation led by the AI coding assistant.
- **AI Coding Assistant** reads and executes on the prompt IF not provided by the learner. The AI Coding Assistant should execute the tasks specified under each unit and - upon completion - mark off each task with [x] = completed or [~] = in progress depending on status. Sections (---) marked with "PAUSE" are milestone points where the AI Coding Assistant should check in with the learner, ensure all checklists in this PRD reflect the latest progress, and await the next learner instructions OR - after approval - move to reading the next `## AI PROMPT` and start execution.

## Prerequisites: Environment Setup (Before Unit 1)

### Backend Setup

- [x] Python 3.12+ installed
- [x] Conda (or venv) environment active: from backend/ in terminal run `conda activate ideas` (or [command to activate venv])
- [x] Backend .env file with existing Supabase credentials from Session 2
- [x] OpenAI API key obtained from platform.openai.com
- [x] Add to backend/.env:
      `OPENAI_API_KEY=sk-proj-... OPENAI_MODEL=gpt-4o-mini OPENAI_MAX_TOKENS=4096 ENCRYPTION_KEY=...`
- [x] Install base AI dependencies: `pip install openai tiktoken cryptography`

### Frontend Setup

- [ ] Sessions 1-3 complete (app bootstrapped, auth working, UI components available)
- [ ] Frontend running: `npm run dev` from /frontend
- [ ] Verify dev server runs on http://localhost:5173
- [ ] shadcn/ui components installed (from Session 2)

### Supabase & Auth Setup

- [x] Session 2 auth complete (user authentication working)
- [x] Supabase project accessible
- [x] Test user account exists for testing
- [x] Verify existing RLS policies on items/tags tables
- [x] Agent-user migration applied (20241219000001_add_agent_user_columns.sql)

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

Use for: SQL generation, data analysis, structured queries without autonomous actions

**Pattern 2: Agent SDK (Agentic)**

```
User Message → Orchestrator Agent → Decision (which specialist?) → Specialist Agent → Tool Call → Database Action → Response
```

Use for: Autonomous operations, multi-step workflows, tool execution with decision-making

### Agent-User Authentication Flow

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   User      │         │   Backend    │         │  Agent-User  │         │   Supabase   │
│   (Human)   │         │   FastAPI    │         │   Service    │         │   Database   │
└──────┬──────┘         └───────┬──────┘         └───────┬──────┘         └──────┬───────┘
       │                        │                        │                       │
       │  1. Open chat drawer   │                        │                       │
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

### Part A: Responses API Architecture (Current Implementation)

```
┌──────────────┐         ┌─────────────────┐         ┌──────────────────┐
│   User       │         │   OpenAI        │         │   Supabase       │
│  (Frontend)  │         │  Responses API  │         │   Database       │
└──────┬───────┘         └────────┬────────┘         └────────┬─────────┘
       │                          │                           │
       │  1. "Show me all ideas" │                           │
       │─────────────────────────>│                           │
       │                          │                           │
       │  2. Turn 1: System      │                           │
       │     instructions +       │                           │
       │     tools available      │                           │
       │<─────────────────────────│                           │
       │                          │                           │
       │  3. LLM decides to call  │                           │
       │     query_database tool  │                           │
       │<─────────────────────────│                           │
       │                          │                           │
       │  4. Execute SQL via      │                           │
       │     agent client (RLS)   │                           │
       │──────────────────────────────────────────────────────>│
       │                          │                           │
       │  5. Query results        │                           │
       │<──────────────────────────────────────────────────────│
       │                          │                           │
       │  6. Turn 2: Send results │                           │
       │     to LLM for formatting│                           │
       │─────────────────────────>│                           │
       │                          │                           │
       │  7. Natural language     │                           │
       │     response with data   │                           │
       │<─────────────────────────│                           │
       ▼                          ▼                           ▼
```

**Note**: Multi-specialist Agent SDK architecture is implemented in **Part B** (separate PRD).

## Core Goals and Objectives

### PART A GOALS (This Document)

### Goal 1: OpenAI Responses API Integration

**Implement the Responses API with multi-turn function calling** for:

- **Multi-turn conversation flow** (Turn 1 → Tool call → Turn 2 with results)
- **Function calling pattern** (LLM decides when to call query_database tool)
- **Natural language to SQL** conversion with safety validation
- **Floating drawer chat interface** (accessible from all authenticated pages)
- **RLS-enforced database queries** via agent-user authentication

**Learning Focus**: Responses API mechanics, multi-turn function calling, tool execution, structured outputs

---

### Goal 2: OpenAI Responses API Integration - MOVED TO PART B

**Agent SDK Integration** (Orchestrator + Specialists) is implemented in **Part B** (separate PRD).

**Part A Focus**: Single-purpose Responses API for database queries only.

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

- **Trigger on chat drawer interaction** (floating button click)
- **Use stored credentials** to authenticate agent-user
- **Execute database queries** via RLS-enforced `agent_client`
- **Agent operates under user's permissions** (RLS enforces boundaries)
- **All tool calls** automatically scoped to authenticated user's data

**Learning Focus**: RLS with service accounts, scoped auth, audit trails, secure tool execution

---

## Principles Carried Over from Session 3

1. **AI-first workflow**: Plan-first, diff-only, approve per step
2. **Least-privilege data access**: User-scoped for user actions, admin only for system operations
3. **Auditability**: Request IDs, error normalization, structured logging
4. **Design consistency**: shadcn/ui components, Tailwind patterns
5. **Testing mindset**: QA checklists, error scenarios, manual validation

---

## Agent-User Pattern & Security Model

### Agent-User Architecture

**Why Agent-Users?**

1. **RLS Enforcement**: Agents operate within same security boundaries as human users
2. **Audit Trail**: All agent actions traceable to specific user via agent-user ID
3. **Permission Scoping**: Agents cannot escalate privileges beyond user's access
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

### AI PROMPT:

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

Begin with Part A Phase 1 Unit 1.

---

# PART A: RESPONSES API IMPLEMENTATION (Units 1-14)

**Goal**: Implement standalone AI chat with OpenAI Responses API for structured database queries

**Outcome**: Working chat interface where users can ask natural language questions about their data, receive SQL queries, and see results - all without agentic tool-calling

**Why This First**: Simpler pattern (no tool execution), establishes foundation (OpenAI SDK, chat UI, agent-user auth) that Agent SDK builds upon

---

## Phase 1: OpenAI Integration & Agent-User Foundation (Units 1-5):

### AI PROMPT: Phase 1 Implementation (Units 1-5)

```
Implement Phase 1 - OpenAI Integration & Agent-User Foundation

**Context**: Phase 2 implements Responses API with multi-turn function calling. This phase (Phase 1) creates agent-users (service accounts) that enable RLS-enforced AI database operations.

**Unit 1: OpenAI SDK Setup**
- Install openai package, add to requirements.txt
- Add config to backend/app/core/config.py: OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TIMEOUT
- Create backend/app/services/openai_service.py with:
  * get_openai_client() returning configured OpenAI client
  * estimate_tokens(text) using tiktoken
  * calculate_cost(prompt_tokens, completion_tokens, model) with GPT-4o-mini rates
- Create health endpoint GET /api/v1/ai/health

**Unit 2: Agent-User Database Schema**
- Migration adds to user_profile: agent_user_id (UUID FK), agent_credentials_encrypted (TEXT), agent_created_at, agent_last_used_at
- Add index on agent_user_id, NOT NULL constraint, CHECK constraint (length > 10)
- RLS: Users can read their agent metadata, only service role can write credentials
- Create rollback migration

**Unit 3: Credential Encryption**
- Install cryptography package
- Create scripts/generate_encryption_key.py to generate Fernet key
- Create backend/app/core/encryption.py with get_fernet(), encrypt_password(), decrypt_password()
- NEVER log plaintext passwords or encryption keys

**Unit 4: Agent Creation on Signup**
- Extend backend/app/api/routes/auth.py signup endpoint:
  * After human user created, generate agent email: agent_{user_id}@code45.internal
  * Generate secure random password (32+ chars)
  * Use admin_client.auth.sign_up() to create agent auth account
  * Encrypt password, store in user_profile with admin client (bypasses RLS)
  * Transaction wrapper: rollback human user if agent creation fails
- Add agentCreated boolean to signup response

**Unit 5: Agent Authentication Service**
- Create backend/app/services/agent_auth.py with:
  * get_agent_client(user_id) - retrieves encrypted credentials, decrypts, authenticates agent, returns RLS-enforced Supabase client
  * Session caching with expiry tracking, automatic token refresh
  * Update agent_last_used_at on each authentication
  * Attach user_id and agent_user_id attributes to client for audit logging

**Error Handling**: Use APIError(code="...", message="...", status_code=...) from backend/app/core/errors.py

**Validation**:
- Signup creates 2 auth.users (human + agent_{uuid}@code45.internal)
- Credentials encrypted in user_profile
- get_agent_client() returns working client that only accesses owning user's data (RLS enforced)

Mark tasks [x] in PRD. Await approval before Phase 2.
```

### Unit 1: OpenAI SDK Setup

- [x] Install `openai` Python package and add to requirements.txt
- [x] Extend `backend/app/core/config.py` with OpenAI settings: API key, model name, max tokens, temperature, timeout
- [x] Create `backend/app/services/openai_service.py` module
  - [x] Implement `get_openai_client()` function returning configured OpenAI client with timeout and retry settings
  - [x] Implement `estimate_tokens(text: str)` utility using tiktoken for accurate token counting
  - [x] Implement `calculate_cost(prompt_tokens, completion_tokens, model)` utility with current GPT-4 pricing rates
  - [x] Add error handling for OpenAI API failures including rate limits and timeouts
  - [x] Add logging for all OpenAI API calls capturing model, tokens, cost, and latency metrics
- [x] Create health check endpoint `GET /api/v1/ai/health` testing OpenAI connectivity and model availability

### Unit 2: Agent-User Database Schema

- [x] Create Supabase migration file with timestamp naming convention
- [x] Add columns to `user_profile`: agent_user_id (UUID FK), agent_credentials_encrypted (TEXT), agent_created_at (TIMESTAMP), agent_last_used_at (TIMESTAMP)
  - [x] Add index on `agent_user_id` for performant lookups
  - [x] Add NOT NULL constraint on `agent_user_id` ensuring every user has agent-user
  - [x] Add CHECK constraint validating encrypted credentials have minimum length
- [x] Update RLS policies to allow users reading their agent metadata but not decrypting credentials
- [x] Create RLS policy restricting credential writes to service role only
- [x] Write migration rollback script for safe reversal
- [x] Document schema changes in project database documentation
- [x] Update TypeScript types excluding sensitive fields from frontend exposure

### Unit 3: Credential Encryption Service

- [x] Install cryptography package and add to requirements.txt
- [x] Extend `backend/app/core/config.py` with ENCRYPTION_KEY setting from environment (base64-encoded Fernet key)
- [x] Create script to generate secure encryption key in `scripts/generate_encryption_key.py`
- [x] Prompt user to run `python scripts/generate_encryption_key.py` and add output to `backend/.env`
- [x] Create `backend/app/core/encryption.py` module
  - [x] Implement `get_fernet()` function returning cached Fernet cipher instance
  - [x] Implement `encrypt_password(password: str)` function returning base64-encoded ciphertext
  - [x] Implement `decrypt_password(encrypted: str)` function returning plaintext password
  - [x] Implement `rotate_encryption(old_key, new_key)` function for future key rotation scenarios
  - [x] Add comprehensive error handling for invalid ciphertexts and key errors
  - [x] Implement logging that never exposes plaintext passwords or encryption keys
- [x] Write unit tests for encrypt/decrypt round-trips and error scenarios
- [x] **Security Checklist:**
  - [x] Encryption key stored only in environment variable
  - [x] Encryption key never logged or exposed in error messages
  - [x] Plaintext passwords never logged anywhere
  - [x] Fernet provides authenticated encryption preventing tampering

### Unit 4: Agent-User Creation on Signup

- [x] Extend `backend/app/api/routes/auth.py` signup endpoint with agent creation logic
  - [x] After human user creation, generate agent email using pattern `agent_{user_id}@code45.internal`
  - [x] Generate cryptographically secure random password for agent (32+ characters)
  - [x] Use Supabase admin client to create agent auth account via `auth.sign_up()`
  - [x] Encrypt agent password using encryption service from Unit 3
  - [x] Store encrypted credentials in `user_profile` table using admin client to bypass RLS
  - [x] Implement transaction wrapper ensuring atomicity (rollback human user if agent creation fails)
  - [x] Add comprehensive audit logging for successful and failed agent creations
- [x] Update signup response model to include `agentCreated: boolean` field
- [x] Add error handling with safe messages that never expose credentials
- [x] Write integration test verifying two auth.users created and credentials stored encrypted

### Unit 5: Agent Authentication Service

- [x] Create `backend/app/services/agent_auth.py` module
  - [x] Implement `authenticate_agent_user(user_id: str)` function that retrieves and decrypts agent credentials then authenticates via Supabase
  - [x] Implement session caching using in-memory dictionary with expiry tracking
  - [x] Implement `get_agent_client(user_id: str)` function returning RLS-enforced Supabase client with agent token
  - [x] Attach `user_id` and `agent_user_id` attributes to client for audit logging
  - [x] Implement automatic token refresh when cached session expires
  - [x] Implement `revoke_agent_session(user_id)` function for logout scenarios
  - [x] Update `agent_last_used_at` timestamp in user_profile on each authentication
  - [x] Add comprehensive logging including authentication attempts, successes, failures with request IDs
  - [x] Add error handling for missing credentials, decryption failures, auth failures
- [x] Write integration tests verifying agent authentication and RLS enforcement

---

PAUSE

### AI PROMPT: Phase 1 Validation - OpenAI Integration & Agent-User Foundation

```
Help me validate Phase 1 completion (Units 1-5):

1. Start backend server: python -m uvicorn app.main:app --reload from backend/ directory
2. Test OpenAI connectivity via health check endpoint: GET http://localhost:8000/api/v1/ai/health
3. Run encryption service unit tests to verify encrypt/decrypt works
4. Test signup with agent creation using new test user email
5. Verify in Supabase Studio Authentication tab: two users created (human + agent with email pattern agent_{uuid}@code45.internal)
6. Verify in Supabase Studio user_profile table: agent_user_id populated and credentials encrypted
7. Test agent authentication by calling get_agent_client() with a real user_id
8. Verify agent client has user_id and agent_user_id attributes attached
9. Confirm RLS enforcement by testing agent client can only access owning user's data

After validation:
- Show me test results for all Phase 1 components
- Ask me to confirm all tests pass before proceeding to Phase 2

Mark Phase 1 complete in Beast_Mode_Agent_SDK_PRD.md. Wait for approval before starting Phase 2 (Responses API Implementation).
```

---

## Phase 2: Responses API with Multi-Turn Function Calling (Units 6-8)

### AI PROMPT: Phase 2 Implementation (Units 6-8)

```
Implement Phase 2: OpenAI Responses API integration with multi-turn function calling for natural language database queries.

**Core Architecture**
- **Pattern**: Multi-turn function calling (NOT structured outputs)
- **Official Docs**: https://platform.openai.com/docs/api-reference/responses/create
- **Function Calling Guide**: https://platform.openai.com/docs/guides/function-calling
- **Key Flow**: User query → LLM decides if data needed → Calls query_database tool → Execute SQL → Send results to LLM → LLM formats natural response

**Implementation Requirements**

Unit 6 - Data Models:
- Create `backend/app/models/responses_api.py` with QueryResult, TokenUsage, QueryType models
- QueryResult has: success, query_type, generated_sql (optional), explanation, results, row_count, token_usage, cost

Unit 7 - Tools Module (Simple Functional Approach):
- Create `backend/app/tools/database_tools.py` with QUERY_DATABASE_TOOL dict following OpenAI spec
- Tool definition: `{"type": "function", "name": "query_database", "description": "...", "parameters": {...}}`
- Parameters: sql (string), explanation (string) - both required
- Create `execute_query_database(agent_client, sql, explanation)` function handler
- SQL validation: Only SELECT allowed, block DROP/ALTER/CREATE, require LIMIT
- SQL execution: Parse query, execute via `agent_client.table().select()` (NO RPC functions)
- Export ALL_TOOLS list and TOOL_HANDLERS dict in `__init__.py`

Unit 7 - Responses Service:
- Create `backend/app/services/responses_service.py` importing tools module
- Implement `process_query_request(agent_client, user_query)` with multi-turn flow:
  * Turn 1: Call `client.responses.create(tools=ALL_TOOLS, tool_choice="auto")`
  * Parse response.output for function_call items (check both top-level AND nested in messages)
  * If no tool calls: Extract output_text and return (conversational)
  * If tool calls: Execute via `TOOL_HANDLERS[tool_name](agent_client, **args)`
  * Turn 2: Call `client.responses.create(previous_response_id=..., input=tool_results)`
  * LLM sees actual data and formats natural language response
- System instructions: Explain database schema, when to use query_database tool
- Token tracking: Sum tokens from both API calls
- Logging: Log Turn 1, tool calls, SQL execution, Turn 2 completion

Unit 8 - API Endpoint:
- Create `POST /api/v1/ai/query` in `backend/app/api/routes/ai.py`
- Get authenticated user, get agent client for RLS enforcement
- Call `process_query_request()` and return QueryResult
- Rate limiting: 10 queries/minute per user
- Error handling with APIError pattern (code="...", message="...", status_code=...)

**Critical Implementation Details**
1. ResponseFunctionToolCall attributes: `.name`, `.arguments`, `.call_id` (NOT nested under `.function`)
2. Function calls can be top-level `response.output` items OR nested in message.content
3. Parse SQL to extract table/columns/LIMIT, execute via PostgREST (RLS automatic)
4. WHERE clause parsing complex - log but don't apply (note in comments)
5. Tool results format: `{"type": "function_call_output", "call_id": "...", "output": json.dumps(...)}`

**Testing Prerequisites**
- MUST use user account created AFTER Phase 1 (has agent_user_id)
- Existing users (created before or during Phase 1) don't have agent credentials - create new account
- Request learner to verify agent_user_id populated in user_profiles table

**Validation Tests**
- Conversational: "How are you?" → No tool call, explanation only
- Data query: "Show me all ideas" → Tool call → SQL execution → Natural language response
- Unsafe: "Delete all ideas" → LLM refuses, no tool call
- RLS: Results only include authenticated user's data
- Logs show: Turn 1 → Tool call → SQL execution → Turn 2

Mark completed tasks [x] in PRD. Await approval before Phase 3.
```

### Unit 6: Pydantic Models for Responses API

- [x] Create `backend/app/models/responses_api.py` module
- [x] Define `QueryType` enum with values: SQL_GENERATION, SUMMARIZATION
- [x] Define `QueryResult` Pydantic model:
  - [x] `success: bool` - operation success status
  - [x] `query_type: QueryType` - type of query processed
  - [x] `generated_sql: Optional[str]` - SQL query if applicable (None for conversations)
  - [x] `explanation: str` - LLM's natural language response
  - [x] `results: List[Dict[str, Any]]` - database query results
  - [x] `row_count: int` - number of results returned
  - [x] `token_usage: Optional[TokenUsage]` - tokens consumed
  - [x] `cost: Optional[float]` - estimated API cost
- [x] Define `TokenUsage` model with prompt_tokens, completion_tokens, total_tokens
- [x] Define `SQLQueryRequest` model for user queries with natural language question
- [x] Write unit tests for model validation

### Unit 7: Responses API Service with Multi-Turn Function Calling

**Architecture**: Multi-turn function calling (NOT structured outputs). Simple functional approach with no abstract classes.

- [x] **Tools Module** (`backend/app/tools/`)

  - [x] `database_tools.py`:
    - [x] QUERY_DATABASE_TOOL dict following OpenAI function spec: `{"type": "function", "name": "query_database", "description": "...", "parameters": {"type": "object", "properties": {...}}}`
    - [x] Parameters: sql (string, required), explanation (string, required)
    - [x] `execute_query_database(agent_client, sql, explanation)` handler function (NOT a class method)
    - [x] SQL validation: Block DROP/ALTER/CREATE/UPDATE/DELETE, require SELECT, enforce LIMIT (default 50)
    - [x] SQL execution via PostgREST query builder: Parse table name, columns, ORDER BY, LIMIT
    - [x] **CRITICAL - ORDER BY Syntax**: Use correct Supabase Python client syntax:
      - [x] For DESC: `query.order(column, desc=True)` (NOT `query.order("column.desc")`)
      - [x] For ASC: `query.order(column)` or `query.order(column, desc=False)`
      - [x] Old PostgREST v1 syntax causes parsing errors: "failed to parse order (column.desc.asc)"
      - [x] Add debug logging to show ORDER BY detection and application
    - [x] WHERE clause: Log if detected but do NOT apply (PostgREST filter conversion too complex)
    - [x] Return format: `{"success": bool, "results": list, "row_count": int}` or `{"success": False, "error": str}`
  - [x] `__init__.py`: Export ALL_TOOLS list (contains tool dicts) and TOOL_HANDLERS dict (maps tool names to handler functions)

- [x] **Responses Service** (`backend/app/services/responses_service.py`)

  - [x] Import tools: `from ..tools import ALL_TOOLS, TOOL_HANDLERS`
  - [x] `build_schema_context()`: Returns string describing ideas table schema (columns, types, sample queries)
  - [x] `process_query_request(agent_client, user_query, conversation_history=None, temperature=0.7, max_tokens=2000)` multi-turn flow:
    - [x] **Conversation History Support**: Accept `conversation_history` (list of {role, content} dicts) to provide context from previous messages
    - [x] Build messages array: Include last 10 conversation history messages + current query for contextual awareness
    - [x] **Settings Integration**: Accept `temperature` and `max_tokens` parameters to allow user-configurable AI behavior
    - [x] **Turn 1**: `client.responses.create(instructions=[...], input=messages_array, tools=ALL_TOOLS, tool_choice="auto", temperature=temperature, max_output_tokens=max_tokens)`
    - [x] Parse `response.output` for function_call items - check BOTH top-level output items AND nested in message.content items
    - [x] **Critical**: ResponseFunctionToolCall attributes are `.name`, `.arguments`, `.call_id` directly (NOT `.function.name`)
    - [x] If no tool calls detected: Extract output_text from message items, return conversational response
    - [x] If tool calls detected: Execute via `TOOL_HANDLERS[tool_call.name](agent_client, **json.loads(tool_call.arguments))`
    - [x] Build tool_results list: `[{"type": "function_call_output", "call_id": tool_call.call_id, "output": json.dumps(result)}]`
    - [x] **Turn 2**: `client.responses.create(previous_response_id=response.id, input=tool_results)`
    - [x] LLM sees actual data and formats natural language response
    - [x] Sum token usage from both API calls: `turn1_tokens + turn2_tokens`
  - [x] System instructions: Database schema context, when to use query_database tool, conversational fallback guidelines
  - [x] Comprehensive logging: Turn 1 completion, tool call detection, SQL execution, Turn 2 completion, token counts
  - [x] Error handling: API failures, tool execution errors, JSON parsing errors

- [x] **Implementation completed and working**:
  - [x] Multi-turn conversation flow operational
  - [x] LLM successfully calls tools when needed
  - [x] SQL execution via PostgREST with RLS enforcement
  - [x] Natural language responses include actual data
  - [x] Token tracking across both turns

### Unit 8: Responses API Endpoint

- [x] Create `POST /api/v1/ai/query` endpoint in `backend/app/api/routes/ai.py`
- [x] Import logger: `from ..core.logging import get_logger` and initialize: `logger = get_logger(__name__)`
- [x] Request handling:
  - [x] Extract `SQLQueryRequest` from request body (includes conversation_history, settings)
  - [x] Get authenticated user via Session 2 auth dependency
  - [x] Get agent client: `get_agent_client(user_id)` for RLS-enforced access
  - [x] **Conversation History Logging**: Log received conversation history count and message previews for debugging
  - [x] **Settings Extraction**: Extract temperature and max_tokens from request.settings (use defaults 0.7, 2000 if not provided)
- [x] Process query:
  - [x] Call `process_query_request(agent_client, user_query, conversation_history, temperature, max_tokens)`
  - [x] Return `QueryResult` with explanation, results, SQL, token usage, cost
- [x] Rate limiting: 10 queries/minute per user (in-memory tracking)
- [x] Request ID tracking via middleware for audit trail
- [x] Error handling with APIError pattern (code="...", message="...", status_code=...)
- [x] OpenAPI documentation for endpoint
- [x] Endpoint tests:
  - [x] Conversational queries ("How are you?") → No tool call
  - [x] Data queries ("Show me all ideas") → Tool call + SQL execution
  - [x] Unsafe requests ("Delete all") → LLM refuses
  - [x] Rate limiting enforcement
  - [x] RLS verification (user sees only their data)

---

**PAUSE**

---

## Phase 3: Frontend Chat Interface for Responses API (Units 9-14)

### AI PROMPT: Phase 3 Implementation (Units 9-14)

```
Implement Phase 3: Frontend Chat Interface for Responses API.

**CRITICAL PREREQUISITE - Agent-User Required**
- MUST use account created AFTER Phase 1 (agent-users created during signup)
- Existing users lack agent credentials - sign up with NEW email to test
- Ask learner to verify: user_profiles table has agent_user_id populated

**Unit 9 - Redux State (frontend/src/store/chatSlice.ts)**
- ChatState: messages[], loading, error, token_usage
- Message type: id, role (user/assistant), content, timestamp, metadata (tokens, cost)
- Reducers: addMessage, setLoading, setError, clearMessages, updateTokenUsage
- sendQuery async thunk → POST /api/v1/ai/query
- Optimistic update: Add user message before API call
- Selectors: messages, loading, totalTokens, totalCost
- Integrate into root store

**Unit 10 - Chat Service (frontend/src/services/chatService.ts)**
- Interfaces: QueryRequest, QueryResult (match backend models)
- sendQuery(query: string) → POST /api/v1/ai/query with error handling
- getConversationHistory() placeholder for future persistence

**Unit 11 - Chat Interface (frontend/src/components/chat/ChatInterface.tsx)**
- Install shadcn components: `npx shadcn@latest add scroll-area textarea alert`
- Layout: ScrollArea for messages, Textarea + Button for input
- useChat() hook wrapping Redux actions/selectors
- User vs assistant message styling (alignment, colors)
- Loading indicator, auto-scroll on new message
- Empty state with example queries
- Keyboard shortcut: Cmd/Ctrl+Enter to send
- Mobile responsive

**Unit 12 - Message Components**
- MessageCard.tsx: User (right-aligned) vs assistant (left-aligned, SQL code block with syntax highlighting)
- Timestamp (relative format), copy-to-clipboard for SQL
- Metadata section (tokens, cost) expandable
- QueryResultsTable.tsx: shadcn Table with headers, pagination for large results
- Accessibility: ARIA labels, keyboard navigation

**Unit 13 - Floating Drawer Pattern (NO /chat route)**
- Install: `npx shadcn@latest add sheet`
- FloatingChatButton.tsx: Fixed bottom-right (`fixed bottom-4 right-4 z-50`), MessageSquare icon
- ChatDrawer.tsx: Sheet with side="right", width `w-full md:w-[500px]`
- Header: "AI Assistant" title, token/cost display
- Integrate FloatingChatButton into UserLayout.tsx (appears on all authenticated pages)
- NO dedicated /chat page or route

**Unit 14 - Polish**
- Clear conversation button with confirmation dialog
- Example queries as clickable chips
- Token/cost totals in drawer header
- Toast notifications for success/errors

**Validation**
- E2E: Send query → Receive response with SQL + explanation + results
- RLS: User A sees only their data
- Safety: Dangerous queries rejected by LLM
- Rate limiting: 11th query within minute rate-limited
- UI/UX: Mobile responsive, keyboard shortcuts, copy-to-clipboard
- Accessibility: Keyboard navigation, screen reader compatibility

Mark tasks [x] in PRD. Show key files (chatSlice.ts, chatService.ts, ChatInterface.tsx, ChatDrawer.tsx) for review. Await approval before PART B.
```

### Unit 9: Redux Chat Slice

- [x] Create `frontend/src/store/chatSlice.ts` module
- [x] Define `ChatState` interface with messages array, loading state, error, token usage, settings (temperature, maxTokens)
- [x] Define `Message` type with id, role (user/assistant), content, timestamp, metadata (tokens, cost)
- [x] Define `ChatSettings` type with temperature (0.0-2.0, default 0.7) and maxTokens (100-8192, default 2000)
- [x] Create slice with reducers: addMessage, setLoading, setError, clearMessages, updateTokenUsage, updateSettings
- [x] Create `sendQuery` async thunk calling `/api/v1/ai/query` endpoint
  - [x] **Conversation History**: Extract last 10 messages from state and include as conversationHistory in API request
  - [x] **Settings Integration**: Include current temperature and maxTokens settings in API request
  - [x] **Client-side Logging**: Log conversation history count, current query, and settings to browser console for debugging
  - [x] Implement optimistic update adding user message immediately before API call
  - [x] Implement thunk fulfilled handler adding assistant response to messages
  - [x] Implement error handling storing error message in state
- [x] Add selectors for messages, loading state, total tokens used, total cost
- [x] Export actions and reducer
- [x] Integrate chat reducer into root store configuration
- [x] Write tests for reducers and async thunk lifecycle

### Unit 10: Chat Service Layer

- [x] Create `frontend/src/services/chatService.ts` module
- [x] Define TypeScript interfaces matching backend models:
  - [x] `Message` interface: {role: "user" | "assistant", content: string}
  - [x] `QuerySettings` interface: {temperature?: number, maxTokens?: number}
  - [x] `QueryRequest`: {query, conversationHistory?, settings?, schemaContext?, includeExplanation?}
  - [x] `QueryResult`: {success, queryType, generatedSql, explanation, results, rowCount, tokenUsage, cost, warnings, error}
- [x] Implement `sendQuery(query: string, options?: {conversationHistory?, settings?})` function calling POST `/api/v1/ai/query`
  - [x] **HTTP Request Logging**: Log full request body including conversation history and settings to browser console
  - [x] Include conversationHistory and settings in request body
- [x] Implement response parsing and validation
- [x] Add error handling with user-friendly error messages
- [x] Implement `getConversationHistory()` function (placeholder for future persistence)
- [x] Add logging for debugging (client-side console logs in development only)
- [x] Export all service functions
- [x] Write service layer tests mocking apiClient

### Unit 11: ChatInterface Component

**IMPORTANT - Install Missing shadcn/ui Components:**

Before creating the ChatInterface component, you must manually install the required shadcn/ui components using the official CLI. The AI assistant should guide the learner to run these commands in the `frontend/` directory:

```bash
cd frontend
npx shadcn@latest add table alert scroll-area textarea sheet drawer slider tooltip
```

**Why manual installation?**

- shadcn/ui components should always be installed via the official CLI, not created manually
- The CLI ensures correct dependencies, proper configuration, and up-to-date component code
- Manual component creation risks version mismatches and missing Radix UI dependencies

**After running the CLI command:**

- [x] Verify `src/components/ui/table.tsx` was created
- [x] Verify `src/components/ui/alert.tsx` was created
- [x] Verify `src/components/ui/scroll-area.tsx` was created
- [x] Verify `src/components/ui/textarea.tsx` was created
- [x] Verify `src/components/ui/sheet.tsx` was created
- [x] Verify `src/components/ui/drawer.tsx` was created
- [x] Verify `src/components/ui/slider.tsx` was created
- [x] Verify `src/components/ui/tooltip.tsx` was created

**Component Implementation Tasks:**

- [x] Create `frontend/src/components/chat/ChatInterface.tsx` component
- [x] Implement layout with message list area and input area using shadcn Card and ScrollArea
- [x] Create `useChat()` custom hook wrapping Redux actions and selectors
- [x] Implement message rendering with distinct styling for user vs assistant messages
- [x] Create input field using shadcn Textarea with send button
- [x] Implement send handler dispatching `sendQuery` thunk and clearing input
- [x] Add loading indicator during API call (disable input, show thinking animation)
- [x] Implement auto-scroll to latest message on new message arrival
- [x] Add empty state when no messages exist with helpful prompt examples
- [x] Implement error display using shadcn Alert component
- [x] Add keyboard shortcut (Cmd/Ctrl+Enter) to send message
- [x] Make component responsive for mobile screens
  - [x] Write component tests for user interactions

### Unit 12: Message Display Components

- [x] Create `frontend/src/components/chat/MessageCard.tsx` component
  - [x] Implement different layouts for user vs assistant messages (alignment, colors)
  - [x] Add avatar or icon indicating message sender
  - [x] Display timestamp in relative format (e.g., "2 minutes ago")
  - [x] Show SQL query in code block with syntax highlighting for assistant responses
  - [x] Display explanation text clearly separated from query
  - [x] Show metadata (tokens used, cost) in collapsed section expandable on click
  - [x] Add copy-to-clipboard button for SQL queries
- [x] Create `frontend/src/components/chat/QueryResultsTable.tsx` for displaying data results
  - [x] Implement table with column headers from database response
  - [x] Add row limit with "show more" pagination if results exceed limit
  - [x] Style using shadcn Table component
- [x] Make components accessible (ARIA labels, keyboard navigation)
- [x] Write component tests

### Unit 13: Floating Chat Button & Drawer Integration

**IMPORTANT - Install Missing shadcn/ui Components:**
Before creating the chat drawer, ensure the required shadcn/ui drawer/sheet component(s) are present:

**Chat UX Pattern:**

- **NO dedicated /chat page** - users should not navigate away from their current context
- **Floating button** - persistent in bottom right corner on all authenticated pages
- **Sheet/Drawer** - chat opens in right-side drawer with full viewport height when button clicked
- **Global access** - chat available from any authenticated page without navigation

**Component Implementation Tasks:**

- [x] Create `frontend/src/components/chat/FloatingChatButton.tsx` component
  - [x] Implement floating button fixed to bottom-right corner (e.g., `fixed bottom-4 right-4 z-50`)
  - [x] Use MessageSquare icon from lucide-react with badge showing unread count (future)
  - [x] Add hover animation and accessible button label
  - [x] Implement onClick handler to open chat drawer
  - [x] Make button responsive (hide on very small screens if needed)
- [x] Create `frontend/src/components/chat/ChatDrawer.tsx` component wrapping ChatInterface
  - [x] Use shadcn Sheet component with side="right" for right-side drawer
  - [x] Set drawer width to appropriate size (e.g., `w-full md:w-[500px] lg:w-[600px]`)
  - [x] Drawer should span full viewport height
  - [x] Include Sheet header with "AI Assistant" title and close button
  - [x] Include token/cost display in drawer header
  - [x] Wrap ChatInterface component in Sheet content area
  - [x] Manage drawer open/closed state with React state
- [x] Integrate FloatingChatButton into `frontend/src/layouts/UserLayout.tsx`
  - [x] Render FloatingChatButton as persistent element in authenticated layout
  - [x] Ensure button appears on all authenticated pages (Dashboard, Ideas, Profile, Analytics)
  - [x] Pass drawer open/close handlers to FloatingChatButton
- [x] **Remove chat from navigation** - delete Chat link from Navigation.tsx
- [x] **Remove dedicated chat route** - delete /chat route from AppRoutes.tsx and Chat.tsx page file
- [x] Test drawer functionality: open, close, chat while on different pages
- [x] Test responsiveness: drawer should be full-width on mobile, partial-width on desktop
- [x] Write component tests for drawer interactions

### Unit 14: Responses API Polish & Testing

- [x] Add conversation clearing button to chat interface
- [x] Implement confirmation dialog before clearing chat history
- [x] Add example queries as clickable chips when chat is empty
- [x] Implement token/cost display in chat header showing session totals
- [x] Chat Settings Panel Implementation:
  - [x] Create `ChatSettings.tsx` component with Sheet/Drawer UI
  - [x] Add temperature slider (0.0-2.0, default 0.7) with live value display
  - [x] Add maxTokens slider (100-8192, default 2000) with live value display
  - [x] Connect sliders to Redux state via `updateSettings` action
  - [x] Include helpful descriptions for each setting
  - [x] Settings apply to all future queries immediately
  - [x] Add settings button to chat header/toolbar
- [x] Implement loading skeleton states for better perceived performance
- [x] Add toast notifications for successful query execution and errors
- [x] Write E2E test scenarios: send query, receive response, verify SQL generation, verify results display
- [x] Write test for rate limiting behavior from user perspective
- [x] Write test for RLS enforcement (user should only see their data)
- [x] Create user documentation for chat feature
- [x] Add inline help tooltips explaining how to ask questions effectively
- [x] Performance test: measure and optimize for large result sets
- [x] Accessibility audit and fixes

**Table Stakes Features - Critical for Production**:

- [x] **Conversation History (Context Awareness)**:

  - [x] Backend: `process_query_request()` accepts `conversation_history` parameter
  - [x] Backend: Build messages array with last 10 history messages + current query
  - [x] Frontend: Extract last 10 messages from Redux state in `sendQuery` thunk
  - [x] Frontend: Pass as `conversationHistory` in API request
  - [x] LLM maintains context across conversation turns (can reference previous queries/answers)
  - [x] Logging: Both frontend and backend log conversation history for debugging

- [x] **Settings Integration (User Control)**:

  - [x] Backend: Accept `temperature` and `max_tokens` parameters in `process_query_request()`
  - [x] Backend: Pass settings to both Turn 1 and Turn 2 OpenAI API calls
  - [x] Frontend: Store settings in Redux state (temperature: 0.7, maxTokens: 2000 defaults)
  - [x] Frontend: ChatSettings UI component with enabled sliders
  - [x] Frontend: Send current settings with every query

- [x] **Database Query Fixes**:
  - [x] Fix ORDER BY syntax: Use `query.order(column, desc=True)` instead of `query.order("column.desc")`
  - [x] Prevents PostgREST parsing errors on first query attempt
  - [x] Ensures queries work reliably on first try without retry needed

---

**PAUSE**

---

## Final Validation - PART A Complete

### AI PROMPT: Final Validation - PART A Complete (Responses API)

```
Let's validate PART A together - Responses API Implementation (Units 1-14).

**Phase 1 - Backend Foundation & Agent-User Setup**

*AI Assistant Actions:*
- Verify backend/.env contains OPENAI_API_KEY, OPENAI_MODEL, ENCRYPTION_KEY
- Run encryption service unit tests
- Check backend logs for any startup errors

*Please perform these manual checks:*
1. Start backend server: `python -m uvicorn app.main:app --reload --log-level info` from backend/
2. Verify server starts without errors (check terminal output)
3. Open Supabase Studio → Navigate to SQL Editor
4. Run migration verification: `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_profile';`
5. Confirm these columns exist: agent_user_id, agent_credentials_encrypted, agent_created_at, agent_last_used_at
6. Using frontend, create a NEW test user (email you haven't used before)
7. In Supabase Studio → Authentication tab: Confirm TWO users created (human + agent_{uuid}@code45.internal)
8. In Supabase Studio → Table Editor → user_profile:
   - Find your new user's row
   - Confirm agent_user_id is populated (UUID value)
   - Confirm agent_credentials_encrypted contains ciphertext (long base64 string, NOT readable password)
   - Confirm agent_created_at has timestamp
9. Confirm encryption working: The encrypted credentials should be unreadable gibberish

**Ask learner to advise when Phase 1 manual checks are complete. What was observed?**

---

**Phase 2 - Responses API with Multi-Turn Function Calling**

*AI Assistant Actions:*
- Verify responses_service.py implements multi-turn flow (Turn 1 → Tool execution → Turn 2)
- Verify tools module exports ALL_TOOLS and TOOL_HANDLERS
- Check database_tools.py blocks unsafe SQL (DROP, DELETE, ALTER, CREATE)

*Ask learner test these API scenarios:*
1. Start backend (if not already running)
2. Start frontend: `npm run dev` from frontend/
3. Login with your NEW test user (created in Phase 1)
4. Open browser DevTools → Network tab

**Test 1 - Simple Data Query:**
- Send query via API or UI: "Show me all my ideas"
- Expected response should include:
  * generated_sql: A SELECT statement
  * explanation: Natural language description
  * results: Array of your ideas (empty array if you have no ideas yet)
  * token_usage: {prompt_tokens: X, completion_tokens: Y, total_tokens: Z}
  * cost: Dollar amount (e.g., 0.0001)
- Check backend logs: Should show Turn 1 → Tool call → SQL execution → Turn 2
- **What SQL was generated? How many results returned?**

**Test 2 - Conversational Query:**
- Send query: "How are you today?"
- Expected: No generated_sql field (or null), only explanation with conversational response
- Backend logs should show no tool call (conversational path)
- **Did the LLM respond conversationally without calling query_database?**

**Test 3 - Unsafe Query:**
- Send query: "Delete all my ideas"
- Expected: LLM refuses OR backend blocks with error
- No DELETE statement should execute
- **What happened? Did LLM refuse, or did backend block it?**

**Test 4 - Rate Limiting:**
- Send 10 queries rapidly (any queries, use "Show me all ideas" repeatedly)
- All 10 should succeed
- Send 11th query immediately
- Expected: 429 error "Rate limit exceeded"
- **Did the 11th query get rate-limited?**

**Test 5 - RLS Enforcement:**
- As current user, send: "Show me all ideas"
- Note how many results returned (write down count)
- Logout, create SECOND new test user, login as that user
- Send same query: "Show me all ideas"
- Expected: Different results (or empty if second user has no ideas)
- **Did each user see only their own data?**

**Test 6 - Backend Logging:**
- Check backend terminal logs for a complete query
- You should see:
  * "Processing query request" with user_id and agent_user_id
  * "Turn 1: Calling OpenAI Responses API"
  * "Tool call detected: query_database"
  * "Executing SQL" with the generated query
  * "Turn 2: Sending results to LLM"
  * Token counts and cost
  * Request ID throughout
- **Do logs show the complete flow? Any errors?**

**Test 7 - Security Verification:**
- Check backend/.env file: Confirm ENCRYPTION_KEY is NOT committed to git (run `git status` - .env should be ignored)
- In Supabase Studio → user_profile table: Verify agent_credentials_encrypted is ciphertext (not plaintext password)
- In browser DevTools → Network tab: Click on a query response → Confirm no agent credentials in response body
- **Are credentials secure? Nothing exposed?**

**Tell me results of Phase 2 tests. Any failures or unexpected behavior?**

---

**Phase 3 - Frontend Chat Interface**

*AI Assistant Actions:*
- Verify chatSlice.ts integrated into root store
- Verify ChatInterface component exists and imports correctly
- Check for floating drawer pattern (no /chat route)

*Please test the chat UI:*
1. Ensure frontend running and you're logged in
2. Look for floating chat button in bottom-right corner (all authenticated pages)
3. Click the floating button
4. Expected: Right-side drawer opens with chat interface

**Test 8 - Empty State:**
- When drawer first opens, you should see:
  * Empty state message
  * Example queries as clickable chips
- **Do you see example queries? What are they?**

**Test 9 - Send Query Flow:**
- Type: "What ideas do I have?"
- Press Cmd/Ctrl+Enter (or click Send)
- Watch the sequence:
  1. Your message appears immediately (right-aligned)
  2. Loading indicator shows ("AI is thinking...")
  3. Assistant response appears (left-aligned) with:
     - SQL query in code block with syntax highlighting
     - Explanation text
     - Results table (if you have ideas)
     - Expandable metadata section
- **Does the flow work smoothly? What did the assistant respond?**

**Test 10 - Message Display:**
- User messages: Right-aligned with distinct background color?
- Assistant messages: Left-aligned with SQL code block?
- Timestamp shows relative time ("just now", "X minutes ago")?
- Click "Copy" button on SQL query → Check clipboard
- Expand metadata section → See token counts and cost?
- **Is message styling correct? Copy button working?**

**Test 11 - Clear Conversation:**
- Send 2-3 more queries to build history
- Click "Clear Conversation" button
- Expected: Confirmation dialog appears
- Click "Confirm"
- Expected: All messages cleared, empty state returns
- **Did conversation clear successfully?**

**Test 12 - Mobile Responsiveness:**
- Resize browser to 375px width (use DevTools device toolbar)
- Chat drawer should be full-width on mobile
- Messages should stack properly
- Input area and send button accessible
- **Is chat usable on mobile width?**

**Test 13 - Keyboard & Accessibility:**
- Press Tab repeatedly to navigate through chat interface
- All interactive elements should show focus indicators
- Try Cmd/Ctrl+Enter shortcut to send message
- **Does keyboard navigation work? Focus indicators clear?**

**Test 14 - Error Handling:**
- Stop the backend server (Ctrl+C in backend terminal)
- Try sending a query in the chat
- Expected: Error alert appears with message about connection failure
- Restart backend server
- Send query again
- Expected: Works normally
- **Did error display correctly? Recovery after restart?**

**Test 15 - Performance:**
- If you have many ideas (or create several), send: "Show me all my ideas"
- If result set is large (50+ rows), measure how long table takes to render
- Expected: < 2 seconds
- Check browser console for performance warnings
- **How did performance feel? Any console warnings?**

**Tell me results of Phase 3 tests. Any UI issues or unexpected behavior?**

---

**Final Summary**

*Please confirm:*
- [ ] Phase 1: Agent-users created automatically on signup, credentials encrypted in database
- [ ] Phase 2: Responses API working with multi-turn function calling, RLS enforced, rate limiting active
- [ ] Phase 3: Floating chat drawer functional, messages display correctly, mobile responsive
- [ ] Security: No credential leaks, encryption working, RLS preventing cross-user data access
- [ ] Performance: Query responses feel fast, UI responsive
- [ ] UX: Chat is accessible, error messages clear, keyboard shortcuts work

**If all validation passes, PART A (Responses API Implementation) is COMPLETE ✅**

We're ready to proceed to PART B (Agent SDK Implementation) when you're ready.

**If any tests failed, please tell me specifically what didn't work so we can fix it before moving forward.**
```

---

**END OF BEAST MODE PRD - PART A: RESPONSES API IMPLEMENTATION**

---

**Continue to Part B**: See `Beast_Mode_Agent_SDK_PRD_B.md` for Agent SDK implementation with tool-calling, multi-specialist architecture, and autonomous agent operations.
