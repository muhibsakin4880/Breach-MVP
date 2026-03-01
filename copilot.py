from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, List

from agent_v1.llm import OllamaJsonClient
from agent_v1.loop import AgentLoop
from agent_v1.models import RunResult, Task


class Color:
    RESET = "\033[0m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Project copilot launcher for the strict autonomous coding agent."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    do_cmd = sub.add_parser("do", help="Run one objective")
    add_common_args(do_cmd)
    do_cmd.add_argument("objective", help="Objective for the agent")
    do_cmd.add_argument("--task-id", default="", help="Optional task id")

    chat_cmd = sub.add_parser("chat", help="Interactive objective mode")
    add_common_args(chat_cmd)

    batch_cmd = sub.add_parser("batch", help="Run objectives from a text file")
    add_common_args(batch_cmd)
    batch_cmd.add_argument("--tasks-file", required=True, help="Text file with one objective per line")

    return parser


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--repo", default=".", help="Repository path")
    parser.add_argument("--verify", default="auto", help="Verification command (or 'auto')")
    parser.add_argument("--model", default="auto", help="Ollama model name, 'auto', or 'auto-fast'")
    parser.add_argument("--fast", action="store_true", help="Alias for --model auto-fast when model is auto")
    parser.add_argument("--url", default="http://localhost:11434", help="Ollama base URL")
    parser.add_argument("--temperature", type=float, default=0.1)
    parser.add_argument("--num-ctx", type=int, default=4096)
    parser.add_argument("--max-steps", type=int, default=20)
    parser.add_argument("--max-retries", type=int, default=2)
    parser.add_argument("--output-root", default=".agent_v1/runs", help="Directory for run artifacts")
    parser.add_argument(
        "--allow-prefix",
        action="append",
        default=[],
        help="Extra allowed shell command prefix (repeatable)",
    )
    parser.add_argument("--verbose", action="store_true", help="Show step-by-step execution")


def normalize_model(model: str, fast: bool) -> str:
    if fast and model.strip().lower() == "auto":
        return "auto-fast"
    return model


def detect_verify_command(repo: Path) -> str:
    package_json = repo / "package.json"
    if package_json.exists():
        manager = "npm"
        if (repo / "pnpm-lock.yaml").exists():
            manager = "pnpm"
        elif (repo / "yarn.lock").exists():
            manager = "yarn"

        try:
            payload = json.loads(package_json.read_text(encoding="utf-8"))
            scripts = payload.get("scripts", {}) if isinstance(payload, dict) else {}
            test_script = scripts.get("test") if isinstance(scripts, dict) else None
            if isinstance(test_script, str):
                lowered = test_script.strip().lower()
                if lowered and "no test specified" not in lowered:
                    if manager == "pnpm":
                        return "pnpm test"
                    if manager == "yarn":
                        return "yarn test"
                    return "npm test"
        except Exception:
            pass

    python_markers = [
        repo / "pytest.ini",
        repo / "pyproject.toml",
        repo / "setup.cfg",
        repo / "requirements.txt",
        repo / "tests",
    ]
    if any(marker.exists() for marker in python_markers):
        return "python -m pytest -q"

    if (repo / "go.mod").exists():
        return "go test ./..."
    if (repo / "Cargo.toml").exists():
        return "cargo test"

    raise RuntimeError(
        "Could not auto-detect a verification command. Pass one with --verify "
        "(example: --verify \"python -m pytest -q\")."
    )


def resolve_verify_command(repo: Path, raw_verify: str) -> str:
    value = (raw_verify or "").strip()
    if not value or value.lower() == "auto":
        return detect_verify_command(repo)
    return value


def sanitize_task_id(text: str, fallback: str = "task") -> str:
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "_", text.strip().lower()).strip("_")
    return (slug[:48] or fallback).strip("_")


def objective_from_file(path: Path) -> List[str]:
    if not path.exists():
        raise FileNotFoundError(f"Tasks file not found: {path}")
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    objectives: List[str] = []
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        objectives.append(line)
    return objectives


def run_one(
    llm: OllamaJsonClient,
    repo: Path,
    output_root: Path,
    objective: str,
    verify_cmd: str,
    max_steps: int,
    max_retries: int,
    allow_prefixes: Iterable[str],
    verbose: bool,
    task_id: str = "",
) -> tuple[RunResult, Path]:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    effective_task_id = task_id.strip() or f"{sanitize_task_id(objective, 'objective')}_{stamp}"
    task = Task(
        id=effective_task_id,
        repo_path=repo,
        objective=objective,
        verify_cmd=verify_cmd,
        max_steps=max_steps,
        max_retries_per_step=max_retries,
    )
    loop = AgentLoop(
        task=task,
        llm=llm,
        output_root=output_root,
        extra_allowed_prefixes=list(allow_prefixes),
        verbose=verbose,
    )
    result = loop.run()
    return result, loop.run_dir


