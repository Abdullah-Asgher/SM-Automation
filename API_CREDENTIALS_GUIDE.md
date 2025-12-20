# Getting Platform API Credentials

This guide will walk you through getting API credentials for each platform.

## 1. YouTube Data API

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "ShortSync" and click "Create"

### Step 2: Enable YouTube Data API

1. In the left menu, go to "APIs & Services" → "Library"
2. Search for "YouTube Data API v3"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - Choose "External"
   - Fill in app name "ShortSync"
   - Add your email
   - Click "Save and Continue"
4. Back to credentials:
   - Application type: "Web application"
   - Name: "ShortSync"
   - Add authorized redirect URI: `http://localhost:3000/api/integrations/youtube/callback`
   - Click "Create"
5. Copy the **Client ID** and **Client Secret**
6. Add to `.env`:
   ```
   YOUTUBE_CLIENT_ID=your-client-id-here
   YOUTUBE_CLIENT_SECRET=your-client-secret-here
   ```

---

## 2. TikTok Content Posting API

> ⚠️ **Important**: TikTok API requires approval, which can take 1-2 weeks.

### Step 1: Create TikTok Developer Account

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Click "Register" and sign up with your TikTok account
3. Complete the registration form

### Step 2: Create an App

1. Go to "Manage Apps" → "Create an App"
2. Fill in app details:
   - App name: "ShortSync"
   - Category: "Social Media"
3. Submit the form

### Step 3: Apply for Content Posting API Access

1. In your app dashboard, go to "Add Products"
2. Find "Content Posting API" and click "Apply"
3. Fill in the application:
   - Use case: Personal automation tool for posting videos
   - Expected monthly volume: Low (personal use)
4. Submit and wait for approval (1-2 weeks)

### Step 4: Get Credentials

Once approved:
1. Go to your app's "Credentials" tab
2. Copy the **Client Key** and **Client Secret**
3. Add redirect URI: `http://localhost:3000/api/integrations/tiktok/callback`
4. Add to `.env`:
   ```
   TIKTOK_CLIENT_KEY=your-client-key-here
   TIKTOK_CLIENT_SECRET=your-client-secret-here
   ```

---

## 3. Instagram Graph API

> ⚠️ Instagram requires a **Business** or **Creator** account linked to a Facebook Page.

### Step 1: Convert to Business Account

1. Open Instagram app on your phone
2. Go to Settings → Account → "Switch to Professional Account"
3. Choose "Business" or "Creator"
4. Link to a Facebook Page (create one if needed)

### Step 2: Create Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Other" → "Business"
4. Fill in:
   - App name: "ShortSync"
   - Contact email: Your email
5. Click "Create App"

### Step 3: Add Instagram Product

1. In your app dashboard, find "Add Products"
2. Find "Instagram" and click "Set Up"
3. Follow the prompts to link your Instagram Business account

### Step 4: Get Credentials

1. Go to app Settings → Basic
2. Copy **App ID** and **App Secret**
3. Click "Add Platform" → "Website"
4. Add redirect URI: `http://localhost:3000/api/integrations/instagram/callback`
5. Add to `.env`:
   ```
   INSTAGRAM_APP_ID=your-app-id-here
   INSTAGRAM_APP_SECRET=your-app-secret-here
   ```

---

## 4. Facebook Graph API

Use the same Facebook app created for Instagram.

### Step 1: Add Facebook Login Product

1. In your app dashboard, find "Add Products"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web"

### Step 2: Configure Settings

1. Go to Facebook Login → Settings
2. Add redirect URI: `http://localhost:3000/api/integrations/facebook/callback`
3. Save changes

### Step 3: Get Credentials

Same as Instagram:
```
FACEBOOK_APP_ID=your-app-id-here (same as Instagram)
FACEBOOK_APP_SECRET=your-app-secret-here (same as Instagram)
```

---

## 5. OpenAI API

### Step 1: Create Account

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to "Billing" and add a payment method
4. Add at least $5-10 credit

### Step 2: Create API Key

1. Go to "API Keys"
2. Click "Create new secret key"
3. Name it "ShortSync"
4. Copy the key (you won't see it again!)
5. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-your-openai-key-here
   ```

---

## Final .env File

Your `.env` file should look like this:

```env
# Database
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/shortsync?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-random-secret-string-123456

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=524288000

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxx

# YouTube
YOUTUBE_CLIENT_ID=xxxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=GOCSPX-xxxxx
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/integrations/youtube/callback

# TikTok
TIKTOK_CLIENT_KEY=awxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxx
TIKTOK_REDIRECT_URI=http://localhost:3000/api/integrations/tiktok/callback

# Instagram
INSTAGRAM_APP_ID=123456789
INSTAGRAM_APP_SECRET=xxxxxxxxxx
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/integrations/instagram/callback

# Facebook (same as Instagram)
FACEBOOK_APP_ID=123456789
FACEBOOK_APP_SECRET=xxxxxxxxxx
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/integrations/facebook/callback

# Platform Rate Limits
YOUTUBE_DAILY_LIMIT=5
TIKTOK_DAILY_LIMIT=2
INSTAGRAM_DAILY_LIMIT=3
FACEBOOK_DAILY_LIMIT=4

# Scheduling
MIN_DELAY_MINUTES=5
MAX_DELAY_MINUTES=15
SAFE_MODE=false
```

## Testing Your Credentials

1. Start the backend: `npm run dev`
2. Check the console for any errors
3. Go to the Integrations page in the app
4. Try connecting each platform
5. If OAuth fails, double-check your redirect URIs

## Important Notes

- **Keep your API keys secret!** Never commit `.env` to Git
- TikTok approval can take 1-2 weeks - apply  early
- Instagram must be a Business account
- Test with throwaway accounts first
- Monitor your API usage and billing
