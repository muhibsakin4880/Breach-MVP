from __future__ import annotations

from core.agent import AutonomousAgent
from core.config import AgentConfig


def build_agent(config: AgentConfig) -> AutonomousAgent:
    return AutonomousAgent(config)
