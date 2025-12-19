# Tools Architecture

## Overview

The tools module (`backend/app/tools/`) provides a simple, centralized location for OpenAI Responses API function calling tools. This follows OpenAI's official documentation patterns without unnecessary abstraction layers.

## Design Philosophy

1. **Simplicity**: Simple dicts and functions - no classes, no abstract patterns
2. **Centralization**: All tool definitions in one module, not scattered across services
3. **Official Patterns**: Follows OpenAI Responses API spec exactly
4. **Pragmatic**: Add complexity only when actually needed

## Module Structure

```
backend/app/tools/
├── __init__.py          # Exports ALL_TOOLS and TOOL_HANDLERS
└── database_tools.py    # Tool definition and handler
```

That's it. No abstract base classes, no registry pattern, no over-engineering.

## Current Implementation

### Tool Definition (`database_tools.py`)

```python
QUERY_DATABASE_TOOL = {
    "type": "function",
    "name": "query_database",
    "description": "Execute a SQL SELECT query...",
    "parameters": {
        "type": "object",
        "properties": {
            "sql": {"type": "string", "description": "..."},
            "explanation": {"type": "string", "description": "..."}
        },
        "required": ["sql", "explanation"]
    }
}
```

**Key Points**:

- `name` at TOP level (not nested under `function`)
- Follows OpenAI Responses API spec exactly
- Includes full schema documentation in parameter descriptions

### Tool Handler

```python
def execute_query_database(agent_client: Client, sql: str, explanation: str = "") -> Dict[str, Any]:
    """Execute the query_database tool."""
    # 1. Validate SQL safety
    # 2. Parse SQL (table, columns, WHERE, ORDER BY, LIMIT)
    # 3. Execute via PostgREST (RLS enforced)
    # 4. Return results
```

**Safety Features**:

- Only SELECT queries allowed
- Blocks DROP, ALTER, CREATE, etc.
- Forces LIMIT clause (max 50)
- RLS enforced via agent_client session

### Tool Registry

```python
# backend/app/tools/__init__.py
ALL_TOOLS = [QUERY_DATABASE_TOOL]
TOOL_HANDLERS = {"query_database": execute_query_database}
```

## Usage in Responses API

### responses_service.py

```python
from ..tools import ALL_TOOLS, TOOL_HANDLERS

# Turn 1: LLM decides if it needs tools
response = client.responses.create(
    model="gpt-4o-mini",
    tools=ALL_TOOLS,  # All available tools
    tool_choice="auto"
)

# Turn 2: Execute tool calls
for tool_call in tool_calls:
    tool_name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)

    # Execute via registry
    result = TOOL_HANDLERS[tool_name](agent_client, **args)

    # Send results back to LLM
    tool_results.append({
        "type": "function_call_output",
        "call_id": tool_call.id,
        "output": json.dumps(result)
    })
```

## Multi-Turn Conversation Flow

1. **Turn 1**: User asks "Show me all ideas created this week"

   - Send to LLM with `tools=ALL_TOOLS`
   - LLM decides: "I need database access"
   - Returns: `function_call` with `query_database(sql="SELECT...", explanation="...")`

2. **Execution**: Our code executes the SQL

   - `TOOL_HANDLERS["query_database"](agent_client, sql=..., explanation=...)`
   - Returns: `{"success": True, "results": [...], "row_count": 3}`

3. **Turn 2**: Send results back to LLM
   - Include `previous_response_id` for conversation context
   - LLM sees actual data: `[{id: ..., title: "My idea", ...}, ...]`
   - LLM formats natural response: "You have 3 ideas created this week: 'My idea', 'Another idea', 'Test idea'"

## SQL Execution Strategy

**NO RPC Functions** - Direct PostgREST queries:

```python
# Parse SQL: SELECT * FROM ideas WHERE created_at > '...' ORDER BY created_at DESC LIMIT 10

# Build PostgREST query:
query = agent_client.table("ideas")
query = query.select("*")
query = query.order("created_at.desc")
query = query.limit(10)
result = query.execute()
```

**Why Not RPC?**:

- RLS automatically enforced on table queries
- No need for custom RPC functions
- Simpler, more maintainable
- WHERE clauses noted but not applied (PostgREST filter syntax conversion complex)

## Adding New Tools

1. **Add tool definition** in `database_tools.py`:

   ```python
   MY_NEW_TOOL = {
       "type": "function",
       "name": "my_tool",
       "description": "What this tool does",
       "parameters": {
           "type": "object",
           "properties": {
               "arg1": {"type": "string", "description": "..."}
           },
           "required": ["arg1"]
       }
   }
   ```

2. **Add handler function**:

   ```python
   def execute_my_tool(agent_client: Client, arg1: str) -> Dict[str, Any]:
       # Do the work
       return {"success": True, "result": ...}
   ```

3. **Export in `__init__.py`**:

   ```python
   from .database_tools import QUERY_DATABASE_TOOL, MY_NEW_TOOL
   from .database_tools import execute_query_database, execute_my_tool

   ALL_TOOLS = [QUERY_DATABASE_TOOL, MY_NEW_TOOL]
   TOOL_HANDLERS = {
       "query_database": execute_query_database,
       "my_tool": execute_my_tool
   }
   ```

That's it. No classes, no inheritance, no abstractions. Just add your dict and function.

## Why This Approach?

**What we're NOT doing:**

- ❌ Abstract base classes (no polymorphism needed)
- ❌ Registry patterns (simple dict dispatch works fine)
- ❌ Class-based tools (tools are stateless)
- ❌ Planning for "future" needs (YAGNI - You Aren't Gonna Need It)

**What we ARE doing:**

- ✅ Simple dicts matching OpenAI's spec exactly
- ✅ Plain functions that do one thing well
- ✅ Easy to understand and modify
- ✅ Add complexity only when actually needed

## Testing

See `Beast_Mode_OARAPI_PRD1.md` Unit 9 for validation:

- Query: "How are you?" → No tool call (conversational)
- Query: "Show me all ideas" → Tool call + execution
- Query: "Count my ideas" → Tool call + aggregation
- Logs show tool execution and SQL results
- LLM discusses actual data naturally

## Benefits

✅ **Simple**: No unnecessary abstractions  
✅ **Clear**: Obvious what each part does  
✅ **Maintainable**: Easy to modify or extend  
✅ **Follows OpenAI docs**: Matches official examples

## References

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Responses API Docs](https://platform.openai.com/docs/api-reference/responses/create)
