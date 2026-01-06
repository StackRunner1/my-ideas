# OpenAI Agent SDK Implementation - Product Requirements Document v1.0

## Overview

This document details **Part B: Agent SDK Implementation** - the autonomous agentic system built **ALONGSIDE** (not replacing) the OpenAI Responses API foundation established in Part A.

## CRITICAL: Dual-System Architecture Strategy

**⚠️ IMPORTANT FOR AI CODING ASSISTANTS**: This implementation creates **TWO SEPARATE, INDEPENDENT AI SYSTEMS** that run in parallel:

### System 1: Responses API (Part A - Already Complete ✅)

- **Backend**: `POST /api/v1/ai/query` endpoint (already implemented)
- **Purpose**: Conversational queries, database SELECT operations, SQL generation
- **Pattern**: User asks question → LLM generates SQL → Execute query → Return results
- **State**: SELECT-only, read-only operations
- **Use Cases**: "Show me all items", "Analyze my data", "What tags do I have?"

### System 2: Agent SDK (Part B - To Implement 🚧)

- **Backend**: `POST /api/v1/agent/chat` endpoint (new, separate endpoint)
- **Purpose**: Autonomous actions, CRUD operations, multi-specialist orchestration
- **Pattern**: User instructs → Orchestrator routes → Specialist executes tools → Confirmation
- **State**: Full CRUD with autonomous decision-making
- **Use Cases**: "Create item X", "Tag Y with Z", "Delete old items"

### Shared Infrastructure (Reuse from Part A)

- **Frontend Components**: Floating drawer, message cards, Redux patterns
- **Backend Infrastructure**: Agent-user authentication, RLS enforcement, OpenAI SDK setup
- **UI Pattern**: Single floating chat drawer with **prominent mode toggle at top**

### User Experience Flow

```
User clicks floating chat button
    ↓
Drawer opens with MODE TOGGLE at top
    ↓
┌─────────────────────────────────────┐
│  [Ask Questions] [Take Actions]    │ ← Mode Toggle (Segmented Control/Tabs)
├─────────────────────────────────────┤
│                                     │
│  Chat messages here...              │
│                                     │
└─────────────────────────────────────┘

Mode 1: "Ask Questions" (Responses API)
  - Calls /api/v1/ai/query
  - Shows SQL queries and results
  - Read-only operations

Mode 2: "Take Actions" (Agent SDK)
  - Calls /api/v1/agent/chat
  - Shows agent reasoning, tool calls, confirmations
  - Full CRUD operations
```

### Implementation Strategy

1. **Keep Part A intact** - Do NOT modify existing Responses API implementation
2. **Add Part B separately** - New agent endpoint, new Redux state/actions, new components
3. **Reuse UI shell** - Same drawer, shared message components extended for agent actions
4. **Clear mode distinction** - Prominent toggle, different visual styling, mode-specific hints
5. **Independent operation** - Each system works completely independently

### Why This Approach?

This is a **demo/learning tool** for teaching non-technical users how to code with AI assistance. Having both systems accessible side-by-side demonstrates:

- Different AI interaction patterns (ask vs instruct)
- Structured outputs vs autonomous agents
- Read-only vs write operations
- Simple vs complex AI architectures

**What This Adds**: Tool-calling agents with multi-specialist architecture, orchestration patterns, decision boundaries, and autonomous database operations - adding a second AI interaction mode alongside the existing conversational query system.

**Architecture**: Multi-specialist agent system where:

- **Orchestrator Agent** routes user requests to appropriate specialists
- **Specialist Agents** (Items, Tags) execute domain-specific operations with custom tools
- **Tool Execution** happens via RLS-enforced agent-user clients ensuring security
- **Chat Interface** extended with mode toggle and agent-specific displays (actions, tool calls, confidence scores)

## Prerequisites

**MANDATORY**: Part A (Responses API) MUST be complete before starting Part B. There is no alternative path.

**From Part A** (Beast_Mode_OARAPI_PRD_A.md) - All Required:

- ✅ OpenAI SDK configured and tested (Phase 1, Units 1-5)
- ✅ Agent-user authentication working with encrypted credentials (Units 3-4)
- ✅ Responses API endpoints functional with RLS enforcement (Units 7-8)
- ✅ Chat interface operational with Redux state management (Units 9-11)
- ✅ Floating drawer UI implemented (Unit 13)
- ✅ All Phase 1-3 validation tests passing

**Additional Requirements**:

- Understanding of OpenAI function calling and tool execution patterns

## Required Reading: OpenAI Agent SDK Documentation

**⚠️ CRITICAL FOR AI CODING ASSISTANTS**: Before implementing Part B, you MUST thoroughly read and understand the official OpenAI Agent SDK documentation. This framework is relatively new and may not be fully represented in training data.

### Primary Documentation Links

