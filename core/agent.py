from __future__ import annotations

import json
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from core.config import AgentConfig
from core.llm import OllamaClient
from core.prompts import get_system_prompt
from core.tools import ToolExecutor


class Color:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    MAGENTA = "\033[95m"
    RED = "\033[91m"
    BLUE = "\033[94m"


@dataclass
class ToolCall:
    name: str
    arguments: Dict[str, Any]


class AutonomousAgent:
    def __init__(self, config: AgentConfig) -> None:
        self.config = config
        self.workdir = config.resolved_workdir()
        self.llm = OllamaClient(
            base_url=config.ollama_url,
            model=config.model,
            temperature=config.temperature,
            timeout_seconds=max(30, config.command_timeout_seconds),
            num_ctx=config.llm_num_ctx,
        )
        self.model = self.llm.resolve_model(config.model)
        self.tools = ToolExecutor(
            workdir=self.workdir,
            max_file_read_chars=config.max_file_read_chars,
            max_tool_output_chars=config.max_tool_output_chars,
            command_timeout_seconds=config.command_timeout_seconds,
        )

    def run(self, task: str) -> str:
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": get_system_prompt(str(self.workdir))},
            {"role": "user", "content": f"TASK: {task}"},
        ]

        parse_failures = 0
        step = 0

        while True:
            step += 1
            if self.config.max_steps > 0 and step > self.config.max_steps:
                return "Max steps reached before TASK_COMPLETE."

            if self.config.max_steps > 0:
                self._print(Color.CYAN, f"\n=== Step {step}/{self.config.max_steps} ===")
            else:
                self._print(Color.CYAN, f"\n=== Step {step} ===")
            assistant_text = self.llm.chat(messages)
            if self.llm.last_fallback_notice:
                self._print(Color.YELLOW, self.llm.last_fallback_notice)
            self._print(Color.BLUE, "Model Response:")
            self._print(Color.BLUE, self._truncate_for_console(assistant_text, 1600))

            plan = self._extract_plan(assistant_text)
            if plan:
                self._print(Color.YELLOW, f"Plan: {plan}")

            final_answer = self._extract_task_complete(assistant_text)
            if final_answer is not None:
                self._print(Color.GREEN, "Task completed by model.")
                return final_answer

            tool_call = self._parse_tool_call(assistant_text)
            if tool_call is None:
                parse_failures += 1
                self._print(Color.RED, "No valid `tool {...}` call found. Asking model to fix format.")
                messages.append({"role": "assistant", "content": assistant_text})
                messages.append(
                    {
                        "role": "user",
                        "content": (
                            "FORMAT_ERROR: Reply with exactly one tool call in `tool {...}` JSON format "
                            "or `TASK_COMPLETE: ...` if done."
                        ),
                    }
                )

                if parse_failures >= 4:
                    return "Failed to parse model responses repeatedly. Stop condition reached."
                continue

            parse_failures = 0
            self._print(Color.GREEN, f"Tool: {tool_call.name}")
            self._print(Color.GREEN, f"Arguments: {json.dumps(tool_call.arguments, ensure_ascii=False)}")

            observation = self.tools.execute(tool_call.name, tool_call.arguments)
            self._print(Color.MAGENTA, "Observation:")
            self._print(Color.MAGENTA, self._truncate_for_console(observation, 2400))

            messages.append({"role": "assistant", "content": assistant_text})
            messages.append(
                {
                    "role": "user",
                    "content": (
                        f"OBSERVATION from tool `{tool_call.name}`:\n{observation}\n\n"
                        "Continue the ReAct loop. Use another tool or output TASK_COMPLETE if finished."
                    ),
                }
            )

    def _extract_plan(self, text: str) -> Optional[str]:
        match = re.search(r"(?im)^\s*PLAN\s*:\s*(.+)$", text)
        if not match:
            return None
        return match.group(1).strip()

    def _extract_task_complete(self, text: str) -> Optional[str]:
        match = re.search(r"(?is)TASK_COMPLETE\s*:\s*(.*)", text)
        if not match:
            return None

        summary = match.group(1).strip()
        if summary:
            return summary
        return "Task complete."

    def _parse_tool_call(self, text: str) -> Optional[ToolCall]:
        for keyword in re.finditer(r"(?i)\btool\b", text):
            start = text.find("{", keyword.end())
            if start == -1:
                continue

            raw_json = self._extract_json_object(text, start)
            if raw_json is None:
                continue

            try:
                payload = json.loads(raw_json)
            except json.JSONDecodeError:
                continue

            if not isinstance(payload, dict):
                continue

            name = payload.get("name") or payload.get("tool") or payload.get("action")
            if not isinstance(name, str) or not name.strip():
                continue

            arguments = payload.get("arguments")
            if arguments is None:
                arguments = payload.get("args")
            if arguments is None:
                arguments = payload.get("input")

            if isinstance(arguments, dict):
                arg_dict = arguments
            elif arguments is None:
                arg_dict = {
                    key: value
                    for key, value in payload.items()
                    if key not in {"name", "tool", "action", "arguments", "args", "input"}
                }
            else:
                arg_dict = {"input": arguments}

            normalized = self._coerce_arguments(name.strip(), arg_dict)
            return ToolCall(name=name.strip(), arguments=normalized)

        return None

    def _coerce_arguments(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if "input" not in arguments or len(arguments) != 1:
            return arguments

        value = arguments["input"]
        if tool_name == "read_file":
            return {"path": value}
        if tool_name == "run_command":
            return {"command": value}
        if tool_name in {"list_directory", "analyze_code"}:
            return {"path": value}
        if tool_name == "search_in_files":
            if isinstance(value, str) and "|||" in value:
                path, query = value.split("|||", 1)
                return {"path": path.strip(), "query": query.strip()}
        return arguments

    def _extract_json_object(self, text: str, start_index: int) -> Optional[str]:
        if start_index < 0 or start_index >= len(text) or text[start_index] != "{":
            return None

        depth = 0
        in_string = False
        escaped = False

        for idx in range(start_index, len(text)):
            char = text[idx]

            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue

            if char == '"':
                in_string = True
                continue

            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    return text[start_index : idx + 1]

        return None

    def _truncate_for_console(self, text: str, max_chars: int) -> str:
        if len(text) <= max_chars:
            return text
        return text[:max_chars] + "\n...[truncated]"

    def _print(self, color: str, message: str) -> None:
        print(f"{color}{message}{Color.RESET}")
