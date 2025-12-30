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

---

# PART B: AGENT SDK IMPLEMENTATION (Units 15-32)

**Goal**: Implement autonomous agentic system with tool-calling, multi-specialist architecture, and orchestration

**Outcome**: Working agent system where users can instruct AI to perform database operations (create items, add tags), with agents making autonomous decisions about when and how to act

**Why After Responses API**: Builds upon established foundation (OpenAI SDK, chat UI, agent-user auth) and adds complexity (tool execution, decision boundaries, orchestrator pattern)

---

## Phase 4: Tool Specification & Base Agent Infrastructure (Units 15-18)

**⚠️ CRITICAL FOR AI ASSISTANTS:**

- Folder MUST be `backend/app/services/app_agents/` (NOT `agents/` - conflicts with openai-agents package)
- Import: `from agents import Agent, Runner` (package name is `agents`, NOT `openai_agents`)
- Database table: `ideas` (NOT `items` - terminology must match database schema)
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
46. Create Tags agent and verify tools array populated correctly
47. Test AgentChatRequest/Response models serialize correctly with camelCase aliases
48. Verify all three system prompts defined (Orchestrator, Ideas, Tags)
49. Test prompt version tracking works
50. Run backend server and verify no import errors
51. Test /api/v1/agent/chat endpoint with simple query ("how are you?")
52. Test tool execution via endpoint ("create a tag called python")
53. Verify backend logs show handoffs and tool calls clearly
54. Check database for created tag with correct user_id (RLS enforcement)

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

- [ ] Create `backend/app/models/agent.py` module
- [ ] Define `AgentAction` enum with values: answer, tool_call, clarify, refuse
- [ ] Define `AgentChatRequest` model with fields:
  - message (str) - user query
  - session_id (Optional[str]) - SDK session ID for conversation continuity
  - conversation_history (Optional[List]) - DEPRECATED, not used with SDK Sessions (included for API compatibility but ignored)
- [ ] Define `AgentChatResponse` model with fields:
  - success (bool)
  - response (str)
  - session_id (str) - return session ID for frontend to persist (CRITICAL for conversation continuity)
  - handoffs (Optional[List[Handoff]])
  - toolCalls (Optional[List[ToolCall]])
  - agentName (Optional[str])
  - confidence (Optional[float])
  - error (Optional[str])
- [ ] **CRITICAL**: Ensure session_id uses camelCase alias "sessionId" for frontend compatibility
- [ ] Add model validation and examples in docstrings showing session_id usage patterns
- [ ] Write model validation tests including session_id serialization to camelCase
- [ ] Document all models with usage examples emphasizing session management flow

**Note**: Simplified from original PRD specs. OpenAI Agent SDK handles most response formatting internally via Runner. We only need request/response models for FastAPI endpoint contract. Session management is handled via SDK's SQLiteSession class.

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

### Unit 19: Ideas Specialist Agent Implementation

- [x] Create `backend/app/services/app_agents/ideas_agent.py` module
- [x] Import: `from agents import Agent` (package name is `agents`)
- [x] Import: `from .prompts import IDEAS_AGENT_INSTRUCTIONS`
- [x] Define `create_ideas_agent()` factory function
- [x] Configure Agent with name="Ideas" and IDEAS_AGENT_INSTRUCTIONS
- [x] Export singleton `ideas_agent` instance for reuse
- [ ] Register tools: create_idea, search_ideas, update_idea, delete_idea (placeholders for future)
- [ ] Implement tool wrapper functions with agent_client closure
- [ ] **CRITICAL**: Apply `@function_tool` decorator to all tool wrappers (follow Unit 16 + Tags agent pattern)
- [ ] Verify decorated tools have `.name` attribute before passing to `Agent(tools=[...])`
- [ ] Add comprehensive logging for agent decisions
- [ ] Write agent tests: tool execution, routing behavior

**Status**: Agent structure created. Tool implementations pending.

**Note**: When implementing Ideas tools (create_idea, search_ideas, etc.), follow the @function_tool decorator pattern from Unit 16 and Tags agent implementation. All tool wrappers MUST be decorated before registration to avoid `AttributeError: 'function' object has no attribute 'name'`.

### Unit 20: Tags Specialist Agent Implementation

- [x] Create `backend/app/services/app_agents/tags_agent.py` module
- [x] Import: `from agents import Agent, function_tool` (**CRITICAL**: must import function_tool decorator)
- [x] Import: `from ..tools import create_tag, search_tags` (relative import from services/tools)
- [x] Import: `from .prompts import TAGS_AGENT_INSTRUCTIONS`
- [x] Define `create_tags_agent(agent_client)` factory function
- [x] Configure Agent with name="Tags" and TAGS_AGENT_INSTRUCTIONS
- [x] **CRITICAL**: Apply `@function_tool` decorator to create_tag wrapper function
- [x] **CRITICAL**: Verify decorated function has `.name` attribute: `hasattr(create_tag_tool, 'name')`
- [x] Update wrapper function to return `str` (SDK expects string outputs, not dict)
- [x] Register create_tag tool with agent_client closure
- [x] Implement search_tags tool with @function_tool decorator
- [x] Register search_tags tool with agent_client closure
- [ ] Register additional tools: link_tag, unlink_tag (future work)
- [x] Implement tool wrapper binding agent_client to create_tag
- [x] Add docstrings for all tool wrappers
- [ ] Write agent tests: tag creation, tag search, tag linking

