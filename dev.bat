@echo off
echo Starting CHB Backend and Frontend...

:: Start Backend in background
start /B "CHB Backend" .\backend\venv\Scripts\python -m uvicorn app.main:app --reload --app-dir backend --port 8080

:: Start Frontend in background
start /B "CHB Frontend" cmd /c "cd dteapp && npm run dev"

echo Both servers are running in the background of this window.
echo Press Ctrl+C to stop both servers.
pause
