Write-Host "Starting Campus Connect..." -ForegroundColor Cyan

# Start BackEnd
Write-Host "[1/3] Starting BackEnd (Node.js)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location `"$PSScriptRoot\BackEnd`"; Write-Host 'BackEnd Server' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start FrontEnd
Write-Host "[2/3] Starting FrontEnd (Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location `"$PSScriptRoot\FrontEnd`"; Write-Host 'FrontEnd Dev Server' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start FaceService - using PowerShell with error handling (not CMD which closes on error)
Write-Host "[3/3] Starting FaceService (Python)..." -ForegroundColor Yellow

$pythonExe = Join-Path $PSScriptRoot "FaceService\venv\Scripts\python.exe"
$appPy = Join-Path $PSScriptRoot "FaceService\app.py"

if (-Not (Test-Path $pythonExe)) {
    Write-Host "[ERROR] Python venv not found at: $pythonExe" -ForegroundColor Red
    Write-Host "[INFO] Creating virtual environment..." -ForegroundColor Yellow
    
    $faceDir = Join-Path $PSScriptRoot "FaceService"
    & python -m venv "$faceDir\venv"
}

# Always ensure requirements are up to date
Write-Host "[INFO] Checking Python dependencies..." -ForegroundColor Yellow
$faceDir = Join-Path $PSScriptRoot "FaceService"
& "$faceDir\venv\Scripts\pip.exe" install -r "$faceDir\requirements.txt" | Out-Null

# Start FaceService in its own PowerShell window (won't close on errors like CMD does)
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
Set-Location `"$PSScriptRoot\FaceService`"
Write-Host 'FaceService (Python Flask)' -ForegroundColor Green
Write-Host 'Loading TensorFlow/DeepFace models (may take 10-15 seconds)...' -ForegroundColor Yellow
try {
    & `"$pythonExe`" `"$appPy`"
} catch {
    Write-Host 'FaceService crashed! Error:' -ForegroundColor Red
    Write-Host `$_.Exception.Message -ForegroundColor Red
    Write-Host 'Press any key to exit...' -ForegroundColor Yellow
    `$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}
"@ -WindowStyle Normal

Write-Host ""
Write-Host "All 3 services are starting in separate windows!" -ForegroundColor Green
Write-Host "  Backend:     http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend:    http://localhost:5173" -ForegroundColor White
Write-Host "  FaceService: http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: FaceService takes ~15 seconds to load ML models. Wait before registering faces." -ForegroundColor Yellow
