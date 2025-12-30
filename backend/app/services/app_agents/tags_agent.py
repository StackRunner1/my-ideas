"""
Tags Agent - OpenAI Agent SDK Implementation

Specialist agent for managing tags in the database.
Uses OpenAI Agent SDK primitives: Agent, tools, handoffs.

Documentation: https://openai.github.io/openai-agents-python/agents/
"""

from typing import Optional

from agents import Agent, function_tool

from supabase import Client

from ..tools import create_tag, search_tags
from .prompts import TAGS_AGENT_INSTRUCTIONS


def create_tags_agent(agent_client: Client) -> Agent:
    """
    Create the Tags specialist agent.

    This agent handles all tag-related operations:
    - Create new tags
    - Search/retrieve tags
    - Link tags to items
    - Validate tag names

    Args:
        agent_client: RLS-enforced Supabase client for database operations

    Returns:
        Agent configured for tags management

    Note:
        Tools receive agent_client via closure for RLS enforcement.
        Following OpenAI Agent SDK pattern where tools are Python functions.
        All tools MUST be decorated with @function_tool for SDK compatibility.
        User context (user_id) will be passed via RunContextWrapper (see Unit 16.5).
    """

    # Wrap create_tag with agent_client bound
    # Note: user_id will be accessed via RunContextWrapper (see Unit 16.5)
    @function_tool
    def create_tag_tool(tag_name: str, idea_id: Optional[int] = None) -> str:
        """Create a new tag and optionally link it to an idea.

        Args:
            tag_name: Name of the tag to create (alphanumeric, hyphens, underscores).
            idea_id: Optional ID of idea to link the tag to.

        Returns:
            Success message or error description.
        """
        result = create_tag(agent_client, tag_name, idea_id)
        return str(result)

    @function_tool
    def search_tags_tool(query: str, limit: Optional[int] = 10) -> str:
        """Search for tags by name pattern.

        Args:
            query: Search pattern to match tag names (case-insensitive).
            limit: Maximum number of results to return (default 10, max 50).

        Returns:
            Search results or error description.
        """
        result = search_tags(agent_client, query, limit)
        return str(result)

    tags_agent = Agent(
        name="Tags",
        instructions=TAGS_AGENT_INSTRUCTIONS,
        tools=[create_tag_tool, search_tags_tool],
        handoffs=[],  # Tags agent is a leaf specialist, no handoffs needed
    )

    return tags_agent


# Factory function - creates new instance per request with user context
# (Different from items_agent which is stateless)
