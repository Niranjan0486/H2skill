# EcoVerify AI - Complete Local Setup
# PowerShell script to start all services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EcoVerify AI - Complete Local Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Check if backend .env.local has Firebase credentials
Write-Host "[Checking] Backend configuration..." -ForegroundColor Yellow
$backendEnv = Join-Path $projectRoot "render-backend\.env.local"
if (Test-Path $backendEnv) {
    $envContent = Get-Content $backendEnv -Raw
    if ($envContent -match "FIREBASE_PROJECT_ID" -and $envContent -match "FIREBASE_PRIVATE_KEY") {
        Write-Host "✅ Firebase Admin credentials found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Firebase Admin credentials missing!" -ForegroundColor Yellow
        Write-Host "   Backend may fail to start. See setup_guide.md for instructions." -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Press Enter to continue anyway or Ctrl+C to cancel"
    }
} else {
    Write-Host "❌ Backend .env.local not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/3] Starting Backend (Express + Gemini)..." -ForegroundColor Green
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\render-backend'; Write-Host 'Backend Server' -ForegroundColor Cyan; npm run dev" -PassThru

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Frontend (Vite React)..." -ForegroundColor Green
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot'; Write-Host 'Frontend Server' -ForegroundColor Cyan; npm run dev" -PassThru

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All services starting..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop all services..." -ForegroundColor Gray

# Wait for user to press Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Green
}
