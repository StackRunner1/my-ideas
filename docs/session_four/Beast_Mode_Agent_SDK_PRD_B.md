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

**Unit 15 - Tool Base Class & Contract Pattern**
1. Create backend/app/services/tools/base.py module
2. Define Tool abstract base class with properties: name, description, parameters_schema
3. Define abstract execute(agent_client, **params) method signature
4. Define abstract validate_parameters(**params) method for parameter validation
5. Implement to_openai_function_schema() method converting tool to OpenAI function calling format
6. Define ToolResult dataclass for standardized tool execution responses with success status, data, errors
7. Create ToolExecutionError custom exception for tool failures
8. Add logging helper methods for tool invocation tracking
9. Document tool contract requirements in docstrings
10. Write tests for base class utility methods

**Unit 16 - create_tag Tool Implementation**
11. Create backend/app/services/tools/create_tag.py module
12. Define CreateTagTool class inheriting from Tool base class
13. Implement name, description, and parameters_schema properties
14. Implement validate_parameters() checking tag_name (required string) and item_id (optional int)
15. Implement execute(agent_client, tag_name, item_id=None) method
16. Validate tag_name format (alphanumeric, hyphens, underscores, max 50 chars)
17. If item_id provided, verify item exists and user has access via agent_client
18. Create tag using agent_client.from_("tags").insert()
19. If item_id provided, link tag to item via item_tags junction table
20. Return ToolResult with created tag data
21. Handle errors: duplicate tag names, invalid item_id, RLS violations
22. Add comprehensive logging for all operations
23. Write tests: valid creation, duplicates, invalid inputs, RLS enforcement
24. Write integration test with Supabase

**Unit 17 - Pydantic Models for Agent Responses**
25. Create backend/app/models/agent.py module
26. Define AgentAction enum with values: answer, tool_call, clarify, refuse
27. Define AgentResponse model with fields: action (AgentAction), message (str), rationale (Optional[str]), tool_name (Optional[str]), tool_params (Optional[dict]), confidence (float 0.0-1.0), needs_confirmation (bool)
28. Define ToolExecutionResult model with fields: tool_name (str), success (bool), data (Optional[dict]), error (Optional[str]), execution_time_ms (int)
29. Define ConversationMessage model with fields: role (str), content (str), timestamp (datetime), metadata (Optional[dict])
30. Define ConversationContext model with fields: user_id (str), conversation_id (Optional[str]), messages (List[ConversationMessage]), agent_user_id (Optional[str])
31. Add validators for confidence score (0.0-1.0 range)
32. Implement to_openai_format() methods for OpenAI API compatibility
33. Write model validation tests
34. Document all models with usage examples

**Unit 18 - Agent System Prompts**
35. Create backend/app/services/app_agents/prompts.py module (MUST be app_agents folder)
36. Define IDEAS_AGENT_INSTRUCTIONS including role, available tools, decision guidelines, constraints (RLS enforcement), response format
37. Define TAGS_AGENT_INSTRUCTIONS including role, available tools (create_tag), special behavior, decision guidelines, response format
38. Define ORCHESTRATOR_INSTRUCTIONS including routing role, specialist descriptions (Ideas vs Tags), routing patterns, fallback behavior
39. Add prompt version identifiers for tracking and A/B testing
40. Include few-shot examples in each prompt (3-5 examples of expected behavior)
41. Document prompt engineering rationale and iteration history
42. Create prompt testing utilities for validation
43. Write tests verifying prompts produce expected structured outputs

**Phase 4 Validation**
44. Verify Tool base class enforces contract correctly
45. Test to_openai_function_schema() generates valid OpenAI function definitions
46. Create CreateTagTool instance and test parameter validation
47. Execute create_tag tool with valid parameters via agent_client
48. Verify tag created in Supabase database with correct RLS enforcement
49. Test error handling: duplicate tags, invalid item_id, RLS violations
50. Create AgentResponse instances for each action type and validate
51. Test model serialization to OpenAI format
52. Send sample requests using each specialist prompt
53. Verify orchestrator prompt produces correct routing decisions
54. Run full integration test: prompt → model → tool execution

