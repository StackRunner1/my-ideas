"""
Ideas Agent - OpenAI Agent SDK Implementation

Specialist agent for managing ideas in the database.
Uses OpenAI Agent SDK primitives: Agent, tools, handoffs.

Documentation: https://openai.github.io/openai-agents-python/agents/
"""

from agents import Agent

from .prompts import IDEAS_AGENT_INSTRUCTIONS


def create_ideas_agent() -> Agent:
    """
    Create the Ideas specialist agent.

    This agent handles all idea-related operations:
    - Create new ideas
    - Search/retrieve ideas
    - Update existing ideas
    - Delete ideas

    Returns:
        Agent configured for ideas management

    Note:
        Tools will be added once implemented (create_idea, search_ideas, etc.)
        Following OpenAI Agent SDK pattern where tools are Python functions.
    """
    ideas_agent = Agent(
        name="Ideas",
        instructions=IDEAS_AGENT_INSTRUCTIONS,
        tools=[],  # Will add: create_idea, search_ideas, update_idea, delete_idea
        handoffs=[],  # Ideas agent is a leaf specialist, no handoffs needed
    )

    return ideas_agent


# Export singleton instance for reuse
ideas_agent = create_ideas_agent()
