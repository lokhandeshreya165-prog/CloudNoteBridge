@echo off
title CloudNoteBridge - Backend Server
echo ===================================================
echo Starting CloudNoteBridge Flask Backend Server...
echo ===================================================
cd /d "%~dp0backend"
if not exist ".venv\Scripts\python.exe" (
    echo Virtual environment not found. Creating .venv...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
    python -m flask --app app:create_app init-db
    python -m flask --app app:create_app seed-data
) else (
    call .venv\Scripts\activate.bat
)

python run.py
pause