1. **OpenAI Agents SDK Python API Reference** (PRIMARY RESOURCE):

   - URL: https://openai.github.io/openai-agents-python/
   - Purpose: Complete API documentation, usage patterns, examples
   - Key Sections:
     - [Installation and Quickstart](https://openai.github.io/openai-agents-python/quickstart/)
     - [Agents](https://openai.github.io/openai-agents-python/agents/) - Core Agent primitives
     - [Running Agents](https://openai.github.io/openai-agents-python/running_agents/) - Runner.run_sync/async patterns
     - [Tools](https://openai.github.io/openai-agents-python/tools/) - Function-to-tool conversion
     - [Handoffs](https://openai.github.io/openai-agents-python/handoffs/) - Multi-agent coordination
     - [Sessions](https://openai.github.io/openai-agents-python/sessions/) - Conversation history management
     - [Multi-Agent Orchestration](https://openai.github.io/openai-agents-python/multi_agent/)
     - [Tracing](https://openai.github.io/openai-agents-python/tracing/) - Debugging and monitoring

2. **OpenAI Platform Agents Guide**:

   - URL: https://platform.openai.com/docs/guides/agents
   - Purpose: High-level overview, AgentKit ecosystem, deployment patterns
   - Focus: Understanding agent workflows, tools, and optimization

3. **OpenAI Platform Agents SDK Guide**:

   - URL: https://platform.openai.com/docs/guides/agents-sdk
   - Purpose: SDK introduction, download links, documentation navigation
   - Focus: Getting started with the SDK

4. **GitHub Repository**:
   - URL: https://github.com/openai/openai-agents-python
   - Purpose: Source code, examples, issues, changelog
   - Focus: Real-world examples, community issues, latest updates

### Key Concepts from Documentation

From the SDK documentation, understand these core primitives:

1. **Agent** - LLM equipped with instructions and tools

   ```python
   from agents import Agent, Runner

   agent = Agent(
       name="Assistant",
       instructions="You are a helpful assistant",
       tools=[...],  # Function tools
       handoffs=[...]  # Other agents this can delegate to
   )
   ```

2. **Runner** - Executes agent loop (call tools → send results → loop until done)

   ```python
   result = Runner.run_sync(agent, "user query")
   print(result.final_output)
   ```

3. **Tools** - Any Python function becomes a tool with automatic schema generation

   ```python
   def create_tag(tag_name: str) -> dict:
       """Create a new tag."""
       # Implementation
       return {"success": True}

   agent = Agent(tools=[create_tag])  # Automatic schema generation
   ```

4. **Handoffs** - Agents delegate to specialists

   ```python
   items_agent = Agent(name="Items", tools=[create_item, ...])
   tags_agent = Agent(name="Tags", tools=[create_tag, ...])

   orchestrator = Agent(
       name="Orchestrator",
       handoffs=[items_agent, tags_agent]
   )
   ```

5. **Sessions** - Automatic conversation history management

   ```python
   from agents.memory import InMemorySession

   session = InMemorySession()
   result1 = Runner.run_sync(agent, "First query", session=session)
   result2 = Runner.run_sync(agent, "Follow-up", session=session)  # Has context
   ```

6. **Tracing** - Built-in debugging and monitoring
   - Visualize agent decision-making
   - Debug tool execution
   - Monitor performance

### Implementation Requirements

**Before writing ANY code for Part B**:

1. ✅ Read the [Quickstart guide](https://openai.github.io/openai-agents-python/quickstart/)
2. ✅ Study [Tools documentation](https://openai.github.io/openai-agents-python/tools/) - understand function-to-tool patterns
3. ✅ Review [Handoffs documentation](https://openai.github.io/openai-agents-python/handoffs/) - multi-agent coordination
4. ✅ Understand [Sessions](https://openai.github.io/openai-agents-python/sessions/) - conversation history
5. ✅ Review [Multi-Agent Orchestration](https://openai.github.io/openai-agents-python/multi_agent/) - specialist patterns
6. ✅ Check [Examples](https://openai.github.io/openai-agents-python/examples/) - real-world patterns

**Why This Matters**:

- The Agent SDK has specific patterns for tool calling (different from Responses API)
- Handoffs are a first-class primitive (not custom orchestration logic)
- Sessions handle conversation history automatically (different from Part A manual approach)
- The SDK's `Runner` handles the agent loop (we don't implement it ourselves)
- Tool schema generation is automatic via Pydantic (simpler than Part A)

**Implementation Approach**:

1. Follow SDK patterns exactly as documented
2. Use `Agent`, `Runner`, `handoffs` primitives as intended
3. Leverage automatic tool schema generation
4. Use Sessions for conversation history (don't reinvent)
5. Enable tracing for debugging
6. Adapt patterns to our FastAPI/Supabase/Redux architecture

### Documentation Integration Points

When implementing specific units, refer to:

- **Unit 15 (Tool Base Class)**: [Tools documentation](https://openai.github.io/openai-agents-python/tools/)
- **Unit 16 (Agent Models)**: [Agents documentation](https://openai.github.io/openai-agents-python/agents/)
- **Unit 17 (Specialist Agents)**: [Handoffs](https://openai.github.io/openai-agents-python/handoffs/) + [Multi-Agent](https://openai.github.io/openai-agents-python/multi_agent/)
- **Unit 18 (Orchestrator)**: [Running Agents](https://openai.github.io/openai-agents-python/running_agents/) + [Sessions](https://openai.github.io/openai-agents-python/sessions/)
- **Unit 19 (Agent Endpoint)**: [API Reference](https://openai.github.io/openai-agents-python/ref/)

---

- Familiarity with orchestration and delegation patterns
- Python abstract base classes and inheritance

## Business Context

- **Problem**: Users need AI assistants that can autonomously perform actions, not just answer questions
- **Solution**: Agent SDK with tool-calling capabilities, multi-specialist architecture, and decision-making boundaries
- **Value**: Autonomous database operations (create, update, delete) with security guarantees, audit trails, and user-scoped permissions

## Implementation Scope

Part B implements:

1. **Tool Infrastructure**: Base class patterns, OpenAI function schemas, standardized execution
2. **Custom Tools**: create_tag, create_item, search operations with RLS enforcement
3. **Specialist Agents**: Domain-focused agents with tool delegation and system prompts
4. **Orchestrator Agent**: Routes requests to appropriate specialists based on intent
5. **Frontend Extensions**: Agent action display, tool call indicators, confidence visualization
6. **Production Features**: Web search integration, rate limiting, conversation persistence, observability

## AI Coding Agent Instructions

**CRITICAL IMPLEMENTATION STRATEGY FOR AI ASSISTANTS**:

This PRD implements a **dual-system architecture** where Part B (Agent SDK) runs **ALONGSIDE** Part A (Responses API) as completely separate systems. Both coexist with minimal shared state.

### Separation of Concerns - What MUST Be Separate

**Backend Files (Do NOT Modify Part A Files)**:

- ✅ **NEW endpoint file**: `backend/app/api/routes/agent.py`
  - Do NOT add agent endpoints to existing `ai.py`
  - Agent SDK gets its own route file: `POST /api/v1/agent/chat`
- ✅ **NEW service directory**: `backend/app/services/agents/`
  - Create separate directory for orchestrator and specialist agents
  - Do NOT mix with `responses_service.py` from Part A
- ✅ **NEW models file**: `backend/app/models/agent.py`
  - Agent-specific Pydantic models (AgentAction, AgentResponse, etc.)
  - Keep separate from `responses_api.py` models
- ✅ **NEW tools directory**: `backend/app/services/tools/` (if creating Tool base class)
  - Part A uses simple functional approach in `app/tools/database_tools.py`
  - Part B MAY create OOP tool pattern in separate location

**Frontend Files (Do NOT Modify Part A Redux State)**:

- ✅ **NEW Redux slice**: `frontend/src/store/agentSlice.ts`
  - Do NOT extend or modify existing `chatSlice.ts` from Part A
  - Completely separate state management for Agent SDK
  - Agent state: messages, agentStatus, currentAction, toolResults, etc.
- ✅ **NEW service file**: `frontend/src/services/agentService.ts`
  - Calls `/api/v1/agent/chat` endpoint
  - Do NOT add agent methods to existing `chatService.ts`
- ✅ **NEW components** (agent-specific):
  - `ActionBadge.tsx`, `ToolResultCard.tsx`, `ConfirmationDialog.tsx`, `ThinkingIndicator.tsx`
  - Can extend existing `MessageCard.tsx` but keep agent rendering logic separate

### What CAN Be Shared (Reuse Existing Infrastructure)

**Backend Shared**:

- ✅ Agent-user authentication services (already implemented in Part A)
- ✅ OpenAI SDK client setup and helpers
- ✅ RLS enforcement patterns
- ✅ Logging utilities (`core/logging.py`)
- ✅ Rate limiting patterns (create separate state for agent endpoints)

**Frontend Shared**:

- ✅ Floating drawer shell component (`ChatDrawer.tsx`)
- ✅ Base message display components (can extend for agent messages)
- ✅ shadcn/ui components
- ✅ Root store configuration (imports both `chatSlice` and `agentSlice`)

### Mode Toggle Implementation Pattern

The chat drawer contains BOTH systems accessed via a mode toggle:

```typescript
// In ChatInterface or ChatDrawer component
const [mode, setMode] = useState<"responses" | "agent">("responses");

// Mode determines which Redux slice and API to use
const handleSendMessage = (message: string) => {
  if (mode === "responses") {
    dispatch(sendQuery(message)); // chatSlice from Part A
  } else {
    dispatch(sendAgentMessage(message)); // agentSlice from Part B
  }
};
```

### File Organization Summary

```
backend/
  app/
    api/routes/
      ai.py              ← Part A (existing, do not modify)
      agent.py           ← Part B (NEW)
    services/
      responses_service.py   ← Part A (existing, do not modify)
      app_agents/           ← Part B (NEW directory - MUST be app_agents NOT agents)
        __init__.py
        orchestrator.py
        ideas_agent.py
        tags_agent.py
        prompts.py
      tools/              ← Part B (NEW, if using OOP tools)
        __init__.py
        base.py
        create_tag.py
    models/
      responses_api.py    ← Part A (existing, do not modify)
      agent.py           ← Part B (NEW)
    tools/
      database_tools.py  ← Part A (existing, functional approach)

frontend/
  src/
    store/
      chatSlice.ts       ← Part A (existing, do not modify)
      agentSlice.ts      ← Part B (NEW)
    services/
      chatService.ts     ← Part A (existing, do not modify)
      agentService.ts    ← Part B (NEW)
    components/chat/
      ChatInterface.tsx  ← Shared (extend with mode toggle)
      ChatDrawer.tsx     ← Shared (hosts both modes)
      MessageCard.tsx    ← Shared (extend for agent messages)
      ActionBadge.tsx    ← Part B (NEW)
      ToolResultCard.tsx ← Part B (NEW)
      ConfirmationDialog.tsx ← Part B (NEW)
      ThinkingIndicator.tsx  ← Part B (NEW)
```

### Why This Separation Matters

1. **Modularity**: Each system can be understood, tested, and modified independently
2. **Clear boundaries**: No confusion about which code belongs to which system
3. **Maintainability**: Changes to Agent SDK don't risk breaking Responses API
4. **Learning path**: Learners can clearly see the progression from Part A to Part B
5. **Future extensibility**: Easy to add Part C (e.g., multi-modal agents) without tangling code

### Implementation Workflow for AI Assistants

1. **Verify Part A complete**: Check that all Part A files exist and tests pass
2. **Create Part B structure**: New files only, no modifications to Part A files
3. **Implement backend first**: Agent endpoint → Specialists → Tools → Tests
4. **Implement frontend second**: Agent slice → Service → Components → Integration
5. **Integration point**: Mode toggle in shared ChatDrawer component
6. **Testing**: Verify both systems work independently and mode toggle switches correctly

---

**Continuation Context**: This PRD continues from Beast_Mode_OARAPI_PRD_A.md (Part A: Responses API). All infrastructure from Part A is assumed working and must not be modified during Part B implementation.

- **AI PROMPT markers**: Phase-level prompts (### AI PROMPT) consolidate all units in that phase
- **PAUSE markers**: Checkpoints for learner approval before proceeding
- **Task tracking**: Mark [x] for completed, [~] for in-progress
- **Validation**: Run tests after each phase and comprehensive validation after Part B

## Architecture Extension

### Dual-System Comparison

| Aspect                  | Responses API (Part A) ✅              | Agent SDK (Part B) 🚧                                         |
| ----------------------- | -------------------------------------- | ------------------------------------------------------------- |
| **Backend Endpoint**    | `POST /api/v1/ai/query`                | `POST /api/v1/agent/chat`                                     |
| **Frontend Mode**       | "Ask Questions" toggle mode            | "Take Actions" toggle mode                                    |
| **Interaction**         | User asks → AI generates SQL → Results | User instructs → Agent decides → Tools execute → Confirmation |
| **Autonomy**            | None (generates queries only)          | High (makes decisions, calls tools)                           |
| **Database Operations** | SELECT only (read-only)                | Full CRUD (create, update, delete)                            |
| **Tools**               | query_database function                | Custom tools + web search                                     |
| **Decision Making**     | None (always generates SQL)            | Confidence thresholds, safety checks                          |
| **Orchestration**       | Single endpoint, direct response       | Multi-specialist with routing                                 |
| **Use Cases**           | "Show me X", "Analyze Y"               | "Create item Z", "Tag A with B"                               |
| **State Management**    | chatSlice (responses mode)             | chatSlice (agent mode) - extended                             |
| **UI Components**       | Shared drawer, mode toggle OFF         | Shared drawer, mode toggle ON                                 |

**IMPLEMENTATION NOTE**: Both systems coexist. User toggles between them in the same chat drawer. Redux state tracks which mode is active and routes to appropriate API endpoint.

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

**Architecture Flow**:

1. User sends message to Orchestrator Agent
2. Orchestrator analyzes intent and routes to appropriate specialist
3. Specialist Agent receives request and decides which tool to use
4. Tool executes database operation via RLS-enforced agent client
5. Results flow back: Tool → Specialist → Orchestrator → User

**Example User Flow**:

```
User: "Create a new item called 'Learn Rust' and tag it with 'programming'"
  │
  ▼
Orchestrator: Detects compound request (item creation + tagging)
  │
  ├──> Items Specialist: execute create_item("Learn Rust")
  │         └──> Supabase INSERT (RLS enforced)
  │
  └──> Tags Specialist: execute create_tag("programming", item_id)
            └──> Supabase INSERT (RLS enforced)
```

### Chat History vs Agent Session Memory

**⚠️ CRITICAL DISTINCTION**: These are related but separate concepts that must not be confused during implementation.

| Concept                  | What it is                                   | Where it lives                       | Who manages it    |
| ------------------------ | -------------------------------------------- | ------------------------------------ | ----------------- |
| **Chat History (UI)**    | Messages displayed to user in chat interface | Frontend Redux `state.chat.messages` | Frontend code     |
| **Agent Session Memory** | SDK's internal context for agent "memory"    | Backend `SQLiteSession` instance     | OpenAI Agents SDK |

**How they relate**:

- Chat History = What the **user sees** in the UI
- Session Memory = What the **agent knows** when processing a message

**SDK Session Memory Flow**:

1. Frontend sends `sessionId` with request
2. Backend retrieves `SQLiteSession` from `sessions` dict using `sessionId`
3. `Runner.run()` automatically calls `session.get_items()` to prepend history to LLM context
4. After run, SDK automatically calls `session.add_items()` to store new items
5. Backend returns `sessionId` in response for frontend to reuse

**Frontend Chat Messages Flow**:

1. User sends message → message added to Redux `messages` array
2. Response received → response message added to Redux `messages` array
3. Messages are purely UI state, NOT sent to backend as conversation history
4. Frontend does NOT build `conversationHistory` - SDK Sessions handle this automatically

---

## IMPLEMENTATION OF PART B W/ AGENT INSTRUCTIONS AND TASK CHECKLISTS (Phase 4-8 | Units 15-30)

**Goal**: Implement autonomous agentic system with tool-calling, multi-specialist architecture, and orchestration

**Outcome**: Working agent system where users can instruct AI to perform database operations (create items, add tags), with agents making autonomous decisions about when and how to act

**Why After Responses API**: Builds upon established foundation (OpenAI SDK, chat UI, agent-user auth) and adds complexity (tool execution, decision boundaries, orchestrator pattern)

---

## Phase 4: Tool Specification & Base Agent Infrastructure (Units 15-18)

**⚠️ CRITICAL FOR AI ASSISTANTS:**

- Folder MUST be `backend/app/services/app_agents/` (NOT `agents/` - conflicts with openai-agents package)
- Import: `from agents import Agent, Runner` (package name is `agents`, NOT `openai_agents`)
- Database table: `ideas` (NOT `items` - terminology must match database schema, verify with learner)
- Tool pattern: Functional (NOT OOP base class - simpler for this project)

### AI PROMPT: Phase 4 Implementation (Units 15-18)

```
Help me implement Phase 4 - Tool Specification & Base Agent Infrastructure (Units 15-18):

**IMPLEMENTATION APPROACH**: Using functional tool pattern with OpenAI Agent SDK's @function_tool decorator.
The SDK automatically generates function schemas from type hints and docstrings, making OOP base classes unnecessary.

**Unit 15 - Functional Tool Implementation (create_tag)**
1. Create backend/app/services/tools/create_tag.py module
2. Import Supabase Client type for agent_client parameter: `from supabase import Client`
3. Import Optional from typing for optional parameters
4. Define create_tag() function signature: `def create_tag(agent_client: Client, tag_name: str, idea_id: Optional[int] = None) -> dict`
5. Add comprehensive docstring explaining tool purpose, parameters, and return value
6. Validate tag_name format using regex: alphanumeric, hyphens, underscores, max 50 chars
7. If idea_id provided, verify idea exists using agent_client.from_("ideas").select()
8. Create tag using agent_client.from_("tags").insert({"name": tag_name, "user_id": agent_user_id})
9. If idea_id provided, link tag to idea via idea_tags junction table insert
10. Return dict with success status, created tag data, or error message
11. Handle errors: duplicate tag names (unique constraint), invalid idea_id, RLS violations
12. Add comprehensive logging for all operations (validation, database operations, errors)
13. Write tests: valid creation, duplicates, invalid inputs, RLS enforcement (DEFERRED)
14. Write integration test with Supabase (DEFERRED)

**Unit 16 - Apply @function_tool Decorator to Tools**
15. Import function_tool decorator: `from agents import function_tool`
16. In backend/app/services/app_agents/tags_agent.py, create wrapper function for create_tag
17. Apply @function_tool decorator to wrapper function
18. Wrapper function signature: `async def create_tag_tool(tag_name: str, idea_id: Optional[int] = None) -> str`
19. Wrapper calls underlying create_tag function with agent_client bound via closure
20. Wrapper returns string representation of result (SDK expects string outputs)
21. Add detailed docstring to wrapper (SDK uses this for LLM function calling schema)
22. Verify decorated function has .name attribute: `hasattr(create_tag_tool, 'name')`
23. Test tool registration: create agent with tools=[create_tag_tool] and verify agent.tools populated
24. Reference SDK documentation: https://openai.github.io/openai-agents-python/tools/#function-tools

**Unit 17 - Pydantic Models for Agent Responses**
25. Create backend/app/models/agent.py module
26. Define AgentChatRequest model with fields:
    - message (str) - user query
    - session_id (Optional[str]) - SDK session ID for conversation continuity
27. Define AgentChatResponse model with fields:
    - success (bool)
    - response (str)
    - session_id (str) - return session ID for frontend persistence
    - handoffs (Optional[List[dict]]) - agent routing information
    - toolCalls (Optional[List[dict]]) - tool execution details
    - agentName (Optional[str])
    - confidence (Optional[float])
    - error (Optional[str])
28. Add camelCase field aliases for frontend compatibility (sessionId, toolCalls, agentName)
29. Add model validation and examples in docstrings
30. Write model validation tests (DEFERRED)
31. Document all models with usage examples

**Unit 18 - Agent System Prompts**
32. Create backend/app/services/app_agents/prompts.py module (MUST be app_agents folder)
33. Define IDEAS_AGENT_INSTRUCTIONS including role, available tools, decision guidelines, constraints (RLS enforcement), response format
34. Define TAGS_AGENT_INSTRUCTIONS including role, available tools (create_tag), special behavior, decision guidelines, response format
35. Define ORCHESTRATOR_INSTRUCTIONS including routing role, specialist descriptions (Ideas vs Tags), routing patterns, fallback behavior
36. Add prompt version identifiers for tracking: PROMPT_VERSION = "1.0.0"
37. Include few-shot examples in each prompt (3-5 examples of expected behavior)
38. Document prompts with clear formatting and guidelines
39. Create prompt testing utilities for validation (DEFERRED)
40. Write tests verifying prompts produce expected structured outputs (DEFERRED)

**Phase 4 Validation**
41. Verify create_tag function implements validation correctly (tag name format, max length)
42. Test create_tag executes database operations via agent_client with RLS enforcement
43. Verify error handling works for duplicates, invalid idea_id, RLS violations
44. Verify @function_tool decorator applied to wrapper in tags_agent.py
45. Verify decorated function has .name attribute (SDK requirement)
46. Test AgentChatRequest/Response models serialize correctly with camelCase aliases
47. Verify all three system prompts defined (Orchestrator, Ideas, Tags)
48. Test prompt version tracking works
49. Run backend server and verify no import errors

After implementation:
- Show me files for review
- Guide me through testing
- Ask me to confirm tests pass

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 5.
```

### Unit 15: Functional Tool Implementation (Simplified from OOP Base Class Pattern)

**DECISION**: Using functional tool pattern instead of OOP base class for simplicity and alignment with OpenAI Agent SDK's automatic schema generation from Python functions.

- [x] Create `backend/app/services/tools/create_tag.py` module
- [x] Implement `create_tag()` function with type hints for automatic schema generation
- [x] Accept `agent_client` parameter for RLS enforcement
- [x] Function signature: `create_tag(agent_client: Client, tag_name: str, idea_id: Optional[int] = None) -> dict`
- [x] Validate tag_name format (alphanumeric, hyphens, underscores, max 50 chars)
- [x] If idea*id provided, verify idea exists using `agent_client.from*("ideas").select()`
- [x] Create tag using `agent_client.from_("tags").insert()`
- [x] If idea_id provided, link tag to idea via `idea_tags` junction table
- [x] Return dict with success status and created tag data
- [x] Handle errors: duplicate tag names, invalid idea_id, RLS violations
- [x] Add comprehensive logging for all operations
- [ ] Write tests: valid creation, duplicates, invalid inputs, RLS enforcement
- [ ] Write integration test with Supabase

**Note**: OOP Tool base class (Unit 15) skipped in favor of functional approach. OpenAI Agent SDK automatically generates function schemas from Python function signatures and docstrings, making a base class unnecessary for this project scope.

### Unit 16: Apply @function_tool Decorator to Agent Tools

**CRITICAL**: OpenAI Agents SDK requires tools to be decorated with `@function_tool` before passing to `Agent(tools=[...])`. This decorator:

- Adds `.name` attribute that SDK expects (Python functions only have `.__name__`)
- Enables automatic schema generation from type hints and docstrings
- Configures tool metadata for LLM function calling

- [ ] Import `function_tool` from agents package: `from agents import function_tool`
- [ ] Apply `@function_tool` decorator to create_tag wrapper in tags_agent.py
- [ ] Verify decorated function has `.name` attribute: `hasattr(create_tag_tool, 'name')`
- [ ] Update function signature to return `str` (SDK expects string outputs)
- [ ] Test tool registration: create agent and verify `agent.tools` list populated
- [ ] Add SDK documentation reference: https://openai.github.io/openai-agents-python/tools/#function-tools

**Pattern**:

```python
from agents import function_tool, Agent

@function_tool
async def create_tag_tool(tag_name: str, idea_id: Optional[int] = None) -> str:
    """Create a new tag and optionally link to an idea.

    Args:
        tag_name: Name of tag to create (alphanumeric, hyphens, underscores).
        idea_id: Optional ID of idea to link tag to.

    Returns:
        Success message or error description.
    """
    result = create_tag(agent_client, tag_name, idea_id)
    return str(result)

agent = Agent(name="Tags", tools=[create_tag_tool], instructions="...")
```

### Unit 17: Pydantic Models for Agent Responses

**Purpose**: Define request/response models for the Agent SDK endpoint with proper serialization for frontend compatibility.

**⚠️ CRITICAL FOR AI ASSISTANTS**: All Pydantic models with Field aliases MUST be configured to serialize using aliases. Without this, JSON responses use snake_case instead of camelCase, breaking frontend integration.

**Implementation Tasks**:

- [x] Create `backend/app/models/agent.py` module
- [x] Define `AgentAction` enum with values: answer, tool_call, clarify, refuse
- [x] Define `AgentChatRequest` model with fields:
  - message (str) - user query
  - session_id (Optional[str]) with alias "sessionId" - SDK session ID for conversation continuity
  - conversation_history (Optional[List]) - DEPRECATED, not used with SDK Sessions (included for API compatibility but ignored)
- [x] Define `AgentChatResponse` model with fields:
  - success (bool)
  - response (str)
  - session_id (str) with alias "sessionId" - return session ID for frontend to persist (CRITICAL)
  - handoffs (Optional[List[Handoff]]) - agent routing information
  - tool_calls (Optional[List[ToolCall]]) with alias "toolCalls" - tool execution details
  - agent_name (Optional[str]) with alias "agentName"
  - confidence (Optional[float])
  - token_usage (Optional[TokenUsage]) with alias "tokenUsage"
  - cost (Optional[float])
  - error (Optional[str])
- [x] Define `Handoff` model with fields:
  - from_agent (str) with alias "from" - agent handing off
  - to_agent (str) with alias "to" - agent receiving handoff
  - timestamp (int) - Unix timestamp of handoff
- [x] Define `ToolCall` model with fields:
  - tool_name (str) with alias "toolName" - name of tool executed
  - parameters (Dict[str, Any]) - parameters passed to tool
  - result (Optional[Any]) - result from tool execution
  - error (Optional[str]) - error message if tool failed
- [x] Define `TokenUsage` model with fields:
  - prompt_tokens (int) with alias "promptTokens"
  - completion_tokens (int) with alias "completionTokens"
  - total_tokens (int) with alias "totalTokens"
- [x] Configure ALL models with Field aliases to use model_config with both populate_by_name and serialize_by_alias set to True
- [x] Verify JSON serialization produces camelCase field names in response output
- [ ] Write model validation tests including serialization verification

**Model Configuration Requirement**:

For any Pydantic model using Field aliases, the model_config must include BOTH settings:

- `populate_by_name: True` - allows setting fields using Python name OR alias during instantiation
- `serialize_by_alias: True` - ensures JSON output uses camelCase aliases instead of snake_case Python names

Without `serialize_by_alias`, FastAPI returns snake_case in JSON responses even when aliases are defined, causing frontend state management to fail (e.g., `sessionId` expected but `session_id` received).

**Files**:

- `backend/app/models/agent.py` - All agent-related Pydantic models

**Status**: ✅ IMPLEMENTED - All models created with proper serialization configuration

### Unit 18: Agent System Prompts

- [x] Create `backend/app/services/app_agents/prompts.py` module
- [x] Define `IDEAS_AGENT_INSTRUCTIONS` including role, available tools, decision guidelines, constraints, response format
- [x] Define `TAGS_AGENT_INSTRUCTIONS` including role, available tools (create_tag), special behavior, decision guidelines, response format
- [x] Define `ORCHESTRATOR_INSTRUCTIONS` including routing role, specialist descriptions (Ideas vs Tags), routing patterns, fallback behavior
- [x] Add prompt version identifiers for tracking (PROMPT_VERSION = "1.0.0")
- [x] Include few-shot examples in each prompt (3-5 examples of expected behavior)
- [x] Document prompts with clear formatting and guidelines
- [ ] Create prompt testing utilities for validation
- [ ] Write tests verifying prompts produce expected structured outputs

**Status**: Core prompts implemented. Testing utilities pending.

---

**PAUSE - Phase 4 Complete**

Foundational infrastructure complete (tools, decorators, models, prompts). Proceed to Phase 5 for agent implementation.

---

## Phase 5: Agent Implementation & Backend Endpoint (Units 19-22)

**Goal**: Build the multi-agent system using the foundational pieces from Phase 4. Create Ideas and Tags specialist agents, the Orchestrator for routing, and the backend endpoint that ties everything together.

**Why Now**: Phase 4 established the tool pattern, Pydantic models, and system prompts. Now assemble these into functional agents and expose via API endpoint.

**⚠️ CRITICAL FOR AI ASSISTANTS:**

- All tool wrappers MUST be decorated with `@function_tool` before passing to Agent
- Use `await Runner.run()` in async endpoints (NOT `Runner.run_sync()`)
- Session management via `SQLiteSession` is required for conversation continuity
- Return `session_id` in response for frontend to maintain conversation state

### AI PROMPT: Phase 5 Implementation (Units 19-22)

```
Help me implement Phase 5 - Agent Implementation & Backend Endpoint (Units 19-22):

**CONTEXT**: Phase 4 completed foundational infrastructure:
- Functional tool pattern with create_tag implemented
- @function_tool decorator pattern established
- Pydantic models for request/response with camelCase aliases
- System prompts defined for Orchestrator, Ideas Agent, Tags Agent

**TASK**: Build the multi-agent system and expose via backend endpoint.

**Unit 19 - Ideas Specialist Agent**
1. Create backend/app/services/app_agents/ideas_agent.py module
2. Import Agent from agents package (NOT openai_agents)
3. Import IDEAS_AGENT_INSTRUCTIONS from prompts module
4. Define create_ideas_agent(agent_client, user_id) factory function
5. Implement 5 tools: create_idea, search_ideas, list_ideas, get_idea, edit_idea
6. Apply @function_tool decorator to all tool wrappers
7. Bind agent_client and user_id via closure in tool wrappers
8. Register all tools with Agent: tools=[create_idea_tool, search_ideas_tool, ...]
9. Add comprehensive logging for agent decisions

**Unit 20 - Tags Specialist Agent**
10. Create backend/app/services/app_agents/tags_agent.py module
11. Import Agent and function_tool from agents package
12. Import TAGS_AGENT_INSTRUCTIONS from prompts module
13. Define create_tags_agent(agent_client, user_id) factory function
14. Implement 4 tools: create_tag, search_tags, link_tag_to_idea, edit_tag
15. Apply @function_tool decorator to all tool wrappers
16. Register all tools with Agent
17. Update TAGS_AGENT_INSTRUCTIONS with tool descriptions

**Unit 21 - Orchestrator Agent**
18. Create backend/app/services/app_agents/orchestrator.py module
19. Import Agent from agents package
20. Import create_ideas_agent and create_tags_agent factory functions
21. Import ORCHESTRATOR_INSTRUCTIONS from prompts module
22. Define create_orchestrator(agent_client, user_id) factory function
23. Initialize Ideas and Tags specialist agents
24. Configure handoffs to both specialists
25. Add comprehensive docstrings explaining architecture

**Unit 22 - Agent SDK Backend Endpoint**
26. Create backend/app/api/routes/agent.py module
27. Import Runner and SQLiteSession from agents package
28. Import create_orchestrator from services.app_agents
29. Import get_agent_client from services.agent_auth
30. Create POST /chat endpoint accepting AgentChatRequest
31. Get authenticated user via get_current_user dependency
32. Create/retrieve SQLiteSession for conversation continuity
33. Use await Runner.run() (NOT run_sync) in async endpoint
34. Extract handoffs and tool calls from result.new_items
35. Correlate ToolCallItem with ToolCallOutputItem by call_id for tool names
36. Return AgentChatResponse with session_id for frontend persistence
37. Add comprehensive debug logging for session management
38. Register router in main.py with prefix /api/v1

**Phase 5 Validation**
39. Run backend server and verify no import errors
40. Test /api/v1/agent/chat endpoint with simple query ("how are you?")
41. Test tool execution via endpoint ("create a tag called python")
42. Verify backend logs show handoffs and tool calls clearly
43. Check database for created tag with correct user_id (RLS enforcement)
44. Test session continuity: send second message, verify context maintained
45. Verify response includes sessionId (camelCase) for frontend

After implementation:
- Show me files for review
- Guide me through testing
- Ask me to confirm tests pass

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 6.
```

### Unit 19: Ideas Specialist Agent Implementation

**Purpose**: Create the Ideas specialist agent with all required tools for idea management operations.

**⚠️ CRITICAL FOR AI ASSISTANTS**: The Ideas Agent requires functional tools to operate. All tool wrappers MUST be decorated with `@function_tool` before registration to avoid `AttributeError: 'function' object has no attribute 'name'`.

**Agent Module Implementation**:

- [x] Create `backend/app/services/app_agents/ideas_agent.py` module
- [x] Import Agent from agents package (package name is `agents`, NOT `openai_agents`)
- [x] Import IDEAS_AGENT_INSTRUCTIONS from prompts module
- [x] Define `create_ideas_agent(agent_client, user_id)` factory function accepting Supabase client and user ID
- [x] Configure Agent with name="Ideas" and IDEAS_AGENT_INSTRUCTIONS
- [x] Apply @function_tool decorator to all tool wrapper functions
- [x] Verify all decorated tools have `.name` attribute before passing to Agent
- [x] Register all 5 tools with Agent: create_idea_tool, search_ideas_tool, list_ideas_tool, get_idea_tool, edit_idea_tool
- [x] Add comprehensive logging for agent decisions
- [ ] Write agent tests: tool execution, routing behavior

**Tool 1: create_idea**:

- [x] Create `backend/app/services/tools/create_idea.py` module
- [x] Function accepts agent_client (Supabase Client), user_id (str), title (str), and optional content (str)
- [x] Validate title is non-empty and max 200 characters
- [x] Insert into ideas table with user_id for RLS ownership
- [x] Return dict with success status and created idea data including id, title, content, created_at
- [x] Handle errors including duplicate titles and RLS violations
- [x] Add comprehensive logging

**Tool 2: search_ideas**:

- [x] Create `backend/app/services/tools/search_ideas.py` module
- [x] Function accepts agent_client, user_id, query string, and optional limit (default 10)
- [x] Implement text search using Supabase ilike or textSearch across title and content fields
- [x] Filter by user_id for RLS enforcement
- [x] Return dict with list of matching ideas
- [x] Handle empty results gracefully

**Tool 3: list_ideas**:

- [x] Create `backend/app/services/tools/list_ideas.py` module
- [x] Function accepts agent_client, user_id, optional limit (default 20), and optional offset (default 0)
- [x] Implement paginated listing ordered by created_at descending (newest first)
- [x] Filter by user_id for RLS enforcement
- [x] Return dict with ideas list and pagination info

**Tool 4: get_idea**:

- [x] Create `backend/app/services/tools/get_idea.py` module
- [x] Function accepts agent_client, user_id, and idea_id (int)
- [x] Fetch single idea by ID with user_id filter for RLS enforcement
- [x] Return dict with idea details including associated tags
- [x] Handle not found with clear error message

**Tool 5: edit_idea**:

- [x] Create `backend/app/services/tools/edit_idea.py` module
- [x] Function accepts agent_client, user_id, idea_id (str), and optional title, description, status
- [x] Validate idea ownership by verifying idea belongs to user_id before updating
- [x] Validate title is non-empty and max 200 characters if provided
- [x] Validate status is one of 'draft', 'published', 'archived' if provided
- [x] Require at least one field to update (title, description, or status)
- [x] Update idea in database with provided fields only (partial update)
- [x] Return dict with success status and updated idea data
- [x] Handle errors: idea not found, access denied, validation failures
- [x] Add comprehensive logging

**Tool Registration**:

- [x] In ideas_agent.py, import all tools from tools module
- [x] Create @function_tool decorated wrapper functions binding agent_client and user_id via closure
- [x] Update `backend/app/services/tools/__init__.py` to export all idea tools

**Files Created**:

- `backend/app/services/tools/create_idea.py`
- `backend/app/services/tools/search_ideas.py`
- `backend/app/services/tools/list_ideas.py`
- `backend/app/services/tools/get_idea.py`
- `backend/app/services/tools/edit_idea.py`

**Files Modified**:

- `backend/app/services/tools/__init__.py` - Added exports for idea tools
- `backend/app/services/app_agents/ideas_agent.py` - Added tool wrappers and registration

**Status**: ✅ IMPLEMENTED - Ideas Agent created with all 5 tools

### Unit 20: Tags Specialist Agent Implementation

**Purpose**: Create the Tags specialist agent with all required tools for tag management operations including creating tags, searching tags, and linking tags to ideas.

**⚠️ CRITICAL FOR AI ASSISTANTS**: All tool wrappers MUST be decorated with `@function_tool` before registration. The SDK expects tools to have a `.name` attribute which the decorator provides.

**Agent Module Implementation**:

- [x] Create `backend/app/services/app_agents/tags_agent.py` module
- [x] Import Agent and function_tool from agents package (CRITICAL: must import function_tool decorator)
- [x] Import tools from tools module: create_tag, search_tags, link_tag_to_idea
- [x] Import TAGS_AGENT_INSTRUCTIONS from prompts module
- [x] Define `create_tags_agent(agent_client, user_id)` factory function accepting Supabase client and user ID
- [x] Configure Agent with name="Tags" and TAGS_AGENT_INSTRUCTIONS
- [x] Apply @function_tool decorator to all tool wrapper functions
- [x] Verify all decorated tools have `.name` attribute before passing to Agent
- [x] Update wrapper functions to return str (SDK expects string outputs, not dict)
- [x] Register all 4 tools with Agent: create_tag_tool, search_tags_tool, link_tag_to_idea_tool, edit_tag_tool
- [x] Add docstrings for all tool wrappers (SDK uses these for LLM function calling schema)
- [ ] Write agent tests: tag creation, tag search, tag linking, tag editing

**Tool 1: create_tag** (implemented in Unit 15):

- [x] Tool already implemented in `backend/app/services/tools/create_tag.py`
- [x] Create @function_tool decorated wrapper binding agent_client and user_id via closure
- [x] Register with Agent tools list

**Tool 2: search_tags**:

- [x] Create `backend/app/services/tools/search_tags.py` module
- [x] Function accepts agent_client, user_id, query string, and optional limit
- [x] Implement text search using Supabase ilike across tag name field
- [x] Filter by user_id for RLS enforcement
- [x] Return dict with list of matching tags
- [x] Create @function_tool decorated wrapper in tags_agent.py

**Tool 3: link_tag_to_idea**:

- [x] Create `backend/app/services/tools/link_tag_to_idea.py` module
- [x] Function accepts agent_client, user_id, tag_id (int), and idea_id (int)
- [x] Validate tag ownership by verifying tag belongs to user_id
- [x] Validate idea ownership by verifying idea belongs to user_id
- [x] Check for existing link in idea_tags junction table to prevent duplicates
- [x] Insert into idea_tags table with idea_id and tag_id
- [x] Return dict with success status and link details
- [x] Handle errors: tag not found, idea not found, already linked, RLS violations
- [x] Add comprehensive logging
- [x] Create @function_tool decorated wrapper in tags_agent.py with docstring explaining usage

**Tool 4: edit_tag**:

- [x] Create `backend/app/services/tools/edit_tag.py` module
- [x] Function accepts agent_client, user_id, tag_id (int), and tag_name (str)
- [x] Validate tag ownership by verifying tag belongs to user_id before updating
- [x] Validate new tag_name format (alphanumeric, hyphens, underscores, max 50 chars)
- [x] Check for duplicate tag names to prevent naming conflicts
- [x] Update tag name in database
- [x] Return dict with success status and updated tag data including old and new names
- [x] Handle errors: tag not found, access denied, duplicate name, validation failures
- [x] Add comprehensive logging
- [x] Create @function_tool decorated wrapper in tags_agent.py with docstring explaining usage

**Prompt Update**:

- [x] Update TAGS_AGENT_INSTRUCTIONS in prompts.py to include link_tag_to_idea tool
- [x] Add example usage for linking tags to ideas
- [x] Add instruction to use search_tags to find tag_id when user references tag by name
- [x] Add context awareness instruction to check conversation history for recently created tags and ideas

**Files Created**:

- `backend/app/services/tools/link_tag_to_idea.py`
- `backend/app/services/tools/edit_tag.py`

**Files Modified**:

- `backend/app/services/tools/__init__.py` - Added exports for search_tags, link_tag_to_idea, and edit_tag
- `backend/app/services/app_agents/tags_agent.py` - Added all tool wrappers and registration
- `backend/app/services/app_agents/prompts.py` - Updated TAGS_AGENT_INSTRUCTIONS with new tools

**Status**: ✅ IMPLEMENTED - Tags Agent created with all 4 tools (create_tag, search_tags, link_tag_to_idea, edit_tag)

### Unit 21: Orchestrator Agent Implementation

- [x] Create `backend/app/services/app_agents/orchestrator.py` module
- [x] Import: `from agents import Agent`
- [x] Import: `from .ideas_agent import create_ideas_agent`
- [x] Import: `from .tags_agent import create_tags_agent`
- [x] Import: `from .prompts import ORCHESTRATOR_INSTRUCTIONS`
- [x] Define `create_orchestrator(agent_client)` factory function
- [x] Configure Agent with name="Orchestrator" and ORCHESTRATOR_INSTRUCTIONS
- [x] Initialize Ideas and Tags specialist agents
- [x] Configure handoffs to both specialists
- [x] Add comprehensive docstrings explaining architecture
- [ ] Add session management for conversation continuity
- [ ] Write tests: routing decisions, handoff behavior, fallback handling

**Status**: Core orchestrator implemented with handoffs. Session management pending.

---

### Unit 22: Agent SDK Backend Endpoint - Complete Implementation Guide

**Purpose**: Create the `/api/v1/agent/chat` endpoint that serves as the entry point for the Agent SDK system. This endpoint receives user messages, creates the orchestrator agent with specialist handoffs, manages conversation sessions, executes the agent pipeline via Runner.run(), and returns structured responses with tool call and handoff information.

**⚠️ CRITICAL FOR AI ASSISTANTS**: This unit documents the complete, tested implementation pattern for the agent endpoint. All patterns described here have been validated through implementation and resolve common pitfalls discovered during development.

**Endpoint Module Setup**:

- [x] Create `backend/app/api/routes/agent.py` module
- [x] Import Runner and SQLiteSession from agents package (package name is `agents`, NOT `openai_agents`)
- [x] Import create_orchestrator from services.app_agents module
- [x] Import get_agent_client from services.agent_auth module for RLS-enforced database access
- [x] Import AgentChatRequest and AgentChatResponse Pydantic models from models.agent
- [x] Import get_current_user dependency for authentication
- [x] Create APIRouter with prefix "/agent" and tags for OpenAPI documentation
- [x] Register router in main.py with prefix "/api/v1"

**Authentication and User Context**:

- [x] Add get_current_user dependency to endpoint function signature
- [x] Extract user ID using nested structure: `current_user["user"]["id"]` (auth system returns nested dict)
- [x] Obtain RLS-enforced Supabase client via `get_agent_client(user_id)` for database operations
- [x] Pass both agent_client and user_id to orchestrator factory function
- [x] Handle case where user has no stored agent credentials (return helpful error message)

**Request Handling**:

- [x] Define endpoint as `POST /chat` accepting AgentChatRequest body
- [x] Extract message from `request_body.message` field (NOT `query` - distinguishes from Responses API)
- [x] Extract optional session_id from `request_body.session_id` for conversation continuity
- [x] Generate request_id for logging and session identification: `str(uuid.uuid4())[:8]`
- [x] Log incoming request with user_id, message preview, and session_id

**Session Management Implementation**:

- [x] Create module-level sessions dictionary: `sessions: dict[str, SQLiteSession] = {}`
- [x] If request provides session_id, attempt to reuse existing session from dictionary
- [x] If no session*id provided, generate new one: `f"session*{user*id}*{request_id}"`
- [x] Create SQLiteSession with in-memory storage: `SQLiteSession(session_id, ":memory:")`
- [x] Store session in dictionary for reuse: `sessions[session_id] = session`
- [x] SDK Sessions automatically manage conversation history (no manual history building required)
- [x] Always return session_id in response for frontend to persist and send with subsequent requests

**Session Debug Logging** (essential for troubleshooting continuity issues):

- [x] Log received session_id from request to verify frontend is sending it
- [x] Log whether creating NEW session or REUSING existing session
- [x] Log session item count when reusing to verify history is accumulating
- [x] Log new_items count after Runner.run() to verify items are being stored

**Agent Pipeline Execution**:

- [x] Create orchestrator agent: `orchestrator = create_orchestrator(agent_client, user_id)`
- [x] Use async Runner.run pattern (NOT Runner.run_sync which causes event loop conflicts in async endpoints)
- [x] Pass positional arguments for agent and message: `Runner.run(orchestrator, message, session=session)`
- [x] Await the result: `result = await Runner.run(...)`
- [x] Extract final response: `result.final_output`
- [x] Extract last agent name: `result.last_agent.name` for agentName field in response

**Result Processing - Handoff Extraction**:

- [x] Initialize empty handoffs list for response
- [x] Iterate through `result.new_items` to find HandoffOutputItem types
- [x] For HandoffOutputItem: extract source_agent.name and target_agent.name
- [x] Build Handoff objects with from_agent, to_agent, and timestamp fields
- [x] Log handoffs with clear formatting for debugging

**Result Processing - Tool Call Extraction** (CRITICAL pattern):

- [x] Initialize empty tool_calls list and pending_tool_calls dict for correlation
- [x] Understand SDK item type separation: ToolCallItem contains tool name, ToolCallOutputItem contains result
- [x] For ToolCallItem: extract tool name from `item.raw_item.name` and call_id from `item.raw_item.call_id`
- [x] Store in pending_tool_calls dictionary: `pending_tool_calls[call_id] = tool_name`
- [x] For ToolCallOutputItem: extract call_id and look up tool name from pending_tool_calls
- [x] Extract tool output from `item.output`
- [x] Build ToolCall objects with tool_name, parameters (if available), and result
- [x] Log tool invocations and results with clear formatting

**Response Construction**:

- [x] Build AgentChatResponse with all required fields
- [x] Set success=True for successful execution, False for errors
- [x] Set response to result.final_output
- [x] Set session_id to the session ID used (CRITICAL for frontend conversation continuity)
- [x] Set handoffs list (may be empty if no routing occurred)
- [x] Set tool_calls list (may be empty if no tools were called)
- [x] Set agent_name to the last agent that executed
- [x] Verify model serialization uses camelCase aliases (requires serialize_by_alias in model config)

**Error Handling**:

- [x] Wrap agent execution in try/except block
- [x] Catch agent credential errors and return helpful message about credential setup
- [x] Catch general exceptions and log full traceback
- [x] Return AgentChatResponse with success=False and error message for failures
- [x] Never expose internal error details to frontend (security)

**Environment Configuration Requirement**:

- [x] Ensure load_dotenv() called at TOP of main.py BEFORE any imports
- [x] OpenAI Agents SDK reads OPENAI_API_KEY on import - must be available immediately
- [x] Without early load_dotenv(), SDK raises `OpenAIError: The api_key client option must be set`

**Files Created**:

- `backend/app/api/routes/agent.py` - Complete endpoint implementation

**Files Modified**:

- `backend/app/main.py` - Registered agent router with prefix "/api/v1"
- `backend/app/main.py` - Added load_dotenv() at very top before imports

**Common Pitfalls Resolved**:

| Pitfall                                 | Symptom                                                          | Solution                                                             |
| --------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| Missing @function_tool decorator        | `AttributeError: 'function' object has no attribute 'name'`      | Decorate all tool wrappers with `@function_tool` from agents package |
| Late environment loading                | `OpenAIError: The api_key client option must be set`             | Call `load_dotenv()` at top of main.py before any imports            |
| Using Runner.run_sync in async endpoint | Event loop conflicts, hangs                                      | Use `await Runner.run()` in async endpoints                          |
| Accessing result.messages               | `AttributeError: 'RunResult' object has no attribute 'messages'` | Use `result.final_output`, `result.new_items`, `result.last_agent`   |
| Tool name from ToolCallOutputItem       | Tool names display as "?" or "unknown"                           | Correlate ToolCallItem and ToolCallOutputItem by call_id             |
| Session not persisting                  | Agent loses context between messages                             | Return session_id in response; frontend must send it back            |
| snake_case in JSON response             | Frontend receives session_id instead of sessionId                | Add `serialize_by_alias: True` to Pydantic model config              |

**Status**: ✅ IMPLEMENTED - Endpoint functional with session management, handoff extraction, and tool call correlation

---

**Phase 4 Validation**

**Completed:**

- [x] Functional create_tag tool implemented with RLS enforcement
- [x] Tag validation (alphanumeric, hyphens, underscores, max 50 chars)
- [x] Database operations via agent_client (tags table insert)
- [x] Comprehensive error handling in create_tag
- [x] Agent system prompts defined (Orchestrator, Ideas, Tags)
- [x] Ideas specialist agent created with SDK primitives
- [x] Tags specialist agent created with create_tag tool
- [x] Orchestrator agent with handoffs to both specialists
- [x] Agent endpoint `/api/v1/agent/chat` functional
- [x] Session management (basic SQLiteSession implementation)
- [x] Runner.run async integration working with correct positional argument signature
- [x] Authentication flow (get_current_user → get_agent_client) with correct field access
- [x] Agent credential retrieval and decryption working for users with stored credentials
- [x] Server starts without errors

**Validation via Frontend (Phase 5):**

- [ ] Test create_tag end-to-end via UI chat interface
- [ ] Verify orchestrator handoffs displayed in UI ("Orchestrator → Tags Agent")
- [ ] Verify tool execution visible in UI ("Calling create_tag...")
- [ ] Confirm tag appears in database with correct RLS enforcement

**Critical Logging Requirement:**
Backend must log all handoffs and tool calls with clear formatting:

```
[Agent] Orchestrator received: "create a python tag"
[Handoff] Orchestrator → Tags Agent
[Tool] Tags Agent calling create_tag(tag_name='python', idea_id=None)
[Tool Result] create_tag SUCCESS: {'id': 42, 'name': 'python'}
```

---

**PAUSE - Phase 5 Complete**

Backend agent system complete. Proceed to Phase 6 for frontend integration and visual validation.

---

## Phase 6: Frontend Integration & UI Validation (Units 23-26)

**Goal**: Make Agent SDK visible and testable via chat interface. Demonstrate handoffs, tool calls, and agent reasoning in UI components.

**Why Now**: Validate multi-agent system works through user-facing interface before building additional tools. No external API testing tools (Postman) needed - everything visible in UI.

**Critical Requirements**:

- **Display Handoffs**: Show "Orchestrator → Ideas Agent" or "Orchestrator → Tags Agent" in message UI
- **Display Tool Calls**: Show "Calling tool: create_tag(tag_name='python')" with results
- **Backend Logging**: Log all handoffs and tool executions with clear formatting and timestamps
- **Frontend Visibility**: Users see full agent decision-making process (thinking → routing → tool execution → result)

### AI PROMPT: Phase 6 Implementation (Frontend Integration - Units 23-26)

```
Help me implement Phase 6 - Frontend Integration & UI Validation:

**CONTEXT**: Phase 4 completed backend - orchestrator, specialists, create_tag tool functional.
- Server running, /api/v1/agent/chat endpoint works
- Backend ready but needs UI to make system visible and testable

**GOAL**: Build chat interface to visualize agent system without external API tools.

**Unit 23 - Redux Agent Slice Extension**
1. Extend ChatState interface with agent-specific fields: agent_status, current_action, tool_results
2. Add agentStatus field with values: idle, thinking, acting, waiting_confirmation
3. Add reducers: setAgentStatus, addToolResult, requestConfirmation
4. Create sendAgentMessage async thunk calling /api/v1/agent/chat
5. Implement thunk handling different agent actions: answer (add message), tool call (show action + result), clarify (show question)
6. Add confirmation flow state management for operations requiring user approval
7. Extend selectors for agent-specific state
8. Write tests for new reducers and agent message thunk

**Unit 24 - Agent Message Components**
9. Extend MessageCard component to handle agent response types
10. Create ActionBadge component showing HANDOFFS ("Orchestrator → Tags Agent") and TOOL CALLS ("create_tag")
11. Create ToolResultCard component displaying tool execution results with success/error states
12. Implement different styling for different agent actions (thinking, acting, clarifying, refusing)
13. Add ThinkingIndicator animation component for when agent is processing
14. Create ClarificationPrompt component displaying agent questions with suggested responses
15. Create ConfirmationDialog component for operations requiring user approval
16. Add confidence score display (optional, collapsible) for debugging
17. Implement copy button for agent rationale text
18. Make all components accessible with ARIA labels
19. **CRITICAL**: Display handoffs prominently: "🔄 Orchestrator → Ideas Agent" in message UI
20. **CRITICAL**: Display tool calls: "🔧 Calling create_tag(tag_name='python')... ✅ Success"
21. Write component tests

**Unit 25 - Agent Chat Mode Toggle**
22. Add chatMode field to Redux chat state with values: responses_api, agent_sdk
23. Add reducer for toggling chat mode
24. Create ChatModeToggle component with segmented control or tabs UI
25. Display mode descriptions: "Ask Questions" (Responses) vs "Take Actions" (Agent)
26. Show appropriate icons for each mode
27. Clear conversation when switching modes with user confirmation
28. Update ChatInterface to call correct API based on mode
29. Add helpful hints specific to each mode in UI
30. Save mode preference to localStorage
31. Write tests for mode switching behavior

**Phase 5 Validation**
32. Login and navigate to /chat
33. Toggle to Agent SDK mode
34. Send: "Create a tag called python"
35. **VERIFY**: See "Orchestrator → Tags Agent" handoff displayed in UI
36. **VERIFY**: See "Calling create_tag..." tool execution displayed
37. **VERIFY**: See success message with created tag
38. Check backend logs for clear handoff/tool call logging
39. Check database for tag with correct user_id (RLS)
40. Test keyboard navigation and screen reader compatibility

After implementation:
- Show me files for review
- Guide me through UI testing
- Ask me to confirm handoffs visible in interface

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 6.
```

---

### Unit 23: Redux Agent Slice Extension ✅

- [x] Extend `ChatState` interface with agent-specific fields: agent_status, current_action, tool_results
- [ ] **Extend ChatState with session management field (CRITICAL for conversation continuity)**:
  - Add `agentSessionId: string | null` to ChatState interface
  - This stores the SDK session ID returned from backend for reuse in subsequent messages
  - Separate from responses_api which doesn't use persistent sessions
  - Initial value: `null` (no active session)
- [x] Add `agentStatus` field with values: idle, thinking, acting, waiting_confirmation
- [x] Add reducers: setAgentStatus, addToolResult, requestConfirmation
- [ ] **Add session management reducers (CRITICAL)**:
  - `setAgentSessionId(state, action: PayloadAction<string>)` - store session ID from backend response
  - `clearAgentSession(state)` - clear session when starting new conversation or switching modes (sets agentSessionId to null)
- [x] Create `sendAgentMessage` async thunk calling `/api/v1/agent/chat`
- [ ] **Modify sendAgentMessage thunk to use session management (CRITICAL)**:
  - Extract `agentSessionId` from state: `const { agentSessionId } = state.chat`
  - Pass `agentSessionId` to agentService: `sendAgentMessageAPI(message, { sessionId: agentSessionId || undefined })`
  - **DO NOT** build conversationHistory manually - SDK Sessions handle this automatically when sessionId is provided
  - On successful response, dispatch `setAgentSessionId(response.sessionId)` to persist session for next message
  - On error or mode switch, session remains unchanged (cleared separately via clearAgentSession reducer)
- [x] Implement thunk handling different agent actions: answer (add message), tool call (show action + result), clarify (show question)
- [x] Add confirmation flow state management for operations requiring user approval
- [x] Extend selectors for agent-specific state
- [ ] **ADD: Add session selector**:
  - Add selector: `selectAgentSessionId = (state: RootState) => state.chat.agentSessionId`
  - Use in components to display current session status (optional for debugging)
- [ ] Write tests for new reducers and agent message thunk (deferred to testing phase)
- [ ] **Write session management tests**:
  - Test session ID persisted after first message: `expect(state.agentSessionId).toBe("session_abc123")`
  - Test session ID reused on subsequent messages: verify sendAgentMessage passes stored sessionId
  - Test session cleared on mode switch: `expect(state.agentSessionId).toBeNull()` after setChatMode
  - Test session cleared on new conversation: verify clearAgentSession action resets state

### Unit 24: Agent Message Components ✅

- [x] Extend MessageCard component to handle agent response types
- [x] Create `ActionBadge` component showing **handoffs** ("Orchestrator → Tags Agent") and **tool execution** indicators (create_tag, create_idea)
- [x] Create `ToolResultCard` component displaying tool execution results with success/error states
- [x] Implement different styling for different agent actions (thinking, acting, clarifying, refusing)
- [x] Add `ThinkingIndicator` animation component for when agent is processing
- [x] Create `ClarificationPrompt` component displaying agent questions with suggested responses
- [x] Create `ConfirmationDialog` component for operations requiring user approval
- [x] Add confidence score display (optional, collapsible) for debugging
- [x] Implement copy button for agent rationale text (inherited from MessageCard)
- [x] Make all components accessible with ARIA labels
- [x] **CRITICAL**: Display handoffs prominently in message UI: "🔄 Orchestrator → Ideas Agent"
- [x] **CRITICAL**: Display tool calls with clear formatting: "🔧 Calling create_tag(tag_name='python')... ✅ Success"
- [ ] Write component tests (deferred to testing phase)

### Unit 25: Agent Chat Mode Toggle ✅

- [x] Add `chatMode` field to Redux chat state with values: responses_api, agent_sdk
- [x] Add reducer for toggling chat mode
- [x] Create `ChatModeToggle` component with segmented control or tabs UI
- [x] Display mode descriptions: "Ask Questions" (Responses) vs "Take Actions" (Agent)
- [x] Show appropriate icons for each mode
- [x] Clear conversation when switching modes with user confirmation
- [ ] **Enhance mode switch to clear agent session (CRITICAL for preventing context leakage)**:
  - When switching FROM agent_sdk mode, dispatch `clearAgentSession()` to clear `agentSessionId`
  - When switching TO agent_sdk mode, ensure `agentSessionId` starts as null (new conversation with fresh session)
  - Confirmation dialog should mention: "This will start a new conversation and clear agent memory"
  - Session clearing must happen BEFORE clearing messages to prevent race conditions
  - Verify session cleared in Redux DevTools: `agentSessionId: null` after mode switch
- [x] Update ChatInterface to call correct API based on mode
- [x] Add helpful hints specific to each mode in UI
- [x] Save mode preference to localStorage
- [x] **UI Polish**: Compact design (h-9), single-line labels, high contrast active states, description separated below toggle
- [ ] Write tests for mode switching behavior (deferred to testing phase)

**Phase 5 Validation Checklist:**

- [x] **Backend Alignment**: AgentChatResponse models match frontend expectations (handoffs[], toolCalls[] arrays with camelCase aliases)
- [ ] Mode toggle switches between Responses API and Agent SDK
- [ ] Agent mode displays "Orchestrator → Tags Agent" handoffs in UI
- [ ] Tool calls show "Calling create_tag..." with results in UI
- [ ] Backend logs show handoffs with clear formatting
- [ ] Tags created via UI appear in database with correct user_id
- [ ] Keyboard navigation works throughout agent interface
- [ ] Screen reader announces handoffs and tool calls correctly

**Session Continuity Validation (CRITICAL - Test Multi-Turn Conversations):**

- [ ] **First Message Test**: Send "Hello" in Agent SDK mode
  - Verify backend logs: "Created new session: session_47e8ca62..."
  - Verify response contains sessionId field
  - Verify Redux state: `agentSessionId` populated with session ID (check Redux DevTools)
  - Verify network tab: response body includes `{"sessionId": "session_abc123"}`
- [ ] **Second Message Test (Conversation Continuity)**: Send "What did I just say?"
  - Verify agent responds with context from first message (e.g., "You said hello")
  - Verify backend logs: "Using existing session: session_47e8ca62..." (NOT "Created new session")
  - Verify network tab: request body includes `{"sessionId": "session_abc123"}` (same as first message)
  - Verify Redux state: `agentSessionId` unchanged from first message
- [ ] **Third Message Test (Extended Context)**: Send "And before that?"
  - Verify agent maintains full conversation context across all 3 messages
  - Verify same session ID used in all requests and responses
- [ ] **Mode Switch Test (Session Clearing)**: Switch to Responses API mode
  - Verify confirmation dialog warns about clearing agent memory
  - Verify Redux state: `agentSessionId` cleared to `null` after switch
  - Switch back to Agent SDK mode and send "What did we talk about?"
  - Verify agent has NO memory of previous conversation (fresh session)
  - Verify backend logs: "Created new session" (not "Using existing session")
- [ ] **New Conversation Test**: Click "New Conversation" button in Agent SDK mode
  - Verify `agentSessionId` cleared to `null` in Redux state
  - Send new message and verify new session ID generated
  - Verify backend creates new session, not reusing old one
- [ ] **Browser Refresh Test (Session Loss - Expected Behavior)**:
  - Start conversation with 2-3 messages, note the sessionId
  - Refresh browser page
  - Verify Redux state reset: `agentSessionId` is `null` (sessions don't persist across page reload)
  - Send new message and verify NEW session created (expected - in-memory sessions lost on frontend refresh)

---

**PAUSE - Phase 5 Review**

Before proceeding to Phase 6, confirm:

1. UI displays handoffs clearly ("Orchestrator → Specialist")
2. Tool executions visible in chat interface
3. Backend logs show handoff/tool call tracing
4. Multi-agent system validated end-to-end via UI

---

## Phase 7: Remaining Tools, Delete Operations & Testing

**Goal**: Complete the tool library with remaining CRUD operations (delete_idea, delete_tag, list_tags) and write automated tests for all agent tools.

**Why Now**: Phase 4 implemented core tools (create, read, update for ideas and tags). Phase 5 validated UI integration. Now complete the tool set with delete operations and ensure quality with automated tests.

**Tools Already Implemented (Phase 4)**:

- Ideas Agent (5 tools): create_idea, search_ideas, list_ideas, get_idea, edit_idea
- Tags Agent (4 tools): create_tag, search_tags, link_tag_to_idea, edit_tag

### AI PROMPT: Phase 7 Implementation (Remaining Tools & Testing)

```
Help me implement Phase 7 - Remaining Tools & Testing:

**CONTEXT**: Phase 4-5 completed core implementation:
- Ideas Agent has 5 tools: create_idea, search_ideas, list_ideas, get_idea, edit_idea
- Tags Agent has 4 tools: create_tag, search_tags, link_tag_to_idea, edit_tag
- UI displays handoffs and tool calls correctly
- All tools follow functional pattern with RLS enforcement

**TASK**: Implement remaining tools and write comprehensive tests.

**Tools to Implement**:
1. delete_idea(agent_client, user_id, idea_id) - Delete idea with ownership validation and cascade cleanup of tag links
2. delete_tag(agent_client, user_id, tag_id) - Delete tag with ownership validation and cleanup of idea_tags links
3. list_tags(agent_client, user_id, idea_id?) - List all user's tags, optionally filtered by idea_id

**Requirements for Each Tool**:
- Functional implementation following established pattern
- RLS enforcement via agent_client parameter
- Ownership validation before delete operations
- Cascade cleanup (delete_idea removes idea_tags entries, delete_tag removes idea_tags entries)
- Clear confirmation messages ("Deleted idea 'My Idea' and removed 3 tag links")
- Return dict with success/error status and affected counts

**Update Agents**:
- Add delete_idea to Ideas Agent
- Add delete_tag, list_tags to Tags Agent
- Update agent instructions with delete operation guidance and confirmation examples

**Automated Testing**:
- Write unit tests for each tool function
- Write integration tests for agent routing
- Test RLS enforcement (user cannot delete other user's data)
- Test cascade cleanup (deleting idea/tag cleans up junction table)
- Test error handling (delete non-existent, delete already deleted)

After implementation:
- Show me created tool files
- Run test suite and show results
- Guide me through UI testing of delete operations

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 7.
```

**Tasks:**

- [ ] Implement delete_idea tool with ownership validation and cascade cleanup of idea_tags
- [ ] Implement delete_tag tool with ownership validation and cleanup of idea_tags links
- [ ] Implement list_tags tool with optional idea_id filtering
- [ ] Add delete_idea_tool wrapper to Ideas Agent (brings total to 6 tools)
- [ ] Add delete_tag_tool, list_tags_tool wrappers to Tags Agent (brings total to 6 tools)
- [ ] Update IDEAS_AGENT_INSTRUCTIONS with delete operation guidance
- [ ] Update TAGS_AGENT_INSTRUCTIONS with delete and list operations guidance
- [ ] Write unit tests for all Ideas Agent tools (create, search, list, get, edit, delete)
- [ ] Write unit tests for all Tags Agent tools (create, search, link, edit, delete, list)
- [ ] Write integration tests for orchestrator routing decisions
- [ ] Write RLS enforcement tests (cross-user access prevention)
- [ ] Write cascade cleanup tests (delete idea cleans idea_tags, delete tag cleans idea_tags)
- [ ] Test delete operations via UI chat interface
- [ ] Verify error handling for edge cases (delete non-existent, double-delete)

**Phase 6 Validation Checklist:**

- [ ] delete_idea works via UI: "Delete my idea about Python"
- [ ] delete_tag works via UI: "Delete the javascript tag"
- [ ] list_tags works via UI: "Show me all my tags" or "What tags does idea 5 have?"
- [ ] Cascade cleanup verified: deleting idea removes its tag links
- [ ] Cascade cleanup verified: deleting tag removes its idea links
- [ ] All unit tests pass: `pytest backend/tests/test_tools.py`
- [ ] All integration tests pass: `pytest backend/tests/test_agents.py`
- [ ] RLS tests pass: user cannot delete other user's ideas/tags
- [ ] Backend logs show delete operations clearly

---

**PAUSE - Phase 7 Review**

Before proceeding to Phase 8, confirm:

1. All 6 Ideas Agent tools functional (create, search, list, get, edit, delete)
2. All 6 Tags Agent tools functional (create, search, link, edit, delete, list)
3. Test suite passing with good coverage
4. Delete operations cascade correctly

---

## Phase 8: Production Features & Safeguards (Units 30-33)

**Goal**: Add production-ready features - rate limiting, comprehensive testing, advanced conversation management, and cost controls.

**Why Now**: Core functionality validated via UI. Now add safeguards before wider deployment.

### AI PROMPT: Phase 8 Implementation

```
Help me implement Phase 8 - Production Features & Safeguards:

**CONTEXT**: Phases 4-7 complete:
- Backend agent system functional
- Frontend displays handoffs and tool calls
- Additional tools implemented and tested via UI

**TASK**: Add production-ready features for safe deployment.

**Unit 30 - Rate Limiting**
1. Install slowapi library: pip install slowapi
2. Create rate limiter instance in backend/app/core/rate_limiting.py
3. Apply rate limiter to /api/v1/agent/chat: 20 requests/minute per user
4. Apply rate limiter to /api/v1/ai/query: 10 requests/minute per user
5. Test: send rapid requests, verify 429 on limit exceeded
6. Return clear error messages with retry-after header
7. Write rate limiting tests

**Unit 31 - Comprehensive Testing Suite**
8. Write E2E test: "Create tag called python" → verify in database
9. Write E2E test: "Create idea called X" → verify in database
10. Write E2E test: Multi-turn conversation maintains context
11. Write E2E test: RLS enforcement - user can't access other user's data
12. Write E2E test: Error recovery - OpenAI API failure, database error
13. Write performance test: agent response time < 3s p95
14. Write test for orchestrator routing decisions
15. Write test for handoff logging and display
16. Create test data fixtures for reproducible testing

**Unit 32 - Advanced Conversation Management**
17. Create conversations table: id, user_id, title, created_at, updated_at, mode
18. Create conversation_messages table: id, conversation_id, role, content, metadata, timestamp
19. Implement conversation auto-saving on each message exchange
20. Implement conversation listing endpoint GET /api/v1/conversations
21. Implement conversation loading endpoint GET /api/v1/conversations/{id}
22. Add conversation sidebar component in frontend
23. Add "New Conversation" button functionality
24. Test conversation persistence and loading

**Unit 33 - Cost Tracking & Monitoring**
25. Create user_api_usage table: user_id, date, total_tokens, total_cost, request_count
26. Implement usage tracking middleware updating stats on each API call
27. Implement daily cost budget checking ($10/day per user default)
28. Add usage dashboard component showing consumption
29. Add alerts when approaching budget limits
30. Write tests for cost tracking and budget enforcement

After implementation:
- Show me files for review
- Guide me through testing production features
- Ask me to confirm all safeguards working

Mark completed tasks with [x].
```

### Unit 30: Rate Limiting

- [ ] Install slowapi library: `pip install slowapi`
- [ ] Create rate limiter instance in [backend/app/core/rate_limiting.py](backend/app/core/rate_limiting.py)
- [ ] Apply rate limiter to `/api/v1/agent/chat`: 20 requests/minute per user
- [ ] Apply rate limiter to `/api/v1/ai/query`: 10 requests/minute per user
- [ ] Test rapid requests, verify 429 status on limit exceeded
- [ ] Return clear error messages with `retry-after` header
- [ ] Write rate limiting tests

### Unit 31: Comprehensive Testing Suite

- [ ] Write E2E test: user sends "Create tag called python", verify tag in database
- [ ] Write E2E test: user sends "Create idea called X", verify idea in database
- [ ] Write E2E test: multi-turn conversation maintains context correctly
- [ ] Write E2E test: RLS enforcement - user cannot access other user's ideas/tags
- [ ] Write E2E test: error recovery - OpenAI API failure, database connection error
- [ ] Write performance test: agent response time < 3s at p95
- [ ] Write test for orchestrator routing decisions (ideas vs tags)
- [ ] Write test for handoff logging appears in backend logs
- [ ] Create test data fixtures for reproducible agent testing
- [ ] Document test scenarios and expected behaviors

### Unit 32: Advanced Conversation Management

- [ ] Create `conversations` table: id, user_id, title, created_at, updated_at, mode (responses_api | agent_sdk)
- [ ] Create `conversation_messages` table: id, conversation_id, role, content, metadata, timestamp
- [ ] Implement conversation auto-saving on each message exchange
- [ ] Implement `GET /api/v1/conversations` endpoint for listing user's conversations
- [ ] Implement `GET /api/v1/conversations/{id}` endpoint for loading specific conversation
- [ ] Add conversation sidebar component in frontend showing history
- [ ] Add "New Conversation" button functionality
- [ ] Test conversation persistence and loading across sessions

### Unit 33: Cost Tracking & Monitoring

- [ ] Create `user_api_usage` table: user_id, date, total_tokens, total_cost, request_count
- [ ] Implement usage tracking middleware updating stats on each API call (both Responses and Agent)
- [ ] Implement daily cost budget checking ($10/day per user default)
- [ ] Return error when budget exceeded with clear message
- [ ] Add usage dashboard component in frontend showing token/cost consumption
- [ ] Add alerts when user approaching 80% of daily budget
- [ ] Write tests for cost tracking accuracy and budget enforcement

**Phase 8 Validation Checklist:**

- [ ] Rate limiting prevents abuse (test rapid requests)
- [ ] All E2E tests passing
- [ ] Conversation history saves and loads correctly
- [ ] Cost tracking accurately reflects API usage
- [ ] Budget limits enforced properly
- [ ] Production monitoring ready

---

**PAUSE - Phase 8 Review**

Before final deployment, confirm:

1. Rate limiting tested and working
2. Full test suite passes
3. Conversation management functional
4. Cost tracking accurate
5. All production safeguards active

---

## Phase 9: Advanced Features (Optional Future Enhancements)

**Note**: These features are optional and should only be implemented after Phases 4-8 are complete and stable.

### Potential Future Features:

- **Unit 34**: Web search integration for enriching ideas with external content
- **Unit 35**: Multi-modal support (image uploads for idea visualization)
- **Unit 36**: Collaborative features (shared ideas, team workspaces)
- **Unit 37**: Advanced analytics (idea trends, tag usage patterns)
- **Unit 38**: Export capabilities (PDF, Markdown, JSON)
- **Unit 39**: Browser extension for capturing ideas from web pages
- **Unit 40**: RunContextWrapper for SDK-native user context passing

---

### Unit 40: RunContextWrapper for SDK-Native User Context Passing

**Note**: This is an optional enhancement to replace the current closure-based pattern with the SDK-native RunContextWrapper pattern. The current implementation works correctly; this unit provides an architectural improvement for better separation of concerns.

**CRITICAL**: This unit implements the SDK-native pattern for passing custom context (user_id, email, etc.) to agent tools WITHOUT hardcoding parameters through the entire call chain. The `RunContextWrapper` pattern is the official OpenAI Agents SDK solution for providing runtime context that agents don't need to reason about but tools need to access.

**Why This Matters**:

- **Ownership Problem**: Agent authenticates as agent-user (UUID: 8ef7e6d1-...), but tags must be owned by human user (UUID: 47e8ca62-...)
- **Without RunContextWrapper**: Hardcode user_id through orchestrator → tags_agent → tools (tight coupling, architectural smell)
- **With RunContextWrapper**: SDK injects context into tools automatically, agents remain context-agnostic
- **Educational Value**: Demonstrates SDK-native patterns vs ad-hoc solutions for new developers

**Official Documentation**: https://github.com/openai/openai-agents-python/blob/main/docs/context.md

**Architecture Flow**:

```
HTTP Request (user_id: "47e8ca62-...")
    ↓
Endpoint creates UserContext(user_id="47e8ca62-...", email="user@example.com")
    ↓
Endpoint wraps orchestrator: RunContextWrapper(orchestrator, UserContext)
    ↓
Endpoint passes context to Runner.run(..., context=user_context)
    ↓
SDK automatically injects context as first parameter to ALL tool calls
    ↓
Tools receive: create_tag_tool(ctx: RunContextWrapper[UserContext], tag_name: str)
    ↓
Tools access: tag_owner = ctx.context.user_id
    ↓
Database insert: {"name": tag_name, "user_id": tag_owner}
```

**Task List**:

- [ ] **Step 1: Define UserContext Pydantic Model**

  - Create `backend/app/models/user_context.py` module
  - Import: `from pydantic import BaseModel, Field`
  - Define `UserContext` model with fields:
    - `user_id: str = Field(..., description="UUID of the human user who owns the data")`
    - `email: str = Field(..., description="Email of the authenticated user")`
  - Add docstring explaining: "Runtime context passed to all agent tools via RunContextWrapper. Contains human user identity (not agent-user identity)."
  - Add example usage in docstring showing context access pattern
  - Write model validation tests

- [ ] **Step 2: Update Tool Signatures to Accept Context**

  - Modify `backend/app/services/tools/create_tag.py`:
    - Import: `from agents import RunContextWrapper`
    - Import: `from ...models.user_context import UserContext`
    - Change signature: `def create_tag(ctx: RunContextWrapper[UserContext], tag_name: str, item_id: Optional[int] = None) -> dict:`
    - Extract user_id: `user_id = ctx.context.user_id` (first line of function)
    - Update docstring: Add ctx parameter documentation, explain RunContextWrapper pattern
    - Keep agent_client access: `agent_client = ctx.context.agent_client` (if storing in context) OR pass separately
  - Modify `backend/app/services/tools/search_tags.py`:
    - Import: `from agents import RunContextWrapper`
    - Import: `from ...models.user_context import UserContext`
    - Change signature: `def search_tags(ctx: RunContextWrapper[UserContext], query: str, limit: Optional[int] = 10) -> dict:`
    - Extract user_id: `user_id = ctx.context.user_id`
    - Update query filter: `.eq("user_id", user_id)` (already implemented, just add ctx access)
    - Update docstring with ctx parameter
  - **CRITICAL**: Context parameter MUST be first parameter for SDK to inject it
  - **CRITICAL**: Tools still decorated with `@function_tool` - decorator compatible with context pattern

- [ ] **Step 3: Update Tool Wrappers in Tags Agent**

  - Modify `backend/app/services/app_agents/tags_agent.py`:
    - Import: `from agents import RunContextWrapper`
    - Import: `from ...models.user_context import UserContext`
    - Update `create_tag_tool` wrapper signature: `def create_tag_tool(ctx: RunContextWrapper[UserContext], tag_name: str, idea_id: Optional[int] = None) -> str:`
    - Pass context to underlying function: `result = create_tag(ctx, tag_name, idea_id)`
    - Update `search_tags_tool` wrapper signature: `def search_tags_tool(ctx: RunContextWrapper[UserContext], query: str, limit: Optional[int] = 10) -> str:`
    - Pass context to underlying function: `result = search_tags(ctx, query, limit)`
    - Update docstrings explaining context parameter
    - Keep `@function_tool` decorator (decorator handles context injection)
  - **CRITICAL**: Remove agent_client from closure - pass via context OR keep separate
  - **Decision Point**: Store agent_client in UserContext OR pass separately to tools (recommend separate for clarity)

- [ ] **Step 4: Modify Endpoint to Create and Pass Context**

  - Modify `backend/app/api/routes/agent.py`:
    - Import: `from agents import RunContextWrapper`
    - Import: `from ...models.user_context import UserContext`
    - After getting user_id and email from current_user, create context:
      ```python
      user_context = UserContext(
          user_id=user_id,
          email=current_user["user"]["email"]
      )
      ```
    - Wrap orchestrator with context:
      ```python
      orchestrator = create_orchestrator(agent_client)
      wrapped_orchestrator = RunContextWrapper(orchestrator, user_context)
      ```
    - Pass context to Runner.run:
      ```python
      result = await Runner.run(
          wrapped_orchestrator,
          request_body.message,
          session=session,
          context=user_context  # SDK injects this into all tool calls
      )
      ```
    - Add logging: `logger.info(f"Created UserContext for user {user_id}")`
  - **CRITICAL**: Context passed to Runner.run, NOT to agent factory functions
  - **CRITICAL**: SDK automatically injects context as first parameter to all decorated tools

- [ ] **Step 5: Revert Factory Function Signatures**

  - Verify `create_orchestrator(agent_client)` signature has NO user_id parameter (already done in Step 1)
  - Verify `create_tags_agent(agent_client)` signature has NO user_id parameter (already done in Step 1)
  - Verify `create_ideas_agent()` signature unchanged (no user_id)
  - **Status**: All reversions completed in Step 1 above

- [ ] **Step 6: Handle agent_client in Context (Architectural Decision)**

  - **Option A (Recommended)**: Keep agent_client as closure in tool wrappers, use context only for user_id/email
    - Pros: Clear separation of SDK client vs runtime data, simpler context model
    - Cons: Tools still have closure over agent_client
  - **Option B**: Store agent_client in UserContext, access via `ctx.context.agent_client`
    - Pros: All runtime dependencies in context, no closures
    - Cons: Mixing concerns (user data + SDK client), requires typing.cast for client type
  - **Recommendation**: Use Option A - context for user identity, closure for agent_client
  - Implement chosen option in tool wrappers

- [ ] **Step 7: Update Documentation and Comments**

  - Add comments in create_tag.py explaining RunContextWrapper pattern vs hardcoded user_id
  - Add comments in tags_agent.py explaining context injection by SDK
  - Add comments in agent.py endpoint explaining context creation and wrapping
  - Update AGENTS.md with RunContextWrapper pattern as best practice
  - Add section to PRD Implementation Notes documenting:
    - Why RunContextWrapper chosen over alternatives (data model, RLS mapping)
    - SDK documentation references
    - Code examples showing context flow
    - Comparison to rejected approaches (hardcoded threading, etc.)

- [ ] **Step 8: Validation Testing**

  - Test: "Create a tag called python" → verify tag created with correct user_id (human user, not agent user)
  - Test: "Search for tags matching 'py'" → verify only human user's tags returned
  - Verify logs show: "Created UserContext for user 47e8ca62-..."
  - Verify database: tags.user_id = "47e8ca62-..." (human user UUID)
  - Verify NO user_id in orchestrator/agent factory signatures
  - Verify tools receive context as first parameter
  - Test handoffs still work: "Orchestrator → Tags Agent" visible in logs
  - Test tool execution: "Calling create_tag..." visible in logs

- [ ] **Step 9: Write Tests for Context Pattern**
  - Unit test: UserContext model validation
  - Unit test: Tool receives context correctly, extracts user_id
  - Integration test: Endpoint creates context, wraps orchestrator, passes to Runner
  - Integration test: Tag created with correct ownership (human user_id)
  - Integration test: Search returns only user's tags
  - Test error handling: Invalid user_id in context

**Common Pitfalls**:

- **Pitfall #1**: Forgetting to make context first parameter in tool signature
  - SDK expects: `def tool(ctx: RunContextWrapper[T], other_args...)`
  - Will fail if: `def tool(other_args..., ctx: RunContextWrapper[T])`
- **Pitfall #2**: Not passing context to Runner.run
  - Must use: `Runner.run(..., context=user_context)`
  - SDK won't inject context if not provided to Runner
- **Pitfall #3**: Wrapping agent before creating it
  - Correct: Create agent, then wrap: `RunContextWrapper(agent, context)`
  - Wrong: Trying to pass context to agent factory
- **Pitfall #4**: Mixing context with hardcoded parameters
  - Don't pass both ctx AND user_id as separate parameters
  - Context replaces hardcoded parameters entirely

**Educational Notes for New Developers**:

This pattern demonstrates:

- **SDK-Native Solutions**: Using built-in framework features vs ad-hoc implementations
- **Separation of Concerns**: Agents reason about tasks, tools access runtime context, no mixing
- **Type Safety**: Pydantic models for context ensure type checking and validation
- **Testability**: Context can be mocked easily in tests vs threading parameters through multiple layers
- **Maintainability**: Adding new context fields (permissions, org_id, etc.) only touches UserContext model and tools that need it

**Alternative Approaches Rejected**:

1. **Hardcoded user_id Threading** (current implementation - works but not SDK-native):

   - Requires changing every factory signature: orchestrator(user_id) → tags_agent(user_id) → tools(user_id)
   - Tight coupling between layers
   - Difficult to extend (add new context fields = change all signatures)
   - Not SDK-native pattern

2. **Data Model Changes** (created_by vs owned_by):

   - Could add created_by_agent_id and owned_by_user_id columns
   - Avoids threading but requires database migration
   - Doesn't solve general context passing problem (what about permissions, org_id, etc.?)
   - Mixes data model concerns with runtime context

3. **RLS with Mapping Table**:
   - Could create agent_to_user_mappings table for RLS to resolve
   - Complex database logic for simple runtime context problem
   - Still doesn't provide context for non-ownership use cases

**Why RunContextWrapper Wins**: SDK-native, type-safe, extensible, testable, clear separation of concerns.

---

## Recommended Final PRD Structure

**Phase 4: Tool Specification & Base Infrastructure (Units 15-18)**

- Unit 15: Functional Tool Implementation
- Unit 16: @function_tool Decorator Pattern
- Unit 17: Pydantic Models for Agent Responses
- Unit 18: Agent System Prompts

**Phase 5: Agent Implementation & Backend Endpoint (Units 19-22)**

- Unit 19: Ideas Specialist Agent
- Unit 20: Tags Specialist Agent
- Unit 21: Orchestrator Agent
- Unit 22: Agent SDK Backend Endpoint

**Phase 6: Frontend Integration & UI Validation (Units 23-25)**

- Unit 23: Redux Agent Slice Extension
- Unit 24: Agent Message Components
- Unit 25: Agent Chat Mode Toggle

**Phase 7: Remaining Tools, Delete Operations & Testing (Units 26-29)**

- Unit 26: delete_idea Tool
- Unit 27: delete_tag Tool
- Unit 28: list_tags Tool
- Unit 29: Agent Tool Testing Suite

**Phase 8: Production Features & Safeguards (Units 30-33)**

- Unit 30: Rate Limiting
- Unit 31: Comprehensive Testing Suite
- Unit 32: Advanced Conversation Management
- Unit 33: Cost Tracking & Monitoring

**Phase 9: Advanced Features (Optional Future Enhancements - Units 34-40)**

- Unit 34: Web Search Integration
- Unit 35: Multi-Modal Support
- Unit 36: Collaborative Features
- Unit 37: Advanced Analytics
- Unit 38: Export Capabilities
- Unit 39: Browser Extension
- Unit 40: RunContextWrapper for SDK-Native User Context

---

**END OF BEAST MODE PRD - SESSION 4 PART B**
