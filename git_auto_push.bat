@echo off
setlocal enabledelayedexpansion

echo [INFO] Starting git auto-commit and push...

REM Step into the folder where this script lives
pushd "%~dp0"
if errorlevel 1 (
    echo [ERROR] Failed to change directory to script location.
    exit /b 1
)

REM Verify we are inside a git repository
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Current directory is not a git repository.
    popd
    exit /b 1
)

REM Stage all changes (modified, new, and deleted files)
echo [INFO] Staging all changed files...
git add -A
if errorlevel 1 (
    echo [ERROR] git add failed. Aborting.
    popd
    exit /b 1
)

REM Decide whether a commit is actually needed.
REM git diff --cached --quiet returns 0 when nothing is staged, 1 when something is staged.
echo [INFO] Checking for staged changes...
git diff --cached --quiet
if not errorlevel 1 (
    echo [INFO] Nothing staged to commit. Working tree is clean.
    goto :PULL
)

REM Commit with a pure-English message
set "COMMIT_MSG=Auto commit: update files via one-click script"
echo [INFO] Creating commit...
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo [ERROR] git commit failed. Aborting.
    popd
    exit /b 1
)

:PULL
REM Integrate remote work before pushing so the push can fast-forward.
REM If a conflict occurs, rebase stops and the script aborts for manual fixing.
echo [INFO] Pulling remote changes with rebase...
git pull --rebase
if errorlevel 1 (
    echo [ERROR] git pull --rebase failed. Resolve conflicts manually, then run again.
    popd
    exit /b 1
)

REM Push to the remote repository
echo [INFO] Pushing to remote repository...
git push
if errorlevel 1 (
    echo [ERROR] git push failed. Aborting.
    popd
    exit /b 1
)

echo [INFO] Success. All changes committed and pushed.
popd
exit /b 0
