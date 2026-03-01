from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

ActionType = Literal["shell", "read_file", "write_file", "apply_patch", "finish"]


@dataclass
class Task:
    id: str
    repo_path: Path
    objective: str
    verify_cmd: str
    max_steps: int = 20
    max_retries_per_step: int = 2


@dataclass
class Action:
    type: ActionType
    args: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Step:
    index: int
    action: Action
    tool_output: Dict[str, Any]
    success: bool
    timestamp: str
    reason: str = ""

    @staticmethod
    def now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        payload = asdict(self)
        payload["action"]["type"] = self.action.type
        return payload


@dataclass
class State:
    task: Task
    steps: List[Step] = field(default_factory=list)
    current_plan: str = ""
    done: bool = False
    result: Optional[str] = None
    last_verification: Optional[Dict[str, Any]] = None


@dataclass
class RunResult:
    ok: bool
    message: str
    steps_taken: int
    verification: Optional[Dict[str, Any]] = None
    changed_files: List[str] = field(default_factory=list)
    diff: str = ""
