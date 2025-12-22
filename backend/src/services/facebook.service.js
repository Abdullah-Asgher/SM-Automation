import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import FormData from 'form-data';
import fs from 'fs';

const prisma = new PrismaClient();

const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v18.0/dialog/oauth';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v18.0/oauth/access_token';
const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0';

// Generate OAuth URL
export function getFacebookAuthUrl(userId) {
    const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,publish_video',
        state: userId,
    });

    return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
}

// Handle OAuth callback
export async function handleFacebookCallback(code, userId) {
    const params = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
    });

    const response = await axios.get(`${FACEBOOK_TOKEN_URL}?${params.toString()}`);
    const { access_token } = response.data;

    // Exchange for long-lived token (60 days)
    const longLivedParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: access_token,
    });

    const longLivedResponse = await axios.get(
        `${FACEBOOK_GRAPH_URL}/oauth/access_token?${longLivedParams.toString()}`
    );

    const { access_token: longLivedToken } = longLivedResponse.data;

    await prisma.platformConnection.upsert({
        where: {
            userId_platform: {
                userId,
                platform: 'FACEBOOK',
            },
        },
        create: {
            userId,
            platform: 'FACEBOOK',
            accessToken: longLivedToken,
            tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        },
        update: {
            accessToken: longLivedToken,
            tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            isActive: true,
        },
    });

    return { access_token: longLivedToken };
}

// Get access token - use direct token from env for personal use
async function getAccessToken(userId) {
    // For personal automation, use the access token from .env
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!accessToken) {
        throw new Error('Facebook access token not configured in .env');
    }

    return accessToken;
}

// Get user's Facebook pages
async function getUserPages(accessToken) {
    const response = await axios.get(`${FACEBOOK_GRAPH_URL}/me/accounts`, {
        params: {
            access_token: accessToken,
        },
    });

    return response.data.data;
}

// Upload video to Facebook
export async function uploadToFacebook(userId, videoPath, metadata) {
    const accessToken = await getAccessToken(userId);
    const pages = await getUserPages(accessToken);

    if (pages.length === 0) {
        throw new Error('No Facebook pages found');
    }

    // Use first page (or let user select in future)
    const page = pages[0];
    const pageAccessToken = page.access_token;

    const { title, description, hashtags = [] } = metadata;
    const fullDescription = `${description}\n\n${hashtags.join(' ')}`;

    // Get public video URL via ngrok
    const ngrokUrl = process.env.NGROK_PUBLIC_URL || 'http://localhost:3000';
    const videoFilename = videoPath.split(/[\\\/]/).pop();
    const publicVideoUrl = `${ngrokUrl}/uploads/${videoFilename}`;

    console.log('👥 Facebook Upload:', videoFilename);
    console.log('   Public URL:', publicVideoUrl);

    // Upload video using public URL
    const response = await axios.post(
        `${FACEBOOK_GRAPH_URL}/${page.id}/videos`,
        null,
        {
            params: {
                file_url: publicVideoUrl,
                description: fullDescription,
                title,
                access_token: pageAccessToken,
            },
        }
    );

    return {
        id: response.data.id,
        url: `https://facebook.com/${response.data.id}`,
    };
}

// Get video insights
export async function getFacebookAnalytics(userId, videoId) {
    const accessToken = await getAccessToken(userId);

    const response = await axios.get(`${FACEBOOK_GRAPH_URL}/${videoId}`, {
        params: {
            fields: 'likes.summary(true),comments.summary(true),views',
            access_token: accessToken,
        },
    });

    return {
        views: response.data.views || 0,
        likes: response.data.likes?.summary?.total_count || 0,
        comments: response.data.comments?.summary?.total_count || 0,
        shares: 0,
    };
}