After implementation:
- Show me files for review
- Guide me through testing
- Ask me to confirm tests pass

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 5.
```

### Unit 15-16: Functional Tool Implementation (Simplified from OOP Base Class Pattern)

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

### Unit 17: Pydantic Models for Agent Responses

- [ ] Create `backend/app/models/agent.py` module
- [ ] Define `AgentAction` enum with values: answer, tool_call, clarify, refuse
- [ ] Define `AgentChatRequest` model with fields: query (str), session_id (Optional[str])
- [ ] Define `AgentChatResponse` model with fields: response (str), session_id (str), actions (List), metadata (Optional[dict])
- [ ] Add model validation and examples in docstrings
- [ ] Write model validation tests
- [ ] Document all models with usage examples

**Note**: Simplified from original PRD specs. OpenAI Agent SDK handles most response formatting internally via Runner. We only need request/response models for FastAPI endpoint contract.

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
- [ ] Add comprehensive logging for agent decisions
- [ ] Write agent tests: tool execution, routing behavior

**Status**: Agent structure created. Tool implementations pending.

### Unit 20: Tags Specialist Agent Implementation

- [x] Create `backend/app/services/app_agents/tags_agent.py` module
- [x] Import: `from agents import Agent`
- [x] Import: `from ..tools import create_tag` (relative import from services/tools)
- [x] Import: `from .prompts import TAGS_AGENT_INSTRUCTIONS`
- [x] Define `create_tags_agent(agent_client)` factory function
- [x] Configure Agent with name="Tags" and TAGS_AGENT_INSTRUCTIONS
- [x] Register create_tag tool with agent_client closure
- [ ] Register additional tools: search_tags, link_tag, unlink_tag
- [x] Implement tool wrapper binding agent_client to create_tag
- [x] Add docstrings for all tool wrappers
- [ ] Write agent tests: tag creation, tag search, tag linking

**Status**: Core agent + create_tag tool implemented. Additional tools pending.

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
- [x] Get RLS-enforced agent_client via `get_agent_client(user_id)`
- [x] Create orchestrator agent with agent_client
- [x] Use `Runner.run_sync()` to execute agent with user query
- [x] Implement basic session management (in-memory SQLiteSession store)
- [x] Return agent response with session_id
- [ ] Implement rate limiting (20 agent requests per minute per user)
- [ ] Add request ID tracking through entire agent pipeline
- [ ] Enhance error handling to return safe messages
- [ ] Add comprehensive endpoint documentation with examples
- [ ] Write endpoint tests: tool execution, handoffs, errors

**Status**: Core endpoint functional with basic session support. Rate limiting and comprehensive error handling pending.

---

**Phase 4 Validation**

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
- [x] Runner.run_sync integration working
- [x] Authentication flow (get_current_user → get_agent_client)
- [x] Server starts without errors
- [ ] Test create_tag with valid parameters via agent_client
- [ ] Verify tag created in Supabase database with correct RLS enforcement
- [ ] Test error handling: duplicate tags, invalid idea_id, RLS violations
- [ ] Verify orchestrator prompt produces correct routing decisions
- [ ] Run full integration test: user query → orchestrator → specialist → tool → database
- [ ] Test agent endpoint end-to-end with authenticated user
- [ ] Additional tool implementations (create_idea, search_ideas, etc.)
- [ ] Rate limiting implementation
- [ ] Comprehensive error handling and logging

**Next Steps:**

1. Test agent endpoint manually: Send authenticated request to `/api/v1/agent/chat`
2. Verify orchestrator routes "create tag X" → Tags Agent → create_tag tool
3. Verify tag appears in database with correct user_id (RLS)
4. Implement additional tools (create_idea, etc.)
5. Add rate limiting
6. Write automated tests

---

**PAUSE - Phase 4 Review**

Before proceeding to Phase 5, confirm:

1. Server starts successfully
2. Manual test of agent endpoint works
3. Tag creation via agent verified in database

---

## Phase 5: Additional Tools & Testing (Adapted from Original Units 19-22)

### AI PROMPT: Phase 5 Implementation (Additional Tools & Testing)

```
Help me implement Phase 5 - Additional Tools & Testing:

