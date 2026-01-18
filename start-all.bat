@echo off
echo ========================================
echo EcoVerify AI - Complete Local Setup
echo ========================================
echo.

echo [1/3] Starting Backend (Express + Gemini)...
start "Backend Server" cmd /k "cd /d %~dp0render-backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend (Vite React)...
start "Frontend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo All services starting...
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all services...
pause >nul

taskkill /FI "WINDOWTITLE eq Backend Server*" /T /F
taskkill /FI "WINDOWTITLE eq Frontend Server*" /T /F
