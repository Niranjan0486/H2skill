# Windows PowerShell Startup Script
# Run this file by right-clicking and selecting "Run with PowerShell"

Write-Host "🚀 Starting EcoVerify AI..." -ForegroundColor Green
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js not found! Please install from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green

# Check if node_modules exists
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not installed. Installing now..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies found" -ForegroundColor Green
}

# Check/create .env.local
Write-Host ""
Write-Host "Checking .env.local..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found. Creating with default settings..." -ForegroundColor Yellow
    Set-Content -Path ".env.local" -Value "VITE_LOCAL_SATELLITE_MODE=false"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local found" -ForegroundColor Green
}

# Start dev server
Write-Host ""
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Write-Host "   (Press Ctrl+C to stop)" -ForegroundColor Gray
Write-Host ""

npm run dev
