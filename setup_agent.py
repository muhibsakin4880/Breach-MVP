#!/usr/bin/env python3
"""
Run this once — it will create all the agent files automatically.
Usage: python setup_agent.py
"""

import os

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "autonomous-coding-agent")
CORE = os.path.join(BASE, "core")
os.makedirs(CORE, exist_ok=True)

files = {}

files[os.path.join(BASE, "agent.py")] = '''#!/usr/bin/env python3
import sys, argparse
from core.agent import CodingAgent
from core.config import Config

def main():
    parser = argparse.ArgumentParser(description="Autonomous Coding Agent")
    parser.add_argument("task", nargs="?", help="Task to perform")
    parser.add_argument("--model", default="qwen2.5-coder", help="Ollama model")
    parser.add_argument("--url", default="http://localhost:11434")
    parser.add_argument("--max-iterations", type=int, default=20)
    parser.add_argument("--workdir", default=".")
    parser.add_argument("--interactive", "-i", action="store_true")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()
    config = Config(model=args.model, ollama_url=args.url,
                    max_iterations=args.max_iterations,
                    workdir=args.workdir, verbose=args.verbose)
    agent = CodingAgent(config)
    if args.interactive:
        agent.interactive_session()
    elif args.task:
        agent.run(args.task)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
'''

files[os.path.join(CORE, "__init__.py")] = '''from .agent import CodingAgent
from .config import Config
from .llm import OllamaClient
from .tools import get_all_tools
'''

files[os.path.join(CORE, "config.py")] = '''from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    model: str = "qwen2.5-coder"
    ollama_url: str = "http://localhost:11434"
    max_iterations: int = 20
    workdir: str = "."
    verbose: bool = False
    temperature: float = 0.1
    system_prompt: Optional[str] = None
'''

files[os.path.join(CORE, "llm.py")] = '''import json, urllib.request, urllib.error

class OllamaClient:
    def __init__(self, base_url="http://localhost:11434", model="qwen2.5-coder"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def chat(self, messages, temperature=0.1):
        data = {"model": self.model, "messages": messages, "stream": False,
                "options": {"temperature": temperature, "num_ctx": 8192}}
        body = json.dumps(data).encode()
        req = urllib.request.Request(f"{self.base_url}/api/chat", data=body,
              headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.loads(r.read())["message"]["content"]
        except urllib.error.URLError as e:
            raise ConnectionError(f"Ollama connect error: {e}")

    def list_models(self):
        req = urllib.request.Request(f"{self.base_url}/api/tags")
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read()).get("models", [])

    def is_available(self):
        try:
            self.list_models()
            return True
        except:
            return False
'''

