# Quick Firebase Admin Setup Helper
# This script helps you configure Firebase Admin SDK credentials

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firebase Admin SDK Setup Helper" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "You need to get your Firebase Admin SDK credentials." -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps:" -ForegroundColor White
Write-Host "1. Go to: https://console.firebase.google.com/" -ForegroundColor Gray
Write-Host "2. Select your project: ecoverify-deab8" -ForegroundColor Gray
Write-Host "3. Click gear icon → Project Settings" -ForegroundColor Gray
Write-Host "4. Go to 'Service Accounts' tab" -ForegroundColor Gray
Write-Host "5. Click 'Generate New Private Key'" -ForegroundColor Gray
Write-Host "6. Download the JSON file" -ForegroundColor Gray
Write-Host ""

$jsonPath = Read-Host "Enter the path to your downloaded JSON file (or press Enter to skip)"

if ([string]::IsNullOrWhiteSpace($jsonPath)) {
    Write-Host ""
    Write-Host "Skipped. You can manually add credentials to:" -ForegroundColor Yellow
    Write-Host "  render-backend\.env.local" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Add these lines:" -ForegroundColor Yellow
    Write-Host "FIREBASE_PROJECT_ID=your-project-id" -ForegroundColor Gray
    Write-Host "FIREBASE_CLIENT_EMAIL=your-client-email" -ForegroundColor Gray
    Write-Host 'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"' -ForegroundColor Gray
    exit 0
}

if (-not (Test-Path $jsonPath)) {
    Write-Host "❌ File not found: $jsonPath" -ForegroundColor Red
    exit 1
}

try {
    $json = Get-Content $jsonPath -Raw | ConvertFrom-Json
    
    $projectId = $json.project_id
    $clientEmail = $json.client_email
    $privateKey = $json.private_key
    
    Write-Host ""
    Write-Host "✅ Credentials loaded from JSON" -ForegroundColor Green
    Write-Host "   Project ID: $projectId" -ForegroundColor Gray
    Write-Host "   Client Email: $clientEmail" -ForegroundColor Gray
    Write-Host ""
    
    $envPath = Join-Path $PSScriptRoot "render-backend\.env.local"
    
    if (Test-Path $envPath) {
        $currentEnv = Get-Content $envPath -Raw
        
        # Update or add Firebase credentials
        if ($currentEnv -match "FIREBASE_PROJECT_ID=") {
            $currentEnv = $currentEnv -replace "FIREBASE_PROJECT_ID=.*", "FIREBASE_PROJECT_ID=$projectId"
        } else {
            $currentEnv += "`nFIREBASE_PROJECT_ID=$projectId"
        }
        
        if ($currentEnv -match "FIREBASE_CLIENT_EMAIL=") {
            $currentEnv = $currentEnv -replace "FIREBASE_CLIENT_EMAIL=.*", "FIREBASE_CLIENT_EMAIL=$clientEmail"
        } else {
            $currentEnv += "`nFIREBASE_CLIENT_EMAIL=$clientEmail"
        }
        
        if ($currentEnv -match "FIREBASE_PRIVATE_KEY=") {
            $currentEnv = $currentEnv -replace 'FIREBASE_PRIVATE_KEY=.*', "FIREBASE_PRIVATE_KEY=`"$privateKey`""
        } else {
            $currentEnv += "`nFIREBASE_PRIVATE_KEY=`"$privateKey`""
        }
        
        Set-Content -Path $envPath -Value $currentEnv -NoNewline
        
        Write-Host "✅ Updated: render-backend\.env.local" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now start the backend:" -ForegroundColor Yellow
        Write-Host "  cd render-backend" -ForegroundColor Cyan
        Write-Host "  npm run dev" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Backend .env.local not found!" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error reading JSON file: $_" -ForegroundColor Red
    exit 1
}
