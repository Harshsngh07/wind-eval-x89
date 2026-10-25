@echo off
echo Starting FastAPI Backend on http://localhost:8000 ...
cd /d "%~dp0backend"
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
pause
