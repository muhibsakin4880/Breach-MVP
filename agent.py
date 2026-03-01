from __future__ import annotations

import argparse
import json
from pathlib import Path

from core.config import AgentConfig
from core.init import build_agent
from core.llm import OllamaClient
from core.workflows import autocomplete_file, propose_file_fix, run_diagnostics_command


class Color:
    RESET = "\033[0m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Autonomous Coding Agent (Ollama)")
    parser.add_argument("task", nargs="?", help="Task to execute")
    parser.add_argument("--workdir", default=".", help="Working directory")
    parser.add_argument("--interactive", action="store_true", help="Interactive autonomous mode")
    parser.add_argument("--model", default="auto", help="Ollama model, or 'auto' for strongest installed model")
    parser.add_argument("--fast", action="store_true", help="Faster responses (smaller model + lighter settings)")
    parser.add_argument("--startup-scan", action="store_true", help="Run initial full project scan in interactive mode")
    parser.add_argument("--url", default="http://localhost:11434", help="Ollama URL")
    parser.add_argument("--temperature", type=float, default=0.2)
    parser.add_argument("--num-ctx", type=int, default=4096, help="LLM context window (lower = faster, less VRAM)")
    parser.add_argument("--timeout", type=int, default=60)
    parser.add_argument("--max-steps", type=int, default=0, help="Agent max steps (0 = unlimited)")

    parser.add_argument("--health", action="store_true", help="Check Ollama connectivity and selected model")
    parser.add_argument("--list-models", action="store_true", help="List installed local models")

    parser.add_argument("--complete-file", help="Autocomplete target file path")
    parser.add_argument("--line", type=int, help="1-based cursor line for autocomplete")
    parser.add_argument("--column", type=int, help="1-based cursor column for autocomplete")
    parser.add_argument("--max-completion-chars", type=int, default=400, help="Max completion chars to insert")
    parser.add_argument("--apply-completion", action="store_true", help="Write completion into the file")

    parser.add_argument("--fix-file", help="Path of file to fix")
    parser.add_argument("--error", help="Error text, stack trace, or failing output")
    parser.add_argument("--diagnose-command", help="Run command and use its output as fix context")
    parser.add_argument("--apply-fix", action="store_true", help="Apply generated fix to --fix-file")
    return parser


def run_single_task(task: str, config: AgentConfig) -> int:
    try:
        agent = build_agent(config)
    except Exception as exc:
        print(f"{Color.RED}Error: {exc}{Color.RESET}")
        return 1

    print(f"{Color.CYAN}Working directory: {config.resolved_workdir()}{Color.RESET}")
    print(f"{Color.CYAN}Model: {agent.model}{Color.RESET}")
    print(f"{Color.YELLOW}Task: {task}{Color.RESET}")
    try:
        result = agent.run(task)
    except Exception as exc:
        print(f"{Color.RED}Error: {exc}{Color.RESET}")
        return 1
    print(f"\n{Color.GREEN}Done:{Color.RESET}\n{result}")
    return 0


def interactive_loop(config: AgentConfig, startup_scan: bool = False) -> int:
    try:
        agent = build_agent(config)
    except Exception as exc:
        print(f"{Color.RED}Error: {exc}{Color.RESET}")
        return 1

    print(f"\n{Color.CYAN}{'='*50}{Color.RESET}")
    print(f"{Color.CYAN}  Autonomous Coding Agent{Color.RESET}")
    print(f"{Color.CYAN}  Model   : {agent.model}{Color.RESET}")
    print(f"{Color.CYAN}  Project : {config.resolved_workdir()}{Color.RESET}")
    print(f"{Color.CYAN}{'='*50}{Color.RESET}")
    if startup_scan:
        print(f"{Color.YELLOW}  Scanning project files...{Color.RESET}")

        # Optional scan: slower startup, better global context.
        try:
            agent.run(
                "Scan this entire project now. Use list_directory recursively, "
                "then read the key source files (App.tsx, index files, main components, pages). "
                "Build a complete mental map of what exists. "
                "TASK_COMPLETE when you have explored everything."
            )
        except Exception:
            pass
    else:
        print(f"{Color.YELLOW}  Startup scan skipped for speed (--startup-scan to enable).{Color.RESET}")

    print(f"{Color.GREEN}  Ready! Just tell me what to do.{Color.RESET}")
    print(f"  (type 'exit' to quit)\n")

    while True:
        try:
            task = input(f"{Color.GREEN}You: {Color.RESET}").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            return 0

        if not task:
            continue
        if task.lower() in {"exit", "quit", "বন্ধ"}:
            print("Bye!")
            return 0

        try:
            result = agent.run(task)
            print(f"\n{Color.GREEN}Done:{Color.RESET} {result}\n")
        except Exception as exc:
            print(f"{Color.RED}Error: {exc}{Color.RESET}")


def build_llm(config: AgentConfig) -> OllamaClient:
    llm = OllamaClient(
        base_url=config.ollama_url,
        model=config.model,
        temperature=config.temperature,
        timeout_seconds=max(30, config.command_timeout_seconds),
        num_ctx=config.llm_num_ctx,
    )
    llm.resolve_model(config.model)
    return llm


