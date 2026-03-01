from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional


class OllamaClient:
    def __init__(
        self,
        base_url: str,
        model: str,
        temperature: float = 0.2,
        timeout_seconds: int = 120,
        num_ctx: int = 4096,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model.strip() if model else "qwen/qwen2.5-coder-14b"
        self.requested_model = self.model
        self.temperature = temperature
        self.timeout_seconds = timeout_seconds
        self.num_ctx = max(512, int(num_ctx))
        self.last_fallback_notice = ""
        # Detect if using LM Studio (port 1234) or Ollama
        self._is_lmstudio = "1234" in base_url

    def list_models(self) -> List[Dict[str, Any]]:
        if self._is_lmstudio:
            # LM Studio uses OpenAI-compatible /v1/models endpoint
            try:
                payload = self._request("GET", "/v1/models")
                models = payload.get("data", [])
                return [{"name": m.get("id", "")} for m in models if m.get("id")]
            except Exception:
                return [{"name": self.model}]
        else:
            payload = self._request("GET", "/api/tags")
            models = payload.get("models")
            if not isinstance(models, list):
                raise RuntimeError(f"Unexpected /api/tags response shape: {payload}")
            return [m for m in models if isinstance(m, dict) and isinstance(m.get("name"), str)]

    def resolve_model(self, requested: Optional[str] = None) -> str:
        return self.model

    def chat(self, messages: List[Dict[str, str]]) -> str:
        if self._is_lmstudio:
            return self._chat_openai(messages)
        else:
            return self._chat_ollama(messages)

    def _chat_openai(self, messages: List[Dict[str, str]]) -> str:
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": 4096,
        }
        data = self._request("POST", "/v1/chat/completions", payload)
        choices = data.get("choices", [])
        if not choices:
            raise RuntimeError(f"No choices in LM Studio response: {data}")
        content = choices[0].get("message", {}).get("content", "")
        if not isinstance(content, str):
            raise RuntimeError(f"Unexpected content type: {data}")
        return content

    def _chat_ollama(self, messages: List[Dict[str, str]]) -> str:
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
        message = data.get("message")
        if not isinstance(message, dict):
            raise RuntimeError(f"Unexpected Ollama response: {data}")
        content = message.get("content")
        if not isinstance(content, str):
            raise RuntimeError(f"Missing content in Ollama response: {data}")
        return content

    def _request(self, method: str, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = urllib.request.Request(
            url=url,
            data=body,
            headers={"Content-Type": "application/json"},
            method=method.upper(),
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
                raw = response.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace") if exc.fp else str(exc)
            raise RuntimeError(f"HTTP error {exc.code} at {endpoint}: {detail}") from exc
        except urllib.error.URLError as exc:
            raise RuntimeError(f"Cannot connect to {self.base_url}: {exc}") from exc

        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise RuntimeError(f"Invalid JSON: {exc}: {raw[:500]}") from exc

        if not isinstance(data, dict):
            raise RuntimeError(f"Unexpected response type: {type(data).__name__}")
        return data
