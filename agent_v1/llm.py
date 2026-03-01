from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional


class OllamaJsonClient:
    def __init__(
        self,
        base_url: str,
        model: str = "auto",
        temperature: float = 0.1,
        timeout_seconds: int = 120,
        num_ctx: int = 4096,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.requested_model = model.strip() if model else "auto"
        self.model = self.requested_model
        self.temperature = temperature
        self.timeout_seconds = timeout_seconds
        self.num_ctx = max(512, int(num_ctx))

    def list_models(self) -> List[Dict[str, Any]]:
        payload = self._request("GET", "/api/tags")
        models = payload.get("models", [])
        if not isinstance(models, list):
            raise RuntimeError(f"Unexpected /api/tags shape: {payload}")
        return [m for m in models if isinstance(m, dict) and isinstance(m.get("name"), str)]

    def resolve_model(self, requested: Optional[str] = None) -> str:
        target = (requested or self.requested_model or "auto").strip().lower()
        models = self.list_models()
        names = [str(m["name"]) for m in models]
        if not names:
            raise RuntimeError("No Ollama models installed. Run: ollama pull <model>")

        if target not in {"auto", "auto-fast", "fast"}:
            if requested not in names:
                raise RuntimeError(f"Model '{requested}' not installed. Installed: {', '.join(names[:8])}")
            self.model = requested or self.requested_model
            return self.model

        if target in {"auto-fast", "fast"}:
            smallest = min(models, key=lambda m: int(m.get("size") or 0))
            self.model = str(smallest["name"])
            return self.model

        largest = max(models, key=lambda m: int(m.get("size") or 0))
        self.model = str(largest["name"])
        return self.model

    def chat(self, messages: List[Dict[str, str]]) -> str:
        if self.model.lower() in {"auto", "auto-fast", "fast"}:
            self.resolve_model(self.model)

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": self.temperature,
                "num_ctx": self.num_ctx,
            },
        }
        data = self._request("POST", "/api/chat", payload)
        message = data.get("message", {})
        if not isinstance(message, dict) or not isinstance(message.get("content"), str):
            raise RuntimeError(f"Unexpected /api/chat response: {data}")
        return message["content"]

    def chat_json(
        self,
        messages: List[Dict[str, str]],
        schema_hint: str,
        max_retries: int = 2,
    ) -> Dict[str, Any]:
        conversation = list(messages)
        for _ in range(max_retries + 1):
            text = self.chat(conversation)
            parsed = _extract_json_dict(text)
            if parsed is not None:
                return parsed

            conversation.append({"role": "assistant", "content": text})
            conversation.append(
                {
                    "role": "user",
                    "content": (
                        f"JSON_FORMAT_ERROR: reply with strict JSON only for schema: {schema_hint}. "
                        "No markdown, no extra text."
                    ),
                }
            )
        raise RuntimeError(f"Model did not return parseable JSON for {schema_hint}")

    def _request(self, method: str, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(
            url=url,
            data=data,
            headers={"Content-Type": "application/json"},
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as resp:
                raw = resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace") if exc.fp else str(exc)
            raise RuntimeError(f"Ollama HTTP {exc.code} at {endpoint}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Cannot connect to Ollama at {self.base_url}: {exc}") from exc

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid JSON from Ollama at {endpoint}: {raw[:300]}") from exc

        if not isinstance(parsed, dict):
            raise RuntimeError(f"Unexpected JSON type from Ollama at {endpoint}: {type(parsed).__name__}")
        return parsed


def _extract_json_dict(text: str) -> Optional[Dict[str, Any]]:
    stripped = text.strip()
    if stripped.startswith("{") and stripped.endswith("}"):
        try:
            payload = json.loads(stripped)
            if isinstance(payload, dict):
                return payload
        except json.JSONDecodeError:
            pass

    start = stripped.find("{")
    while start != -1:
        candidate = _extract_balanced_object(stripped, start)
        if candidate is None:
            break
        try:
            payload = json.loads(candidate)
            if isinstance(payload, dict):
                return payload
        except json.JSONDecodeError:
            next_start = stripped.find("{", start + 1)
            start = next_start
            continue
        break
    return None


def _extract_balanced_object(text: str, start_index: int) -> Optional[str]:
    if start_index < 0 or start_index >= len(text) or text[start_index] != "{":
        return None

    depth = 0
    in_string = False
    escaped = False

    for idx in range(start_index, len(text)):
        char = text[idx]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
            continue

        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start_index : idx + 1]

    return None