def run_health(config: AgentConfig) -> int:
    try:
        llm = build_llm(config)
        models = llm.list_models()
    except Exception as exc:
        print(f"{Color.RED}Health check failed: {exc}{Color.RESET}")
        return 1

    print(f"{Color.CYAN}Ollama URL: {config.ollama_url}{Color.RESET}")
    print(f"{Color.CYAN}Selected model: {llm.model}{Color.RESET}")
    print(f"{Color.CYAN}num_ctx: {llm.num_ctx}{Color.RESET}")
    print(f"{Color.GREEN}Installed models ({len(models)}):{Color.RESET}")
    for model in models:
        size = int(model.get("size") or 0)
        print(f"- {model.get('name')} ({size} bytes)")
    return 0


def run_list_models(config: AgentConfig) -> int:
    try:
        llm = build_llm(config)
        models = llm.list_models()
    except Exception as exc:
        print(f"{Color.RED}Error: {exc}{Color.RESET}")
        return 1

    print(f"{Color.CYAN}Selected model: {llm.model}{Color.RESET}")
    print(json.dumps(models, ensure_ascii=False, indent=2))
    return 0


def run_autocomplete(config: AgentConfig, path: str, line: int, column: int, max_chars: int, apply: bool) -> int:
    try:
        llm = build_llm(config)
        result = autocomplete_file(
            llm=llm,
            workdir=config.resolved_workdir(),
            path_input=path,
            line=line,
            column=column,
            max_chars=max_chars,
            apply=apply,
        )
    except Exception as exc:
        print(f"{Color.RED}Autocomplete failed: {exc}{Color.RESET}")
        return 1

    print(f"{Color.CYAN}Model: {llm.model}{Color.RESET}")
    if llm.last_fallback_notice:
        print(f"{Color.YELLOW}{llm.last_fallback_notice}{Color.RESET}")
    print(f"{Color.CYAN}File: {result['path']} @ {result['line']}:{result['column']}{Color.RESET}")
    print(f"{Color.CYAN}Characters: {result['completion_chars']}{Color.RESET}")
    if result["applied"]:
        print(f"{Color.GREEN}Completion applied to file.{Color.RESET}")
    print(result["completion"])
    return 0


def run_fix_mode(config: AgentConfig, path: str, error_text: str, diagnose_command: str | None, apply: bool) -> int:
    workdir = config.resolved_workdir()
    combined_error = error_text.strip() if error_text else ""

    if diagnose_command:
        try:
            diagnostic = run_diagnostics_command(workdir, diagnose_command, timeout_seconds=config.command_timeout_seconds)
        except Exception as exc:
            print(f"{Color.RED}Failed to run diagnostic command: {exc}{Color.RESET}")
            return 1
        combined_error = (
            f"{combined_error}\n\n"
            f"Diagnostic command output:\n{json.dumps(diagnostic, ensure_ascii=False, indent=2)}"
        ).strip()

    if not combined_error:
        print(f"{Color.RED}Fix mode needs --error or --diagnose-command.{Color.RESET}")
        return 1

    try:
        llm = build_llm(config)
        result = propose_file_fix(
            llm=llm,
            workdir=workdir,
            path_input=path,
            error_text=combined_error,
            apply=apply,
        )
    except Exception as exc:
        print(f"{Color.RED}Fix generation failed: {exc}{Color.RESET}")
        return 1

    print(f"{Color.CYAN}Model: {llm.model}{Color.RESET}")
    if llm.last_fallback_notice:
        print(f"{Color.YELLOW}{llm.last_fallback_notice}{Color.RESET}")
    print(f"{Color.CYAN}File: {result['path']}{Color.RESET}")
    print(f"{Color.CYAN}Changed: {result['changed']}{Color.RESET}")
    if result["applied"]:
        print(f"{Color.GREEN}Fix applied. Backup: {result['backup']}{Color.RESET}")
    else:
        print(result["updated_content"])
    return 0


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    config = AgentConfig(
        ollama_url=args.url,
        model=args.model,
        max_steps=args.max_steps,
        temperature=args.temperature,
        llm_num_ctx=args.num_ctx,
        command_timeout_seconds=args.timeout,
        workdir=Path(args.workdir),
    )

    if args.fast:
        if config.model.strip().lower() == "auto":
            config.model = "auto-fast"
        config.temperature = 0.1
        config.llm_num_ctx = min(config.llm_num_ctx, 2048)
        config.max_tool_output_chars = 5000
        config.max_file_read_chars = 12000

    if args.list_models:
        return run_list_models(config)

    if args.health:
        return run_health(config)

    if args.complete_file:
        if args.line is None or args.column is None:
            parser.error("--complete-file requires --line and --column")
        return run_autocomplete(
            config=config,
            path=args.complete_file,
            line=args.line,
            column=args.column,
            max_chars=args.max_completion_chars,
            apply=args.apply_completion,
        )

    if args.fix_file:
        return run_fix_mode(
            config=config,
            path=args.fix_file,
            error_text=args.error or "",
            diagnose_command=args.diagnose_command,
            apply=args.apply_fix,
        )

    if args.interactive:
        config.max_steps = 0
        return interactive_loop(config, startup_scan=args.startup_scan)

    if not args.task:
        parser.error(
            "Provide a task, or use one of: --interactive, --complete-file, --fix-file, --list-models, --health"
        )

    return run_single_task(args.task, config)


if __name__ == "__main__":
    raise SystemExit(main())
