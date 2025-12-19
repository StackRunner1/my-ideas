"""
Tags Agent - OpenAI Agent SDK Implementation

Specialist agent for managing tags in the database.
Uses OpenAI Agent SDK primitives: Agent, tools, handoffs.

Documentation: https://openai.github.io/openai-agents-python/agents/
"""

from agents import Agent

from supabase import Client

from ..tools import create_tag
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
    """

    # Wrap create_tag with agent_client bound
    def create_tag_tool(tag_name: str, item_id: int = None) -> dict:
        """
        Create a new tag.

        Args:
            tag_name: Name of the tag to create
            item_id: Optional item ID to link the tag to

        Returns:
            Result dictionary with success status and tag data
        """
        return create_tag(agent_client, tag_name, item_id)

    tags_agent = Agent(
        name="Tags",
        instructions=TAGS_AGENT_INSTRUCTIONS,
        tools=[create_tag_tool],  # Will add more: search_tags, link_tag, etc.
        handoffs=[],  # Tags agent is a leaf specialist, no handoffs needed
    )

    return tags_agent


# Factory function - creates new instance per request with user context
# (Different from items_agent which is stateless)