**Status**: Core agent + create_tag + search_tags tools implemented with @function_tool decorator. Decorator error FIXED. Ready for validation.

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

### Unit 22: Agent SDK Backend Endpoint

- [x] Create `POST /api/v1/agent/chat` endpoint in `backend/app/api/routes/agent.py`
- [x] Import: `from agents import Runner, SQLiteSession` (NOT openai_agents)
- [x] Import: `from ...services.app_agents import create_orchestrator`
- [x] Import: `from ...services.agent_auth import get_agent_client`
- [x] Implement `AgentChatRequest` and `AgentChatResponse` Pydantic models
- [x] Get authenticated user from session via `get_current_user` dependency
- [x] Access user ID correctly using nested structure `current_user["user"]["id"]` matching auth system
- [x] Get RLS-enforced agent_client via `get_agent_client(user_id)`
- [x] Create orchestrator agent with agent_client
- [x] Use correct field name `request_body.message` not `request_body.query` matching AgentChatRequest model
- [x] Use async pattern `await Runner.run()` not `Runner.run_sync()` in async endpoint to avoid event loop conflicts
- [x] Pass agent and message as positional arguments to Runner.run, session as keyword argument
- [x] **Session Management Implementation (CRITICAL for conversation continuity)**:
  - Create/retrieve SQLiteSession from in-memory sessions dictionary: `sessions: dict[str, SQLiteSession] = {}`
  - If `request_body.session_id` provided, reuse existing session (enables multi-turn conversations)
  - If no `session_id`, generate new: `f"session_{user_id}_{request_id}"`
  - Store session in dictionary for reuse across requests: `sessions[session_id] = SQLiteSession(session_id, ":memory:")`
  - Sessions use in-memory SQLite (`:memory:`) - sufficient for demo/learning purposes
  - **CRITICAL**: Always return `session_id` in AgentChatResponse for frontend persistence
  - SDK Sessions automatically manage conversation history via `session.get_items()` and `session.add_items()`
  - No manual conversation history building required - SDK handles this internally
  - Documentation: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md
- [x] Return agent response with session_id (essential for frontend to maintain conversation continuity)
- [ ] **Out of Scope**: Upgrade to persistent file-based sessions: `SQLiteSession(session_id, "agent_sessions.db")` for persistence across server restarts
- [ ] Implement rate limiting (20 agent requests per minute per user)
- [ ] Add request ID tracking through entire agent pipeline
- [ ] Enhance error handling to return safe messages
- [ ] Add comprehensive endpoint documentation with examples
- [ ] Write endpoint tests: tool execution, handoffs, errors

**Implementation Notes - Common Pitfalls Resolved**:

- **Tool Registration Error (CRITICAL)**: Tools passed to `Agent(tools=[...])` MUST be decorated with `@function_tool` decorator from agents package.

  - **Problem**: Passing raw Python functions or plain wrapper functions without decorator
  - **Symptom**: `AttributeError: 'function' object has no attribute 'name'` when SDK tries to access `t.name` on tools
  - **Root Cause**: Python functions have `.__name__` attribute (with underscores), but SDK expects `.name` attribute (no underscores) which the decorator provides
  - **Solution**: Import `from agents import function_tool` and decorate all tool wrappers: `@function_tool`
  - **Example**:

    ```python
    from agents import function_tool, Agent

    @function_tool
    async def create_tag_tool(tag_name: str, idea_id: Optional[int] = None) -> str:
        """Create a new tag and optionally link to an idea."""
        result = create_tag(agent_client, tag_name, idea_id)
        return str(result)

    agent = Agent(name="Tags", tools=[create_tag_tool])  # ✅ Decorated function has .name
    ```

  - **Verification**: Check `hasattr(tool_function, 'name')` returns `True` before passing to Agent
  - **SDK Reference**: https://openai.github.io/openai-agents-python/tools/#function-tools
  - **Error Location**: SDK crashes at `agents/run.py:599` when building tool metadata: `[t.name for t in all_tools]`

- **Environment Loading (CRITICAL)**: `load_dotenv()` must be called at the VERY TOP of `main.py` BEFORE any other imports. The OpenAI Agents SDK looks for `OPENAI_API_KEY` environment variable as soon as the `agents` package is imported anywhere in the codebase. If `.env` is not loaded first, the SDK will raise `OpenAIError: The api_key client option must be set`. Add this pattern at top of `main.py`:

  ```python
  # CRITICAL: Load environment variables BEFORE any other imports
  import os
  from dotenv import load_dotenv
  load_dotenv()

  # Optionally log that env vars loaded
  import logging
  logger = logging.getLogger(__name__)
  logger.info("✅ Environment variables loaded from .env")
  if os.getenv("OPENAI_API_KEY"):
      key_preview = os.getenv("OPENAI_API_KEY")[:20] + "..."
      logger.info(f"✅ OPENAI_API_KEY found: {key_preview}")

  from fastapi import FastAPI, Request
  # ... rest of imports
  ```

````

