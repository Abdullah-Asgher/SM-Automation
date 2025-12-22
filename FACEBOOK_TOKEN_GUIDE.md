# How to Get a Long-Lived Facebook Access Token

## Current Situation
Your token expires in **1-2 hours** (short-lived token from Graph Explorer).

## Solution: Get a 60-Day Token

### Option 1: Use Our Script (Easiest)

Run this command:
```bash
node extend-facebook-token.js
```

This will automatically:
- Take your current short-lived token
- Exchange it for a 60-day long-lived token
- Update your `.env` file
- Restart the backend

### Option 2: Manual Exchange

1. Go to: https://developers.facebook.com/tools/debug/accesstoken/
2. Paste your current token
3. Click "Extend Access Token"
4. Copy the new long-lived token
5. Update `backend/.env`

## Best Solution: Use Page Access Token (Never Expires!)

**Page Access Tokens don't expire** as long as the page exists.

To get one:

1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your **App** from dropdown
3. Under "User or Page", select your **Facebook Page**
4. Click "Generate Access Token"
5. This token **never expires**! ✅

Copy this token to `FACEBOOK_ACCESS_TOKEN` in `.env`

## Token Types

| Type | Lifespan | Use Case |
|------|----------|----------|
| Short-lived | 1-2 hours | Testing only |
| Long-lived | 60 days | Personal automation |
| Page Token | Never expires | **Best for this app** |

## Recommendation

**Use a Page Access Token** - it's the most reliable for automation!
