from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass
class AgentConfig:
    ollama_url: str = "http://localhost:11434"
    model: str = "auto"
    max_steps: int = 20
    temperature: float = 0.2
    llm_num_ctx: int = 4096
    command_timeout_seconds: int = 60
    max_tool_output_chars: int = 8000
    max_file_read_chars: int = 20000
    workdir: Path = Path(".")

    def resolved_workdir(self) -> Path:
        return self.workdir.resolve()