**CONTEXT**: Phase 4 completed core agent infrastructure using OpenAI Agent SDK primitives.
- Ideas Agent, Tags Agent, and Orchestrator implemented
- create_tag tool functional with RLS enforcement
- /api/v1/agent/chat endpoint working with Runner.run_sync
- Basic session management in place

**Unit 23 - create_idea Tool Implementation**
1. Create backend/app/services/tools/create_idea.py module
2. Implement create_idea(agent_client, title, description=None, status="draft") function
3. Validate title (required, non-empty string)
4. Validate status (must be: draft, active, or archived)
5. Create idea using agent_client.from_("ideas").insert()
6. Return dict with success status and created idea data
7. Handle errors: empty title, invalid status, RLS violations
8. Add comprehensive logging
9. Write tests: valid creation, invalid inputs, RLS enforcement

**Unit 24 - Integrate create_idea with Ideas Agent**
10. Update backend/app/services/app_agents/ideas_agent.py
11. Import create_idea tool
12. Create tool wrapper function binding agent_client
13. Register tool with Ideas Agent
14. Test: "Create an idea called 'Test Idea'" → verify idea created in database

**Unit 25 - Additional Tag Tools**
15. Implement search_tags(agent_client, query=None) in backend/app/services/tools/search_tags.py
16. Implement link_tag(agent_client, tag_id, idea_id) in backend/app/services/tools/link_tag.py
17. Register both tools with Tags Agent
18. Write tests for each tool

**Unit 26 - Agent Endpoint Testing**
19. Test orchestrator routing: "Create a tag called python" → Tags Agent
20. Test orchestrator routing: "Create idea AI Project" → Ideas Agent
21. Test compound request: "Create idea X and tag it Y"
22. Verify RLS enforcement: tags/ideas created with correct user_id
23. Test error scenarios: invalid inputs, database errors
24. Add request ID logging throughout pipeline
25. Write automated endpoint tests

**Unit 27 - Rate Limiting**
26. Install slowapi library: pip install slowapi
27. Create rate limiter instance in backend/app/core/rate_limiting.py
28. Apply rate limiter to /api/v1/agent/chat: 20 requests/minute per user
29. Test: send 21 requests rapidly, verify 429 on 21st
30. Write rate limiting tests

**Phase 5 Validation**
- Test Ideas Agent: "Create an idea called 'Agent Testing'"
- Test Tags Agent: "Create a tag called python-agent"
- Test Orchestrator routing with both idea and tag requests
- Verify all database operations have correct RLS user_id
- Verify rate limiting prevents abuse
- Check logs for complete request tracing

After implementation:
- Show me files for review
- Guide me through manual testing
- Ask me to confirm tests pass

