# CHB Project Starter
Write-Host "Starting CHB Backend and Frontend..." -ForegroundColor Green

# Start Backend in a new window
Write-Host "Launching Backend (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Backend...'; .\backend\venv\Scripts\python -m uvicorn app.main:app --reload --app-dir backend"

# Start Frontend in a new window
Write-Host "Launching Frontend (Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Frontend...'; cd dteapp; npm run dev"

Write-Host "Both servers are starting in separate windows." -ForegroundColor Green