files[os.path.join(CORE, "tools.py")] = '''import os, subprocess, ast
from pathlib import Path

class Tool:
    def __init__(self, name, description):
        self.name = name
        self.description = description
    def execute(self, **kwargs):
        raise NotImplementedError

class ReadFileTool(Tool):
    def __init__(self, workdir):
        super().__init__("read_file", "Read file contents")
        self.workdir = workdir
    def execute(self, path):
        try:
            p = Path(self.workdir) / path if not os.path.isabs(path) else Path(path)
            if not p.exists():
                return {"success": False, "error": f"Not found: {path}"}
            content = p.read_text(encoding="utf-8", errors="replace")
            lines = content.split("\\n")
            numbered = "\\n".join(f"{i+1:4d} | {l}" for i, l in enumerate(lines))
            return {"success": True, "content": numbered, "raw": content, "lines": len(lines), "path": str(p)}
        except Exception as e:
            return {"success": False, "error": str(e)}

class WriteFileTool(Tool):
    def __init__(self, workdir):
        super().__init__("write_file", "Write/create a file")
        self.workdir = workdir
    def execute(self, path, content):
        try:
            p = Path(self.workdir) / path if not os.path.isabs(path) else Path(path)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(content, encoding="utf-8")
            return {"success": True, "path": str(p), "bytes": len(content)}
        except Exception as e:
            return {"success": False, "error": str(e)}

class EditFileTool(Tool):
    def __init__(self, workdir):
        super().__init__("edit_file", "Replace exact text in a file")
        self.workdir = workdir
    def execute(self, path, old_str, new_str):
        try:
            p = Path(self.workdir) / path if not os.path.isabs(path) else Path(path)
            if not p.exists():
                return {"success": False, "error": f"Not found: {path}"}
            content = p.read_text(encoding="utf-8")
            if old_str not in content:
                return {"success": False, "error": "Text not found in file"}
            p.write_text(content.replace(old_str, new_str, 1), encoding="utf-8")
            return {"success": True, "path": str(p)}
        except Exception as e:
            return {"success": False, "error": str(e)}

class ListDirectoryTool(Tool):
    def __init__(self, workdir):
        super().__init__("list_directory", "List files in a directory")
        self.workdir = workdir
    def execute(self, path="."):
        try:
            p = Path(self.workdir) / path if not os.path.isabs(path) else Path(path)
            if not p.exists():
                return {"success": False, "error": f"Not found: {path}"}
            skip = {"__pycache__", "node_modules", ".git", "venv", ".venv"}
            items = []
            for item in sorted(p.iterdir()):
                if item.name in skip or (item.name.startswith(".") and item.name != ".env.example"):
                    continue
                items.append({"name": item.name,
                               "type": "dir" if item.is_dir() else "file",
                               "size": item.stat().st_size if item.is_file() else 0})
            return {"success": True, "path": str(p), "items": items}
        except Exception as e:
            return {"success": False, "error": str(e)}

class ShellCommandTool(Tool):
    def __init__(self, workdir):
        super().__init__("run_command", "Run a shell command")
        self.workdir = workdir
    def execute(self, command, timeout=30):
        try:
            r = subprocess.run(command, shell=True, cwd=self.workdir,
                               capture_output=True, text=True, timeout=timeout)
            return {"success": r.returncode == 0,
                    "stdout": r.stdout[-3000:], "stderr": r.stderr[-2000:],
                    "returncode": r.returncode}
        except subprocess.TimeoutExpired:
            return {"success": False, "error": f"Timeout after {timeout}s"}
        except Exception as e:
            return {"success": False, "error": str(e)}

class SearchInFilesTool(Tool):
    def __init__(self, workdir):
        super().__init__("search_in_files", "Search for pattern in files")
        self.workdir = workdir
    def execute(self, pattern, path=".", file_extension=""):
        try:
            p = Path(self.workdir) / path if not os.path.isabs(path) else Path(path)
            results = []
            glob = f"**/*{file_extension}" if file_extension else "**/*"
            skip = {"__pycache__", "node_modules", ".git", "venv"}
            for f in p.glob(glob):
                if not f.is_file() or any(s in str(f) for s in skip):
                    continue
                try:
                    for i, line in enumerate(f.read_text(encoding="utf-8", errors="ignore").split("\\n"), 1):
                        if pattern.lower() in line.lower():
                            results.append({"file": str(f.relative_to(self.workdir)), "line": i, "content": line.strip()})
                except:
                    pass
            return {"success": True, "matches": results[:50]}
        except Exception as e:
            return {"success": False, "error": str(e)}

class AnalyzeCodeTool(Tool):
    def __init__(self, workdir):
        super().__init__("analyze_code", "Analyze Python code for errors")
        self.workdir = workdir
    def execute(self, path):
        try:
            p = Path(self.workdir) / path if not os.path.isabs(path) else Path(path)
            content = p.read_text(encoding="utf-8")
            result = {"success": True, "path": path, "issues": [], "info": {}}
            try:
                tree = ast.parse(content)
                result["info"] = {
                    "syntax": "OK",
                    "classes": [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)],
                    "functions": [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)],
                    "lines": len(content.split("\\n"))
                }
            except SyntaxError as e:
                result["issues"].append(f"SyntaxError line {e.lineno}: {e.msg}")
                result["info"]["syntax"] = "ERROR"
            return result
        except Exception as e:
            return {"success": False, "error": str(e)}

def get_all_tools(workdir):
    tools = [ReadFileTool(workdir), WriteFileTool(workdir), EditFileTool(workdir),
             ListDirectoryTool(workdir), ShellCommandTool(workdir),
             SearchInFilesTool(workdir), AnalyzeCodeTool(workdir)]
    return {t.name: t for t in tools}
'''

