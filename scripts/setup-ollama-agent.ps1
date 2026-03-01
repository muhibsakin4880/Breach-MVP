$ErrorActionPreference = "Stop"

$HostUrl = if ($env:OLLAMA_HOST) { $env:OLLAMA_HOST } else { "http://localhost:11434" }
$Model = if ($env:OLLAMA_MODEL) { $env:OLLAMA_MODEL } else { "codellama:7b" }

Write-Host "Checking Ollama at $HostUrl ..." -ForegroundColor Cyan
try {
  $null = Invoke-RestMethod -Method Get -Uri "$HostUrl/api/tags"
} catch {
  Write-Host "Ollama endpoint is not available. Starting 'ollama serve' in background..." -ForegroundColor Yellow
  Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
  Start-Sleep -Seconds 2
}

Write-Host "Ensuring model is available: $Model" -ForegroundColor Cyan
ollama pull $Model | Out-Null

Write-Host "Running health check through local CLI agent..." -ForegroundColor Cyan
node tools/ollama-agent/agent.mjs health --host $HostUrl --model $Model

Write-Host "" 
Write-Host "Local coding agent is ready." -ForegroundColor Green
Write-Host "Start chat: npm run agent:chat" -ForegroundColor Green
Write-Host 'One-shot ask: npm run agent -- ask --task "Create a React button component"' -ForegroundColor Green
