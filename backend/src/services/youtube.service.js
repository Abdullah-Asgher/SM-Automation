import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
);

// Generate OAuth URL
export function getYouTubeAuthUrl(userId) {
    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: userId, // Pass userId for callback
    });
}

// Handle OAuth callback
export async function handleYouTubeCallback(code, userId) {
    const { tokens } = await oauth2Client.getToken(code);

    // Save tokens to database
    await prisma.platformConnection.upsert({
        where: {
            userId_platform: {
                userId,
                platform: 'YOUTUBE',
            },
        },
        create: {
            userId,
            platform: 'YOUTUBE',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
        update: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            isActive: true,
        },
    });

    return tokens;
}

// Get access token for user
async function getAccessToken(userId) {
    const connection = await prisma.platformConnection.findUnique({
        where: {
            userId_platform: {
                userId,
                platform: 'YOUTUBE',
            },
        },
    });

    if (!connection) {
        throw new Error('YouTube not connected');
    }

    // Check if token expired and refresh if needed
    if (connection.tokenExpiry && new Date() > connection.tokenExpiry) {
        oauth2Client.setCredentials({
            refresh_token: connection.refreshToken,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();

        await prisma.platformConnection.update({
            where: { id: connection.id },
            data: {
                accessToken: credentials.access_token,
                tokenExpiry: new Date(credentials.expiry_date),
            },
        });

        return credentials.access_token;
    }

    return connection.accessToken;
}

// Upload video to YouTube Shorts
export async function uploadToYouTube(userId, videoPath, metadata) {
    const accessToken = await getAccessToken(userId);

    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const { title, description, hashtags = [] } = metadata;

    // Add hashtags to description
    const fullDescription = `${description}\n\n${hashtags.join(' ')}`;

    const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: {
                title,
                description: fullDescription,
                categoryId: '22', // People & Blogs
                tags: hashtags.map(tag => tag.replace('#', '')),
            },
            status: {
                privacyStatus: 'public',
                selfDeclaredMadeForKids: false,
            },
        },
        media: {
            body: fs.createReadStream(videoPath),
        },
    });

    return {
        id: response.data.id,
        url: `https://youtube.com/shorts/${response.data.id}`,
    };
}

// Get video analytics
export async function getYouTubeAnalytics(userId, videoId) {
    const accessToken = await getAccessToken(userId);

    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.videos.list({
        part: ['statistics'],
        id: [videoId],
    });

    const stats = response.data.items[0]?.statistics;

    return {
        views: parseInt(stats?.viewCount || 0),
        likes: parseInt(stats?.likeCount || 0),
        comments: parseInt(stats?.commentCount || 0),
        shares: 0, // YouTube API doesn't provide share count directly
    };
}
