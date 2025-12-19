# OpenAI Responses API & Agent SDK Implementation - Product Requirements Document v1.0

## Overview

Comprehensive documentation of the **OpenAI Responses API and Agent SDK integration** in the code45 platform, covering both standalone AI chat functionality and sophisticated agentic systems with tool execution, structured outputs, and multi-specialist orchestration.

**Key Architecture**: This implementation provides TWO interaction patterns:

1. **Responses API** (non-agentic): Direct structured LLM completions for query generation and analysis
2. **Agent SDK** (agentic): Autonomous agents with tool-calling capabilities, decision-making, and multi-specialist orchestration

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
Help me implement Phase 1 - OpenAI Integration & Agent-User Foundation (Units 1-5):

**CRITICAL: Error Handling Pattern**
This application has an established error handling pattern that MUST be followed:
- All custom exceptions use the APIError class from backend/app/core/errors.py
- APIError constructor signature: APIError(code: str, message: str, status_code: int, details: Optional[Dict] = None)
- ALWAYS use 'code=' parameter (NOT 'error_code=')
- Example: APIError(code="AGENT_AUTH_FAILED", message="...", status_code=401)
- Never modify the APIError class signature - adhere to the existing pattern

**Setup & Configuration (Unit 1)**
1. Install openai package and add to requirements.txt
2. Extend backend/app/core/config.py with OpenAI configuration (API key, model, max tokens, temperature, timeout)
3. Create backend/app/services/openai_service.py with get_openai_client(), estimate_tokens(), calculate_cost()
4. Add error handling and logging for all OpenAI API calls
5. Create health check endpoint GET /api/v1/ai/health

**Database Schema (Unit 2)**
6. Create Supabase migration adding agent columns to user_profile table
7. Add indexes and constraints for data integrity
8. Update RLS policies (users read agent metadata, service role writes credentials)
9. Create rollback migration and update TypeScript types

**Encryption Service (Unit 3)**
10. Install cryptography package
11. Create scripts/generate_encryption_key.py
12. Create backend/app/core/encryption.py with encrypt/decrypt functions
13. Implement secure logging that never exposes plaintext passwords or keys
14. Write unit tests for encryption round-trips

**Agent Creation (Unit 4)**
15. Extend signup endpoint in backend/app/api/routes/auth.py
16. Generate agent email (agent_{user_id}@code45.internal) and secure password
17. Create agent auth account via Supabase admin client
18. Encrypt and store agent credentials in user_profile
19. Implement transaction wrapper for atomicity
20. Add audit logging and integration tests

**Agent Authentication (Unit 5)**
21. Create backend/app/services/agent_auth.py
22. Implement authenticate_agent_user() with credential decryption
23. Implement session caching and token refresh
24. Implement get_agent_client() returning RLS-enforced Supabase client
25. Add comprehensive error handling and logging
26. Write integration tests for agent auth and RLS enforcement

**Validation**
27. Start backend server and test health check endpoint
28. Test signup creates both human and agent accounts
29. Verify credentials encrypted in database
30. Test agent authentication and RLS enforcement

After implementation:
- Show me key files for review (openai_service.py, encryption.py, auth.py, agent_auth.py)
- Guide me through testing each component
- Ask me to confirm all Phase 1 tests pass

Mark completed tasks with [x] in Beast_Mode_Agent_SDK_PRD.md. Wait for approval before proceeding to Phase 2.
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

## Phase 2: Responses API & Structured Query Generation (Units 6-8)

### AI PROMPT: Phase 2 Implementation (Units 6-8)