files[os.path.join(CORE, "prompts.py")] = '''SYSTEM_PROMPT = """You are an autonomous coding agent. You can read files, write code, run commands, and fix bugs.

TOOLS AVAILABLE:
- read_file(path)
- write_file(path, content)
- edit_file(path, old_str, new_str)
- list_directory(path)
- run_command(command)
- search_in_files(pattern, path, file_extension)
- analyze_code(path)

HOW TO USE TOOLS - respond with EXACTLY this JSON format:
```tool
{
  "tool": "tool_name",
  "args": {"arg1": "value1"},
  "reason": "why"
}
```

WORKFLOW:
1. Explore the project first (list_directory, read_file)
2. Make changes step by step
3. Verify after each change (run_command, analyze_code)
4. When done: TASK_COMPLETE: <summary>

RULES:
- Always explore before writing
- Fix errors immediately
- Never give up - analyze errors and retry
"""

TASK_PROMPT_TEMPLATE = """TASK: {task}

WORKING DIRECTORY: {workdir}

Start by exploring the project, then complete the task step by step.
"""

CONTINUE_PROMPT = "Continue. If done respond with TASK_COMPLETE: <summary>"
'''

files[os.path.join(CORE, "agent.py")] = '''import json, re, os
from pathlib import Path
from .config import Config
from .llm import OllamaClient
from .tools import get_all_tools
from .prompts import SYSTEM_PROMPT, TASK_PROMPT_TEMPLATE, CONTINUE_PROMPT

class C:
    RESET="\033[0m"; BOLD="\033[1m"; RED="\033[31m"; GREEN="\033[32m"
    YELLOW="\033[33m"; BLUE="\033[34m"; MAGENTA="\033[35m"; CYAN="\033[36m"; GRAY="\033[90m"

class CodingAgent:
    def __init__(self, config: Config):
        self.config = config
        self.workdir = str(Path(config.workdir).resolve())
        self.llm = OllamaClient(base_url=config.ollama_url, model=config.model)
        self.tools = get_all_tools(self.workdir)
        self.conversation = []

    def _check_ollama(self):
        if not self.llm.is_available():
            print(f"{C.RED}Ollama চালু নেই! Terminal এ: ollama serve{C.RESET}")
            raise SystemExit(1)

    def _parse_tool_call(self, response):
        for pattern in [r"```tool\s*\n(.*?)\n```", r"```json\s*\n(.*?)\n```"]:
            m = re.search(pattern, response, re.DOTALL)
            if m:
                try:
                    d = json.loads(m.group(1).strip())
                    if "tool" in d and "args" in d:
                        return d
                except:
                    pass
        return None

    def _is_done(self, response):
        m = re.search(r"TASK_COMPLETE[:\s]+(.*?)(?:\n|$)", response, re.IGNORECASE | re.DOTALL)
        return m.group(1).strip() if m else None

    def _execute_tool(self, tc):
        name = tc.get("tool")
        args = tc.get("args", {})
        reason = tc.get("reason", "")
        print(f"  {C.MAGENTA}🔧 {name}{C.RESET} {C.GRAY}({reason}){C.RESET}")
        if name not in self.tools:
            return f"ERROR: Unknown tool {name}"
        result = self.tools[name].execute(**args)
        if result.get("success"):
            print(f"  {C.GREEN}✓ OK{C.RESET}")
            if name == "read_file":
                return f"FILE ({args.get(\'path\')}):\n{result[\'content\']}"
            elif name == "write_file":
                return f"SUCCESS: Written to {result[\'path\']}"
            elif name == "edit_file":
                return f"SUCCESS: Edited {result[\'path\']}"
            elif name == "list_directory":
                items = result.get("items", [])
                out = f"DIRECTORY ({result[\'path\']}):\n"
                for i in items:
                    icon = "📁" if i["type"] == "dir" else "📄"
                    out += f"  {icon} {i[\'name\']}\n"
                return out
            elif name == "run_command":
                out = f"EXIT CODE: {result[\'returncode\']}\n"
                if result.get("stdout"): out += f"OUTPUT:\n{result[\'stdout\']}\n"
                if result.get("stderr"): out += f"STDERR:\n{result[\'stderr\']}\n"
                return out
            elif name == "search_in_files":
                matches = result.get("matches", [])
                if not matches: return "No matches found"
                return "\n".join(f"{m[\'file\']}:{m[\'line\']}: {m[\'content\']}" for m in matches[:20])
            elif name == "analyze_code":
                info = result.get("info", {})
                issues = result.get("issues", [])
                out = f"Syntax: {info.get(\'syntax\')}, Lines: {info.get(\'lines\')}\n"
                if issues: out += "Issues: " + ", ".join(issues)
                return out
        else:
            err = result.get("error", "Unknown error")
            print(f"  {C.RED}✗ {err}{C.RESET}")
            return f"ERROR: {err}"

    def run(self, task):
        self._check_ollama()
        print(f"\n{C.BOLD}{C.CYAN}{'='*50}{C.RESET}")
        print(f"{C.BOLD}{C.CYAN}  🤖 Agent Started{C.RESET}")
        print(f"{C.CYAN}  Model: {self.config.model}{C.RESET}")
        print(f"{C.CYAN}  Dir: {self.workdir}{C.RESET}")
        print(f"{C.CYAN}  Task: {task}{C.RESET}")
        print(f"{C.BOLD}{C.CYAN}{\'=\'*50}{C.RESET}\n")

        self.conversation = [
            {"role": "system", "content": self.config.system_prompt or SYSTEM_PROMPT},
            {"role": "user", "content": TASK_PROMPT_TEMPLATE.format(task=task, workdir=self.workdir)}
        ]

        for step in range(1, self.config.max_iterations + 1):
            print(f"\n{C.BOLD}{C.BLUE}[Step {step}]{C.RESET} {C.YELLOW}Thinking...{C.RESET}")
            try:
                response = self.llm.chat(self.conversation, self.config.temperature)
            except Exception as e:
                print(f"{C.RED}Error: {e}{C.RESET}")
                break

            self.conversation.append({"role": "assistant", "content": response})

            done = self._is_done(response)
            if done:
                print(f"\n{C.BOLD}{C.GREEN}{'='*50}{C.RESET}")
                print(f"{C.GREEN}✅ DONE: {done}{C.RESET}")
                print(f"{C.BOLD}{C.GREEN}{'='*50}{C.RESET}\n")
                return

            tc = self._parse_tool_call(response)
            if tc:
                result = self._execute_tool(tc)
                self.conversation.append({"role": "user", "content": f"Result:\n{result}\n\n{CONTINUE_PROMPT}"})
            else:
                self.conversation.append({"role": "user", "content": "Use a tool or say TASK_COMPLETE if done."})

        print(f"{C.YELLOW}Max iterations reached.{C.RESET}")

    def interactive_session(self):
        self._check_ollama()
        print(f"\n{C.BOLD}{C.CYAN}Interactive Mode - exit লিখলে বন্ধ হবে{C.RESET}\n")
        self.conversation = [{"role": "system", "content": SYSTEM_PROMPT}]
        while True:
            try:
                task = input(f"{C.BOLD}{C.GREEN}তুমি: {C.RESET}").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not task: continue
            if task.lower() in ["exit", "quit", "বন্ধ"]: break
            self.conversation.append({"role": "user", "content": task})
            for _ in range(self.config.max_iterations):
                try:
                    response = self.llm.chat(self.conversation, self.config.temperature)
                except Exception as e:
                    print(f"{C.RED}{e}{C.RESET}"); break
                self.conversation.append({"role": "assistant", "content": response})
                done = self._is_done(response)
                if done:
                    print(f"\n{C.GREEN}✅ {done}{C.RESET}\n"); break
                tc = self._parse_tool_call(response)
                if tc:
                    result = self._execute_tool(tc)
                    self.conversation.append({"role": "user", "content": f"Result:\n{result}\n\n{CONTINUE_PROMPT}"})
                else:
                    print(f"\n{C.BOLD}Agent:{C.RESET} {response}\n"); break
'''

# Write all files
for path, content in files.items():
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"✓ Created: {os.path.relpath(path)}")

print("\n" + "="*50)
print("✅ Setup complete!")
print("="*50)
print("\nএখন এই command দাও:")
print('  cd autonomous-coding-agent')
print('  python agent.py "Breach project এর files দেখাও" --workdir ..')
