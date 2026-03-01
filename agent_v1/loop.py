from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict

from .llm import OllamaJsonClient
from .memory import MemoryBuilder
from .models import Action, RunResult, State, Step, Task
from .prompts import build_critic_messages, build_planner_messages
from .tools import FileTool, GitTool, ShellTool
from .verifier import Verifier


class AgentLoop:
    def __init__(
        self,
        task: Task,
        llm: OllamaJsonClient,
        output_root: Path,
        extra_allowed_prefixes: list[str] | None = None,
        max_file_read_chars: int = 40000,
        max_file_write_bytes: int = 1_000_000,
        shell_timeout_seconds: int = 60,
        verbose: bool = False,
        progress_callback: Callable[[str], None] | None = None,
    ) -> None:
        self.task = task
        self.llm = llm
        self.verbose = verbose
        self.progress_callback = progress_callback
        self.memory = MemoryBuilder()
        self.files = FileTool(task.repo_path, max_read_chars=max_file_read_chars, max_write_bytes=max_file_write_bytes)
        self.shell = ShellTool(
            repo_path=task.repo_path,
            verify_cmd=task.verify_cmd,
            extra_allowed_prefixes=extra_allowed_prefixes,
            default_timeout_seconds=shell_timeout_seconds,
        )
        self.git = GitTool(task.repo_path)
        self.verifier = Verifier(task.repo_path, task.verify_cmd)

        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        safe_id = "".join(ch if ch.isalnum() or ch in {"-", "_"} else "_" for ch in task.id)
        self.run_dir = (output_root / f"{safe_id}_{stamp}").resolve()
        self.run_dir.mkdir(parents=True, exist_ok=True)
        self.steps_log_path = self.run_dir / "steps.jsonl"
        self.result_path = self.run_dir / "result.json"

    def run(self) -> RunResult:
        state = State(task=self.task)
        self._write_meta()
        consecutive_failures = 0
        self._emit(f"[run] task_id={self.task.id} max_steps={self.task.max_steps}")
        self._emit(f"[run] objective={self.task.objective}")
        self._emit(f"[run] verify={self.task.verify_cmd}")
        self._emit(f"[run] artifacts={self.run_dir}")

        for step_num in range(1, self.task.max_steps + 1):
            self._emit(f"[step {step_num}] planning")
            planner_payload = self._planner_payload(state)
            plan_update = str(planner_payload.get("plan_update", "")).strip()
            if plan_update:
                state.current_plan = plan_update

            action = self._parse_action(planner_payload.get("next_action"))
            reason = str(planner_payload.get("reason", "")).strip()
            self._emit(
                f"[step {step_num}] action={action.type} args={self._summarize_args(action.args)} reason={reason or '-'}"
            )

            tool_output = self._execute_action(action)
            success = bool(tool_output.get("ok", False))
            summary = str(tool_output.get("summary") or tool_output.get("error") or "").strip()
            self._emit(f"[step {step_num}] result={'ok' if success else 'fail'} {summary}")
            step = Step(
                index=len(state.steps) + 1,
                action=action,
                tool_output=tool_output,
                success=success,
                timestamp=Step.now_iso(),
                reason=reason,
            )
            state.steps.append(step)
            self._append_step(step)

            if success:
                consecutive_failures = 0
            else:
                consecutive_failures += 1
                if consecutive_failures > self.task.max_retries_per_step:
                    self._emit(
                        f"[run] stop: consecutive_failures={consecutive_failures} "
                        f"limit={self.task.max_retries_per_step}"
                    )
                    return self._finalize(
                        state,
                        ok=False,
                        message=(
                            f"Stopped after {consecutive_failures} consecutive failed actions "
                            f"(limit={self.task.max_retries_per_step})."
                        ),
                    )

            critic_payload = self._critic_payload(state, action, tool_output)
            decision = str(critic_payload.get("decision", "continue")).strip().lower()
            if decision not in {"continue", "verify", "finish"}:
                decision = "continue"
            override = self._override_decision_if_stuck(state, decision)
            if override != decision:
                self._emit(
                    f"[step {step_num}] critic_override={override} reason=repeated no-op actions detected"
                )
                decision = override
            self._emit(f"[step {step_num}] critic_decision={decision}")

            if action.type == "finish" or decision in {"verify", "finish"}:
                self._emit(f"[step {step_num}] running verification")
                verify_output = self.verifier.run(self.shell)
                state.last_verification = verify_output
                self._emit(
                    f"[step {step_num}] verify={'pass' if verify_output.get('ok') else 'fail'} "
                    f"exit={verify_output.get('exit_code', '-')}"
                )
                verify_step = Step(
                    index=len(state.steps) + 1,
                    action=Action(type="shell", args={"command": self.task.verify_cmd, "verification": True}),
                    tool_output=verify_output,
                    success=bool(verify_output.get("ok", False)),
                    timestamp=Step.now_iso(),
                    reason=f"critic={decision} action={action.type}",
                )
                state.steps.append(verify_step)
                self._append_step(verify_step)

                if verify_output.get("ok"):
                    summary = action.args.get("summary") if action.type == "finish" else "Objective verified."
                    return self._finalize(state, ok=True, message=str(summary or "Objective verified."))

        return self._finalize(
            state,
            ok=False,
            message=f"Max steps reached ({self.task.max_steps}) before completion.",
        )

    def _planner_payload(self, state: State) -> Dict[str, Any]:
        messages = build_planner_messages(state, repo_path=str(self.task.repo_path))
        history = self.memory.summarize_state(state)
        messages[0]["content"] += f"\n\nCondensed history:\n{history}\n"
        return self.llm.chat_json(messages, schema_hint="planner")

    def _critic_payload(self, state: State, action: Action, tool_output: Dict[str, Any]) -> Dict[str, Any]:
        messages = build_critic_messages(
            objective=self.task.objective,
            action={"type": action.type, "args": action.args},
            tool_output=tool_output,
            verification=state.last_verification,
        )
        return self.llm.chat_json(messages, schema_hint="critic")

    def _parse_action(self, raw: Any) -> Action:
        if not isinstance(raw, dict):
            return Action(type="finish", args={"summary": "Planner returned invalid next_action."})

        raw_type = str(raw.get("type", "")).strip().lower()
        if raw_type not in {"shell", "read_file", "write_file", "apply_patch", "finish"}:
            return Action(type="finish", args={"summary": f"Invalid action type: {raw_type}"})

        args = raw.get("args", {})
        if not isinstance(args, dict):
            args = {}
        return Action(type=raw_type, args=args)

    def _execute_action(self, action: Action) -> Dict[str, Any]:
        try:
            if action.type == "shell":
                command = str(action.args.get("command", ""))
                timeout = action.args.get("timeout_seconds")
                timeout_int = int(timeout) if timeout is not None else None
                return self.shell.run(command, timeout_seconds=timeout_int)

            if action.type == "read_file":
                return self.files.read_file(str(action.args.get("path", "")))

            if action.type == "write_file":
                return self.files.write_file(
                    path=str(action.args.get("path", "")),
                    content=str(action.args.get("content", "")),
                )

            if action.type == "apply_patch":
                edits = action.args.get("edits", [])
                return self.files.apply_patch(path=str(action.args.get("path", "")), edits=edits)

            if action.type == "finish":
                return {"ok": True, "summary": str(action.args.get("summary", "Requested finish."))}

            return {"ok": False, "error": f"Unknown action type: {action.type}"}
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    def _append_step(self, step: Step) -> None:
        with self.steps_log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(step.to_dict(), ensure_ascii=False) + "\n")

    def _write_meta(self) -> None:
        payload = {
            "task_id": self.task.id,
            "repo_path": str(self.task.repo_path),
            "objective": self.task.objective,
            "verify_cmd": self.task.verify_cmd,
            "max_steps": self.task.max_steps,
            "policy": self.shell.describe_policy(),
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        (self.run_dir / "meta.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def _finalize(self, state: State, ok: bool, message: str) -> RunResult:
        state.done = True
        state.result = message

        changed_files = self.git.changed_files() if self.git.is_repo() else []
        diff = self.git.diff() if self.git.is_repo() else ""
        result = RunResult(
            ok=ok,
            message=message,
            steps_taken=len(state.steps),
            verification=state.last_verification,
            changed_files=changed_files,
            diff=diff,
        )

        payload = {
            "ok": result.ok,
            "message": result.message,
            "steps_taken": result.steps_taken,
            "verification": result.verification,
            "changed_files": result.changed_files,
            "diff": result.diff,
            "finished_at": datetime.now(timezone.utc).isoformat(),
        }
        self.result_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        self._emit(f"[run] completed ok={result.ok} steps={result.steps_taken} message={result.message}")
        return result

    def _emit(self, message: str) -> None:
        if self.progress_callback is not None:
            self.progress_callback(message)
            return
        if self.verbose:
            print(message)

    def _summarize_args(self, args: Dict[str, Any]) -> Dict[str, Any]:
        output: Dict[str, Any] = {}
        for key, value in args.items():
            if key == "content" and isinstance(value, str):
                output[key] = f"<{len(value)} chars>"
            elif key == "edits" and isinstance(value, list):
                output[key] = f"<{len(value)} edits>"
            else:
                output[key] = value
        return output

    def _override_decision_if_stuck(self, state: State, decision: str) -> str:
        if decision in {"verify", "finish"}:
            return decision
        if len(state.steps) < 2:
            return decision

        latest = state.steps[-1]
        previous = state.steps[-2]

        # If a code-changing operation succeeded, verify immediately.
        if latest.success and latest.action.type in {"write_file", "apply_patch"}:
            return "verify"

        # If the same successful action repeats, force verify to avoid no-op loops.
        if latest.success and previous.success:
            if self._action_signature(latest.action) == self._action_signature(previous.action):
                return "verify"

        # If three consecutive successful identical actions happen, verify.
        if len(state.steps) >= 3:
            a, b, c = state.steps[-3], state.steps[-2], state.steps[-1]
            if a.success and b.success and c.success:
                sig_a = self._action_signature(a.action)
                sig_b = self._action_signature(b.action)
                sig_c = self._action_signature(c.action)
                if sig_a == sig_b == sig_c:
                    return "verify"

        return decision

    def _action_signature(self, action: Action) -> str:
        args: Dict[str, Any] = {}
        for key, value in action.args.items():
            if action.type == "shell" and key == "timeout_seconds":
                continue
            args[key] = value

        if action.type == "shell":
            command = str(args.get("command", ""))
            args["command"] = " ".join(command.lower().split())
        if "path" in args:
            args["path"] = str(args["path"]).replace("\\", "/").lower()

        return f"{action.type}:{json.dumps(args, sort_keys=True, ensure_ascii=False)}"
