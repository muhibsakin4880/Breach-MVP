param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

node "$PSScriptRoot\..\tools\ollama-agent\agent.mjs" @Args