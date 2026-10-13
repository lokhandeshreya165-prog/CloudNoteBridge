@echo off
title CloudNoteBridge - Launcher
echo ===================================================
echo Launching CloudNoteBridge (Backend + Frontend)...
echo ===================================================
start "CloudNoteBridge Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 3 /nobreak >nul
start "CloudNoteBridge Frontend" cmd /k "%~dp0start-frontend.bat"
echo.
echo Both servers are launching!
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:5173
echo.
pause
