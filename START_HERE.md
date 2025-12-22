# ShortSync - Quick Start

Just run this command from the project root:

```powershell
.\start.ps1
```

This will automatically:
- ✅ Start Redis (if not running)
- ✅ Start ngrok tunnel and update .env
- ✅ Start backend server
- ✅ Start frontend server

## First Time Setup

If you get an error about execution policy, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try `.\start.ps1` again.

## What Gets Started

- **Redis**: Background process (required for scheduler)
- **Ngrok**: New terminal window (creates public URL)
- **Backend**: New terminal window (http://localhost:3000)
- **Frontend**: New terminal window (http://localhost:5173)

## Stopping Services

Close the backend and frontend terminal windows. Redis and ngrok will keep running in the background.

To stop Redis:
```powershell
taskkill /IM redis-server.exe /F
```

To stop ngrok:
```powershell
taskkill /IM ngrok.exe /F
```
