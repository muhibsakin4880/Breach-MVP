from __future__ import annotations

import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

from core.llm import OllamaClient


def resolve_in_workdir(workdir: Path, path_input: str) -> Path:
    value = (path_input or "").strip()
    if not value:
        raise ValueError("A file path is required.")

    candidate = Path(value)
    if not candidate.is_absolute():
        candidate = workdir / candidate

    resolved = candidate.resolve()
    try:
        resolved.relative_to(workdir)
    except ValueError as exc:
        raise ValueError(f"Path escapes workdir: {path_input}") from exc
    return resolved


def compute_cursor_offset(source: str, line: int, column: int) -> int:
    if line < 1 or column < 1:
        raise ValueError("line and column must be 1-based positive integers.")

    lines = source.splitlines(keepends=True)
    if not lines:
        if line == 1 and column == 1:
            return 0
        raise ValueError("Cursor is outside of file bounds.")

    if line > len(lines) + 1:
        raise ValueError("Cursor line is outside of file bounds.")

    if line == len(lines) + 1:
        if column != 1:
            raise ValueError("When line is after EOF, column must be 1.")
        return len(source)

    target_line = lines[line - 1]
    visible = target_line.rstrip("\r\n")
    max_column = len(visible) + 1
    if column > max_column:
        raise ValueError(f"Column {column} exceeds line length ({len(visible)}).")

    prefix_length = sum(len(item) for item in lines[: line - 1])
    return prefix_length + (column - 1)


def _extract_first_code_block(text: str) -> Optional[str]:
    match = re.search(r"```[^\n]*\n([\s\S]*?)```", text)
    if match:
        return match.group(1)
    return None


def normalize_model_code_response(text: str) -> str:
    fenced = _extract_first_code_block(text)
    if fenced is not None:
        return fenced

    tagged = re.search(r"<updated_file>\s*([\s\S]*?)\s*</updated_file>", text, re.IGNORECASE)
    if tagged:
        return tagged.group(1)

    cleaned = text.replace("\r\n", "\n")
    return cleaned


def autocomplete_file(
    llm: OllamaClient,
    workdir: Path,
    path_input: str,
    line: int,
    column: int,
    max_chars: int = 400,
    apply: bool = False,
) -> Dict[str, Any]:
    target = resolve_in_workdir(workdir, path_input)
    if not target.exists() or not target.is_file():
        raise FileNotFoundError(f"File not found: {target}")

    source = target.read_text(encoding="utf-8", errors="replace")
    cursor = compute_cursor_offset(source, line=line, column=column)

    before = source[:cursor]
    after = source[cursor:]

    prefix = before[-8000:]
    suffix = after[:4000]

    system_prompt = (
        "You are a coding autocomplete engine. "
        "Return only the exact text to insert at <CURSOR>. "
        "Do not explain. Do not repeat existing text unless it is required."
    )
    user_prompt = (
        f"File: {target.relative_to(workdir)}\n"
        f"Max completion characters: {max_chars}\n\n"
        "Code prefix before cursor:\n"
        "```text\n"
        f"{prefix}\n"
        "```\n\n"
        "Code suffix after cursor:\n"
        "```text\n"
        f"{suffix}\n"
        "```\n\n"
        "Return only completion text."
    )

    raw = llm.chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
    )

    completion = normalize_model_code_response(raw)
    completion = completion[:max(0, max_chars)]

    if apply and completion:
        updated = before + completion + after
        target.write_text(updated, encoding="utf-8")

    return {
        "path": str(target.relative_to(workdir)),
        "line": line,
        "column": column,
        "completion": completion,
        "completion_chars": len(completion),
        "applied": bool(apply and completion),
    }


def run_diagnostics_command(workdir: Path, command: str, timeout_seconds: int = 120) -> Dict[str, Any]:
    completed = subprocess.run(
        command,
        shell=True,
        cwd=str(workdir),
        capture_output=True,
        text=True,
        timeout=timeout_seconds,
    )
    return {
        "command": command,
        "exit_code": completed.returncode,
        "stdout": (completed.stdout or "")[-12000:],
        "stderr": (completed.stderr or "")[-12000:],
    }


def propose_file_fix(
    llm: OllamaClient,
    workdir: Path,
    path_input: str,
    error_text: str,
    apply: bool = False,
) -> Dict[str, Any]:
    target = resolve_in_workdir(workdir, path_input)
    if not target.exists() or not target.is_file():
        raise FileNotFoundError(f"File not found: {target}")

    source = target.read_text(encoding="utf-8", errors="replace")
    system_prompt = (
        "You fix code bugs. Respond with only one complete updated file in a markdown code block. "
        "No explanations."
    )
    user_prompt = (
        f"Target file: {target.relative_to(workdir)}\n\n"
        "Observed error details:\n"
        "```text\n"
        f"{error_text}\n"
        "```\n\n"
        "Current file content:\n"
        "```text\n"
        f"{source}\n"
        "```\n\n"
        "Return the full corrected file only."
    )

    raw = llm.chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
    )
    updated = normalize_model_code_response(raw)
    if not updated.strip():
        raise RuntimeError("Model returned an empty file for fix proposal.")

    changed = updated != source
    backup_path = None
    if apply and changed:
        stamp = datetime.now().strftime("%Y%m%d%H%M%S")
        backup_path = target.with_suffix(target.suffix + f".bak.{stamp}")
        backup_path.write_text(source, encoding="utf-8")
        target.write_text(updated, encoding="utf-8")

    return {
        "path": str(target.relative_to(workdir)),
        "changed": changed,
        "applied": bool(apply and changed),
        "backup": str(backup_path.relative_to(workdir)) if backup_path else None,
        "updated_content": updated,
    }
