param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$RepoDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AgentPath = Join-Path $RepoDir "agent.py"

if (-not (Test-Path $AgentPath)) {
  throw "agent.py not found at $AgentPath"
}

if (Get-Command python -ErrorAction SilentlyContinue) {
  python $AgentPath @Args
  exit $LASTEXITCODE
}

if (Get-Command py -ErrorAction SilentlyContinue) {
  py $AgentPath @Args
  exit $LASTEXITCODE
}

throw "Python launcher not found. Install Python and ensure python.exe or py.exe is on PATH."
