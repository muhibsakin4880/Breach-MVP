from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any, Dict, Iterable, List


DEFAULT_ALLOWED_PREFIXES = [
    "rg",
    "git status",
    "git diff",
    "git log",
    "git rev-parse",
    "pytest",
    "python -m pytest",
    "py -m pytest",
    "python -m py_compile",
    "py -m py_compile",
    "npm test",
    "npm run test",
    "pnpm test",
    "yarn test",
    "go test",
    "cargo test",
    "ruff",
    "eslint",
    "mypy",
    "tsc",
]

DEFAULT_BLOCK_PATTERNS = [
    "rm -rf",
    "rm -r",
    "del /f",
    "format ",
    "shutdown",
    "reboot",
    "git reset --hard",
    "git checkout --",
    "git clean -fd",
    "npm install",
    "pnpm install",
    "yarn install",
    "pip install",
    "curl ",
    "wget ",
]

DISALLOWED_CONTROL_TOKENS = ["&&", "||", ";", "|", ">", "<"]


class ShellTool:
    def __init__(
        self,
        repo_path: Path,
        verify_cmd: str,
        extra_allowed_prefixes: Iterable[str] | None = None,
        default_timeout_seconds: int = 60,
        max_output_chars: int = 12000,
    ) -> None:
        self.repo_path = repo_path.resolve()
        self.verify_cmd = verify_cmd.strip()
        self.default_timeout_seconds = default_timeout_seconds
        self.max_output_chars = max_output_chars

        allow = list(DEFAULT_ALLOWED_PREFIXES)
        if self.verify_cmd:
            allow.append(self.verify_cmd)
        if extra_allowed_prefixes:
            allow.extend(str(item).strip() for item in extra_allowed_prefixes if str(item).strip())

        self.allowed_prefixes = sorted({item.lower().strip() for item in allow if item.strip()})
        self.block_patterns = [p.lower() for p in DEFAULT_BLOCK_PATTERNS]

    def run(self, command: str, timeout_seconds: int | None = None) -> Dict[str, Any]:
        cmd = (command or "").strip()
        if not cmd:
            return {"ok": False, "error": "Shell command is empty."}

        blocked_reason = self._blocked_reason(cmd)
        if blocked_reason:
            return {"ok": False, "blocked": True, "error": blocked_reason, "command": cmd}

        if not self._is_allowed(cmd):
            return {
                "ok": False,
                "blocked": True,
                "error": "Command not in allowlist.",
                "command": cmd,
                "allowed_prefixes": self.allowed_prefixes,
            }

        timeout = timeout_seconds if timeout_seconds and timeout_seconds > 0 else self.default_timeout_seconds
        try:
            completed = subprocess.run(
                cmd,
                cwd=str(self.repo_path),
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
            )
        except subprocess.TimeoutExpired as exc:
            return {
                "ok": False,
                "command": cmd,
                "timed_out": True,
                "timeout_seconds": timeout,
                "stdout": self._truncate(exc.stdout or ""),
                "stderr": self._truncate(exc.stderr or ""),
                "summary": f"Command timed out after {timeout}s.",
            }

        stdout = completed.stdout or ""
        stderr = completed.stderr or ""
        ok = completed.returncode == 0
        return {
            "ok": ok,
            "command": cmd,
            "exit_code": completed.returncode,
            "stdout": self._truncate(stdout),
            "stderr": self._truncate(stderr),
            "summary": f"Command exited with code {completed.returncode}.",
        }

    def _is_allowed(self, command: str) -> bool:
        lowered = " ".join(command.lower().split())
        return any(lowered.startswith(prefix) for prefix in self.allowed_prefixes)

    def _blocked_reason(self, command: str) -> str | None:
        lowered = command.lower()
        for token in DISALLOWED_CONTROL_TOKENS:
            if token in command:
                return f"Blocked shell control token: {token}"
        for pattern in self.block_patterns:
            if pattern in lowered:
                return f"Blocked command pattern: {pattern}"
        return None

    def _truncate(self, text: str) -> str:
        if len(text) <= self.max_output_chars:
            return text
        return text[: self.max_output_chars] + "\n...[truncated]"

    def describe_policy(self) -> Dict[str, List[str]]:
        return {
            "allowed_prefixes": self.allowed_prefixes,
            "blocked_patterns": self.block_patterns,
        }
