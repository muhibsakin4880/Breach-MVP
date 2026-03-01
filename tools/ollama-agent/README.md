# Local Ollama Coding Agent (CLI)

This repository includes a fully local coding-agent CLI that talks to Ollama at `http://localhost:11434`.

## Prerequisites

- Node.js 18+ (you have Node 22)
- Ollama installed and running
- A local model such as `codellama:7b`

## Quick Setup

```powershell
cd D:\Breach
powershell -ExecutionPolicy Bypass -File .\scripts\setup-ollama-agent.ps1
```

## Core Commands

```powershell
# Health check + selected model
npm run agent:health

# Interactive terminal chat
npm run agent:chat

# One-shot generation
npm run agent -- gen --task "Build a React card component"

# Use project files as context
npm run agent -- gen --task "Refactor this page" --files frontend/src/pages/HomePage.tsx,frontend/src/components/Header.tsx

# Ask and stream output directly
npm run agent -- ask --task "How should I organize React feature folders?"

# Edit a file (dry-run)
npm run agent -- edit --file frontend/src/components/Header.tsx --task "Refactor to extract nav links into a map"

# Edit a file and apply result (creates .bak backup)
npm run agent -- edit --file frontend/src/components/Header.tsx --task "Refactor to extract nav links into a map" --apply

# Bug fix workflow from stack trace
npm run agent -- fix --file frontend/src/pages/HomePage.tsx --error "TypeError: Cannot read properties of undefined (reading 'map')" --apply
```

## Alternative launcher (PowerShell wrapper)

```powershell
.\scripts\agent.ps1 chat
.\scripts\agent.ps1 gen --task "Create a React hook for debounced search"
```

## Notes

- Default model is `codellama:7b`.
- Override model per command: `--model qwen2.5-coder:1.5b-base`.
- Override host: `--host http://localhost:11434`.
- `edit`/`fix` only overwrite when `--apply` is provided.
- All operations stay local; no cloud APIs are used.