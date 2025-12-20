# ShortSync - Multi-Platform Video Automation

Automate uploading short-form videos to YouTube Shorts, TikTok, Instagram Reels, and Facebook with AI-powered descriptions and intelligent scheduling.

## Project Structure

```
shortsync/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite UI
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis
- FFmpeg (added to PATH)

### Setup

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Fill in your API credentials in .env
   npm run db:migrate
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Features

- 📤 Upload videos once, post to multiple platforms
- 🤖 AI-powered description generation (4-5 variations)
- ⚡ Post now or schedule for later
- 🧠 Smart scheduling based on optimal posting times
- 🎨 Beautiful, modern UI with dark mode
- 🔒 Safe automation with humanization features

## Tech Stack

**Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Zustand
**Backend:** Node.js, Express, Prisma, PostgreSQL, Bull, Redis
**AI:** OpenAI GPT-4
**Video Processing:** FFmpeg
**Platform APIs:** YouTube, TikTok, Instagram, Facebook
