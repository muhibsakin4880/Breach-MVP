#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const DEFAULT_BASE_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'codellama:7b';
const PREFERRED_MODELS = [DEFAULT_MODEL, 'qwen2.5-coder:1.5b-base', 'codellama:7b'];
const MAX_FILE_CHARS = 50000;

const FRONTEND_SYSTEM_PROMPT = `You are a local coding agent for frontend development.
Focus on React + JavaScript/TypeScript quality.
Be concise, practical, and implementation-oriented.
When editing code, preserve existing behavior unless task says otherwise.
When providing code, output runnable code with minimal explanation.`;

function parseArgs(argv) {
  const [command = 'chat', ...rest] = argv;
  const flags = {};
  const positionals = [];

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = rest[i + 1];
    if (!next || next.startsWith('--')) {
      flags[key] = true;
      continue;
    }

    flags[key] = next;
    i += 1;
  }

  return { command, flags, positionals };
}

function toAbsolute(inputPath) {
  if (!inputPath) {
    return null;
  }
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
}

function readContextFiles(csv) {
  if (!csv) {
    return '';
  }

  const files = csv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const chunks = [];
  for (const file of files) {
    const abs = toAbsolute(file);
    if (!abs || !fs.existsSync(abs)) {
      chunks.push(`FILE_NOT_FOUND: ${file}`);
      continue;
    }

    const text = fs.readFileSync(abs, 'utf8');
    const limited = text.length > MAX_FILE_CHARS ? `${text.slice(0, MAX_FILE_CHARS)}\n/* FILE TRUNCATED */` : text;
    chunks.push(`FILE: ${file}\n\n${limited}`);
  }

  return chunks.join('\n\n-----\n\n');
}

