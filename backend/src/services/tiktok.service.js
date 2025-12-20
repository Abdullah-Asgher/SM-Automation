import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import FormData from 'form-data';

const prisma = new PrismaClient();

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_UPLOAD_URL = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/';
const TIKTOK_STATUS_URL = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/';

// Generate OAuth URL
export function getTikTokAuthUrl(userId) {
    const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        response_type: 'code',
        scope: 'video.upload,video.publish',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
        state: userId,
    });

    return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

// Handle OAuth callback
export async function handleTikTokCallback(code, userId) {
    const response = await axios.post(TIKTOK_TOKEN_URL, {
        client_key: process.env.TIKTOK_CLIENT_KEY,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
    });

    const { access_token, refresh_token, expires_in } = response.data;

    await prisma.platformConnection.upsert({
        where: {
            userId_platform: {
                userId,
                platform: 'TIKTOK',
            },
        },
        create: {
            userId,
            platform: 'TIKTOK',
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
        },
        update: {
            accessToken: access_token,
            refreshToken: refresh_token,
            tokenExpiry: new Date(Date.now() + expires_in * 1000),
            isActive: true,
        },
    });

    return { access_token, refresh_token };
}

// Get access token
async function getAccessToken(userId) {
    const connection = await prisma.platformConnection.findUnique({
        where: {
            userId_platform: {
                userId,
                platform: 'TIKTOK',
            },
        },
    });

    if (!connection) {
        throw new Error('TikTok not connected');
    }

    // Refresh if expired
    if (connection.tokenExpiry && new Date() > connection.tokenExpiry) {
        const response = await axios.post(TIKTOK_TOKEN_URL, {
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            refresh_token: connection.refreshToken,
            grant_type: 'refresh_token',
        });

        const { access_token, expires_in } = response.data;

        await prisma.platformConnection.update({
            where: { id: connection.id },
            data: {
                accessToken: access_token,
                tokenExpiry: new Date(Date.now() + expires_in * 1000),
            },
        });

        return access_token;
    }

    return connection.accessToken;
}

// Upload video to TikTok
export async function uploadToTikTok(userId, videoPath, metadata) {
    const accessToken = await getAccessToken(userId);
    const { title, description, hashtags = [] } = metadata;

    // Combine description with hashtags
    const caption = `${description}\n\n${hashtags.join(' ')}`;

    // Step 1: Initialize upload
    const initResponse = await axios.post(
        TIKTOK_UPLOAD_URL,
        {
            post_info: {
                title: title || caption.substring(0, 100),
                privacy_level: 'PUBLIC_TO_EVERYONE',
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 1000,
            },
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: fs.statSync(videoPath).size,
                chunk_size: fs.statSync(videoPath).size,
                total_chunk_count: 1,
            },
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const { publish_id, upload_url } = initResponse.data.data;

    // Step 2: Upload video file
    const formData = new FormData();
    formData.append('video', fs.createReadStream(videoPath));

    await axios.put(upload_url, formData, {
        headers: {
            ...formData.getHeaders(),
            'Content-Type': 'video/mp4',
        },
    });

    return {
        id: publish_id,
        url: null, // TikTok doesn't provide direct URL immediately
    };
}

// Check upload status
export async function getTikTokUploadStatus(userId, publishId) {
    const accessToken = await getAccessToken(userId);

    const response = await axios.post(
        TIKTOK_STATUS_URL,
        {
            publish_id: publishId,
        },
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return response.data.data;
}
