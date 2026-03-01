param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$CopilotPath = Join-Path $RepoDir "copilot.py"

if (-not (Test-Path $CopilotPath)) {
  throw "copilot.py not found at $CopilotPath"
}

if (Get-Command python -ErrorAction SilentlyContinue) {
  python $CopilotPath @Args
  exit $LASTEXITCODE
}

if (Get-Command py -ErrorAction SilentlyContinue) {
  py $CopilotPath @Args
  exit $LASTEXITCODE
}

throw "Python launcher not found. Install Python and ensure python.exe or py.exe is on PATH."
