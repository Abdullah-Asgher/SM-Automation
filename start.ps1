# ShortSync - Start All Services
Write-Host "🚀 Starting ShortSync..." -ForegroundColor Cyan

# Start Redis (if not running)
Write-Host "`n📦 Checking Redis..." -ForegroundColor Yellow
$redisProcess = Get-Process redis-server -ErrorAction SilentlyContinue
if (!$redisProcess) {
    Write-Host "Starting Redis..." -ForegroundColor Green
    Start-Process "redis-server" -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-Host "Redis already running ✓" -ForegroundColor Green
}

# Start ngrok (if not running)
Write-Host "`n🌐 Checking ngrok..." -ForegroundColor Yellow
$ngrokProcess = Get-Process ngrok -ErrorAction SilentlyContinue
if (!$ngrokProcess) {
    Write-Host "Starting ngrok tunnel..." -ForegroundColor Green
    Start-Process ".\ngrok.exe" -ArgumentList "http 3000" -WindowStyle Normal
    Start-Sleep -Seconds 3
    
    # Get ngrok URL and update .env
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -UseBasicParsing
        $json = $response.Content | ConvertFrom-Json
        $ngrokUrl = ($json.tunnels | Where-Object { $_.proto -eq 'https' }).public_url
        
        if ($ngrokUrl) {
            Write-Host "Ngrok URL: $ngrokUrl" -ForegroundColor Cyan
            
            # Update .env file
            $envPath = "backend\.env"
            $envContent = Get-Content $envPath -Raw
            
            if ($envContent -match "NGROK_PUBLIC_URL=") {
                $envContent = $envContent -replace "NGROK_PUBLIC_URL=.*", "NGROK_PUBLIC_URL=$ngrokUrl"
            } else {
                $envContent += "`nNGROK_PUBLIC_URL=$ngrokUrl"
            }
            
            Set-Content -Path $envPath -Value $envContent
            Write-Host "Updated .env with ngrok URL ✓" -ForegroundColor Green
        }
    } catch {
        Write-Host "Warning: Could not get ngrok URL automatically" -ForegroundColor Yellow
    }
} else {
    Write-Host "Ngrok already running ✓" -ForegroundColor Green
}

# Start Backend
Write-Host "`n⚙️  Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`n🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -WindowStyle Normal

Write-Host "`n✅ All services starting!" -ForegroundColor Green
Write-Host "`nBackend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop this script (servers will keep running)" -ForegroundColor Yellow
Write-Host "To stop all services, close the backend and frontend terminal windows" -ForegroundColor Yellow

# Keep script running
Read-Host "`nPress Enter to exit"
