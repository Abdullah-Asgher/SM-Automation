# ShortSync Setup Guide

This guide will help you set up and run ShortSync on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

### Required Software

1. **Node.js 20+** - [Download](https://nodejs.org/)
   - Verify: `node --version`

2. **PostgreSQL 16+** - [Download](https://www.postgresql.org/download/windows/)
   - Verify: `psql --version`

3. **Redis** - [Download for Windows](https://github.com/microsoftarchive/redis/releases)
   - Download Redis-x64-3.0.504.msi
   - Install and start Redis service

4. **FFmpeg** - [Download](https://ffmpeg.org/download.html#build-windows)
   - Download ffmpeg.zip for Windows
   - Extract to a folder (e.g., `C:\ffmpeg`)
   - Add `C:\ffmpeg\bin` to your PATH environment variable
   - Verify: `ffmpeg -version`

### API Credentials

<You need to obtain API credentials from each platform. See the implementation plan for detailed instructions on getting these credentials.

## Installation Steps

### 1. Database Setup

Open PowerShell or Command Prompt and create the database:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE shortsync;

# Exit psql
\q
```

### 2. Backend Setup

```powershell
cd C:\Users\abdul\.gemini\antigravity\scratch\shortsync\backend

# Install dependencies
npm install

# Copy environment template
copy .env.example .env

# Edit .env file with your credentials
notepad .env
```

**Fill in these values in `.env`:**

- `DATABASE_URL`: Update with your PostgreSQL password
- `OPENAI_API_KEY`: Your OpenAI API key
- `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET`: From Google Cloud Console
- `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`: From TikTok Developer Portal
- `INSTAGRAM_APP_ID` and `INSTAGRAM_APP_SECRET`: From Meta for Developers
- `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`: From Meta for Developers
- `JWT_SECRET`: Change to a random secret string

**Run database migrations:**

```powershell
npm run db:generate
npm run db:migrate
```

### 3. Frontend Setup

Open a new terminal:

```powershell
cd C:\Users\abdul\.gemini\antigravity\scratch\shortsync\frontend

# Install dependencies
npm install
```

### 4. Start Redis

Make sure Redis is running:

```powershell
# Check if Redis service is running
Get-Service -Name Redis

# If not running, start it
Start-Service Redis
```

Or run Redis manually:

```powershell
redis-server
```

## Running the Application

You need to run both backend and frontend simultaneously.

### Terminal 1: Backend

```powershell
cd C:\Users\abdul\.gemini\antigravity\scratch\shortsync\backend
npm run dev
```

You should see:
```
🚀 ShortSync API running on http://localhost:3000
```

### Terminal 2: Frontend

```powershell
cd C:\Users\abdul\.gemini\antigravity\scratch\shortsync\frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access the Application

Open your browser and go to: **http://localhost:5173**

## First Time Setup

1. **Create an Account**
   - Click "Sign up" on the login page
   - Enter your name, email, and password

2. **Connect Platforms**
   - Go to "Integrations" page
   - Click "Connect" for each platform you want to use
   - Complete the OAuth authorization flow
   - You'll be redirected back to the app

3. **Upload Your First Video**
   - Go to "Upload" page
   - Drag and drop a video (MP4, MOV, or WebM)
   - Fill in title and description
   - Click "AI Rewrite" to generate platform-specific descriptions (optional)
   - Select platforms to post to
   - Choose scheduling mode:
     - **Post Now**: Uploads immediately with random delays
     - **Manual Schedule**: Pick exact times for each platform
     - **AI Smart Schedule**: Let AI choose optimal posting times
   - Click "Schedule & Upload"

## Troubleshooting

### Database Connection Error

If you see "Failed to connect to database":
- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Verify the password is correct

### Redis Connection Error

If you see "Redis connection failed":
- Make sure Redis service is running
- Run `Start-Service Redis` in PowerShell as Administrator

### FFmpeg Not Found

If video processing fails:
- Verify FFmpeg is in your PATH: `ffmpeg -version`
- Restart your terminal after adding FFmpeg to PATH

### OAuth Redirect Errors

If OAuth callbacks fail:
- Verify redirect URIs in your platform developer settings match:
  - YouTube: `http://localhost:3000/api/integrations/youtube/callback`
  - TikTok: `http://localhost:3000/api/integrations/tiktok/callback`
  - Instagram: `http://localhost:3000/api/integrations/instagram/callback`
  - Facebook: `http://localhost:3000/api/integrations/facebook/callback`

### API Rate Limits

If uploads fail due to rate limits:
- Check console for error messages
- Enable "Safe Mode" in `.env` file: `SAFE_MODE=true`
- This increases delays and reduces daily post limits

## Next Steps

- Review the [Implementation Plan](file:///C:/Users/abdul/.gemini/antigravity/brain/fd137bff-d79f-4420-a749-fd5e3090b23e/implementation_plan.md) for full details
- Get your platform API credentials (see implementation plan)
- Test with small videos first
- Monitor the Dashboard for analytics and scheduled posts

## Support

For issues or questions:
- Check the implementation plan for detailed API setup instructions
- Review error messages in browser console and terminal
- Ensure all environment variables are set correctly
