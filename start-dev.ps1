# Start the Spring Boot backend and React frontend for local development.

Write-Host "Starting Aal is Well - Full Stack Application" -ForegroundColor Cyan
Write-Host ""

# Check if frontend dependencies are installed
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "Dependencies ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Cyan
Write-Host "   - Spring Boot Backend: http://localhost:3001" -ForegroundColor Gray
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Start Spring Boot backend in a new window.
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend-spring'; mvn spring-boot:run"

# Wait a moment for backend to start
Start-Sleep -Seconds 5

# Start frontend in current window.
Set-Location frontend
npm run dev
