@echo off
setlocal
set "REPO_DIR=%~dp0"

if exist "%REPO_DIR%agent.py" (
  where python >nul 2>nul
  if %errorlevel%==0 (
    python "%REPO_DIR%agent.py" %*
    exit /b %errorlevel%
  )

  where py >nul 2>nul
  if %errorlevel%==0 (
    py "%REPO_DIR%agent.py" %*
    exit /b %errorlevel%
  )
)

echo Could not run agent.py. Ensure Python is installed and available on PATH.
exit /b 1
