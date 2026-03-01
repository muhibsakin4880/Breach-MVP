from __future__ import annotations

from textwrap import dedent
from typing import Any, Dict, List

from .models import State


def _format_recent_steps(state: State, limit: int = 6) -> str:
    if not state.steps:
        return "No previous steps."

    rows: List[str] = []
    for step in state.steps[-limit:]:
        output = step.tool_output
        summary = output.get("summary") if isinstance(output, dict) else ""
        if not summary:
            summary = str(output)[:240]
        rows.append(
            f"- step={step.index} action={step.action.type} success={step.success} summary={summary}"
        )
    return "\n".join(rows)


def build_planner_messages(state: State, repo_path: str) -> List[Dict[str, str]]:
    recent = _format_recent_steps(state)
    verification = state.last_verification or {"status": "not_run"}
    prompt = dedent(
        f"""
        You are the Planner for an autonomous coding agent.
        Choose exactly one next action.

        Objective:
        {state.task.objective}

        Repository:
        {repo_path}

        Verify command:
        {state.task.verify_cmd}

        Current plan:
        {state.current_plan or "No plan yet."}

        Last verification:
        {verification}

        Recent steps:
        {recent}

        Allowed action types: shell, read_file, write_file, apply_patch, finish

        Return strict JSON only, no markdown:
        {{
          "plan_update": "string",
          "next_action": {{"type": "shell|read_file|write_file|apply_patch|finish", "args": {{}}}},
          "reason": "one short sentence"
        }}

        Action argument expectations:
        - shell: {{"command": "...", "timeout_seconds": 60 optional}}
        - read_file: {{"path": "relative/or/absolute/path"}}
        - write_file: {{"path": "...", "content": "..."}}
        - apply_patch: {{"path": "...", "edits": [{{"old_text": "...", "new_text": "...", "count": 1 optional}}]}}
        - finish: {{"summary": "..." optional}}
        """
    ).strip()
    return [{"role": "user", "content": prompt}]


def build_critic_messages(
    objective: str,
    action: Dict[str, Any],
    tool_output: Dict[str, Any],
    verification: Dict[str, Any] | None,
) -> List[Dict[str, str]]:
    prompt = dedent(
        f"""
        You are the Critic for an autonomous coding agent.
        Decide if the next move should continue coding, verify, or finish.

        Objective:
        {objective}

        Last action:
        {action}

        Last action output:
        {tool_output}

        Verification status:
        {verification or {"status": "not_run"}}

        Return strict JSON only, no markdown:
        {{"decision": "continue|verify|finish", "reason": "string"}}

        Rules:
        - If enough changes appear done, prefer verify.
        - If verify has passed and no open errors remain, finish.
        - If action failed, continue unless immediate verify is needed for diagnosis.
        - If the same action repeats without new information, choose verify instead of continue.
        """
    ).strip()
    return [{"role": "user", "content": prompt}]