def print_result(result: RunResult, run_dir: Path) -> None:
    color = Color.GREEN if result.ok else Color.RED
    label = "SUCCESS" if result.ok else "FAILED"
    print(f"{color}{label}{Color.RESET} {result.message}")
    print(f"{Color.CYAN}Steps: {result.steps_taken}{Color.RESET}")
    print(f"{Color.CYAN}Run Dir: {run_dir}{Color.RESET}")
    if result.changed_files:
        print(f"{Color.CYAN}Changed Files: {', '.join(result.changed_files)}{Color.RESET}")


def run_do(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    verify_cmd = resolve_verify_command(repo, args.verify)
    model = normalize_model(args.model, args.fast)

    llm = OllamaJsonClient(
        base_url=args.url,
        model=model,
        temperature=args.temperature,
        num_ctx=args.num_ctx,
    )
    selected_model = llm.resolve_model(model)

    print(f"{Color.CYAN}Repo: {repo}{Color.RESET}")
    print(f"{Color.CYAN}Model: {selected_model}{Color.RESET}")
    print(f"{Color.CYAN}Verify: {verify_cmd}{Color.RESET}")
    print(f"{Color.YELLOW}Objective: {args.objective.strip()}{Color.RESET}")

    result, run_dir = run_one(
        llm=llm,
        repo=repo,
        output_root=Path(args.output_root),
        objective=args.objective.strip(),
        verify_cmd=verify_cmd,
        max_steps=args.max_steps,
        max_retries=args.max_retries,
        allow_prefixes=args.allow_prefix or [],
        verbose=bool(args.verbose),
        task_id=args.task_id or "",
    )
    print_result(result, run_dir)
    return 0 if result.ok else 2


def run_chat(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    verify_cmd = resolve_verify_command(repo, args.verify)
    model = normalize_model(args.model, args.fast)

    llm = OllamaJsonClient(
        base_url=args.url,
        model=model,
        temperature=args.temperature,
        num_ctx=args.num_ctx,
    )
    selected_model = llm.resolve_model(model)

    print(f"{Color.CYAN}Repo: {repo}{Color.RESET}")
    print(f"{Color.CYAN}Model: {selected_model}{Color.RESET}")
    print(f"{Color.CYAN}Verify: {verify_cmd}{Color.RESET}")
    print(f"{Color.YELLOW}Interactive mode. Enter objectives. Type 'exit' to quit.{Color.RESET}")

    counter = 0
    while True:
        try:
            objective = input("objective> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 0

        if not objective:
            continue
        if objective.lower() in {"exit", "quit"}:
            return 0

        counter += 1
        task_id = f"chat_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{counter}"
        print(f"{Color.YELLOW}Running: {objective}{Color.RESET}")
        result, run_dir = run_one(
            llm=llm,
            repo=repo,
            output_root=Path(args.output_root),
            objective=objective,
            verify_cmd=verify_cmd,
            max_steps=args.max_steps,
            max_retries=args.max_retries,
            allow_prefixes=args.allow_prefix or [],
            verbose=bool(args.verbose),
            task_id=task_id,
        )
        print_result(result, run_dir)


def run_batch(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    verify_cmd = resolve_verify_command(repo, args.verify)
    model = normalize_model(args.model, args.fast)
    tasks_file = Path(args.tasks_file).resolve()
    objectives = objective_from_file(tasks_file)
    if not objectives:
        print(f"{Color.RED}No objectives found in {tasks_file}.{Color.RESET}")
        return 1

    llm = OllamaJsonClient(
        base_url=args.url,
        model=model,
        temperature=args.temperature,
        num_ctx=args.num_ctx,
    )
    selected_model = llm.resolve_model(model)

    print(f"{Color.CYAN}Repo: {repo}{Color.RESET}")
    print(f"{Color.CYAN}Model: {selected_model}{Color.RESET}")
    print(f"{Color.CYAN}Verify: {verify_cmd}{Color.RESET}")
    print(f"{Color.CYAN}Batch size: {len(objectives)}{Color.RESET}")

    ok_count = 0
    for idx, objective in enumerate(objectives, start=1):
        print(f"\n{Color.YELLOW}[{idx}/{len(objectives)}] {objective}{Color.RESET}")
        task_id = f"batch_{idx}_{sanitize_task_id(objective, 'objective')}"
        result, run_dir = run_one(
            llm=llm,
            repo=repo,
            output_root=Path(args.output_root),
            objective=objective,
            verify_cmd=verify_cmd,
            max_steps=args.max_steps,
            max_retries=args.max_retries,
            allow_prefixes=args.allow_prefix or [],
            verbose=bool(args.verbose),
            task_id=task_id,
        )
        if result.ok:
            ok_count += 1
        print_result(result, run_dir)

    print(
        f"\n{Color.CYAN}Batch finished: {ok_count}/{len(objectives)} successful.{Color.RESET}"
    )
    return 0 if ok_count == len(objectives) else 2


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    try:
        if args.command == "do":
            return run_do(args)
        if args.command == "chat":
            return run_chat(args)
        if args.command == "batch":
            return run_batch(args)
    except Exception as exc:
        print(f"{Color.RED}Error: {exc}{Color.RESET}")
        return 1

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