- **RunResult Object Structure (CRITICAL)**: The `RunResult` object from `await Runner.run()` does NOT have a `messages` attribute. Instead, use:
  - `result.final_output` - the final response string from the last agent
  - `result.new_items` - list of `RunItem` objects (handoffs, tool calls, messages)
  - `result.last_agent` - the agent that finished execution
  - Documentation: https://github.com/openai/openai-agents-python/blob/main/docs/results.md
  - Parse `new_items` to extract handoffs and tool calls:
    ```python
    for item in result.new_items:
        item_type = type(item).__name__
        if item_type == "HandoffOutputItem":
            # Extract from_agent and to_agent from item.source_agent.name and item.target_agent.name
        elif item_type == "ToolCallOutputItem":
            # Extract tool_name and tool_output from item attributes
    ```
- **Session Management (CRITICAL for conversation continuity)**: The OpenAI Agents SDK provides built-in session memory via `SQLiteSession` to maintain conversation history automatically. Key implementation points:
  - **Backend Pattern**: Create `sessions: dict[str, SQLiteSession] = {}` dictionary to store sessions in memory
  - **Backend Session Retrieval**: If `request_body.session_id` provided, reuse existing session from dictionary for conversation continuity
  - **Backend Session Creation**: If no `session_id`, generate new one: `f"session_{user_id}_{request_id}"` and create `SQLiteSession(session_id, ":memory:")`
  - **Backend Runner Integration**: Pass session to `Runner.run(agent, message, session=session)` - SDK automatically retrieves and appends conversation history
  - **Backend Response**: Always return `session_id` in AgentChatResponse for frontend to persist and reuse
  - **Frontend State**: Store `agentSessionId: string | null` in Redux ChatState (separate from messages array)
  - **Frontend Request**: Pass stored sessionId with each request: `sendAgentMessageAPI(message, { sessionId: state.chat.agentSessionId })`
  - **Frontend Response Handling**: Save returned sessionId to Redux: `dispatch(setAgentSessionId(response.sessionId))` after successful response
  - **Frontend Session Clearing**: Clear `agentSessionId` when switching modes or starting new conversation to prevent context leakage
  - **DO NOT build conversationHistory manually** - SDK Sessions handle this automatically via `session.get_items()` and `session.add_items()`
  - **Session Lifecycle**: Backend sessions persist in memory until server restart; upgrade to file-based for production: `SQLiteSession(session_id, "agent_sessions.db")`
  - **Documentation**: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md
  - **Advanced Options (Out of Scope)**: SQLAlchemySession (PostgreSQL/MySQL), AdvancedSQLiteSession (branching), EncryptedSession (encryption wrapper)
- Authentication dependency returns nested structure requiring `current_user["user"]["id"]` access pattern
- AgentChatRequest uses `message` field not `query` to distinguish from Responses API
- FastAPI async endpoints require `await Runner.run()` not `Runner.run_sync()` - sync method creates event loop conflicts
- Runner.run takes positional arguments for agent and message, keyword arguments for session and config
- Agent credentials must exist in user_profiles table for existing users (auto-created during signup for new users)

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

**PAUSE - Phase 4 Complete**

Backend core infrastructure complete. Proceed to Phase 5 for frontend integration and visual validation.

---

## Phase 5: Frontend Integration & UI Validation (Units 23-25)

**Goal**: Make Agent SDK visible and testable via chat interface. Demonstrate handoffs, tool calls, and agent reasoning in UI components.

**Why Now**: Validate multi-agent system works through user-facing interface before building additional tools. No external API testing tools (Postman) needed - everything visible in UI.

**Critical Requirements**:

- **Display Handoffs**: Show "Orchestrator → Ideas Agent" or "Orchestrator → Tags Agent" in message UI
- **Display Tool Calls**: Show "Calling tool: create_tag(tag_name='python')" with results
- **Backend Logging**: Log all handoffs and tool executions with clear formatting and timestamps
- **Frontend Visibility**: Users see full agent decision-making process (thinking → routing → tool execution → result)

### AI PROMPT: Phase 5 Implementation (Frontend Integration - Units 23-25)