Mark completed tasks with [x]. Wait for approval before proceeding to Phase 6.
```

### Unit 19: Items Specialist Agent

- [ ] Create `backend/app/agents/items_specialist.py` module
- [ ] Define `ItemsSpecialistAgent` class initialized with OpenAI client and system prompt
- [ ] Register available tools: create_item, update_item (placeholder for future), search_items (placeholder)
- [ ] Implement `process_request(user_message, context, agent_client)` method calling OpenAI Chat Completions
- [ ] Configure OpenAI request for structured output (JSON mode) matching AgentResponse schema
- [ ] Implement response parsing and validation using Pydantic models
- [ ] Implement confidence-based decision logic: act if >= 0.8, clarify if < 0.8
- [ ] Implement `execute_tool_call(action, payload, agent_client)` method routing to appropriate tool
- [ ] Add conversation history management (last N messages for context)
- [ ] Implement token limit trimming to stay within model context window
- [ ] Add comprehensive logging for all agent decisions, tool calls, confidence scores
- [ ] Write agent tests: tool execution, clarification requests, refusals, confidence scoring

### Unit 20: Tags Specialist Agent

- [ ] Create `backend/app/agents/tags_specialist.py` module
- [ ] Define `TagsSpecialistAgent` class following Items Specialist pattern
- [ ] Register create_tag tool from Unit 16
- [ ] Register search_tags tool (implement basic tag search functionality)
- [ ] Register delete_tag tool (implement with confirmation requirement)
- [ ] Implement `process_request()` with Tags Specialist system prompt
- [ ] Implement deletion confirmation logic (refuse without explicit user confirmation)
- [ ] Add tag suggestion capability (suggest tags based on item content)
- [ ] Implement all standard agent methods following established pattern
- [ ] Add comprehensive logging specific to tag operations
- [ ] Write tests for tag creation, search, deletion with confirmation

### Unit 21: Orchestrator Agent Implementation

- [ ] Create `backend/app/agents/orchestrator.py` module
- [ ] Define `OrchestratorAgent` class managing specialist routing
- [ ] Initialize with references to Items and Tags Specialists
- [ ] Implement `route_request(user_message, context)` analyzing request and selecting specialist
- [ ] Implement routing logic: item operations → Items Specialist, tag operations → Tags Specialist
- [ ] Handle general questions by answering directly without specialist routing
- [ ] Implement ambiguous request handling asking user to clarify intent
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

### Unit 23: Redux Agent Slice Extension

- [ ] Extend `ChatState` interface with agent-specific fields: agent_status, current_action, tool_results
- [ ] Add `agentStatus` field with values: idle, thinking, acting, waiting_confirmation
- [ ] Add reducers: setAgentStatus, addToolResult, requestConfirmation
- [ ] Create `sendAgentMessage` async thunk calling `/api/v1/agent/chat`
- [ ] Implement thunk handling different agent actions: answer (add message), tool call (show action + result), clarify (show question)
- [ ] Add confirmation flow state management for operations requiring user approval
- [ ] Extend selectors for agent-specific state
- [ ] Write tests for new reducers and agent message thunk

### Unit 24: Agent Message Components

- [ ] Extend MessageCard component to handle agent response types
- [ ] Create `ActionBadge` component showing tool execution indicators (create_tag, create_item)
- [ ] Create `ToolResultCard` component displaying tool execution results with success/error states
- [ ] Implement different styling for different agent actions (thinking, acting, clarifying, refusing)
- [ ] Add `ThinkingIndicator` animation component for when agent is processing
- [ ] Create `ClarificationPrompt` component displaying agent questions with suggested responses
- [ ] Create `ConfirmationDialog` component for operations requiring user approval
- [ ] Add confidence score display (optional, collapsible) for debugging
- [ ] Implement copy button for agent rationale text
- [ ] Make all components accessible with ARIA labels
- [ ] Write component tests

### Unit 25: Agent Chat Mode Toggle

- [ ] Add `chatMode` field to Redux chat state with values: responses_api, agent_sdk
- [ ] Add reducer for toggling chat mode
- [ ] Create `ChatModeToggle` component with segmented control or tabs UI
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

---

**PAUSE**

---

## Phase 7: Production Features & Safeguards (Units 27-32)

### AI PROMPT: Phase 7 Implementation (Units 27-32)

```
Help me implement Phase 7 - Production Features & Safeguards (Units 27-32):

