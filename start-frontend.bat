@echo off
title CloudNoteBridge - Frontend Server
echo ===================================================
echo Starting CloudNoteBridge React Frontend Server...
echo ===================================================
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing node dependencies...
    call npm install
)

call npm run dev
pause