```
Help me implement Phase 5 - Frontend Integration & UI Validation:

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

### Unit 22.5: Configure RunContextWrapper for User Context Passing

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
    * `user_id: str = Field(..., description="UUID of the human user who owns the data")`
    * `email: str = Field(..., description="Email of the authenticated user")`
  - Add docstring explaining: "Runtime context passed to all agent tools via RunContextWrapper. Contains human user identity (not agent-user identity)."
  - Add example usage in docstring showing context access pattern
  - Write model validation tests

- [ ] **Step 2: Update Tool Signatures to Accept Context**
  - Modify `backend/app/services/tools/create_tag.py`:
    * Import: `from agents import RunContextWrapper`
    * Import: `from ...models.user_context import UserContext`
    * Change signature: `def create_tag(ctx: RunContextWrapper[UserContext], tag_name: str, item_id: Optional[int] = None) -> dict:`
    * Extract user_id: `user_id = ctx.context.user_id` (first line of function)
    * Update docstring: Add ctx parameter documentation, explain RunContextWrapper pattern
    * Keep agent_client access: `agent_client = ctx.context.agent_client` (if storing in context) OR pass separately
  - Modify `backend/app/services/tools/search_tags.py`:
    * Import: `from agents import RunContextWrapper`
    * Import: `from ...models.user_context import UserContext`
    * Change signature: `def search_tags(ctx: RunContextWrapper[UserContext], query: str, limit: Optional[int] = 10) -> dict:`
    * Extract user_id: `user_id = ctx.context.user_id`
    * Update query filter: `.eq("user_id", user_id)` (already implemented, just add ctx access)
    * Update docstring with ctx parameter
  - **CRITICAL**: Context parameter MUST be first parameter for SDK to inject it
  - **CRITICAL**: Tools still decorated with `@function_tool` - decorator compatible with context pattern

- [ ] **Step 3: Update Tool Wrappers in Tags Agent**
  - Modify `backend/app/services/app_agents/tags_agent.py`:
    * Import: `from agents import RunContextWrapper`
    * Import: `from ...models.user_context import UserContext`
    * Update `create_tag_tool` wrapper signature: `def create_tag_tool(ctx: RunContextWrapper[UserContext], tag_name: str, idea_id: Optional[int] = None) -> str:`
    * Pass context to underlying function: `result = create_tag(ctx, tag_name, idea_id)`
    * Update `search_tags_tool` wrapper signature: `def search_tags_tool(ctx: RunContextWrapper[UserContext], query: str, limit: Optional[int] = 10) -> str:`
    * Pass context to underlying function: `result = search_tags(ctx, query, limit)`
    * Update docstrings explaining context parameter
    * Keep `@function_tool` decorator (decorator handles context injection)
  - **CRITICAL**: Remove agent_client from closure - pass via context OR keep separate
  - **Decision Point**: Store agent_client in UserContext OR pass separately to tools (recommend separate for clarity)

- [ ] **Step 4: Modify Endpoint to Create and Pass Context**
  - Modify `backend/app/api/routes/agent.py`:
    * Import: `from agents import RunContextWrapper`
    * Import: `from ...models.user_context import UserContext`
    * After getting user_id and email from current_user, create context:
      ```python
      user_context = UserContext(
          user_id=user_id,
          email=current_user["user"]["email"]
      )
      ```
    * Wrap orchestrator with context:
      ```python
      orchestrator = create_orchestrator(agent_client)
      wrapped_orchestrator = RunContextWrapper(orchestrator, user_context)
      ```
    * Pass context to Runner.run:
      ```python
      result = await Runner.run(
          wrapped_orchestrator,
          request_body.message,
          session=session,
          context=user_context  # SDK injects this into all tool calls
      )
      ```
    * Add logging: `logger.info(f"Created UserContext for user {user_id}")`
  - **CRITICAL**: Context passed to Runner.run, NOT to agent factory functions
  - **CRITICAL**: SDK automatically injects context as first parameter to all decorated tools

- [ ] **Step 5: Revert Factory Function Signatures**
  - Verify `create_orchestrator(agent_client)` signature has NO user_id parameter (already done in Step 1)
  - Verify `create_tags_agent(agent_client)` signature has NO user_id parameter (already done in Step 1)
  - Verify `create_ideas_agent()` signature unchanged (no user_id)
  - **Status**: All reversions completed in Step 1 above

- [ ] **Step 6: Handle agent_client in Context (Architectural Decision)**
  - **Option A (Recommended)**: Keep agent_client as closure in tool wrappers, use context only for user_id/email
    * Pros: Clear separation of SDK client vs runtime data, simpler context model
    * Cons: Tools still have closure over agent_client
  - **Option B**: Store agent_client in UserContext, access via `ctx.context.agent_client`
    * Pros: All runtime dependencies in context, no closures
    * Cons: Mixing concerns (user data + SDK client), requires typing.cast for client type
  - **Recommendation**: Use Option A - context for user identity, closure for agent_client
  - Implement chosen option in tool wrappers

- [ ] **Step 7: Update Documentation and Comments**
  - Add comments in create_tag.py explaining RunContextWrapper pattern vs hardcoded user_id
  - Add comments in tags_agent.py explaining context injection by SDK
  - Add comments in agent.py endpoint explaining context creation and wrapping
  - Update AGENTS.md with RunContextWrapper pattern as best practice
  - Add section to PRD Implementation Notes (Unit 22 or Unit 22.5) documenting:
    * Why RunContextWrapper chosen over alternatives (data model, RLS mapping)
    * SDK documentation references
    * Code examples showing context flow
    * Comparison to rejected approaches (hardcoded threading, etc.)

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

1. **Hardcoded user_id Threading** (what we just reverted):
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

## Phase 6: Additional Backend Tools & Testing

**Goal**: Expand agent capabilities with more tools (create_idea, search_ideas, delete_tag, etc.) now that UI validation proves multi-agent system works.

**Why Now**: Frontend validated orchestrator routing and tool execution display. Safe to expand tool library knowing handoffs show correctly in UI.

### AI PROMPT: Phase 6 Implementation (Additional Tools)

```
Help me implement Phase 6 - Additional Backend Tools:

**CONTEXT**: Phase 5 completed frontend integration - handoffs and tool calls visible in UI.
- Users confirmed orchestrator routing works ("Orchestrator → Tags Agent" displayed)
- create_tag tool execution visible end-to-end in chat interface
- Multi-agent system validated through UI testing

**TASK**: Implement additional tools following same functional pattern as create_tag.

