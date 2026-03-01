from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from .evaluator import run_evaluation
from .llm import OllamaJsonClient
from .loop import AgentLoop
from .models import Task


class Color:
    RESET = "\033[0m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Autonomous coding agent v1")
    sub = parser.add_subparsers(dest="command", required=True)

    run_cmd = sub.add_parser("run", help="Run one autonomous task")
    run_cmd.add_argument("--repo", default=".", help="Repository path")
    run_cmd.add_argument("--task-id", default="manual_task", help="Task identifier")
    run_cmd.add_argument("--objective", required=True, help="Objective to complete")
    run_cmd.add_argument("--verify", required=True, help="Verification command")
    run_cmd.add_argument("--max-steps", type=int, default=20)
    run_cmd.add_argument("--max-retries", type=int, default=2)
    run_cmd.add_argument("--model", default="auto", help="Ollama model or auto")
    run_cmd.add_argument("--url", default="http://localhost:11434", help="Ollama base URL")
    run_cmd.add_argument("--temperature", type=float, default=0.1)
    run_cmd.add_argument("--num-ctx", type=int, default=4096)
    run_cmd.add_argument("--output-root", default=".agent_v1/runs", help="Run artifacts directory")
    run_cmd.add_argument("--verbose", action="store_true", help="Show step-by-step agent activity")
    run_cmd.add_argument(
        "--allow-prefix",
        action="append",
        default=[],
        help="Extra allowed command prefix (repeatable)",
    )

    eval_cmd = sub.add_parser("eval", help="Run benchmark tasks")
    eval_cmd.add_argument("--tasks", default="agent_v1/tasks.yaml", help="Path to tasks YAML")
    eval_cmd.add_argument("--model", default="auto", help="Ollama model or auto")
    eval_cmd.add_argument("--url", default="http://localhost:11434", help="Ollama base URL")
    eval_cmd.add_argument("--output-root", default=".agent_v1/eval", help="Evaluation output directory")
    eval_cmd.add_argument("--max-steps", type=int, default=20)
    eval_cmd.add_argument("--verbose", action="store_true", help="Show per-task and step activity")
    eval_cmd.add_argument(
        "--allow-prefix",
        action="append",
        default=[],
        help="Extra allowed command prefix (repeatable)",
    )

    interactive_cmd = sub.add_parser("interactive", help="Interactive objective mode")
    interactive_cmd.add_argument("--repo", default=".", help="Repository path")
    interactive_cmd.add_argument("--verify", required=True, help="Verification command")
    interactive_cmd.add_argument("--max-steps", type=int, default=20)
    interactive_cmd.add_argument("--max-retries", type=int, default=2)
    interactive_cmd.add_argument("--model", default="auto", help="Ollama model or auto")
    interactive_cmd.add_argument("--url", default="http://localhost:11434", help="Ollama base URL")
    interactive_cmd.add_argument("--temperature", type=float, default=0.1)
    interactive_cmd.add_argument("--num-ctx", type=int, default=4096)
    interactive_cmd.add_argument("--output-root", default=".agent_v1/runs", help="Run artifacts directory")
    interactive_cmd.add_argument("--verbose", action="store_true", help="Show step-by-step agent activity")
    interactive_cmd.add_argument(
        "--allow-prefix",
        action="append",
        default=[],
        help="Extra allowed command prefix (repeatable)",
    )

    return parser


