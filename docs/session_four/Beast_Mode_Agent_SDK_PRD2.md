# OpenAI Agent SDK Implementation - Product Requirements Document v1.0

## Overview

This document details **Part B: Agent SDK Implementation** - the autonomous agentic system built upon the OpenAI Responses API foundation established in Part A.

**What This Adds**: Tool-calling agents with multi-specialist architecture, orchestration patterns, decision boundaries, and autonomous database operations - transforming the chat interface from structured query generation to intelligent, autonomous task execution.

**Architecture**: Multi-specialist agent system where:
- **Orchestrator Agent** routes user requests to appropriate specialists
- **Specialist Agents** (Items, Tags) execute domain-specific operations with custom tools
- **Tool Execution** happens via RLS-enforced agent-user clients ensuring security
- **Chat Interface** extended to display agent actions, tool calls, and confidence scores

## Prerequisites

**CRITICAL**: Part A (Responses API) MUST be complete before starting Part B.

**From Part A** (Beast_Mode_OARAPI_PRD1.md):
- ✅ OpenAI SDK configured and tested (Phase 1, Units 1-5)
- ✅ Agent-user authentication working with encrypted credentials
- ✅ Responses API endpoints functional with RLS enforcement
- ✅ Chat interface operational with Redux state management
- ✅ All Phase 1-3 validation tests passing

**Additional Requirements**:
- Understanding of OpenAI function calling and tool execution patterns
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

**Continuation Context**: This PRD continues from Beast_Mode_OARAPI_PRD1.md (Part A: Responses API). All infrastructure from Part A is assumed working.

