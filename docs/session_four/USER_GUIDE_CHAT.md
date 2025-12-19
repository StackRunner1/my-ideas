# AI Chat Feature - User Guide

## Overview

The AI Chat feature allows you to query your ideas database using natural language. Ask questions in plain English, and the AI will generate SQL queries, execute them securely, and present results in an easy-to-understand format.

## Getting Started

### Accessing the Chat

1. Click the floating **chat button** in the bottom-right corner (💬 icon)
2. The chat drawer will slide in from the right side
3. Start typing your question in the input field

### Your First Query

Try one of these example queries to get started:

- "Show me all my ideas"
- "What are my most recent ideas?"
- "List all items with their tags"

Click any example chip in the empty state to auto-fill the query.

## How to Ask Effective Questions

### ✅ Good Questions

**Be specific about what you want:**

- "Show me ideas created in the last 7 days"
- "List ideas sorted by creation date"
- "What tags are most commonly used?"

**Use natural language:**

- "Which of my ideas are marked as favorites?"
- "Show me ideas that don't have any tags"
- "Count how many ideas I have"

**Ask for summaries:**

- "Summarize my ideas by status"
- "What's the average number of tags per idea?"

### ❌ Avoid These

**Vague questions:**

- "Tell me something" (What do you want to know?)
- "Ideas" (Show them? Count them? Filter them?)

**Requests for actions (not yet supported in Part A):**

- "Create a new idea called 'Test'" ← Coming in Part B
- "Delete all my ideas" ← Not allowed for safety
- "Update the title of idea #5" ← Coming in Part B

**Questions about unrelated topics:**

- "What's the weather?" ← AI focuses on your database only

## Understanding Responses

### Response Components

Each AI response includes:

1. **Natural Language Explanation**: Human-friendly summary of what was found
2. **Generated SQL** (expandable): The actual query that ran against your database
3. **Results Table**: Your data displayed in a structured format
4. **Metadata** (expandable): Token usage and cost information

### Reading SQL Queries

Click the **Copy** button next to generated SQL to save it for later use or learning. The SQL shown is exactly what executed against your database (with RLS enforced).

Example:

```sql
SELECT * FROM ideas
ORDER BY created_at DESC
LIMIT 10
```

This query:

- Selects all columns (`*`)
- From your `ideas` table
- Sorts by creation date (newest first)
- Limits results to 10 rows

### Result Tables

- Tables show up to 10 rows by default
- Click "Show all X rows" to expand
- Columns match your database schema
- All data is scoped to your user (RLS enforced)

## Features

### Keyboard Shortcuts

- **Cmd/Ctrl + Enter**: Send query (while typing in input field)
- **Tab**: Navigate through interface
- **Escape**: Close chat drawer (when open)

### Clear Conversation

Click the **Clear Chat** button to delete all messages and start fresh. This will:

- Remove all messages from current session
- Reset token usage counters
- Not affect your database data

### Session Tracking

The header shows:

- **Tokens**: Total tokens consumed this session
- **Cost**: Estimated API cost (in dollars)

This helps you monitor usage during long sessions.

## Safety & Security

### What's Protected

✅ **Your data is safe:**

- Only YOU can see your ideas (RLS enforced)
- AI cannot access other users' data
- AI cannot delete or modify data (read-only in Part A)

✅ **Queries are validated:**

- Only SELECT queries allowed
- DROP/DELETE/UPDATE blocked
- All queries include LIMIT clause (max 50 rows)

✅ **Rate limiting:**

- Maximum 10 queries per minute
- Prevents accidental excessive API usage

### What to Expect

**Conversational responses:**
If you ask "How are you?" or "What can you do?", the AI will respond conversationally without querying the database.

**Query responses:**
If you ask about your data, the AI will:

1. Decide if a database query is needed
2. Generate safe SQL
3. Execute it (RLS enforced)
4. Format results into natural language

**Error handling:**
If something goes wrong:

- Clear error messages explain what happened
- Your data remains unchanged
- Try rephrasing your question or checking examples

## Tips for Best Results

### 1. Start Simple

Begin with basic questions:

- "Show me all ideas"
- "How many ideas do I have?"

Then get more specific:

- "Show ideas created this week"
- "List ideas with more than 3 tags"

### 2. Use Database Column Names

The AI understands your schema, so you can reference:

- `title`, `description`, `status` (ideas table)
- `label`, `color` (tags table)
- `created_at`, `updated_at` (timestamps)

Example: "Show ideas where status is 'active'"

### 3. Specify Limits

For better performance:

- "Show me my 5 most recent ideas" (faster than "all ideas")
- "List top 10 ideas by date"

### 4. Review Generated SQL

Learn SQL by:

- Checking what queries the AI generates
- Comparing different phrasings
- Understanding how natural language maps to SQL

### 5. Use Clear Conversation

Click "Clear Chat" between different topics to help the AI focus on your current question without context from previous queries.

## Troubleshooting

### "Rate limit exceeded"

**Problem:** You've sent more than 10 queries in the last minute.

**Solution:** Wait 60 seconds before sending your next query.

### "Authentication required"

**Problem:** Your session expired.

**Solution:** Refresh the page and log in again.

### "No results to display"

**Problem:** Your query ran successfully but found no matching data.

**Solution:**

- Check if you have ideas in your database
- Try a broader query (remove filters)
- Use example queries to verify AI is working

### "Query failed"

**Problem:** The AI generated invalid SQL or database error occurred.

**Solution:**

- Try rephrasing your question
- Use simpler language
- Check example queries for reference
- Report persistent issues to support

## Examples by Use Case

### Browsing Ideas

```
"Show me all my ideas"
"What are my 10 most recent ideas?"
"List ideas sorted by title alphabetically"
```

### Finding Specific Ideas

```
"Show ideas created in the last week"
"Find ideas with 'project' in the title"
"Which ideas have the tag 'important'?"
```

### Analyzing Data

```
"How many ideas do I have?"
"What's the oldest idea in my collection?"
"Show me ideas grouped by status"
```

### Working with Tags

```
"List all my tags"
"Which ideas have no tags?"
"Show ideas with more than 2 tags"
```

## What's Coming (Part B)

Future updates will add:

- **Create, update, delete operations**: "Create a new idea called 'X'"
- **Multi-step workflows**: "Create an idea and tag it as 'urgent'"
- **Web search integration**: "Search the web for X and save as idea"
- **Autonomous suggestions**: AI recommends actions based on your data

## Feedback

Found a bug? Have a suggestion?

Your feedback helps improve the AI chat experience. Consider:

- What questions you wish worked but don't
- What responses were unclear or unhelpful
- What features would make this more useful

---

**Version**: Part A - Responses API (Read-only queries)  
**Last Updated**: December 2024