def run_single(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    task = Task(
        id=args.task_id,
        repo_path=repo,
        objective=args.objective.strip(),
        verify_cmd=args.verify.strip(),
        max_steps=args.max_steps,
        max_retries_per_step=args.max_retries,
    )

    try:
        llm = OllamaJsonClient(
            base_url=args.url,
            model=args.model,
            temperature=args.temperature,
            num_ctx=args.num_ctx,
        )
        model = llm.resolve_model(args.model)
    except Exception as exc:
        print(f"{Color.RED}Model setup failed: {exc}{Color.RESET}")
        return 1

    loop = AgentLoop(
        task=task,
        llm=llm,
        output_root=Path(args.output_root),
        extra_allowed_prefixes=list(args.allow_prefix or []),
        verbose=bool(args.verbose),
    )
    print(f"{Color.CYAN}Repo: {repo}{Color.RESET}")
    print(f"{Color.CYAN}Model: {model}{Color.RESET}")
    print(f"{Color.YELLOW}Objective: {task.objective}{Color.RESET}")

    try:
        result = loop.run()
    except Exception as exc:
        print(f"{Color.RED}Run failed: {exc}{Color.RESET}")
        return 1

    color = Color.GREEN if result.ok else Color.RED
    print(f"{color}Result: {'SUCCESS' if result.ok else 'FAILED'}{Color.RESET}")
    print(f"{color}Message: {result.message}{Color.RESET}")
    print(f"{Color.CYAN}Steps: {result.steps_taken}{Color.RESET}")
    print(f"{Color.CYAN}Run Dir: {loop.run_dir}{Color.RESET}")
    if result.changed_files:
        print(f"{Color.CYAN}Changed Files: {', '.join(result.changed_files)}{Color.RESET}")
    return 0 if result.ok else 2


def run_eval(args: argparse.Namespace) -> int:
    try:
        report = run_evaluation(
            tasks_path=Path(args.tasks).resolve(),
            base_model=args.model,
            base_url=args.url,
            output_root=Path(args.output_root).resolve(),
            default_max_steps=args.max_steps,
            extra_allowed_prefixes=list(args.allow_prefix or []),
            verbose=bool(args.verbose),
        )
    except Exception as exc:
        print(f"{Color.RED}Evaluation failed: {exc}{Color.RESET}")
        return 1

    print(f"{Color.CYAN}Tasks: {report['tasks_total']}{Color.RESET}")
    print(f"{Color.CYAN}Succeeded: {report['tasks_succeeded']}{Color.RESET}")
    print(f"{Color.CYAN}Success Rate: {report['success_rate']}%{Color.RESET}")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


def run_interactive(args: argparse.Namespace) -> int:
    repo = Path(args.repo).resolve()
    verify = args.verify.strip()
    if not verify:
        print(f"{Color.RED}--verify is required.{Color.RESET}")
        return 1

    try:
        llm = OllamaJsonClient(
            base_url=args.url,
            model=args.model,
            temperature=args.temperature,
            num_ctx=args.num_ctx,
        )
        model = llm.resolve_model(args.model)
    except Exception as exc:
        print(f"{Color.RED}Model setup failed: {exc}{Color.RESET}")
        return 1

    print(f"{Color.CYAN}Repo: {repo}{Color.RESET}")
    print(f"{Color.CYAN}Model: {model}{Color.RESET}")
    print(f"{Color.CYAN}Verify: {verify}{Color.RESET}")
    print(f"{Color.YELLOW}Interactive mode. Type an objective, or 'exit' to quit.{Color.RESET}")

    task_index = 0
    while True:
        try:
            objective = input("objective> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not objective:
            continue
        if objective.lower() in {"exit", "quit"}:
            break

        task_index += 1
        stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        task_id = f"interactive_{stamp}_{task_index}"
        task = Task(
            id=task_id,
            repo_path=repo,
            objective=objective,
            verify_cmd=verify,
            max_steps=args.max_steps,
            max_retries_per_step=args.max_retries,
        )

        loop = AgentLoop(
            task=task,
            llm=llm,
            output_root=Path(args.output_root),
            extra_allowed_prefixes=list(args.allow_prefix or []),
            verbose=bool(args.verbose),
        )
        print(f"{Color.YELLOW}Running task {task_id}{Color.RESET}")
        result = loop.run()
        color = Color.GREEN if result.ok else Color.RED
        print(f"{color}Result: {'SUCCESS' if result.ok else 'FAILED'}{Color.RESET}")
        print(f"{color}Message: {result.message}{Color.RESET}")
        print(f"{Color.CYAN}Run Dir: {loop.run_dir}{Color.RESET}")

    return 0


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "run":
        return run_single(args)
    if args.command == "eval":
        return run_eval(args)
    if args.command == "interactive":
        return run_interactive(args)

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
