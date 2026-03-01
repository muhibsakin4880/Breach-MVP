from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from .tools.shell_tool import ShellTool


class Verifier:
    def __init__(self, repo_path: Path, verify_cmd: str, timeout_seconds: int = 300) -> None:
        self.repo_path = repo_path.resolve()
        self.verify_cmd = verify_cmd
        self.timeout_seconds = timeout_seconds

    def run(self, shell_tool: ShellTool) -> Dict[str, Any]:
        result = shell_tool.run(self.verify_cmd, timeout_seconds=self.timeout_seconds)
        if not isinstance(result, dict):
            return {"ok": False, "status": "error", "error": "Verifier returned invalid response."}

        status = "pass" if result.get("ok") else "fail"
        return {
            **result,
            "status": status,
            "summary": f"Verification {status} (cmd: {self.verify_cmd}).",
        }
