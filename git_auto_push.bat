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

REM Detect any changes in the working tree
echo [INFO] Scanning repository for changes...
git status --porcelain > "%~dp0_git_status_tmp.txt" 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to read git status.
    if exist "%~dp0_git_status_tmp.txt" del /f /q "%~dp0_git_status_tmp.txt" >nul 2>&1
    popd
    exit /b 1
)

set /p CHANGES=<"%~dp0_git_status_tmp.txt"
if not defined CHANGES (
    echo [INFO] No changes detected. Nothing to commit.
    if exist "%~dp0_git_status_tmp.txt" del /f /q "%~dp0_git_status_tmp.txt" >nul 2>&1
    popd
    exit /b 0
)
if exist "%~dp0_git_status_tmp.txt" del /f /q "%~dp0_git_status_tmp.txt" >nul 2>&1

REM Stage all changes (modified, new, and deleted files)
echo [INFO] Staging all changed files...
git add -A
if errorlevel 1 (
    echo [ERROR] git add failed. Aborting.
    popd
    exit /b 1
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
