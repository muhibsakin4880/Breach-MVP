from __future__ import annotations

import ast
import json
import os
import re
import subprocess
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List


SKIP_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    ".idea",
    ".cursor",
    ".continue",
    ".qodo",
    "dist",
    "build",
}


class ToolExecutor:
    def __init__(self, workdir: Path, max_file_read_chars: int, max_tool_output_chars: int, command_timeout_seconds: int) -> None:
        self.workdir = workdir.resolve()
        self.max_file_read_chars = max_file_read_chars
        self.max_tool_output_chars = max_tool_output_chars
        self.command_timeout_seconds = command_timeout_seconds

    def execute(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        handlers = {
            "read_file": self.read_file,
            "write_file": self.write_file,
            "edit_file": self.edit_file,
            "list_directory": self.list_directory,
            "run_command": self.run_command,
            "search_in_files": self.search_in_files,
            "analyze_code": self.analyze_code,
        }

        handler = handlers.get(tool_name)
        if handler is None:
            return self._json(
                {
                    "ok": False,
                    "error": f"Unknown tool: {tool_name}",
                    "available_tools": sorted(handlers.keys()),
                }
            )

        try:
            result = handler(arguments)
            return self._truncate(self._json({"ok": True, "tool": tool_name, "result": result}))
        except Exception as exc:  # defensive
            return self._json({"ok": False, "tool": tool_name, "error": str(exc)})

    def read_file(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target = self._resolve_path(str(arguments.get("path", "")))
        if not target.exists() or not target.is_file():
            raise FileNotFoundError(f"File not found: {target}")

        content = target.read_text(encoding="utf-8", errors="replace")
        truncated = False
        if len(content) > self.max_file_read_chars:
            content = content[: self.max_file_read_chars]
            truncated = True

        return {
            "path": str(target.relative_to(self.workdir)),
            "truncated": truncated,
            "content": content,
        }

    def write_file(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target = self._resolve_path(str(arguments.get("path", "")))
        content = str(arguments.get("content", ""))
        append = bool(arguments.get("append", False))

        target.parent.mkdir(parents=True, exist_ok=True)
        mode = "a" if append else "w"
        with target.open(mode, encoding="utf-8") as handle:
            handle.write(content)

        return {
            "path": str(target.relative_to(self.workdir)),
            "bytes_written": len(content.encode("utf-8")),
            "append": append,
        }

    def edit_file(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target = self._resolve_path(str(arguments.get("path", "")))
        old_text = str(arguments.get("old_text", ""))
        new_text = str(arguments.get("new_text", ""))
        count = int(arguments.get("count", 1))

        if not target.exists() or not target.is_file():
            raise FileNotFoundError(f"File not found: {target}")
        if not old_text:
            raise ValueError("old_text must be provided")
        if count < 0:
            raise ValueError("count must be >= 0")

        content = target.read_text(encoding="utf-8", errors="replace")
        existing = content.count(old_text)
        if existing == 0:
            raise ValueError("old_text not found in target file")

        replacement_count = existing if count == 0 else min(count, existing)
        if count == 0:
            updated = content.replace(old_text, new_text)
        else:
            updated = content.replace(old_text, new_text, count)

        target.write_text(updated, encoding="utf-8")

        return {
            "path": str(target.relative_to(self.workdir)),
            "replacements": replacement_count,
            "remaining_occurrences": updated.count(old_text),
        }

    def list_directory(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        base = self._resolve_path(str(arguments.get("path", ".")))
        recursive = bool(arguments.get("recursive", False))
        max_entries = int(arguments.get("max_entries", 200))
        if max_entries <= 0:
            max_entries = 200

        if not base.exists() or not base.is_dir():
            raise NotADirectoryError(f"Directory not found: {base}")

        entries: List[Dict[str, Any]] = []

        if recursive:
            for root, dirs, files in os.walk(base):
                dirs[:] = sorted([d for d in dirs if d not in SKIP_DIRS])
                root_path = Path(root)

                for name in dirs:
                    entry = root_path / name
                    entries.append({"type": "dir", "path": str(entry.relative_to(self.workdir))})
                    if len(entries) >= max_entries:
                        break
                if len(entries) >= max_entries:
                    break

                for name in sorted(files):
                    entry = root_path / name
                    entries.append(
                        {
                            "type": "file",
                            "path": str(entry.relative_to(self.workdir)),
                            "size": entry.stat().st_size,
                        }
                    )
                    if len(entries) >= max_entries:
                        break
                if len(entries) >= max_entries:
                    break
        else:
            for entry in sorted(base.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
                if entry.name in SKIP_DIRS:
                    continue
                if entry.is_dir():
                    entries.append({"type": "dir", "path": str(entry.relative_to(self.workdir))})
                else:
                    entries.append(
                        {
                            "type": "file",
                            "path": str(entry.relative_to(self.workdir)),
                            "size": entry.stat().st_size,
                        }
                    )
                if len(entries) >= max_entries:
                    break

        return {
            "path": str(base.relative_to(self.workdir)),
            "recursive": recursive,
            "max_entries": max_entries,
            "returned_entries": len(entries),
            "entries": entries,
        }

    def run_command(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        command = str(arguments.get("command", "")).strip()
        timeout_seconds = int(arguments.get("timeout_seconds", self.command_timeout_seconds))

        if not command:
            raise ValueError("command must be provided")

        # Prevent recursive self-invocation of this agent CLI from inside the agent.
        normalized = " ".join(command.split()).lower()
        if re.search(r"(^|\\s)(python(\\.exe)?|py)\\s+(.+\\s+)?agent\\.py(\\s|$)", normalized):
            return {
                "command": command,
                "blocked": True,
                "reason": "Blocked recursive invocation of agent.py from run_command.",
            }

        try:
            completed = subprocess.run(
                command,
                cwd=str(self.workdir),
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            stdout = completed.stdout or ""
            stderr = completed.stderr or ""
            return {
                "command": command,
                "exit_code": completed.returncode,
                "stdout": self._truncate(stdout),
                "stderr": self._truncate(stderr),
            }
        except subprocess.TimeoutExpired as exc:
            return {
                "command": command,
                "timeout_seconds": timeout_seconds,
                "timed_out": True,
                "stdout": self._truncate(exc.stdout or ""),
                "stderr": self._truncate(exc.stderr or ""),
            }

    def search_in_files(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        base = self._resolve_path(str(arguments.get("path", ".")))
        query = str(arguments.get("query", ""))
        case_sensitive = bool(arguments.get("case_sensitive", False))
        max_matches = int(arguments.get("max_matches", 200))
        if max_matches <= 0:
            max_matches = 200

        if not query:
            raise ValueError("query must be provided")

        matches: List[Dict[str, Any]] = []

        paths: List[Path] = []
        if base.is_file():
            paths.append(base)
        elif base.is_dir():
            for root, dirs, files in os.walk(base):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                root_path = Path(root)
                for file_name in files:
                    paths.append(root_path / file_name)
        else:
            raise FileNotFoundError(f"Path not found: {base}")

        for file_path in paths:
            try:
                text = file_path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue

            for line_number, line in enumerate(text.splitlines(), start=1):
                haystack = line if case_sensitive else line.lower()
                needle = query if case_sensitive else query.lower()
                if needle in haystack:
                    matches.append(
                        {
                            "path": str(file_path.relative_to(self.workdir)),
                            "line": line_number,
                            "text": line.strip(),
                        }
                    )
                    if len(matches) >= max_matches:
                        return {
                            "path": str(base.relative_to(self.workdir)) if base != self.workdir else ".",
                            "query": query,
                            "case_sensitive": case_sensitive,
                            "truncated": True,
                            "matches": matches,
                        }

        return {
            "path": str(base.relative_to(self.workdir)) if base != self.workdir else ".",
            "query": query,
            "case_sensitive": case_sensitive,
            "truncated": False,
            "matches": matches,
        }

    def analyze_code(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        target = self._resolve_path(str(arguments.get("path", ".")))
        if not target.exists():
            raise FileNotFoundError(f"Path not found: {target}")

        if target.is_file():
            return self._analyze_file(target)

        extension_counts: Counter[str] = Counter()
        total_files = 0
        total_dirs = 0
        total_lines = 0
        python_functions = 0
        python_classes = 0
        python_imports = 0

        for root, dirs, files in os.walk(target):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            total_dirs += len(dirs)

            for name in files:
                total_files += 1
                file_path = Path(root) / name
                extension_counts[file_path.suffix.lower() or "<no_ext>"] += 1

                try:
                    content = file_path.read_text(encoding="utf-8", errors="replace")
                except OSError:
                    continue

                total_lines += len(content.splitlines())
                if file_path.suffix.lower() == ".py":
                    try:
                        tree = ast.parse(content)
                    except SyntaxError:
                        continue

                    for node in ast.walk(tree):
                        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                            python_functions += 1
                        elif isinstance(node, ast.ClassDef):
                            python_classes += 1
                        elif isinstance(node, (ast.Import, ast.ImportFrom)):
                            python_imports += 1

        return {
            "path": str(target.relative_to(self.workdir)) if target != self.workdir else ".",
            "kind": "directory",
            "total_files": total_files,
            "total_dirs": total_dirs,
            "total_lines": total_lines,
            "top_extensions": extension_counts.most_common(10),
            "python_summary": {
                "functions": python_functions,
                "classes": python_classes,
                "import_statements": python_imports,
            },
        }

    def _analyze_file(self, file_path: Path) -> Dict[str, Any]:
        content = file_path.read_text(encoding="utf-8", errors="replace")
        result: Dict[str, Any] = {
            "path": str(file_path.relative_to(self.workdir)),
            "kind": "file",
            "extension": file_path.suffix.lower() or "<no_ext>",
            "lines": len(content.splitlines()),
            "characters": len(content),
        }

        if file_path.suffix.lower() == ".py":
            try:
                tree = ast.parse(content)
                functions = [n.name for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
                classes = [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
                imports = []
                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        imports.extend(alias.name for alias in node.names)
                    elif isinstance(node, ast.ImportFrom):
                        module = node.module or ""
                        imports.extend(f"{module}.{alias.name}".strip(".") for alias in node.names)

                result["python"] = {
                    "functions": functions,
                    "classes": classes,
                    "imports": sorted(set(imports)),
                }
            except SyntaxError as exc:
                result["python"] = {"parse_error": str(exc)}

        return result

    def _resolve_path(self, path_input: str) -> Path:
        value = path_input.strip() or "."
        candidate = Path(value)
        if not candidate.is_absolute():
            candidate = self.workdir / candidate

        resolved = candidate.resolve()
        try:
            resolved.relative_to(self.workdir)
        except ValueError as exc:
            raise ValueError(f"Path escapes workdir: {path_input}") from exc
        return resolved

    def _json(self, data: Dict[str, Any]) -> str:
        return json.dumps(data, ensure_ascii=False, indent=2)

    def _truncate(self, text: str) -> str:
        if len(text) <= self.max_tool_output_chars:
            return text
        return text[: self.max_tool_output_chars] + "\n...[truncated]"
