# Standalone Startup Script for CampusConnect Face Service
# Bypasses execution policies and handles pathing dynamically.

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$PythonExe = Join-Path $ScriptDir "venv\Scripts\python.exe"

if (-Not (Test-Path $PythonExe)) {
    Write-Host "[ERROR] Virtual environment not found at $PythonExe" -ForegroundColor Red
    Write-Host "Please ensure you have run the environment setup." -ForegroundColor Yellow
    exit 1
}

Write-Host "[STARTING] CampusConnect FaceService (Waitress Production Mode)..." -ForegroundColor Cyan
& $PythonExe app.py
