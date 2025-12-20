import axios from 'axios';
import { PrismaClient } from '@prisma/client';
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
        response_type: 'code',
        state: userId,
    });

    return `${FACEBOOK_AUTH_URL}?${params.toString()}`;
}

// Handle OAuth callback
export async function handleFacebookCallback(code, userId) {
    const response = await axios.get(FACEBOOK_TOKEN_URL, {
        params: {
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
            code,
        },
    });

    const { access_token } = response.data;

    // Exchange for long-lived token
    const longLivedResponse = await axios.get(FACEBOOK_TOKEN_URL, {
        params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FACEBOOK_APP_ID,
            client_secret: process.env.FACEBOOK_APP_SECRET,
            fb_exchange_token: access_token,
        },
    });

    const { access_token: longLivedToken, expires_in } = longLivedResponse.data;

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

// Get access token
async function getAccessToken(userId) {
    const connection = await prisma.platformConnection.findUnique({
        where: {
            userId_platform: {
                userId,
                platform: 'FACEBOOK',
            },
        },
    });

    if (!connection) {
        throw new Error('Facebook not connected');
    }

    return connection.accessToken;
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

    // Upload video
    const formData = new FormData();
    formData.append('source', fs.createReadStream(videoPath));
    formData.append('description', fullDescription);
    formData.append('title', title);
    formData.append('access_token', pageAccessToken);

    const response = await axios.post(
        `${FACEBOOK_GRAPH_URL}/${page.id}/videos`,
        formData,
        {
            headers: formData.getHeaders(),
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
            fields: 'views,likes,comments,shares',
            access_token: accessToken,
        },
    });

    return {
        views: response.data.views || 0,
        likes: response.data.likes?.summary?.total_count || 0,
        comments: response.data.comments?.summary?.total_count || 0,
        shares: response.data.shares?.count || 0,
    };
}
