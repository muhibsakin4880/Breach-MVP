@echo off
setlocal
set "REPO_DIR=%~dp0"

if exist "%REPO_DIR%copilot.py" (
  where python >nul 2>nul
  if %errorlevel%==0 (
    python "%REPO_DIR%copilot.py" %*
    exit /b %errorlevel%
  )

  where py >nul 2>nul
  if %errorlevel%==0 (
    py "%REPO_DIR%copilot.py" %*
    exit /b %errorlevel%
  )
)

echo Could not run copilot.py. Ensure Python is installed and available on PATH.
exit /b 1