- **AI PROMPT markers**: Phase-level prompts (### AI PROMPT) consolidate all units in that phase
- **PAUSE markers**: Checkpoints for learner approval before proceeding
- **Task tracking**: Mark [x] for completed, [~] for in-progress
- **Validation**: Run tests after each phase and comprehensive validation after Part B

## Architecture Extension

### Agent SDK vs Responses API

| Aspect | Responses API (Part A) | Agent SDK (Part B) |
|--------|------------------------|-------------------|
| **Interaction** | User asks → AI generates SQL → Results | User instructs → Agent decides → Tools execute → Confirmation |
| **Autonomy** | None (generates queries only) | High (makes decisions, calls tools) |
| **Tools** | N/A | Custom + built-in (web search) |
| **Decision Making** | None | Confidence thresholds, safety checks |
| **Orchestration** | Single endpoint | Multi-specialist with routing |
| **Use Cases** | "Show me X", "Analyze Y" | "Create item Z", "Tag A with B" |

### Multi-Specialist Architecture

```
User: "Create a new item called 'Learn Rust' and tag it with 'programming'"
       │
       ▼
┌──────────────────┐
│  Orchestrator    │  Analyzes intent → Routes to specialists
│     Agent        │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ Items   │ │  Tags   │
│ Agent   │ │ Agent   │
└────┬────┘ └────┬────┘
     │           │
     ▼           ▼
create_item   create_tag
  (tool)        (tool)
     │           │
     └─────┬─────┘
           ▼
    ┌──────────────┐
    │   Supabase   │  RLS enforces user boundaries
    │  (via agent  │
    │   client)    │
    └──────────────┘
```

---

# PART B: AGENT SDK IMPLEMENTATION (Units 15-32)

**Goal**: Implement autonomous agentic system with tool-calling, multi-specialist architecture, and orchestration

**Outcome**: Working agent system where users can instruct AI to perform database operations (create items, add tags), with agents making autonomous decisions about when and how to act

**Why After Responses API**: Builds upon established foundation (OpenAI SDK, chat UI, agent-user auth) and adds complexity (tool execution, decision boundaries, orchestrator pattern)

---

## Phase 4: Tool Specification & Base Agent Infrastructure (Units 15-18)

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
35. Create backend/app/services/agents/prompts.py module
36. Define ITEMS_SPECIALIST_PROMPT including role, available tools, decision guidelines (confidence >= 0.8 → execute, < 0.8 → clarify), constraints (RLS enforcement, user data only), response format requirements
37. Define TAGS_SPECIALIST_PROMPT including role, available tools (create_tag), special behavior (confirm before deletions), decision guidelines, response format
38. Define ORCHESTRATOR_PROMPT including routing role, specialist descriptions (Items vs Tags), routing keywords and patterns, fallback behavior (answer simple questions directly), response format
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

### Unit 15: Tool Base Class & Contract Pattern

- [ ] Create `backend/app/services/tools/base.py` module
- [ ] Define `Tool` abstract base class with properties: name, description, parameters_schema
- [ ] Define abstract `execute(agent_client, **params)` method signature
- [ ] Define abstract `validate_parameters(**params)` method for parameter validation
- [ ] Implement `to_openai_function_schema()` method converting tool to OpenAI function calling format
- [ ] Define `ToolResult` dataclass for standardized tool execution responses with success status, data, errors
- [ ] Create `ToolExecutionError` custom exception for tool failures
- [ ] Add logging helper methods for tool invocation tracking
- [ ] Document tool contract requirements in docstrings
- [ ] Write tests for base class utility methods

### Unit 16: create_tag Tool Implementation

- [ ] Create `backend/app/services/tools/create_tag.py` module
- [ ] Define `CreateTagTool` class inheriting from `Tool` base class
- [ ] Implement name, description, and parameters_schema properties
- [ ] Implement `validate_parameters()` checking tag_name (required string) and item_id (optional int)
- [ ] Implement `execute(agent_client, tag_name, item_id=None)` method
- [ ] Validate tag_name format (alphanumeric, hyphens, underscores, max 50 chars)
- [ ] If item_id provided, verify item exists and user has access via agent_client
- [ ] Create tag using `agent_client.from_("tags").insert()`
- [ ] If item_id provided, link tag to item via item_tags junction table
- [ ] Return `ToolResult` with created tag data
- [ ] Handle errors: duplicate tag names, invalid item_id, RLS violations
- [ ] Add comprehensive logging for all operations
- [ ] Write tests: valid creation, duplicates, invalid inputs, RLS enforcement
- [ ] Write integration test with Supabase

### Unit 17: Pydantic Models for Agent Responses

- [ ] Create `backend/app/models/agent.py` module
- [ ] Define `AgentAction` enum with values: answer, tool_call, clarify, refuse
- [ ] Define `AgentResponse` model with fields: action, message, rationale, tool_name, tool_params, confidence, needs_confirmation
- [ ] Define `ToolExecutionResult` model with fields: tool_name, success, data, error, execution_time_ms
- [ ] Define `ConversationMessage` model with fields: role, content, timestamp, metadata
- [ ] Define `ConversationContext` model with fields: user_id, conversation_id, messages, agent_user_id
- [ ] Add validators for confidence score (0.0-1.0 range)
- [ ] Implement `to_openai_format()` methods for OpenAI API compatibility
- [ ] Write model validation tests
- [ ] Document all models with usage examples

### Unit 18: Agent System Prompts

- [ ] Create `backend/app/services/agents/prompts.py` module
- [ ] Define `ITEMS_SPECIALIST_PROMPT` including role, available tools, decision guidelines, constraints, response format
- [ ] Define `TAGS_SPECIALIST_PROMPT` including role, available tools, special behavior, decision guidelines, response format
- [ ] Define `ORCHESTRATOR_PROMPT` including routing role, specialist descriptions, routing patterns, fallback behavior
- [ ] Add prompt version identifiers for tracking and A/B testing
- [ ] Include few-shot examples in each prompt (3-5 examples of expected behavior)
- [ ] Document prompt engineering rationale and iteration history
- [ ] Create prompt testing utilities for validation
- [ ] Write tests verifying prompts produce expected structured outputs

---

**PAUSE**

---

## Phase 5: Agent SDK & Specialist Implementation (Units 19-22)

### AI PROMPT: Phase 5 Implementation (Units 19-22)

```
Help me implement Phase 5 - Agent SDK & Specialist Implementation (Units 19-22):

**Unit 19 - Items Specialist Agent**
1. Create backend/app/agents/items_specialist.py module
2. Define ItemsSpecialistAgent class initialized with OpenAI client and system prompt from Unit 18
3. Register available tools: create_item, update_item (placeholder for future), search_items (placeholder)
4. Implement process_request(user_message, context, agent_client) method calling OpenAI Chat Completions API
5. Configure OpenAI request for structured output (JSON mode) matching AgentResponse schema from Unit 17
6. Implement response parsing and validation using Pydantic models
7. Implement confidence-based decision logic: execute if confidence >= 0.8, clarify if < 0.8
8. Implement execute_tool_call(action, payload, agent_client) method routing to appropriate tool
9. Add conversation history management (last N messages for context)
10. Implement token limit trimming to stay within model context window
11. Add comprehensive logging for all agent decisions, tool calls, confidence scores
12. Write agent tests: tool execution, clarification requests, refusals, confidence scoring

**Unit 20 - Tags Specialist Agent**
13. Create backend/app/agents/tags_specialist.py module
14. Define TagsSpecialistAgent class following Items Specialist pattern
15. Register create_tag tool from Unit 16
16. Register search_tags tool (implement basic tag search functionality)
17. Register delete_tag tool (implement with confirmation requirement)
18. Implement process_request() method with Tags Specialist system prompt from Unit 18
19. Implement deletion confirmation logic (refuse deleting tags without explicit user confirmation)
20. Add tag suggestion capability (analyze item content and suggest relevant tags)
21. Implement all standard agent methods following established pattern from Unit 19
22. Add comprehensive logging specific to tag operations
23. Write tests: tag creation, tag search, tag deletion with confirmation, tag suggestions

**Unit 21 - Orchestrator Agent Implementation**
24. Create backend/app/agents/orchestrator.py module
25. Define OrchestratorAgent class managing specialist routing
26. Initialize with references to Items and Tags Specialists
27. Implement route_request(user_message, context) method analyzing request and selecting specialist
28. Implement routing logic: item operations → Items Specialist, tag operations → Tags Specialist
29. Handle general questions by answering directly without specialist routing
30. Implement ambiguous request handling asking user to clarify intent
31. Add conversation memory tracking which specialist handled each turn
32. Implement specialist response forwarding to user
33. Add logging for routing decisions with rationale
34. Implement fallback to direct answer when no specialist needed
35. Write tests: routing decisions, specialist delegation, fallback handling

**Unit 22 - Agent SDK Backend Endpoint**
36. Create POST /api/v1/agent/chat endpoint in backend/app/api/routes/agent.py
37. Implement request handling accepting user message and optional conversation history
38. Get authenticated user from session
39. Get agent client for RLS-enforced operations
40. Call orchestrator to process request and route to specialists
41. If agent decides to execute tool, call tool execution handler
42. Return agent response including action, rationale, tool results if applicable
43. Implement rate limiting (20 agent requests per minute per user)
44. Add request ID tracking through entire agent pipeline
45. Implement error handling returning safe messages (never expose tool internals)
46. Add endpoint documentation with request/response examples
47. Write endpoint tests: tool execution, clarification, refusal, errors

**Phase 5 Validation**
48. Test Items Specialist directly with request: "Create an item called Test Item"
49. Verify agent returns appropriate action with tool call
50. Test Tags Specialist directly with request: "Add tag python to item"
51. Test orchestrator routing with request: "Create a tag called python for my latest item"
52. Verify response includes action, payload, rationale, tool execution result
53. Verify tag created in database
54. Test clarification scenario with ambiguous message: "Do something with my stuff"
55. Test refusal scenario with unsafe operation: "Delete everything"
56. Test RLS enforcement: verify agent only operates on authenticated user's data
57. Test rate limiting: send 21 requests rapidly, verify 21st request rate-limited
58. Check logs: routing decisions, tool executions, confidence scores all logged

After implementation:
- Show me files for review
- Guide me through testing
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


**END OF BEAST MODE PRD - SESSION 4**