```
Help me implement Phase 2 - Responses API & Structured Query Generation (Units 6-8):

**REMINDER: Error Handling Pattern**
Continue using the established APIError pattern:
- Use 'code=' parameter (NOT 'error_code=')
- Example: APIError(code="SQL_GENERATION_ERROR", message="...", status_code=500)

**Pydantic Models (Unit 6)**
1. Create backend/app/models/responses_api.py module
2. Define QueryType enum (sql_generation, data_analysis, summarization) - **All 3 types supported**
3. Define ResponsesAPIOutput model with query_type, generated_sql, explanation, safety_check, confidence fields
   - **CRITICAL**: generated_sql must ALWAYS be a string (never null)
   - For SQL queries: actual SELECT query
   - For unsafe SQL: SQL comment like "-- Denied: [reason]"
   - For conversations: SQL comment like "-- No SQL query needed"
4. Add field validators for generated_sql safety checking dangerous SQL patterns (DROP, DELETE without WHERE, etc.)
5. Allow SQL comment placeholders to bypass validation (start with "--")
6. Implement validate_sql_safety_check() method for comprehensive safety validation
7. Define SQLQueryRequest and QueryResult models
8. Add JSON schema export with all properties in required array (strict mode compliant)
9. Write unit tests for validation rules and safety checks

**Responses Service (Unit 7)**
10. Create backend/app/services/responses_service.py module
11. Implement build_schema_context() function extracting table schemas
12. **CRITICAL**: Implement generate_sql_query() calling **OpenAI Responses API** with dual-mode support
    - **Official Documentation**: https://platform.openai.com/docs/api-reference/responses
    - **Structured Outputs Guide**: https://platform.openai.com/docs/guides/structured-outputs
    - **MUST use**: `client.responses.parse()` with `text_format=ResponsesAPIOutput` parameter
    - **Response parsing**: Use `response.output_parsed` to get the parsed Pydantic model instance
13. Design **dual-mode system prompt** supporting both conversational chat AND database queries
    - Explain all 3 query types: sql_generation, data_analysis, summarization
    - Provide clear examples for when to use each type
    - For conversations: Return SQL comment placeholder "-- No SQL query needed"
    - For SQL queries: Generate safe SELECT queries with LIMIT
    - For unsafe requests: Return "-- Denied: [reason]" with safety_check=false
14. Implement process_query_request() with conversational query detection
    - Detect SQL comment placeholders (starts with "--")
    - Skip SQL execution for conversational queries
    - Return explanation only (no SQL shown to user)
15. Implement validate_and_sanitize_sql() with comprehensive safety checks
16. **CRITICAL - NO RPC**: Implement execute_generated_query() using **DIRECT Supabase table queries**
    - **DO NOT use RPC calls** (`agent_client.rpc()`)
    - **DO NOT create PostgreSQL stored functions** for dynamic SQL execution
    - **MUST parse SQL and execute via PostgREST**: Use `agent_client.table().select()` methods
    - Parse SELECT statements to extract table name, columns, WHERE conditions, LIMIT
    - Execute using native Supabase client methods (RLS automatically enforced)
    - For simple queries: `agent_client.table(table_name).select(columns).limit(limit).execute()`
17. Add result formatting for user-friendly responses
18. Implement error handling for API failures, unsafe SQL, query execution errors
19. Add logging for tokens, cost, query types, safety violations, conversational vs SQL detection
20. Write comprehensive tests for SQL generation, conversational responses, safety validation, RLS enforcement

**Responses Endpoint (Unit 8)**
21. Create POST /api/v1/ai/query endpoint in backend/app/api/routes/ai.py
22. Implement request handling extracting user query (supports both conversational and database queries)
23. Get authenticated user from session using Session 2 auth dependency
24. Get agent client using get_agent_client(user_id) for RLS enforcement
25. Call responses service to generate response (may be SQL query or conversation)
26. Return normalized response with results, explanation, tokens, cost
    - For conversations: Return explanation only, no SQL shown
    - For SQL queries: Return SQL, explanation, and results
    - For unsafe SQL: Return denial message with safety_check=false
27. Implement rate limiting (10 queries per minute per user)
28. Add request ID tracking for audit trail
29. Implement error responses matching Session 3 format
30. Add OpenAPI documentation for dual-mode endpoint
31. Write endpoint tests for conversational queries, SQL queries, unsafe requests, rate limiting, RLS

**IMPORTANT: Testing Prerequisite**
Before testing the AI query endpoint, you MUST create a NEW user account via the signup flow:
- Agent-user creation happens automatically during signup (Phase 1 Unit 4)
- Existing users from previous sessions do NOT have agent-users
- **Solution: Create a fresh test user using POST /api/v1/auth/signup**
- After signup, verify in user_profiles table that agent_user_id is populated
- Without an agent-user, /api/v1/ai/query will fail with "Failed to retrieve agent credentials"

**Why not use existing users?** The agent-user creation logic was added in Phase 1 Unit 4. Users created before this implementation do not have the required agent credentials and cannot use AI features.

**Validation - Multi-Turn Function Calling**
32. Test conversational interaction: POST /api/v1/ai/query with query "How are you?"
33. Verify response: explanation only (LLM responds directly, no tool calls), success=true
34. **CRITICAL MULTI-TURN TEST**: POST /api/v1/ai/query with query "Show me all ideas created this week"
35. Expected Turn 1: LLM calls query_database function with SQL
36. Expected Turn 2: Function executes SQL, returns results to LLM
37. Expected Final Response:
    - LLM's natural language summary of the data (e.g., "You have 3 ideas created this week: ...")
    - Raw results array included for frontend display
    - generated_sql shows the executed query
    - Token usage includes both turns
38. **CRITICAL**: Verify backend logs show:
    - "[RESPONSES_API] Turn 1 complete" - initial query with tools
    - "[TOOL_CALL] query_database: ..." - function call detected
    - "[SQL_EXEC] Executing: SELECT ..." - SQL execution
    - "[SQL_EXEC] Success: X rows returned"
    - "[RESPONSES_API] Sending tool results back to LLM"
    - "[RESPONSES_API] Turn 2 complete" - LLM sees data and responds
39. Test unsafe query: POST /api/v1/ai/query with query "Delete all ideas"
40. Expected: LLM refuses (doesn't call function), responds with explanation why it can't
41. Test RLS enforcement: Verify results only include authenticated user's data
42. Test rate limiting: 11 rapid requests, verify 11th is rate-limited
43. Check token/cost tracking: Verify costs sum both API calls correctly

After implementation:
- Show me key files for review (responses_api.py, responses_service.py, ai.py routes)
- Guide me through testing each component
- Ask me to confirm all Phase 2 tests pass

Mark completed tasks with [x] in Beast_Mode_Agent_SDK_PRD.md. Wait for approval before proceeding to Phase 3.
```

