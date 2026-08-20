@echo off
REM ============================================================
REM  Wordflow - one-click publish to GitHub
REM  Double-click this file to push the current folder to GitHub.
REM  Optional: pass a commit message, e.g.  push.bat Added C1 idioms
REM ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

set REPO=https://github.com/JulioGB01/english-gap-exercise.git
set PAGES=https://juliogb01.github.io/english-gap-exercise/

echo.
echo   WORDFLOW - publishing to GitHub
echo   ------------------------------------------------
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo   [X] Git is not installed, or not on your PATH.
  echo       Install it from https://git-scm.com/download/win
  echo       then double-click this file again.
  echo.
  pause
  exit /b 1
)

if not exist ".git" (
  echo   First run - setting up the repository...
  git init
  git branch -M main
  git remote add origin %REPO%
  echo.
)

git remote get-url origin >nul 2>nul
if errorlevel 1 git remote add origin %REPO%

set MSG=%*
if "%MSG%"=="" set MSG=Update Wordflow

REM ---------- one-time cleanup: retire the old single-file version ----------
REM  index.html + css\ + js\ replaces wordflow.html entirely. This runs only
REM  while the file still exists, so it is a no-op on every later run.
REM  It stays recoverable from git history if you ever want it back.
if exist "wordflow.html" (
  echo   Removing the old wordflow.html ^(superseded by index.html^)...
  git rm -q -f "wordflow.html" 2>nul
  if exist "wordflow.html" del /q "wordflow.html"
  echo.
)

REM ---------- step 1: commit, but only if files actually changed ----------
echo   Checking for changes...
git add -A

set NEEDCOMMIT=0
git diff --cached --quiet || set NEEDCOMMIT=1

if "!NEEDCOMMIT!"=="1" (
  echo.
  echo   Changes to publish:
  git diff --cached --name-status
  echo.
  git commit -m "!MSG!"
  if errorlevel 1 (
    echo.
    echo   [X] Commit failed. If Git asked for your name/email, run these once:
    echo       git config --global user.name  "Your Name"
    echo       git config --global user.email "you@example.com"
    echo.
    pause
    exit /b 1
  )
) else (
  echo   No file changes since your last commit.
)

REM ---------- step 2: push, if the branch is ahead of GitHub ----------
REM  This is deliberately separate from step 1: you can have nothing new to
REM  commit but still have a commit that never made it to GitHub.
set AHEAD=1
git rev-parse --verify --quiet refs/remotes/origin/main >nul 2>nul
if not errorlevel 1 for /f %%i in ('git rev-list --count refs/remotes/origin/main..HEAD') do set AHEAD=%%i

if "!AHEAD!"=="0" (
  echo.
  echo   Already up to date - GitHub has everything.
  echo   %PAGES%
  echo.
  pause
  exit /b 0
)

echo.
echo   Pushing !AHEAD! commit^(s^) to GitHub...
git push -u origin main
if errorlevel 1 (
  echo.
  echo   [X] Push failed.
  echo       If a browser window opened asking you to sign in to GitHub,
  echo       finish signing in and run this file again.
  echo.
  pause
  exit /b 1
)

echo.
echo   ------------------------------------------------
echo   Done. Live in about a minute at:
echo   %PAGES%
echo   ------------------------------------------------
echo.
pause
