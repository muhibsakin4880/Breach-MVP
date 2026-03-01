from __future__ import annotations

import subprocess
from pathlib import Path
from typing import List


class GitTool:
    def __init__(self, repo_path: Path, max_diff_chars: int = 20000) -> None:
        self.repo_path = repo_path.resolve()
        self.max_diff_chars = max_diff_chars

    def is_repo(self) -> bool:
        result = self._run("git rev-parse --is-inside-work-tree")
        return result.returncode == 0

    def changed_files(self) -> List[str]:
        result = self._run("git diff --name-only")
        if result.returncode != 0:
            return []
        return [line.strip() for line in result.stdout.splitlines() if line.strip()]

    def diff(self) -> str:
        result = self._run("git diff")
        if result.returncode != 0:
            return ""
        text = result.stdout or ""
        if len(text) <= self.max_diff_chars:
            return text
        return text[: self.max_diff_chars] + "\n...[truncated]"

    def status_short(self) -> str:
        result = self._run("git status --short")
        if result.returncode != 0:
            return ""
        return result.stdout.strip()

    def _run(self, command: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            command,
            cwd=str(self.repo_path),
            shell=True,
            capture_output=True,
            text=True,
            timeout=30,
        )