**Unit 27 - Built-in Web Search Integration**
1. Research OpenAI's current web search/browsing capabilities and API documentation
2. Update agent system prompts to include web search as available tool
3. Configure OpenAI client to enable web search when supported
4. Implement web search tool wrapper if needed following Tool base class pattern
5. Add decision logic for when to search web vs use database
6. Implement cost tracking for web search operations (may have different pricing)
7. Add logging for web search invocations including queries and result usage
8. Implement fallback behavior if web search unavailable
9. Write tests for web search integration
10. Document when agents use web search vs database

**Unit 28 - Rate Limiting & Cost Controls**
11. Install rate limiting library (slowapi or similar)
12. Implement per-user rate limits: 10 queries/min (Responses API), 20 messages/min (Agent SDK)
13. Implement per-user daily cost budget tracking
14. Create user_api_usage table storing user_id, date, total_tokens, total_cost, request_count
15. Implement middleware updating usage on each API call
16. Implement budget checking before expensive operations
17. Return clear error messages when limits exceeded with reset time
18. Add admin endpoint GET /api/v1/admin/usage for viewing usage stats
19. Implement usage dashboard component in frontend showing user's consumption
20. Add alerts when user approaching budget limits
21. Write tests for rate limiting and budget enforcement

**Unit 29 - Advanced Conversation Management**
22. Create conversations table: id, user_id, title, created_at, updated_at, mode
23. Create conversation_messages table: id, conversation_id, role, content, metadata, timestamp
24. Implement conversation auto-saving on each message exchange
25. Implement conversation listing endpoint GET /api/v1/conversations
26. Implement conversation loading endpoint GET /api/v1/conversations/{id}
27. Add conversation sidebar component showing user's history
28. Implement conversation creation (start new chat)
29. Implement conversation deletion with confirmation
30. Add conversation renaming functionality
31. Implement automatic title generation based on first message
32. Add search across conversation history
33. Implement export conversation as JSON or Markdown
34. Add pagination for conversation lists
35. Write tests for persistence and retrieval

**Unit 30 - Agent Observability & Monitoring**
36. Enhance logging format to include: request_id, user_id, agent_user_id, specialist_type, action, confidence, tool_used, latency, tokens, cost
37. Implement structured logging (JSON format) for easier parsing
38. Create agent_audit_log table storing all agent decisions and actions
39. Implement audit log writing on every agent interaction
40. Create dashboard endpoint GET /api/v1/admin/agent-stats returning aggregated metrics
41. Implement metrics tracking: success rate, average confidence, tool usage distribution, error rates
42. Add debug mode query parameter for verbose agent responses showing internal reasoning
43. Create admin UI component displaying agent statistics and trends
44. Implement alerting for anomalies (sudden spike in errors)
45. Add ability to replay agent decisions from audit log for debugging
46. Write documentation for monitoring and debugging agents
47. Implement log retention policies

**Unit 31 - Error Handling & Failure Modes**
48. Document all possible failure modes: OpenAI API down, rate limits, invalid responses, tool execution failures, RLS violations, database errors, timeouts
49. Implement graceful degradation when OpenAI unavailable (show status message)
50. Add retry logic with exponential backoff for transient failures
51. Implement circuit breaker pattern for OpenAI API calls
52. Add comprehensive error messages explaining what went wrong and suggested actions
53. Implement error recovery: invalid JSON from agent → retry once with stricter prompt
54. Add timeout handling for long-running operations (30 second max)
55. Implement partial success handling (some tool operations succeed, some fail)
56. Add user-facing error documentation explaining common issues
57. Create error testing suite simulating all failure modes
58. Implement error monitoring and alerting
59. Write runbook for common error scenarios

