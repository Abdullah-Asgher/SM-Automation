import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth/authorize';
const INSTAGRAM_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com';

// Generate OAuth URL
export function getInstagramAuthUrl(userId) {
    const params = new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        scope: 'instagram_basic,instagram_content_publish',
        response_type: 'code',
        state: userId,
    });

    return `${INSTAGRAM_AUTH_URL}?${params.toString()}`;
}

// Handle OAuth callback
export async function handleInstagramCallback(code, userId) {
    const formData = new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code,
    });

    const response = await axios.post(INSTAGRAM_TOKEN_URL, formData);
    const { access_token } = response.data;

    // Exchange for long-lived token
    const longLivedResponse = await axios.get(
        `${INSTAGRAM_GRAPH_URL}/access_token`,
        {
            params: {
                grant_type: 'ig_exchange_token',
                client_secret: process.env.INSTAGRAM_APP_SECRET,
                access_token,
            },
        }
    );

    const { access_token: longLivedToken, expires_in } = longLivedResponse.data;

    await prisma.platformConnection.upsert({
        where: {
            userId_platform: {
                userId,
                platform: 'INSTAGRAM',
            },
        },
        create: {
            userId,
            platform: 'INSTAGRAM',
            accessToken: longLivedToken,
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
        },
        update: {
            accessToken: longLivedToken,
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
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
        throw new Error('Facebook/Instagram access token not configured in .env');
    }

    return accessToken;
}

// Get Instagram account ID and Page Access Token
async function getInstagramAccountId(accessToken) {
    // First, get the Facebook Page
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
        params: {
            access_token: accessToken,
        },
    });

    if (pagesResponse.data.data.length === 0) {
        throw new Error('No Facebook pages found');
    }

    // Use first page
    const page = pagesResponse.data.data[0];

    // Get Instagram Business Account connected to the page
    const igResponse = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
        params: {
            fields: 'instagram_business_account',
            access_token: page.access_token,
        },
    });

    if (!igResponse.data.instagram_business_account) {
        throw new Error('No Instagram Business Account connected to Facebook Page. Please connect your Instagram Business account to your Facebook Page.');
    }

    // Return BOTH the IG account ID AND the Page Access Token
    return {
        accountId: igResponse.data.instagram_business_account.id,
        pageAccessToken: page.access_token
    };
}

// Upload video as Reel
export async function uploadToInstagram(userId, videoPath, metadata) {
    const userAccessToken = await getAccessToken(userId);
    const { accountId, pageAccessToken } = await getInstagramAccountId(userAccessToken);

    const { title, description, hashtags = [] } = metadata;

    // Construct caption
    const caption = `${description}\n\n${hashtags.join(' ')}`;

    // Get public video URL via ngrok
    const ngrokUrl = process.env.NGROK_PUBLIC_URL || 'http://localhost:3000';
    const videoFilename = videoPath.split(/[\\\/]/).pop();
    const publicVideoUrl = `${ngrokUrl}/uploads/${videoFilename}`;

    console.log('📸 Instagram Upload:', videoFilename);
    console.log('   Public URL:', publicVideoUrl);
    console.log('   IG Account ID:', accountId);

    try {
        // Step 1: Create media container
        console.log('   Step 1: Creating media container...');
        const containerResponse = await axios.post(
            `${INSTAGRAM_GRAPH_URL}/${accountId}/media`,
            null,
            {
                params: {
                    video_url: publicVideoUrl,
                    media_type: 'REELS',
                    caption,
                    access_token: pageAccessToken,
                },
            }
        );

        const containerId = containerResponse.data.id;
        console.log('   ✅ Container created:', containerId);

        // Step 2: Publish media
        console.log('   Step 2: Publishing media...');
        const publishResponse = await axios.post(
            `${INSTAGRAM_GRAPH_URL}/${accountId}/media_publish`,
            null,
            {
                params: {
                    creation_id: containerId,
                    access_token: pageAccessToken,
                },
            }
        );

        console.log('   ✅ Published successfully!');
        return {
            id: publishResponse.data.id,
            url: null,
        };
    } catch (error) {
        console.error('❌ Instagram Upload Error:');
        console.error('   Error message:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

// Get Reel insights
export async function getInstagramAnalytics(userId, mediaId) {
    const accessToken = await getAccessToken(userId);

    const response = await axios.get(`${INSTAGRAM_GRAPH_URL}/${mediaId}/insights`, {
        params: {
            metric: 'impressions,reach,likes,comments,shares,saved',
            access_token: accessToken,
        },
    });

    const metrics = response.data.data;

    return {
        views: metrics.find(m => m.name === 'impressions')?.values[0]?.value || 0,
        likes: metrics.find(m => m.name === 'likes')?.values[0]?.value || 0,
        comments: metrics.find(m => m.name === 'comments')?.values[0]?.value || 0,
        shares: metrics.find(m => m.name === 'shares')?.values[0]?.value || 0,
    };
}
