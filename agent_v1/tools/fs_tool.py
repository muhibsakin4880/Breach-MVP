from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List


class FileTool:
    def __init__(self, repo_path: Path, max_read_chars: int = 40000, max_write_bytes: int = 1_000_000) -> None:
        self.repo_path = repo_path.resolve()
        self.max_read_chars = max_read_chars
        self.max_write_bytes = max_write_bytes

    def read_file(self, path: str) -> Dict[str, Any]:
        target = self._resolve(path)
        if not target.exists() or not target.is_file():
            return {"ok": False, "error": f"File not found: {path}"}

        text = target.read_text(encoding="utf-8", errors="replace")
        truncated = False
        if len(text) > self.max_read_chars:
            text = text[: self.max_read_chars]
            truncated = True

        return {
            "ok": True,
            "path": str(target.relative_to(self.repo_path)),
            "truncated": truncated,
            "content": text,
            "summary": f"Read {target.name} ({len(text)} chars{', truncated' if truncated else ''}).",
        }

    def write_file(self, path: str, content: str) -> Dict[str, Any]:
        target = self._resolve(path)
        encoded = content.encode("utf-8")
        if len(encoded) > self.max_write_bytes:
            return {
                "ok": False,
                "error": (
                    f"Write exceeds max size ({len(encoded)} bytes > {self.max_write_bytes} bytes)."
                ),
            }

        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        return {
            "ok": True,
            "path": str(target.relative_to(self.repo_path)),
            "bytes_written": len(encoded),
            "summary": f"Wrote {target.name} ({len(encoded)} bytes).",
        }

    def apply_patch(self, path: str, edits: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not isinstance(edits, list) or not edits:
            return {"ok": False, "error": "apply_patch requires non-empty edits list."}

        target = self._resolve(path)
        if not target.exists() or not target.is_file():
            return {"ok": False, "error": f"File not found: {path}"}

        text = target.read_text(encoding="utf-8", errors="replace")
        total_replacements = 0

        for idx, edit in enumerate(edits, start=1):
            if not isinstance(edit, dict):
                return {"ok": False, "error": f"Edit {idx} must be an object."}

            old_text = str(edit.get("old_text", ""))
            new_text = str(edit.get("new_text", ""))
            count_raw = edit.get("count", 1)
            try:
                count = int(count_raw)
            except (TypeError, ValueError):
                return {"ok": False, "error": f"Edit {idx} has invalid count: {count_raw}"}

            if not old_text:
                return {"ok": False, "error": f"Edit {idx} missing old_text."}
            if old_text not in text:
                return {"ok": False, "error": f"Edit {idx}: old_text not found."}

            if count <= 0:
                occurrences = text.count(old_text)
                text = text.replace(old_text, new_text)
                total_replacements += occurrences
            else:
                occurrences = text.count(old_text)
                replacements = min(occurrences, count)
                text = text.replace(old_text, new_text, count)
                total_replacements += replacements

        encoded = text.encode("utf-8")
        if len(encoded) > self.max_write_bytes:
            return {
                "ok": False,
                "error": f"Patched content exceeds max size ({len(encoded)} bytes).",
            }

        target.write_text(text, encoding="utf-8")
        return {
            "ok": True,
            "path": str(target.relative_to(self.repo_path)),
            "replacements": total_replacements,
            "summary": f"Patched {target.name} with {total_replacements} replacement(s).",
        }

    def _resolve(self, path_input: str) -> Path:
        value = (path_input or "").strip()
        if not value:
            raise ValueError("Path is required.")

        candidate = Path(value)
        if not candidate.is_absolute():
            candidate = self.repo_path / candidate

        resolved = candidate.resolve()
        try:
            resolved.relative_to(self.repo_path)
        except ValueError as exc:
            raise ValueError(f"Path escapes repo: {path_input}") from exc
        return resolved
