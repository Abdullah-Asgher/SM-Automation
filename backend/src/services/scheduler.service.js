import Bull from 'bull';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { uploadToYouTube } from './youtube.service.js';
import { uploadToTikTok } from './tiktok.service.js';
import { uploadToInstagram } from './instagram.service.js';
import { uploadToFacebook } from './facebook.service.js';
import { optimizeForPlatform } from './video-processor.service.js';

const prisma = new PrismaClient();

// Create Bull queue
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
});

const uploadQueue = new Bull('video-uploads', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
    },
});

// Humanization utilities
const PLATFORM_LIMITS = {
    YOUTUBE: parseInt(process.env.YOUTUBE_DAILY_LIMIT) || 5,
    TIKTOK: parseInt(process.env.TIKTOK_DAILY_LIMIT) || 2,
    INSTAGRAM: parseInt(process.env.INSTAGRAM_DAILY_LIMIT) || 3,
    FACEBOOK: parseInt(process.env.FACEBOOK_DAILY_LIMIT) || 4,
};

const MIN_SPACING_MS = {
    YOUTUBE: 2 * 60 * 60 * 1000, // 2 hours
    TIKTOK: 4 * 60 * 60 * 1000,  // 4 hours
    INSTAGRAM: 3 * 60 * 60 * 1000, // 3 hours
    FACEBOOK: 3 * 60 * 60 * 1000,   // 3 hours
};

// Get random delay in minutes
function getRandomDelay() {
    const min = parseInt(process.env.MIN_DELAY_MINUTES) || 5;
    const max = parseInt(process.env.MAX_DELAY_MINUTES) || 15;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Add variance to a scheduled time
function addTimeVariance(baseTime) {
    const variance = (Math.random() - 0.5) * 60 * 60 * 1000; // ±30 min
    return new Date(baseTime.getTime() + variance);
}

// Check if posting is allowed (rate limiting)
async function canPostToPlatform(userId, platform) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const postsToday = await prisma.videoPost.count({
        where: {
            video: { userId },
            platform,
            postedAt: {
                gte: today,
            },
        },
    });

    return postsToday < PLATFORM_LIMITS[platform];
}

// Get last post time for platform
async function getLastPostTime(userId, platform) {
    const lastPost = await prisma.videoPost.findFirst({
        where: {
            video: { userId },
            platform,
            status: 'POSTED',
        },
        orderBy: { postedAt: 'desc' },
    });

    return lastPost?.postedAt;
}

// Schedule post with "Post Now" mode
export async function schedulePost(postId, mode) {
    const post = await prisma.videoPost.findUnique({
        where: { id: postId },
        include: {
            video: { include: { user: true } },
        },
    });

    let scheduledTime;

    if (mode === 'now') {
        // Add random delay (5-15 minutes)
        const delayMinutes = getRandomDelay();
        scheduledTime = new Date(Date.now() + delayMinutes * 60 * 1000);
    } else {
        // Manual scheduled time provided - use EXACT time selected by user
        scheduledTime = new Date(mode);
        // NOTE: No time variance added for manual scheduling to respect user's exact choice
    }

    // Check if allowed to post
    const canPost = await canPostToPlatform(post.video.userId, post.platform);
    if (!canPost) {
        throw new Error(`Daily limit reached for ${post.platform}`);
    }

    // Check minimum spacing
    const lastPostTime = await getLastPostTime(post.video.userId, post.platform);
    if (lastPostTime) {
        const minSpacing = MIN_SPACING_MS[post.platform];
        const timeSinceLastPost = Date.now() - lastPostTime.getTime();

        if (timeSinceLastPost < minSpacing) {
            const additionalWait = minSpacing - timeSinceLastPost;
            scheduledTime = new Date(scheduledTime.getTime() + additionalWait);
        }
    }

    // Update post status
    await prisma.videoPost.update({
        where: { id: postId },
        data: {
            scheduledTime,
            status: 'SCHEDULED',
        },
    });

    console.log(`📅 Scheduling post ${postId} for ${scheduledTime}`);
    console.log(`   Platform: ${post.platform}`);
    console.log(`   Delay: ${scheduledTime.getTime() - Date.now()}ms`);

    // Add to queue
    const job = await uploadQueue.add(
        { postId },
        {
            delay: scheduledTime.getTime() - Date.now(),
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 60000, // 1 minute
            },
        }
    );

    console.log(`✅ Job ${job.id} added to queue`);

    return scheduledTime;
}

