@echo off
REM ============================================================
REM  Wordflow - one-click publish to GitHub
REM  Double-click this file to push the current folder to GitHub.
REM  First run will set the repo up for you.
REM ============================================================
setlocal
cd /d "%~dp0"

set REPO=https://github.com/JulioGB01/english-gap-exercise.git

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

echo   Staging changes...
git add -A

git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo   Nothing has changed since the last push. You're up to date.
  echo.
  pause
  exit /b 0
)

echo.
echo   Changes to publish:
git diff --cached --name-status
echo.

set MSG=%*
if "%MSG%"=="" set MSG=Update Wordflow

git commit -m "%MSG%"
if errorlevel 1 (
  echo.
  echo   [X] Commit failed. If Git asked for your name/email, run these once:
  echo       git config --global user.name  "Your Name"
  echo       git config --global user.email "you@example.com"
  echo.
  pause
  exit /b 1
)

echo.
echo   Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
  echo.
  echo   [X] Push failed.
  echo       If this is the first push, a browser window may have opened
  echo       asking you to sign in to GitHub - complete it and run this again.
  echo.
  pause
  exit /b 1
)

echo.
echo   ------------------------------------------------
echo   Done. Live in about a minute at:
echo   https://juliogb01.github.io/english-gap-exercise/
echo   ------------------------------------------------
echo.
pause
