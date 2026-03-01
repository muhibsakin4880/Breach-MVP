# agent_v1

Strict planner/executor/critic autonomous coding agent with local Ollama.

## Features
- Explicit loop: observe -> plan -> act -> critique -> verify
- Strict JSON planner and critic contracts
- Guardrailed shell tool with allowlist/blocklist
- Path-safe file tools (`read_file`, `write_file`, `apply_patch`)
- Mandatory verification before completion
- Run artifacts (`meta.json`, `steps.jsonl`, `result.json`)
- Evaluation runner over `tasks.yaml`

## Run One Task

```powershell
python -m agent_v1.main run --repo . --task-id demo --objective "Fix failing tests" --verify "pytest -q" --verbose
```

## Run Evaluation

```powershell
python -m agent_v1.main eval --tasks agent_v1/tasks.yaml --verbose
```

## Interactive Mode

```powershell
python -m agent_v1.main interactive --repo . --verify "pytest -q" --verbose
```

## Output

Each run writes artifacts under `.agent_v1/runs/<task_id>_<timestamp>/`.