// Schedule with AI-determined optimal times
export async function scheduleWithAI(postIds) {
    const optimalTimes = {
        YOUTUBE: [14, 17, 20], // 2 PM, 5 PM, 8 PM (peak hours)
        TIKTOK: [12, 18, 21],  // 12 PM, 6 PM, 9 PM
        INSTAGRAM: [11, 15, 19], // 11 AM, 3 PM, 7 PM
        FACEBOOK: [13, 18, 20],  // 1 PM, 6 PM, 8 PM
    };

    const scheduledPosts = [];

    for (const postId of postIds) {
        const post = await prisma.videoPost.findUnique({
            where: { id: postId },
            include: { video: true },
        });

        const platform = post.platform;
        const peakHours = optimalTimes[platform];

        // Pick random peak hour
        const randomHour = peakHours[Math.floor(Math.random() * peakHours.length)];

        // Schedule for next occurrence of that hour (within next 7 days)
        let scheduledTime = new Date();
        scheduledTime.setHours(randomHour, Math.floor(Math.random() * 60), 0, 0);

        // If time has passed today, schedule for tomorrow or later
        if (scheduledTime <= new Date()) {
            const daysToAdd = Math.floor(Math.random() * 3) + 1; // 1-3 days
            scheduledTime.setDate(scheduledTime.getDate() + daysToAdd);
        }

        // Add time variance
        scheduledTime = addTimeVariance(scheduledTime);

        // Schedule the post
        await schedulePost(postId, scheduledTime.toISOString());
        scheduledPosts.push({ postId, scheduledTime });
    }

    return scheduledPosts;
}

// Process upload queue
uploadQueue.process(async (job) => {
    const { postId } = job.data;

    const post = await prisma.videoPost.findUnique({
        where: { id: postId },
        include: {
            video: { include: { user: true } },
        },
    });

    if (!post) {
        throw new Error('Post not found');
    }

    // Update status
    await prisma.videoPost.update({
        where: { id: postId },
        data: { status: 'POSTING' },
    });

    try {
        // Optimize video for platform
        const optimizedVideoPath = await optimizeForPlatform(
            post.video.filePath,
            post.platform.toLowerCase()
        );

        // Prepare metadata
        const metadata = {
            title: post.platformSpecificTitle || post.video.title,
            description: post.platformSpecificDescription || post.video.description,
            hashtags: post.platformSpecificHashtags,
        };

        const userId = post.video.userId;
        let result;

        // Upload to platform
        switch (post.platform) {
            case 'YOUTUBE':
                result = await uploadToYouTube(userId, optimizedVideoPath, metadata);
                break;
            case 'TIKTOK':
                result = await uploadToTikTok(userId, optimizedVideoPath, metadata);
                break;
            case 'INSTAGRAM':
                result = await uploadToInstagram(userId, optimizedVideoPath, metadata);
                break;
            case 'FACEBOOK':
                result = await uploadToFacebook(userId, optimizedVideoPath, metadata);
                break;
            default:
                throw new Error(`Unsupported platform: ${post.platform}`);
        }

        // Update post as successful
        await prisma.videoPost.update({
            where: { id: postId },
            data: {
                status: 'POSTED',
                postedAt: new Date(),
                platformPostId: result.id,
            },
        });

        // Create analytics record
        await prisma.postingAnalytics.create({
            data: {
                videoPostId: postId,
            },
        });

        return { success: true, platformPostId: result.id };
    } catch (error) {
        console.error('Upload failed:', error);

        // Update post as failed
        await prisma.videoPost.update({
            where: { id: postId },
            data: {
                status: 'FAILED',
                errorMessage: error.message,
                retryCount: post.retryCount + 1,
            },
        });

        throw error;
    }
});

// Queue event handlers
uploadQueue.on('completed', (job, result) => {
    console.log(`✅ Upload completed: Job ${job.id}`, result);
});

uploadQueue.on('failed', (job, err) => {
    console.error(`❌ Upload failed: Job ${job.id}`, err.message);
});

export { uploadQueue };
