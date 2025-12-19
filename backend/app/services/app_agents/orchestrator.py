"""
Orchestrator Agent - OpenAI Agent SDK Implementation

Main agent that routes requests to specialist agents.
Uses OpenAI Agent SDK primitives: Agent, handoffs, sessions.

Documentation:
- Agents: https://openai.github.io/openai-agents-python/agents/
- Handoffs: https://openai.github.io/openai-agents-python/handoffs/
- Multi-agent: https://openai.github.io/openai-agents-python/multi_agent/
"""

from agents import Agent

from .ideas_agent import create_ideas_agent
from .prompts import ORCHESTRATOR_INSTRUCTIONS
from .tags_agent import create_tags_agent


def create_orchestrator(agent_client) -> Agent:
    """
    Create the Orchestrator agent.

    This agent:
    - Analyzes user requests
    - Routes to appropriate specialist agents via handoffs
    - Coordinates multi-step operations
    - Provides direct answers for general queries

    Args:
        agent_client: RLS-enforced Supabase client for database operations

    Returns:
        Orchestrator Agent configured with handoffs to specialist agents

    Architecture:
        Orchestrator
        ├─> Ideas Agent (handles idea operations)
        └─> Tags Agent (handles tag operations)

    Note:
        Following OpenAI Agent SDK handoffs pattern:
        https://openai.github.io/openai-agents-python/handoffs/

        The orchestrator delegates to specialists, which execute tools.
        Handoffs are a first-class primitive in the SDK.
    """
    # Create specialist agents with RLS-enforced client
    ideas = create_ideas_agent()
    tags = create_tags_agent(agent_client)

    # Create orchestrator with handoffs to specialists
    orchestrator = Agent(
        name="Orchestrator",
        instructions=ORCHESTRATOR_INSTRUCTIONS,
        tools=[],  # Orchestrator has no tools, only delegates via handoffs
        handoffs=[ideas, tags],  # Can hand off to either specialist
    )

    return orchestrator


# Factory function - creates new instance per request with user context