async function jsonRequest(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function getAvailableModels(baseUrl) {
  const response = await fetch(`${baseUrl}/api/tags`);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cannot reach Ollama at ${baseUrl} (${response.status}): ${detail}`);
  }

  const payload = await response.json();
  return (payload.models || []).map((m) => m.name);
}

function pickModel(available, requested) {
  if (requested && available.includes(requested)) {
    return requested;
  }

  for (const name of PREFERRED_MODELS) {
    if (available.includes(name)) {
      return name;
    }
  }

  if (available.length > 0) {
    return available[0];
  }

  throw new Error('No local models found. Run: ollama pull codellama:7b');
}

async function generate({ baseUrl, model, prompt, system = FRONTEND_SYSTEM_PROMPT, stream = false }) {
  if (!stream) {
    const payload = await jsonRequest(`${baseUrl}/api/generate`, {
      model,
      prompt,
      system,
      stream: false,
    });
    return payload.response || '';
  }

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, system, stream: true }),
  });

  if (!response.ok || !response.body) {
    const detail = await response.text();
    throw new Error(`Streaming request failed (${response.status}): ${detail}`);
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      const data = JSON.parse(line);
      if (data.response) {
        process.stdout.write(data.response);
        fullText += data.response;
      }
      if (data.done) {
        process.stdout.write('\n');
      }
    }
  }

  return fullText;
}

function buildTaskPrompt(task, contextFiles) {
  return `${task}\n\n${contextFiles ? `Project context:\n${contextFiles}` : ''}`.trim();
}

function extractCodeBlock(text) {
  const match = text.match(/```(?:[\w-]+)?\n([\s\S]*?)```/);
  return match ? match[1] : null;
}

function usage() {
  console.log(`Local Ollama Agent CLI

Usage:
  node tools/ollama-agent/agent.mjs health [--host URL]
  node tools/ollama-agent/agent.mjs chat [--model NAME] [--host URL]
  node tools/ollama-agent/agent.mjs ask --task "question" [--files a,b]
  node tools/ollama-agent/agent.mjs gen --task "build a React component" [--files a,b] [--out FILE]
  node tools/ollama-agent/agent.mjs edit --file FILE --task "refactor to hooks" [--apply]
  node tools/ollama-agent/agent.mjs fix --file FILE --error "paste stack trace" [--apply]

Flags:
  --model   Model name (default: codellama:7b)
  --host    Ollama base URL (default: http://localhost:11434)
  --files   Comma-separated context files
  --out     Output response to file
  --apply   For edit/fix: overwrite target file with generated code block`);
}

async function runHealth(baseUrl, requestedModel) {
  const models = await getAvailableModels(baseUrl);
  const model = pickModel(models, requestedModel);
  console.log(`Ollama URL: ${baseUrl}`);
  console.log(`Detected models: ${models.join(', ') || '(none)'}`);
  console.log(`Selected model: ${model}`);
}

async function runAskOrGen(baseUrl, model, flags, mode) {
  const task = flags.task;
  if (!task) {
    throw new Error(`--task is required for ${mode}`);
  }

  const context = readContextFiles(flags.files);
  const prompt = buildTaskPrompt(task, context);
  const result = await generate({ baseUrl, model, prompt, stream: mode === 'ask' });

  if (flags.out) {
    const outAbs = toAbsolute(flags.out);
    fs.writeFileSync(outAbs, result, 'utf8');
    console.log(`Saved output to ${outAbs}`);
    return;
  }

  if (mode !== 'ask') {
    process.stdout.write(`${result}\n`);
  }
}

async function runEdit(baseUrl, model, flags, mode) {
  const file = flags.file;
  if (!file) {
    throw new Error(`--file is required for ${mode}`);
  }

  const task = flags.task || '';
  const errorText = flags.error || '';
  const abs = toAbsolute(file);

  if (!fs.existsSync(abs)) {
    throw new Error(`File not found: ${abs}`);
  }

  const source = fs.readFileSync(abs, 'utf8');
  const instruction = mode === 'edit' ? task : `Fix this code based on the error:\n${errorText}`;

  if (!instruction.trim()) {
    throw new Error(mode === 'edit' ? '--task is required for edit' : '--error is required for fix');
  }

  const prompt = `${instruction}

Return only the complete updated file inside one markdown code block.
Do not include prose before or after the code block.

Target file path: ${file}

Current file content:
\`\`\`
${source}
\`\`\`
`;

  const result = await generate({ baseUrl, model, prompt, stream: true });
  const updated = extractCodeBlock(result);

  if (!updated) {
    throw new Error('No code block found in model output. Re-run with a clearer prompt.');
  }

  if (!flags.apply) {
    console.log('\nDry run only. Re-run with --apply to overwrite the file.');
    return;
  }

  fs.copyFileSync(abs, `${abs}.bak`);
  fs.writeFileSync(abs, updated, 'utf8');
  console.log(`Updated ${abs}`);
  console.log(`Backup saved: ${abs}.bak`);
}

async function runChat(baseUrl, model) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    prompt: `${model}> `,
  });

  const history = [];

  console.log('Local agent chat started. Commands: /help /reset /model /exit');
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (!input) {
      rl.prompt();
      return;
    }

    if (input === '/exit' || input === '/quit') {
      rl.close();
      return;
    }

    if (input === '/help') {
      console.log('Use natural language for coding tasks. Commands: /help /reset /model /exit');
      rl.prompt();
      return;
    }

    if (input === '/reset') {
      history.length = 0;
      console.log('Conversation memory cleared.');
      rl.prompt();
      return;
    }

    if (input === '/model') {
      console.log(`Active model: ${model}`);
      rl.prompt();
      return;
    }

    const convo = history
      .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
      .join('\n\n');

    const prompt = `${convo ? `${convo}\n\n` : ''}USER: ${input}\nASSISTANT:`;

    try {
      const response = await generate({ baseUrl, model, prompt, stream: true });
      history.push({ role: 'user', content: input });
      history.push({ role: 'assistant', content: response });
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }

    rl.prompt();
  });

  await new Promise((resolve) => rl.on('close', resolve));
}

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2));
  const baseUrl = flags.host || DEFAULT_BASE_URL;

  if (command === 'help' || flags.help) {
    usage();
    return;
  }

  const models = await getAvailableModels(baseUrl);
  const model = pickModel(models, flags.model || DEFAULT_MODEL);

  switch (command) {
    case 'health':
      await runHealth(baseUrl, flags.model || DEFAULT_MODEL);
      return;
    case 'chat':
      await runChat(baseUrl, model);
      return;
    case 'ask':
      await runAskOrGen(baseUrl, model, flags, 'ask');
      return;
    case 'gen':
      await runAskOrGen(baseUrl, model, flags, 'gen');
      return;
    case 'edit':
      await runEdit(baseUrl, model, flags, 'edit');
      return;
    case 'fix':
      await runEdit(baseUrl, model, flags, 'fix');
      return;
    default:
      usage();
  }
}

main().catch((error) => {
  console.error(`Fatal: ${error.message}`);
  process.exit(1);
});