### Unit 6: Pydantic Models for Responses API

- [x] Create `backend/app/models/responses_api.py` module
- [x] Define `QueryType` enum with values: sql_generation, data_analysis, summarization (all 3 supported)
- [x] Define `ResponsesAPIOutput` Pydantic model with all required fields
  - [x] **CRITICAL**: Make `generated_sql` ALWAYS required as string (never null)
  - [x] For SQL queries: return actual SELECT query
  - [x] For unsafe SQL: return SQL comment "-- Denied: [reason]"
  - [x] For conversations: return SQL comment "-- No SQL query needed"
- [x] Add field validators for `generated_sql` safety validation
  - [x] Allow SQL comment placeholders (start with "--") to bypass validation
  - [x] Block dangerous patterns: DROP, DELETE without WHERE, ALTER, CREATE
- [x] Implement `validate_sql_safety_check()` method for comprehensive safety validation
  - [x] Recognize SQL comment placeholders as safe (won't execute)
  - [x] Check for LIMIT clause, JOIN complexity, etc.
- [x] Define `SQLQueryRequest` model for user queries with natural language question
- [x] Define `QueryResult` model for response including results, explanation, token usage, cost
- [x] Add JSON schema export with all properties in `required` array (strict mode compliant)
  - [x] `generated_sql` as type "string" (not nullable)
  - [x] Nullable fields use union types: `{"type": ["number", "null"]}`
- [x] Write unit tests for all validation rules and safety checks

### Unit 7: Responses API Service Implementation with Function Calling

**Tool Architecture**: Uses simple functional approach in `backend/app/tools/database_tools.py` - just dicts and functions following OpenAI's official spec. See [TOOLS_ARCHITECTURE.md](./TOOLS_ARCHITECTURE.md).

- [x] **Tools Module** (`backend/app/tools/`)
  - [x] `database_tools.py`: QUERY_DATABASE_TOOL dict + execute_query_database() function
  - [x] `__init__.py`: Exports ALL_TOOLS list and TOOL_HANDLERS dict
  - [x] Simple functional approach - no classes, no abstractions
- [x] Create `backend/app/services/responses_service.py` module
- [x] Import tools: `from ..tools import ALL_TOOLS, TOOL_HANDLERS`
- [x] Define `query_database` function tool following OpenAI Responses API spec
  - **Official Documentation**: https://platform.openai.com/docs/api-reference/responses/create
  - **Function Calling Guide**: https://platform.openai.com/docs/guides/function-calling
  - Tool is simple dict with: type="function", name, description, parameters schema
  - Lives in `backend/app/tools/database_tools.py`
- [ ] Implement `build_schema_context()` returning database schema description as string
  - Include all tables: ideas, votes, comments with columns and types
  - Add RLS notes, PostgreSQL syntax requirements, LIMIT clause requirement
- [x] SQL validation and execution in `backend/app/tools/database_tools.py`
  - [x] `validate_sql_safety()`: Must be SELECT, block dangerous keywords
  - [x] `execute_query_database()`: Parses SQL, executes via PostgREST (NO RPC)
  - [x] Direct table queries: `agent_client.table().select()` with RLS enforcement
- [x] **CRITICAL**: Implement `process_query_request()` with multi-turn function calling
  - **Turn 1**: Call `client.responses.create()` with tools=ALL_TOOLS (from tools module)
    - Include system instructions with database schema
    - Set `tool_choice="auto"` - LLM decides if it needs data
    - Check response.output for function_call items
    - If no tool calls: Extract output_text and return (conversational response)
  - **Turn 2**: If tool calls present:
    - Parse function name and arguments (sql, explanation)
    - Call tool handler via `TOOL_HANDLERS[tool_name](agent_client, **args)`
    - Build tool_results with function_call_output type
    - Call `client.responses.create()` with `previous_response_id` (multi-turn)
    - Send tool_results as input
    - LLM sees actual data and formats natural language response
  - **Return**: QueryResult with LLM's formatted explanation + raw results
  - **Token tracking**: Sum tokens from both API calls
  - **Logging**: Log each turn, tool calls, SQL execution, results count
- [x] Add comprehensive logging throughout the flow
  - Log initial query, tool calls detected, SQL executed, results returned
  - Log token usage and cost for both turns
  - Use structured logging from Session 3
  - [x] Configure OpenAI request with correct parameters and Pydantic model
- [x] Implement `process_query_request()` with conversational query detection
  - [x] Detect SQL comment placeholders (`generated_sql.startswith("--")`)
  - [x] Skip SQL execution for conversational queries
  - [x] Return explanation only (set generated_sql=None in response to hide from user)
  - [x] Handle unsafe SQL requests with proper error messages
- [x] Implement `validate_and_sanitize_sql(sql: str)` function with comprehensive safety checks
- [ ] **CRITICAL - NO RPC**: Implement `execute_generated_query(agent_client, sql: str)` using direct PostgREST queries
  - [ ] Parse SELECT statements to extract table, columns, WHERE, ORDER BY, LIMIT
  - [ ] Execute via `agent_client.table(table_name).select().execute()` (NOT `agent_client.rpc()`)
  - [ ] DO NOT create PostgreSQL stored functions for dynamic SQL
  - [ ] RLS automatically enforced through agent_client session
- [ ] Add result formatting converting database response to user-friendly format
- [x] Implement error handling for OpenAI API failures, unsafe SQL generation, query execution errors
- [x] Add logging for all API calls including tokens, cost, query types, safety violations, conversational detection
- [x] Write comprehensive tests for SQL generation, conversational responses, safety validation, execution with RLS

### Unit 8: Responses API Endpoint

- [x] Create `POST /api/v1/ai/query` endpoint in `backend/app/api/routes/ai.py`
- [x] Implement request handling extracting user query (supports both conversational and database queries)
- [x] Get authenticated user from session (Session 2 auth dependency)
- [x] Get agent client using `get_agent_client(user_id)` for RLS-enforced database access
- [x] Call responses service to generate response (handles both chat and SQL automatically)
- [x] Return normalized response with appropriate fields based on query type:
  - [x] For conversations: Return explanation only, no SQL shown to user
  - [x] For SQL queries: Return SQL, explanation, and results (when execution works)
  - [x] For unsafe SQL: Return denial message with safety_check=false
- [x] Implement rate limiting (10 queries per minute per user) using middleware or decorator
- [x] Add request ID tracking for full audit trail
- [x] Implement error responses with consistent format matching Session 3 patterns
- [x] Add endpoint documentation with OpenAPI schema describing dual-mode behavior
- [x] Write endpoint tests for:
  - [x] Conversational queries ("How are you?", "What can you do?")
  - [x] SQL queries ("Show me my items", "Count my tags")
  - [x] Unsafe requests ("Delete all items", "Update items")
  - [x] Rate limiting (11th request blocked)
  - [x] RLS enforcement (user sees only their data)
- [x] Write endpoint tests covering success cases, rate limiting, RLS enforcement, error scenarios

---

**PAUSE**

---

## Phase 3: Frontend Chat Interface for Responses API (Units 9-14)

### AI PROMPT: Phase 3 Implementation (Units 9-14)

```
Help me implement Phase 3 - Frontend Chat Interface for Responses API (Units 9-14):

**TESTING PREREQUISITE REMINDER**
Before testing the chat interface, you MUST use a user account created AFTER Phase 1 implementation:
- **If you have an existing user from previous sessions: Sign up with a NEW email address**
- Agent-users are created automatically during signup (Phase 1 Unit 4)
- Existing users do NOT have agent-users and cannot use the chat feature
- After signup with a new account, everything will work seamlessly
- To verify: Check user_profiles table - agent_user_id should be populated

**Redux State Management (Unit 9)**
1. Create frontend/src/store/chatSlice.ts module
2. Define ChatState interface with messages array, loading state, error, token usage
3. Define Message type with id, role, content, timestamp, metadata fields
4. Create slice with reducers: addMessage, setLoading, setError, clearMessages, updateTokenUsage
5. Create sendQuery async thunk calling /api/v1/ai/query endpoint
6. Implement optimistic update adding user message before API call
7. Implement thunk fulfilled handler adding assistant response
8. Implement error handling storing error in state
9. Add selectors for messages, loading, total tokens, total cost
10. Export actions and reducer, integrate into root store
11. Write tests for reducers and async thunk

**Chat Service Layer (Unit 10)**
12. Create frontend/src/services/chatService.ts module
13. Define TypeScript interfaces matching backend models (QueryRequest, QueryResult)
14. Implement sendQuery(query: string) function calling POST /api/v1/ai/query
15. Implement response parsing and validation
16. Add error handling with user-friendly error messages
17. Implement getConversationHistory() function (placeholder for future)
18. Add logging for debugging (development only)
19. Write service layer tests mocking apiClient

**Chat Interface Component (Unit 11)**
20. Create frontend/src/components/chat/ChatInterface.tsx component
21. Implement layout with message list and input area using shadcn Card and ScrollArea
22. Create useChat() custom hook wrapping Redux actions and selectors
23. Implement message rendering with distinct styling for user vs assistant
24. Create input field using shadcn Textarea with send button
25. Implement send handler dispatching sendQuery thunk and clearing input
26. Add loading indicator during API call (disable input, show thinking animation)
27. Implement auto-scroll to latest message on new arrival
28. Add empty state with helpful prompt examples
29. Implement error display using shadcn Alert
30. Add keyboard shortcut (Cmd/Ctrl+Enter) to send message
31. Make component responsive for mobile
32. Write component tests for user interactions

**Message Display Components (Unit 12)**
33. Create frontend/src/components/chat/MessageCard.tsx component
34. Implement different layouts for user vs assistant messages (alignment, colors)
35. Add avatar or icon indicating message sender
36. Display timestamp in relative format (e.g., "2 minutes ago")
37. Show SQL query in code block with syntax highlighting for assistant responses
38. Display explanation text clearly separated from query
39. Show metadata (tokens, cost) in collapsed expandable section
40. Add copy-to-clipboard button for SQL queries
41. Create frontend/src/components/chat/QueryResultsTable.tsx for data results
42. Implement table with column headers from database response
43. Add row limit with "show more" pagination
44. Style using shadcn Table component
45. Make components accessible (ARIA labels, keyboard navigation)
46. Write component tests

**Route Integration (Unit 13)**
47. Add /chat path to frontend/src/config/paths.ts
48. Create frontend/src/pages/Chat.tsx page component
49. Wrap ChatInterface in page layout with header showing "AI Assistant" title
50. Add ProtectedRoute wrapper requiring authentication
51. Update frontend/src/routes/AppRoutes.tsx adding chat route
52. Update frontend/src/components/Navigation.tsx adding "Chat" link in authenticated nav
53. Add icon for chat link (lucide-react MessageSquare or similar)
54. Implement page title and meta tags for SEO
55. Test route protection (redirect to login if not authenticated)
56. Write routing tests

**Polish & Testing (Unit 14)**
57. Add conversation clearing button to chat interface
58. Implement confirmation dialog before clearing chat history
59. Add example queries as clickable chips when chat is empty
60. Implement token/cost display in chat header showing session totals
61. Add settings panel for query parameters (future enhancement hook)
62. Implement loading skeleton states for better perceived performance
63. Add toast notifications for successful execution and errors
64. Write E2E tests: send query, receive response, verify SQL, verify results
65. Write test for rate limiting from user perspective
66. Write test for RLS enforcement (user only sees their data)
67. Create user documentation for chat feature
68. Add inline help tooltips for asking questions effectively
69. Performance test: measure and optimize for large result sets
70. Accessibility audit and fixes

**PART A Validation**
71. End-to-End Flow Test: Login, navigate to /chat, send queries, verify results
72. Security Test: Verify RLS working (User A only sees User A's data)
73. Safety Test: Try dangerous query, verify rejection
74. Rate Limiting Test: Send 11 queries, verify 11th rate-limited
75. UI/UX Test: Mobile responsive, keyboard shortcuts, copy-to-clipboard, clearing conversation
76. Error Handling Test: Network disconnect, verify graceful error
77. Performance Test: Query with 100+ rows renders in < 2 seconds
78. Accessibility Test: Keyboard navigation, screen reader compatibility

After implementation:
- Show me key files for review (chatSlice.ts, chatService.ts, ChatInterface.tsx, MessageCard.tsx, Chat.tsx)
- Guide me through testing each component and E2E flow
- Ask me to confirm all Phase 3 and PART A validation tests pass

Mark completed tasks with [x] in Beast_Mode_Agent_SDK_PRD.md. Wait for approval before proceeding to PART B.
```

### Unit 9: Redux Chat Slice

- [x] Create `frontend/src/store/chatSlice.ts` module
- [x] Define `ChatState` interface with messages array, loading state, error, token usage
- [x] Define `Message` type with id, role (user/assistant), content, timestamp, metadata (tokens, cost)
- [x] Create slice with reducers: addMessage, setLoading, setError, clearMessages, updateTokenUsage
- [x] Create `sendQuery` async thunk calling `/api/v1/ai/query` endpoint
  - [x] Implement optimistic update adding user message immediately before API call
  - [x] Implement thunk fulfilled handler adding assistant response to messages
  - [x] Implement error handling storing error message in state
- [x] Add selectors for messages, loading state, total tokens used, total cost
- [x] Export actions and reducer
- [x] Integrate chat reducer into root store configuration
- [ ] Write tests for reducers and async thunk lifecycle

### Unit 10: Chat Service Layer

- [x] Create `frontend/src/services/chatService.ts` module
- [x] Define TypeScript interfaces matching backend models: QueryRequest, QueryResult
- [x] Implement `sendQuery(query: string)` function calling POST `/api/v1/ai/query`
- [x] Implement response parsing and validation
- [x] Add error handling with user-friendly error messages
- [x] Implement `getConversationHistory()` function (placeholder for future persistence)
- [x] Add logging for debugging (client-side console logs in development only)
- [x] Export all service functions
- [ ] Write service layer tests mocking apiClient

### Unit 11: ChatInterface Component

**IMPORTANT - Install Missing shadcn/ui Components:**

Before creating the ChatInterface component, you must manually install the required shadcn/ui components using the official CLI. The AI assistant should guide the learner to run these commands in the `frontend/` directory:

```bash
cd frontend
npx shadcn@latest add table alert scroll-area textarea sheet drawer
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
- [x] Check `package.json` for new `@radix-ui/react-scroll-area` dependency
- [x] Run `npm install` to install any new dependencies

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
- [ ] Write component tests for user interactions

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
- [ ] Write component tests

### Unit 13: Floating Chat Button & Drawer Integration

**IMPORTANT - Install Missing shadcn/ui Components:**

Before creating the chat drawer, install the required shadcn/ui drawer/sheet component:

```bash
cd frontend
npx shadcn@latest add sheet
```

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
- [ ] Write component tests for drawer interactions

### Unit 14: Responses API Polish & Testing

- [x] Add conversation clearing button to chat interface
- [x] Implement confirmation dialog before clearing chat history
- [x] Add example queries as clickable chips when chat is empty
- [x] Implement token/cost display in chat header showing session totals
- [ ] Add settings panel for adjusting query parameters (temperature, max tokens) - future enhancement hook
- [ ] Implement loading skeleton states for better perceived performance
- [x] Add toast notifications for successful query execution and errors
- [ ] Write E2E test scenarios: send query, receive response, verify SQL generation, verify results display
- [ ] Write test for rate limiting behavior from user perspective
- [ ] Write test for RLS enforcement (user should only see their data)
- [ ] Create user documentation for chat feature
- [ ] Add inline help tooltips explaining how to ask questions effectively
- [ ] Performance test: measure and optimize for large result sets
- [ ] Accessibility audit and fixes

---

**PAUSE**

---

### AI PROMPT: Final Validation - PART A Complete (Responses API)

```
Help me perform final validation of PART A - Responses API Implementation (Units 1-14):

COMPREHENSIVE VALIDATION CHECKLIST:

**1. Backend Foundation (Phase 1)**
- Start backend server: python -m uvicorn app.main:app --reload --log-level info from backend/
- Test OpenAI health check: GET http://localhost:8000/api/v1/ai/health
- Expected: {"status": "healthy", "openai_connected": true, "model": "gpt-4o-mini"}
- Verify encryption service: Run unit tests for encrypt/decrypt functions
- Expected: All encryption tests pass with no plaintext password exposure

**2. Agent-User Creation (Phase 1)**
- Create new test user via signup endpoint
- Check Supabase Authentication tab: Verify TWO users created (human user + agent_{uuid}@code45.internal)
- Check user_profile table: Verify agent_user_id populated and agent_credentials_encrypted contains encrypted data
- Verify credentials are base64-encoded ciphertext (not plaintext password)
- Check agent_created_at timestamp is set

**3. Agent Authentication (Phase 1)**
- Test agent authentication: Call get_agent_client(user_id) for test user
- Verify agent client returned successfully with user_id and agent_user_id attributes
- Test RLS enforcement: Use agent client to query ideas table
- Expected: Only returns ideas owned by the authenticated user (RLS working)
- Check agent_last_used_at timestamp updated in user_profile

**4. SQL Generation & Safety (Phase 2)**
- Send safe query: POST /api/v1/ai/query with body {"query": "Show me all ideas created this week"}
- Expected response includes:
  - generated_sql: SELECT statement with WHERE and LIMIT clauses
  - explanation: Natural language description of query
  - safety_check: true
  - results: Array of user's ideas (RLS enforced)
  - token_usage: {prompt_tokens, completion_tokens, total_tokens}
  - cost: Calculated cost in USD

**5. SQL Safety Validation (Phase 2)**
- Test unsafe query: POST /api/v1/ai/query with body {"query": "Delete all ideas"}
- Expected: 400 error with message "Unsafe SQL detected: DELETE without WHERE clause"
- Test another unsafe query: POST /api/v1/ai/query with body {"query": "Drop the ideas table"}
- Expected: 400 error with message "Unsafe SQL detected: DROP statement not allowed"

**6. Rate Limiting (Phase 2)**
- Send 10 queries in rapid succession (within 60 seconds)
- Expected: All 10 succeed with 200 responses
- Send 11th query immediately
- Expected: 429 Too Many Requests with error message "Rate limit exceeded: 10 queries per minute"
- Wait 60 seconds and try again
- Expected: Query succeeds (rate limit window reset)

**7. RLS Enforcement (Phase 2)**
- Login as User A and send query: "Show me all my ideas"
- Note idea count and IDs in response
- Logout and login as User B
- Send same query: "Show me all my ideas"
- Expected: Different ideas returned (User B's ideas only, not User A's)
- Verify agent_user_id in backend logs shows different agent accounts for each user

**8. Frontend Chat Interface (Phase 3)**
- Start frontend: npm run dev from frontend/
- Navigate to http://localhost:5173
- Login as test user
- Click "Chat" link in navigation
- Expected: ChatInterface component loads with empty state and example queries

**9. Send Query Flow (Phase 3)**
- Type query in textarea: "What ideas do I have?"
- Click Send button (or press Cmd/Ctrl+Enter)
- Expected sequence:
  - User message appears immediately (optimistic update)
  - Loading indicator shows ("AI is thinking...")
  - Assistant response appears with SQL query in code block
  - Explanation text displayed
  - Results table shows queried data
  - Token usage and cost displayed in expandable metadata section

**10. Message Display (Phase 3)**
- Verify user messages aligned right with different background color
- Verify assistant messages aligned left with SQL code block and syntax highlighting
- Verify timestamp shows relative time ("just now", "2 minutes ago")
- Click copy button on SQL query
- Expected: SQL copied to clipboard with success toast
- Expand metadata section
- Expected: Shows token counts and cost calculation

**11. Error Handling (Phase 3)**
- Disconnect network (turn off WiFi or airplane mode)
- Send query
- Expected: Error alert displays "Network error: Unable to reach server"
- Reconnect network
- Send query again
- Expected: Works normally

**12. Conversation Management (Phase 3)**
- Send 3-4 queries building conversation history
- Verify all messages persist in chat
- Click "Clear Conversation" button
- Expected: Confirmation dialog appears
- Click "Confirm"
- Expected: All messages cleared, empty state with examples shows again

**13. Mobile Responsiveness (Phase 3)**
- Resize browser to mobile width (375px)
- Verify chat interface remains usable
- Verify message cards stack properly
- Verify input area and send button accessible
- Test on actual mobile device if available

**14. Accessibility (Phase 3)**
- Test keyboard navigation: Tab through all interactive elements
- Expected: Clear focus indicators on all buttons, inputs, links
- Test Cmd/Ctrl+Enter shortcut sends message
- Test with screen reader (if available)
- Verify all buttons have aria-labels
- Verify messages have proper semantic structure

**15. Performance (Phase 3)**
- Send query returning 100+ rows
- Measure render time
- Expected: Results table renders in < 2 seconds
- Verify pagination or virtual scrolling if implemented
- Check browser console for any performance warnings

**16. Backend Logging & Audit Trail (All Phases)**
- Check backend logs for a complete query flow
- Expected log entries:
  - OpenAI API call with model, prompt tokens, completion tokens, cost
  - SQL safety validation result
  - Agent authentication with agent_user_id
  - Query execution with RLS enforcement
  - Request ID tracked throughout entire flow
- Verify no plaintext passwords or encryption keys in logs

**17. Security Verification (All Phases)**
- Inspect backend .env file: Verify ENCRYPTION_KEY never committed to git
- Inspect Supabase user_profile table: Verify agent_credentials_encrypted is ciphertext
- Inspect network requests in browser DevTools: Verify no credentials in response bodies
- Verify agent sessions expire (test after 1 hour)
- Verify tokens refreshed automatically on expiry

**18. Cost Tracking Accuracy (Phase 2)**
- Send query and note token counts and cost from response
- Manually verify calculation:
  - GPT-4o-mini pricing: ~$0.150 per 1M input tokens, ~$0.600 per 1M output tokens
  - Calculate: (prompt_tokens / 1_000_000 * 0.150) + (completion_tokens / 1_000_000 * 0.600)
  - Verify matches cost in response within rounding tolerance

**FINAL CHECKLIST:**
- [ ] All Phase 1 tests pass (OpenAI integration, agent-user creation, encryption)
- [ ] All Phase 2 tests pass (SQL generation, safety validation, RLS, rate limiting)
- [ ] All Phase 3 tests pass (chat UI, message display, error handling, accessibility)
- [ ] No security issues found (credentials encrypted, RLS enforced, no secret exposure)
- [ ] Performance acceptable (query rendering < 2s for 100 rows)
- [ ] User experience polished (responsive, accessible, clear error messages)
- [ ] Documentation complete (code comments, inline help, user guide)

After validation:
- Show me summary of all test results
- Highlight any failures or issues found
- Ask me to confirm PART A is complete and ready for production

If all tests pass, PART A (Responses API Implementation) is COMPLETE! ✅

Mark PART A complete in Beast_Mode_OARAPI_PRD1.md. Ready to proceed to PART B (Agent SDK Implementation) when approved.
```

---

**END OF BEAST MODE PRD - PART A: RESPONSES API IMPLEMENTATION**

---

**Continue to Part B**: See `Beast_Mode_Agent_SDK_PRD2.md` for Agent SDK implementation with tool-calling, multi-specialist architecture, and autonomous agent operations.
