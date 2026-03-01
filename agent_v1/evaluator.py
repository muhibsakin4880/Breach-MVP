from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Dict, List

from .llm import OllamaJsonClient
from .loop import AgentLoop
from .models import Task


def load_tasks_yaml(path: Path) -> List[Dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    rows = text.splitlines()

    tasks: List[Dict[str, Any]] = []
    current: Dict[str, Any] | None = None

    for raw in rows:
        line = raw.rstrip()
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        if stripped.startswith("- "):
            if current:
                tasks.append(current)
            current = {}
            remainder = stripped[2:].strip()
            if remainder and ":" in remainder:
                key, value = _split_key_value(remainder)
                current[key] = value
            continue

        if current is None:
            continue

        if ":" in stripped:
            key, value = _split_key_value(stripped)
            current[key] = value

    if current:
        tasks.append(current)

    return tasks


def run_evaluation(
    tasks_path: Path,
    base_model: str,
    base_url: str,
    output_root: Path,
    default_max_steps: int = 20,
    extra_allowed_prefixes: list[str] | None = None,
    verbose: bool = False,
) -> Dict[str, Any]:
    raw_tasks = load_tasks_yaml(tasks_path)
    if not raw_tasks:
        raise RuntimeError(f"No tasks loaded from {tasks_path}")

    llm = OllamaJsonClient(base_url=base_url, model=base_model)
    llm.resolve_model(base_model)

    results: List[Dict[str, Any]] = []
    started = time.time()

    for item in raw_tasks:
        task = Task(
            id=str(item.get("id", f"task_{len(results)+1}")),
            repo_path=Path(str(item.get("repo_path", "."))).resolve(),
            objective=str(item.get("objective", "")).strip(),
            verify_cmd=str(item.get("verify_cmd", "")).strip(),
            max_steps=int(item.get("max_steps", default_max_steps)),
            max_retries_per_step=int(item.get("max_retries_per_step", 2)),
        )
        if not task.objective or not task.verify_cmd:
            results.append(
                {
                    "id": task.id,
                    "ok": False,
                    "message": "Missing objective or verify_cmd in task.",
                    "steps_taken": 0,
                }
            )
            continue

        if verbose:
            print(f"[eval] task={task.id} repo={task.repo_path}")
        loop = AgentLoop(
            task=task,
            llm=llm,
            output_root=output_root,
            extra_allowed_prefixes=extra_allowed_prefixes,
            verbose=verbose,
        )
        run_result = loop.run()
        if verbose:
            print(f"[eval] task={task.id} ok={run_result.ok} steps={run_result.steps_taken}")
        results.append(
            {
                "id": task.id,
                "ok": run_result.ok,
                "message": run_result.message,
                "steps_taken": run_result.steps_taken,
                "changed_files": run_result.changed_files,
                "verification": run_result.verification,
                "run_dir": str(loop.run_dir),
            }
        )

    elapsed = time.time() - started
    success = sum(1 for r in results if r.get("ok"))
    report = {
        "tasks_total": len(results),
        "tasks_succeeded": success,
        "success_rate": round((success / len(results)) * 100.0, 2),
        "elapsed_seconds": round(elapsed, 2),
        "results": results,
    }

    output_root.mkdir(parents=True, exist_ok=True)
    (output_root / "evaluation_report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return report


def _split_key_value(line: str) -> tuple[str, Any]:
    key, value = line.split(":", 1)
    key = key.strip()
    value = value.strip()
    if value.startswith(('"', "'")) and value.endswith(('"', "'")) and len(value) >= 2:
        value = value[1:-1]
    if value.lower() in {"true", "false"}:
        return key, value.lower() == "true"
    try:
        if value and value.replace("-", "", 1).isdigit():
            return key, int(value)
    except ValueError:
        pass
    return key, value
