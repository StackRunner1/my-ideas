"""
Ideas Agent - OpenAI Agent SDK Implementation

Specialist agent for managing ideas in the database.
Uses OpenAI Agent SDK primitives: Agent, tools, handoffs.

Documentation: https://openai.github.io/openai-agents-python/agents/
"""

from typing import List, Optional

from agents import Agent, function_tool

from supabase import Client

from ..tools import create_idea, edit_idea, get_idea, list_ideas, search_ideas
from .prompts import IDEAS_AGENT_INSTRUCTIONS


def create_ideas_agent(agent_client: Client, user_id: str) -> Agent:
    """
    Create the Ideas specialist agent.

    This agent handles all idea-related operations:
    - Create new ideas
    - Search/retrieve ideas
    - List all ideas
    - Get specific idea by ID

    Args:
        agent_client: RLS-enforced Supabase client for database operations
        user_id: Human user's UUID for data ownership (NOT the agent-user UUID)

    Returns:
        Agent configured for ideas management

    Note:
        Tools receive agent_client and user_id via closure.
        Following OpenAI Agent SDK pattern where tools are Python functions.
        All tools MUST be decorated with @function_tool for SDK compatibility.
        user_id is the HUMAN user who owns the data, passed through from endpoint.
    """

    # Wrap tools with agent_client and user_id bound via closure
    @function_tool
    def create_idea_tool(
        title: str,
        description: Optional[str] = None,
        status: str = "draft",
        tags: Optional[List[str]] = None,
    ) -> str:
        """Create a new idea in the database.

        Args:
            title: Title of the idea (required, 1-200 characters).
            description: Optional detailed description of the idea.
            status: Idea status - 'draft', 'published', or 'archived'. Default 'draft'.
            tags: Optional list of tags to associate with the idea.

        Returns:
            Success message with idea details or error description.
        """
        result = create_idea(agent_client, title, description, status, tags, user_id)
        return str(result)

    @function_tool
    def search_ideas_tool(
        query: str,
        status: Optional[str] = None,
        limit: int = 10,
    ) -> str:
        """Search for ideas by title or description text.

        Args:
            query: Search text to match against title and description (case-insensitive).
            status: Optional filter by status ('draft', 'published', 'archived').
            limit: Maximum number of results to return (default 10, max 50).

        Returns:
            Search results or error description.
        """
        result = search_ideas(agent_client, query, status, limit, user_id)
        return str(result)

    @function_tool
    def list_ideas_tool(
        status: Optional[str] = None,
        limit: int = 20,
    ) -> str:
        """List all ideas for the current user.

        Args:
            status: Optional filter by status ('draft', 'published', 'archived').
            limit: Maximum number of results to return (default 20, max 100).

        Returns:
            List of ideas or error description.
        """
        result = list_ideas(agent_client, status, limit, user_id)
        return str(result)

    @function_tool
    def get_idea_tool(idea_id: str) -> str:
        """Get a specific idea by its ID.

        Args:
            idea_id: The UUID of the idea to retrieve.

        Returns:
            Idea details or error description.
        """
        result = get_idea(agent_client, idea_id, user_id)
        return str(result)

    @function_tool
    def edit_idea_tool(
        idea_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
    ) -> str:
        """Edit an existing idea's title, description, or status.

        Args:
            idea_id: The UUID of the idea to update (required).
            title: New title for the idea (optional, 1-200 characters).
            description: New description for the idea (optional).
            status: New status - 'draft', 'published', or 'archived' (optional).

        Returns:
            Success message with updated idea details or error description.
        """
        result = edit_idea(agent_client, idea_id, title, description, status, user_id)
        return str(result)

    ideas_agent = Agent(
        name="Ideas",
        instructions=IDEAS_AGENT_INSTRUCTIONS,
        tools=[
            create_idea_tool,
            search_ideas_tool,
            list_ideas_tool,
            get_idea_tool,
            edit_idea_tool,
        ],
        handoffs=[],  # Ideas agent is a leaf specialist, no handoffs needed
    )

    return ideas_agent