**Tools to Implement**:
1. create_idea(agent_client, title, content, tags) - Create ideas with optional tags
2. search_ideas(agent_client, query) - Semantic search across user's ideas
3. update_idea(agent_client, idea_id, title, content) - Update existing ideas
4. delete_tag(agent_client, tag_id) - Remove tags with orphan cleanup
5. list_tags(agent_client, idea_id) - Get tags for specific idea or all user tags

**Requirements for Each Tool**:
- Functional implementation (not class-based)
- RLS enforcement via agent_client parameter
- Comprehensive input validation
- Clear error messages
- Docstrings with parameter descriptions
- Database operations use try/except with specific error handling
- Return dict with success/error status and data

**Update Agents**:
- Bind new tools to Ideas Agent (create_idea, search_ideas, update_idea)
- Bind new tools to Tags Agent (delete_tag, list_tags)
- Update IDEAS_AGENT_INSTRUCTIONS with new tool descriptions and examples
- Update TAGS_AGENT_INSTRUCTIONS with new tool descriptions and examples

**Testing via UI**:
- Test each tool through chat interface
- Verify handoffs continue displaying correctly
- Verify RLS enforcement for all operations
- Check backend logs for tool call tracing

After implementation:
- Show me created tool files
- Guide me through testing each tool via UI
- Ask me to confirm tools work end-to-end

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 7.
```

**Tasks:**

- [ ] Implement create_idea tool with title validation, content storage, optional tag linkage
- [ ] Implement search_ideas tool with semantic search (vector similarity or text search)
- [ ] Implement update_idea tool with idea ownership validation
- [ ] Implement delete_tag tool with orphan cleanup logic
- [ ] Implement list_tags tool with optional idea_id filtering
- [ ] Bind create_idea, search_ideas, update_idea to Ideas Agent
- [ ] Bind delete_tag, list_tags to Tags Agent
- [ ] Update IDEAS_AGENT_INSTRUCTIONS with new tools and examples
- [ ] Update TAGS_AGENT_INSTRUCTIONS with new tools and examples
- [ ] Test each tool via UI chat interface
- [ ] Verify all tools enforce RLS correctly
- [ ] Confirm handoffs still display properly in UI with new tools
- [ ] Write automated tests for new tools
- [ ] Add rate limiting for tool-heavy operations

**Phase 6 Validation Checklist:**

- [ ] create_idea works via UI: "Create an idea called X"
- [ ] search_ideas works via UI: "Find ideas about Y"
- [ ] update_idea works via UI: "Update idea 5 with new title Z"
- [ ] delete_tag works via UI: "Delete tag python from my ideas"
- [ ] list_tags works via UI: "Show me all tags"
- [ ] UI continues showing handoffs for all operations
- [ ] Backend logs show all tool executions clearly
- [ ] RLS verified: all database operations have correct user_id

---

**PAUSE - Phase 6 Review**

Before proceeding to Phase 7, confirm:

1. All tools work end-to-end via UI
2. Handoffs continue displaying correctly with new tools
3. RLS enforcement verified for all operations
4. Backend logs show clear tool execution tracing

---

## Phase 7: Production Features & Safeguards

**Goal**: Add production-ready features - rate limiting, comprehensive testing, advanced conversation management, and cost controls.

**Why Now**: Core functionality validated via UI. Now add safeguards before wider deployment.

### AI PROMPT: Phase 7 Implementation

```
Help me implement Phase 7 - Production Features & Safeguards:

**CONTEXT**: Phases 4-6 complete:
- Backend agent system functional
- Frontend displays handoffs and tool calls
- Additional tools implemented and tested via UI

**TASK**: Add production-ready features for safe deployment.

**Unit 26 - Rate Limiting**
1. Install slowapi library: pip install slowapi
2. Create rate limiter instance in backend/app/core/rate_limiting.py
3. Apply rate limiter to /api/v1/agent/chat: 20 requests/minute per user
4. Apply rate limiter to /api/v1/ai/query: 10 requests/minute per user
5. Test: send rapid requests, verify 429 on limit exceeded
6. Return clear error messages with retry-after header
7. Write rate limiting tests

**Unit 27 - Comprehensive Testing Suite**
8. Write E2E test: "Create tag called python" → verify in database
9. Write E2E test: "Create idea called X" → verify in database
10. Write E2E test: Multi-turn conversation maintains context
11. Write E2E test: RLS enforcement - user can't access other user's data
12. Write E2E test: Error recovery - OpenAI API failure, database error
13. Write performance test: agent response time < 3s p95
14. Write test for orchestrator routing decisions
15. Write test for handoff logging and display
16. Create test data fixtures for reproducible testing

**Unit 28 - Advanced Conversation Management**
17. Create conversations table: id, user_id, title, created_at, updated_at, mode
18. Create conversation_messages table: id, conversation_id, role, content, metadata, timestamp
19. Implement conversation auto-saving on each message exchange
20. Implement conversation listing endpoint GET /api/v1/conversations
21. Implement conversation loading endpoint GET /api/v1/conversations/{id}
22. Add conversation sidebar component in frontend
23. Add "New Conversation" button functionality
24. Test conversation persistence and loading

**Unit 29 - Cost Tracking & Monitoring**
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

### Unit 26: Rate Limiting

