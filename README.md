# Local Autonomous Coding Agent (Ollama)

This project provides a fully local coding agent that can:
- autonomously edit files
- run shell diagnostics/build/test commands
- generate inline code autocomplete at a cursor location
- propose and apply file-level bug fixes from stack traces or command output

No cloud API key is required.

## Requirements

- Python 3.10+
- Ollama installed and running at `http://localhost:11434`
- At least one local model installed

Example:

```powershell
ollama pull qwen2.5-coder
```

## Quick Start

```powershell
cd D:\Breach
python agent.py --health
```

## Copilot CLI (Recommended)

`copilot.py` is a teammate-style launcher over `agent_v1` for daily project work.
It auto-detects a verification command for common repo types and stores run artifacts.

```powershell
cd D:\Breach
python copilot.py do "Scan the repo, identify the most urgent bug, fix it, and verify."
```

Interactive mode:

```powershell
python copilot.py chat
```

Or use the local wrappers:

```powershell
.\breach-copilot.cmd chat
.\breach-copilot.ps1 do "Fix the failing tests and verify"
```

Batch mode from a text file (one objective per line):

```powershell
python copilot.py batch --tasks-file .\tasks.txt
```

Useful options:

```powershell
python copilot.py chat --fast
python copilot.py do "Refactor the auth flow" --verify "npm test"
python copilot.py do "Fix failing Python tests" --verify "python -m pytest -q"
```

`--model auto` is the default and automatically selects the largest installed local model.
Use `--fast` to prefer smaller/faster local models and lighter settings.
If you hit GPU memory errors, lower context with `--num-ctx 1024` or `--num-ctx 2048`.

## Install Global CLI Command

Install `breach-agent` into your user PATH:

```powershell
cd D:\Breach
powershell -ExecutionPolicy Bypass -File .\scripts\install-breach-agent-cli.ps1
```

Then open a new terminal and run:

```powershell
breach-agent --help
breach-agent --workdir D:\Breach --interactive
breach-agent --workdir D:\Breach --interactive --fast
```

If you want to use it immediately in this repo without reopening terminal:

```powershell
.\breach-agent.cmd --help
.\breach-agent.ps1 --workdir D:\Breach --interactive
```

## Core Commands

Health and models:

```powershell
python agent.py --health
python agent.py --list-models
python agent.py --model qwen2.5-coder --health
```

Autonomous one-shot task:

```powershell
python agent.py "Scan the repo, find failing tests, and fix them."
```

Interactive autonomous mode:

```powershell
python agent.py --interactive
python agent.py --interactive --fast
python agent.py --interactive --fast --num-ctx 1024
```

`--interactive` now skips the startup full-repo scan by default for faster launch.
Add `--startup-scan` when you want deeper initial context:

```powershell
python agent.py --interactive --startup-scan
```

Autocomplete at cursor:

```powershell
# Dry-run completion text
python agent.py --complete-file frontend/src/App.tsx --line 42 --column 9

# Insert completion directly into file
python agent.py --complete-file frontend/src/App.tsx --line 42 --column 9 --apply-completion
```

Bug-fix for a specific file:

```powershell
# Provide stack trace directly
python agent.py --fix-file frontend/src/App.tsx --error "TypeError: Cannot read properties of undefined (reading 'map')"

# Or run a command and use its output as fix context
python agent.py --fix-file frontend/src/App.tsx --diagnose-command "npm run build"

# Apply fix to file (backup is created automatically)
python agent.py --fix-file frontend/src/App.tsx --diagnose-command "npm run build" --apply-fix
```

## Notes

- `--apply-fix` writes a timestamped backup next to the file.
- The autonomous mode operates inside your selected `--workdir` and blocks paths outside it.
- If you want a specific model, pass `--model <name>`. Otherwise keep `--model auto`.

## agent_v1 (Strict Loop)

`agent_v1` is a separate, stricter autonomous agent with:
- planner/critic JSON contracts
- guarded tool execution
- mandatory verification before completion
- per-run artifact logs (`meta.json`, `steps.jsonl`, `result.json`)
- benchmark runner for task sets

Run one task:

```powershell
python -m agent_v1.main run --repo . --task-id demo --objective "Fix failing tests" --verify "pytest -q"
```

Run the evaluation harness:

```powershell
python -m agent_v1.main eval --tasks agent_v1/tasks.yaml
```
