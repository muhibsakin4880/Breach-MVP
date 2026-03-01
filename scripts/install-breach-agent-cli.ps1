$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$AgentPy = Join-Path $RepoRoot "agent.py"

if (-not (Test-Path $AgentPy)) {
  throw "Cannot find agent.py at $AgentPy"
}

$BinDir = Join-Path $env:USERPROFILE ".breach\bin"
New-Item -ItemType Directory -Path $BinDir -Force | Out-Null

$CmdPath = Join-Path $BinDir "breach-agent.cmd"
$Ps1Path = Join-Path $BinDir "breach-agent.ps1"

$CmdContent = @"
@echo off
setlocal
set "BREACH_AGENT_HOME=$RepoRoot"

if not exist "%BREACH_AGENT_HOME%\agent.py" (
  echo agent.py not found at "%BREACH_AGENT_HOME%\agent.py"
  exit /b 1
)

where python >nul 2>nul
if %errorlevel%==0 (
  python "%BREACH_AGENT_HOME%\agent.py" %*
  exit /b %errorlevel%
)

where py >nul 2>nul
if %errorlevel%==0 (
  py "%BREACH_AGENT_HOME%\agent.py" %*
  exit /b %errorlevel%
)

echo Python launcher not found. Install Python and make sure python.exe or py.exe is on PATH.
exit /b 1
"@

$Ps1Content = @"
param(
  [Parameter(ValueFromRemainingArguments = `$true)]
  [string[]]`$Args
)

`$RepoRoot = "$RepoRoot"
if (-not (Test-Path (Join-Path `$RepoRoot "agent.py"))) {
  throw "agent.py not found at `$RepoRoot"
}

if (Get-Command python -ErrorAction SilentlyContinue) {
  python (Join-Path `$RepoRoot "agent.py") @Args
  exit `$LASTEXITCODE
}

if (Get-Command py -ErrorAction SilentlyContinue) {
  py (Join-Path `$RepoRoot "agent.py") @Args
  exit `$LASTEXITCODE
}

throw "Python launcher not found. Install Python and ensure python.exe or py.exe is on PATH."
"@

Set-Content -Path $CmdPath -Encoding Ascii -Value $CmdContent
Set-Content -Path $Ps1Path -Encoding Ascii -Value $Ps1Content

$CurrentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if (-not $CurrentUserPath) {
  $CurrentUserPath = ""
}

$PathParts = @()
if ($CurrentUserPath.Length -gt 0) {
  $PathParts = $CurrentUserPath.Split(";") | Where-Object { $_ -and $_.Trim() -ne "" }
}

if ($PathParts -notcontains $BinDir) {
  $NewPath = if ($CurrentUserPath -and $CurrentUserPath.Trim().Length -gt 0) {
    "$CurrentUserPath;$BinDir"
  } else {
    $BinDir
  }
  [Environment]::SetEnvironmentVariable("Path", $NewPath, "User")
}

if (($env:Path.Split(";") | Where-Object { $_ -eq $BinDir }).Count -eq 0) {
  $env:Path = "$env:Path;$BinDir"
}

Write-Host "Installed CLI launchers:" -ForegroundColor Green
Write-Host "  $CmdPath"
Write-Host "  $Ps1Path"
Write-Host ""
Write-Host "You can now run: breach-agent --help" -ForegroundColor Green
