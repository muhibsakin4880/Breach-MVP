from __future__ import annotations

from dataclasses import dataclass

from .models import State


@dataclass
class MemoryConfig:
    recent_steps: int = 8
    max_summary_chars: int = 2500


class MemoryBuilder:
    def __init__(self, config: MemoryConfig | None = None) -> None:
        self.config = config or MemoryConfig()

    def summarize_state(self, state: State) -> str:
        if not state.steps:
            return "No steps executed yet."

        chunks = []
        for step in state.steps[-self.config.recent_steps :]:
            output = step.tool_output
            if isinstance(output, dict):
                short = output.get("summary") or output.get("error") or str(output)
            else:
                short = str(output)
            short = short.replace("\n", " ")
            if len(short) > 180:
                short = short[:180] + "..."
            chunks.append(
                f"step={step.index} action={step.action.type} success={step.success} reason={step.reason} output={short}"
            )

        text = "\n".join(chunks)
        if len(text) > self.config.max_summary_chars:
            text = text[-self.config.max_summary_chars :]
        return text