- [ ] Install slowapi library: `pip install slowapi`
- [ ] Create rate limiter instance in [backend/app/core/rate_limiting.py](backend/app/core/rate_limiting.py)
- [ ] Apply rate limiter to `/api/v1/agent/chat`: 20 requests/minute per user
- [ ] Apply rate limiter to `/api/v1/ai/query`: 10 requests/minute per user
- [ ] Test rapid requests, verify 429 status on limit exceeded
- [ ] Return clear error messages with `retry-after` header
- [ ] Write rate limiting tests

### Unit 27: Comprehensive Testing Suite

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

### Unit 28: Advanced Conversation Management

- [ ] Create `conversations` table: id, user_id, title, created_at, updated_at, mode (responses_api | agent_sdk)
- [ ] Create `conversation_messages` table: id, conversation_id, role, content, metadata, timestamp
- [ ] Implement conversation auto-saving on each message exchange
- [ ] Implement `GET /api/v1/conversations` endpoint for listing user's conversations
- [ ] Implement `GET /api/v1/conversations/{id}` endpoint for loading specific conversation
- [ ] Add conversation sidebar component in frontend showing history
- [ ] Add "New Conversation" button functionality
- [ ] Test conversation persistence and loading across sessions

### Unit 29: Cost Tracking & Monitoring

- [ ] Create `user_api_usage` table: user_id, date, total_tokens, total_cost, request_count
- [ ] Implement usage tracking middleware updating stats on each API call (both Responses and Agent)
- [ ] Implement daily cost budget checking ($10/day per user default)
- [ ] Return error when budget exceeded with clear message
- [ ] Add usage dashboard component in frontend showing token/cost consumption
- [ ] Add alerts when user approaching 80% of daily budget
- [ ] Write tests for cost tracking accuracy and budget enforcement

**Phase 7 Validation Checklist:**

- [ ] Rate limiting prevents abuse (test rapid requests)
- [ ] All E2E tests passing
- [ ] Conversation history saves and loads correctly
- [ ] Cost tracking accurately reflects API usage
- [ ] Budget limits enforced properly
- [ ] Production monitoring ready

---

**PAUSE - Phase 7 Review**

Before final deployment, confirm:

1. Rate limiting tested and working
2. Full test suite passes
3. Conversation management functional
4. Cost tracking accurate
5. All production safeguards active

---

## Phase 8: Advanced Features (Optional Future Enhancements)

**Note**: These features are optional and should only be implemented after Phases 4-7 are complete and stable.

### Potential Future Features:

- Web search integration for enriching ideas with external content
- Multi-modal support (image uploads for idea visualization)
- Collaborative features (shared ideas, team workspaces)
- Advanced analytics (idea trends, tag usage patterns)
- Export capabilities (PDF, Markdown, JSON)
- Browser extension for capturing ideas from web pages

---

## ARCHIVE: Original Phase 6 Content (Moved to Phase 5)

**Note**: This content has been reorganized. Phase 5 now contains frontend integration, Phase 6 contains additional backend tools.

<details>
<summary>Click to view original Phase 6 structure (for reference only)</summary>
- [ ] Add conversation memory tracking which specialist handled each turn
- [ ] Implement specialist response forwarding to user
- [ ] Add logging for routing decisions with rationale
- [ ] Implement fallback to direct answer when no specialist needed
- [ ] Write tests for routing decisions, specialist delegation, fallback handling

### Unit 22: Agent SDK Backend Endpoint

- [ ] Create `POST /api/v1/agent/chat` endpoint in `backend/app/api/routes/agent.py`
- [ ] Implement request handling accepting user message and optional conversation history
- [ ] Get authenticated user from session
- [ ] Get agent client for RLS-enforced operations
- [ ] Call orchestrator to process request and route to specialists
- [ ] If agent executes tool, call tool execution handler
- [ ] Return agent response including action, rationale, tool results if applicable
- [ ] Implement rate limiting (20 agent requests per minute per user)
- [ ] Add request ID tracking through entire agent pipeline
- [ ] Implement error handling returning safe messages (never expose tool internals)
- [ ] Add endpoint documentation with request/response examples
- [ ] Write endpoint tests: tool execution, clarification, refusal, errors

---

**PAUSE**

---

## Phase 6: Frontend Agent Interface (Units 23-26)

### AI PROMPT: Phase 6 Implementation (Units 23-26)