**Unit 32 - Documentation & Deployment Guide**
60. Write docs/ai_system/architecture.md explaining dual-mode pattern and agent architecture
61. Write docs/ai_system/responses_api_guide.md documenting Responses API usage
62. Write docs/ai_system/agent_sdk_guide.md documenting Agent SDK usage and specialist system
63. Write docs/ai_system/tools.md documenting all tools with contracts and examples
64. Write docs/ai_system/prompts.md documenting all system prompts and tuning guidelines
65. Write docs/ai_system/deployment.md with environment setup, configuration, deployment steps
66. Create user guide for chat interface with screenshots
67. Document rate limits, cost controls, and quotas
68. Write API reference for all AI endpoints
69. Create troubleshooting guide for common issues
70. Write security documentation explaining RLS enforcement and agent-user pattern
71. Create developer onboarding guide for extending the system
72. Update project README with AI system overview and links to detailed docs
73. Write commit message summarizing Session 4 deliverables

**Phase 7 Validation**
74. Test Responses API full flow: login, navigate to /chat, select Responses mode, send query, verify SQL generated safely and results displayed
75. Test Agent SDK full flow: switch to Agent mode, create item, tag it, verify operations execute successfully
76. Verify RLS prevents cross-user data access in both modes
77. Verify agent-user credentials encrypted in database
78. Verify no secrets in logs or error messages
79. Verify rate limiting working on both endpoints
80. Verify cost tracking accurate
81. Verify error handling graceful for all failure modes
82. Verify conversation history persists
83. Verify all tests passing (backend + frontend)
84. Review all docs/ai_system/ documentation
85. Verify deployment guide complete
86. Measure Responses API p95 latency < 2s
87. Measure Agent SDK p95 latency < 3s
88. Verify frontend remains responsive during all operations
89. Stage all changes and commit with Session 4 summary message

After implementation:
- Show me files for review
- Guide me through testing
- Ask me to confirm tests pass

Mark completed tasks with [x]. Session 4 complete after approval!
```

### Unit 27: Built-in Web Search Integration

- [ ] Research OpenAI's current web search/browsing capabilities and API documentation
- [ ] Update agent system prompts to include web search as available tool
- [ ] Configure OpenAI client to enable web search when supported
- [ ] Implement web search tool wrapper if needed following Tool base class pattern
- [ ] Add decision logic for when to search web vs use database
- [ ] Implement cost tracking for web search operations (may have different pricing)
- [ ] Add logging for web search invocations including queries and result usage
- [ ] Implement fallback behavior if web search unavailable
- [ ] Write tests for web search integration
- [ ] Document when agents use web search vs database

### Unit 28: Rate Limiting & Cost Controls

- [ ] Install rate limiting library (slowapi or similar)
- [ ] Implement per-user rate limits: 10 queries/min (Responses API), 20 messages/min (Agent SDK)
- [ ] Implement per-user daily cost budget tracking
- [ ] Create `user_api_usage` table storing: user_id, date, total_tokens, total_cost, request_count
- [ ] Implement middleware updating usage on each API call
- [ ] Implement budget checking before expensive operations
- [ ] Return clear error messages when limits exceeded with reset time
- [ ] Add admin endpoint for viewing usage stats: `GET /api/v1/admin/usage`
- [ ] Implement usage dashboard component in frontend showing user's consumption
- [ ] Add alerts when user approaching budget limits
- [ ] Write tests for rate limiting and budget enforcement

### Unit 29: Advanced Conversation Management

- [ ] Create `conversations` table: id, user_id, title, created_at, updated_at, mode (responses/agent)
- [ ] Create `conversation_messages` table: id, conversation_id, role, content, metadata (tokens, cost, tool_results), timestamp
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

### Unit 30: Agent Observability & Monitoring

- [ ] Enhance logging format to include: request_id, user_id, agent_user_id, specialist_type, action, confidence, tool_used, latency, tokens, cost
- [ ] Implement structured logging (JSON format) for easier parsing
- [ ] Create `agent_audit_log` table storing all agent decisions and actions
- [ ] Implement audit log writing on every agent interaction
- [ ] Create dashboard endpoint: `GET /api/v1/admin/agent-stats` returning aggregated metrics
- [ ] Implement metrics tracking: success rate, average confidence, tool usage distribution, error rates
- [ ] Add debug mode query parameter for verbose agent responses showing internal reasoning
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
