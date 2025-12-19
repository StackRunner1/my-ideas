"""Tool definitions for OpenAI Responses API function calling.

This module exports all available tools that the LLM can call.
Following OpenAI best practices and MCP patterns for tool organization.
"""

from .database_tools import QUERY_DATABASE_TOOL, execute_query_database

# Export all available tools
ALL_TOOLS = [
    QUERY_DATABASE_TOOL,
]

# Export tool handlers
TOOL_HANDLERS = {
    "query_database": execute_query_database,
}

__all__ = [
    "ALL_TOOLS",
    "TOOL_HANDLERS",
    "QUERY_DATABASE_TOOL",
    "execute_query_database",
]