```
Help me implement Phase 6 - Frontend Agent Interface (Units 23-26):

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
10. Create ActionBadge component showing tool execution indicators (create_tag, create_item)
11. Create ToolResultCard component displaying tool execution results with success/error states
12. Implement different styling for different agent actions (thinking, acting, clarifying, refusing)
13. Add ThinkingIndicator animation component for when agent is processing
14. Create ClarificationPrompt component displaying agent questions with suggested responses
15. Create ConfirmationDialog component for operations requiring user approval
16. Add confidence score display (optional, collapsible) for debugging
17. Implement copy button for agent rationale text
18. Make all components accessible with ARIA labels
19. Write component tests

**Unit 25 - Agent Chat Mode Toggle**
20. Add chatMode field to Redux chat state with values: responses_api, agent_sdk
21. Add reducer for toggling chat mode
22. Create ChatModeToggle component with segmented control or tabs UI
23. Display mode descriptions: "Ask Questions" (Responses) vs "Take Actions" (Agent)
24. Show appropriate icons for each mode
25. Clear conversation when switching modes with user confirmation
26. Update ChatInterface to call correct API based on mode
27. Add helpful hints specific to each mode in UI
28. Save mode preference to localStorage
29. Write tests for mode switching behavior

**Unit 26 - Agent Integration Testing**
30. Write E2E test: user sends "Create tag called python", verify tag created in database
31. Write E2E test: user sends ambiguous request, verify clarification question shown
32. Write E2E test: user sends unsafe request, verify polite refusal
33. Write E2E test: agent confidence scoring works (high confidence → execute, low confidence → clarify)
34. Write test for multi-turn conversation maintaining context
35. Write test for RLS enforcement in agent tool execution
36. Write test for rate limiting on agent endpoint
37. Write test for orchestrator routing (items vs tags requests)
38. Write performance test: agent response time < 3s p95
39. Write test for error recovery (OpenAI API failure, database error, etc.)
40. Create test data fixtures for reproducible agent testing
41. Document test scenarios and expected behaviors

**Phase 6 Validation**
42. Login and navigate to /chat
43. Toggle between Responses API and Agent SDK modes
44. Verify mode switch clears conversation with confirmation
45. Verify mode preference persists after page reload
46. Switch to Agent mode and send: "Create a tag called javascript for my latest item"
47. Verify ThinkingIndicator shows while processing
48. Verify ActionBadge displays "create_tag" action
49. Verify ToolResultCard shows success message
50. Verify tag appears in database for correct item
51. Test clarification flow with ambiguous message: "Do something with my data"
52. Test confirmation flow with: "Delete all tags from my item"
53. Test multi-turn conversation maintaining context
54. Test error handling with network disconnect
55. Navigate agent interface with keyboard only and verify accessibility
56. Measure agent response rendering time and verify UI responsiveness

After implementation:
- Show me files for review
- Guide me through testing
- Ask me to confirm tests pass

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 7.
```

</details>

---

## Summary of Phase Reorganization

**NEW STRUCTURE (Implementation Flow):**

- **Phase 4**: Backend Core Agent Infrastructure ✅ COMPLETE
  - Orchestrator + specialist agents
  - Functional tool pattern (create_tag)
  - Agent endpoint `/api/v1/agent/chat`
  - Basic session management
- **Phase 5**: Frontend Integration & UI Validation (Units 23-25)

  - Mode toggle (Responses vs Agent)
  - Redux agent slice
  - Agent message components
  - **Critical**: Display handoffs and tool calls in UI
  - Validate multi-agent system visually

- **Phase 6**: Additional Backend Tools

  - create_idea, search_ideas, update_idea
  - delete_tag, list_tags
  - Expand tool library after UI validation

- **Phase 7**: Production Features (Units 26-29)

  - Rate limiting
  - Comprehensive testing
  - Conversation management
  - Cost tracking

- **Phase 8**: Future Enhancements (Optional)
  - Web search integration
  - Advanced observability
  - Multi-modal support

**Rationale**: Build backend core → Validate via frontend UI → Expand backend tools → Add production safeguards

---

## ARCHIVE SECTION BELOW

<details>
<summary>Original Phase 6 Frontend Content (Now in Phase 5)</summary>

### Unit 23: Redux Agent Slice Extension

- [ ] Display mode descriptions: "Ask Questions" (Responses) vs "Take Actions" (Agent)
- [ ] Show appropriate icons for each mode
- [ ] Clear conversation when switching modes with user confirmation
- [ ] Update ChatInterface to call correct API based on mode
- [ ] Add helpful hints specific to each mode in UI
- [ ] Save mode preference to localStorage
- [ ] Write tests for mode switching behavior

### Unit 26: Agent Integration Testing

- [ ] Write E2E test: user sends "Create tag called python", verify tag created in database
- [ ] Write E2E test: user sends ambiguous request, verify clarification question shown
- [ ] Write E2E test: user sends unsafe request, verify polite refusal
- [ ] Write E2E test: agent confidence scoring works (high confidence → execute, low confidence → clarify)
- [ ] Write test for multi-turn conversation maintaining context
- [ ] Write test for RLS enforcement in agent tool execution
- [ ] Write test for rate limiting on agent endpoint
- [ ] Write test for orchestrator routing (items vs tags requests)
- [ ] Write performance test: agent response time < 3s p95
- [ ] Write test for error recovery (OpenAI API failure, database error, etc.)
- [ ] Create test data fixtures for reproducible agent testing
- [ ] Document test scenarios and expected behaviors

</details>

---

End of Document 41. Implement metrics tracking: success rate, average confidence, tool usage distribution, error rates 42. Add debug mode query parameter for verbose agent responses showing internal reasoning 43. Create admin UI component displaying agent statistics and trends 44. Implement alerting for anomalies (sudden spike in errors) 45. Add ability to replay agent decisions from audit log for debugging 46. Write documentation for monitoring and debugging agents 47. Implement log retention policies

**Unit 31 - Error Handling & Failure Modes** 48. Document all possible failure modes: OpenAI API down, rate limits, invalid responses, tool execution failures, RLS violations, database errors, timeouts 49. Implement graceful degradation when OpenAI unavailable (show status message) 50. Add retry logic with exponential backoff for transient failures 51. Implement circuit breaker pattern for OpenAI API calls 52. Add comprehensive error messages explaining what went wrong and suggested actions 53. Implement error recovery: invalid JSON from agent → retry once with stricter prompt 54. Add timeout handling for long-running operations (30 second max)

---

## ARCHIVE: Original Phase 7 Content (Advanced Features - Future)

**Note**: The following units (27-32) from original Phase 7 describe advanced features like web search, observability, and monitoring. These are optional future enhancements after core functionality is stable.

<details>
<summary>Click to view original Phase 7 advanced features (for reference only)</summary>

### Unit 27: Built-in Web Search Integration (FUTURE)

- [ ] Research OpenAI's current web search/browsing capabilities
- [ ] Update agent system prompts to include web search
- [ ] Implement web search tool wrapper
- [ ] Add cost tracking for web search operations

### Unit 28: Rate Limiting & Cost Controls (MOVED TO PHASE 7, UNIT 26)

(Moved to new Phase 7 as Unit 26)

### Unit 29: Advanced Conversation Management (MOVED TO PHASE 7, UNIT 28)

(Moved to new Phase 7 as Unit 28)

### Unit 30: Agent Observability & Monitoring (FUTURE)

- [ ] Create admin UI component displaying agent statistics and trends
- [ ] Implement alerting for anomalies (e.g., sudden spike in errors)
- [ ] Add ability to replay agent decisions from audit log for debugging
- [ ] Write documentation for monitoring and debugging agents
- [ ] Implement log retention policies

### Unit 31: Error Handling & Failure Modes

- [ ] Document all possible failure modes: OpenAI API down, rate limits, invalid responses, tool execution failures, RLS violations, database errors, timeouts
- [ ] Implement graceful degradation when OpenAI unavailable (show status message)
- [ ] Add retry logic with exponential backoff for transient failures
- [ ] Implement circuit breaker pattern for OpenAI API calls
- [ ] Add comprehensive error messages explaining what went wrong and suggested actions
- [ ] Implement error recovery: invalid JSON from agent → retry once with stricter prompt
- [ ] Add timeout handling for long-running operations (30 second max)
- [ ] Implement partial success handling (some tool operations succeed, some fail)
- [ ] Add user-facing error documentation explaining common issues
- [ ] Create error testing suite simulating all failure modes
- [ ] Implement error monitoring and alerting
- [ ] Write runbook for common error scenarios

### Unit 32: Documentation & Deployment Guide

- [ ] Write `docs/ai_system/architecture.md` explaining dual-mode pattern and agent architecture
- [ ] Write `docs/ai_system/responses_api_guide.md` documenting Responses API usage
- [ ] Write `docs/ai_system/agent_sdk_guide.md` documenting Agent SDK usage and specialist system
- [ ] Write `docs/ai_system/tools.md` documenting all tools with contracts and examples
- [ ] Write `docs/ai_system/prompts.md` documenting all system prompts and tuning guidelines
- [ ] Write `docs/ai_system/deployment.md` with environment setup, configuration, and deployment steps
- [ ] Create user guide for chat interface with screenshots
- [ ] Document rate limits, cost controls, and quotas
- [ ] Write API reference for all AI endpoints
- [ ] Create troubleshooting guide for common issues
- [ ] Write security documentation explaining RLS enforcement and agent-user pattern
- [ ] Create developer onboarding guide for extending the system
- [ ] Update project README with AI system overview and links to detailed docs
- [ ] Write commit message summarizing Session 4 deliverables

---

**PAUSE**

---

## AI PROMPT: Final Validation - Complete Session 4

```
Help me perform final validation of complete Session 4 implementation:

COMPREHENSIVE SYSTEM TEST:

1. Responses API Full Flow:
   - Login, navigate to /chat, select Responses mode
   - Send query: "Show me all items created this month"
   - Verify: SQL generated safely, results displayed, costs tracked

2. Agent SDK Full Flow:
   - Switch to Agent mode
   - Send: "Create an item called Session 4 Complete"
   - Send: "Tag it with done and ai-agents"
   - Verify: Both operations execute successfully, items visible in database

3. Security Validation:
   - Verify RLS prevents cross-user data access (both modes)
   - Verify agent-user credentials encrypted in database
   - Verify no secrets in logs or error messages

4. Production Readiness:
   - Verify rate limiting working (both endpoints)
   - Verify cost tracking accurate
   - Verify error handling graceful for all failure modes
   - Verify conversation history persists
   - Verify all tests passing (backend + frontend)

5. Documentation Review:
   - Review all docs/ai_system/ documentation
   - Verify deployment guide complete
   - Verify API reference accurate
   - Verify user guide helpful

6. Performance Validation:
   - Responses API p95 latency < 2s
   - Agent SDK p95 latency < 3s
   - Frontend remains responsive during all operations

7. Final Commit:
   - Stage all changes
   - Commit with message: "Session 4: OpenAI Responses API & Agent SDK Implementation - Complete dual-mode AI system with RLS enforcement, multi-specialist agents, tool execution, conversation management, and production safeguards"
   - Push to repository

After validation:
- Show me final test results
- Confirm all documentation complete
- Verify commit successful

SESSION 4 COMPLETE! 🎉
```

---

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

---

**END OF BEAST MODE PRD - SESSION 4 PART B**
````
