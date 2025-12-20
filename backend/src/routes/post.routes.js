import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';
import { schedulePost, scheduleWithAI } from '../services/scheduler.service.js';

const router = Router();
const prisma = new PrismaClient();

// Create posts for video
router.post('/create', authenticate, async (req, res, next) => {
    try {
        const {
            videoId,
            platforms, // array of platform objects with title, description, hashtags
            scheduleMode, // 'now', 'manual', 'ai'
            scheduledTimes, // object with platform name as key and timestamp as value (for manual mode)
        } = req.body;

        // Verify video belongs to user
        const video = await prisma.video.findFirst({
            where: { id: videoId, userId: req.userId },
        });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Create posts based on schedule mode
        const posts = [];

        for (const platformData of platforms) {
            const { platform, title, description, hashtags } = platformData;

            // Create post record
            const post = await prisma.videoPost.create({
                data: {
                    videoId,
                    platform: platform.toUpperCase(),
                    platformSpecificTitle: title,
                    platformSpecificDescription: description,
                    platformSpecificHashtags: hashtags || [],
                    status: 'PENDING',
                },
            });

            posts.push(post);
        }

        // Schedule based on mode
        if (scheduleMode === 'now') {
            // Schedule with random delays
            for (const post of posts) {
                await schedulePost(post.id, 'now');
            }
        } else if (scheduleMode === 'manual') {
            // Schedule at specified times
            for (const post of posts) {
                const scheduledTime = scheduledTimes[post.platform.toLowerCase()];
                await schedulePost(post.id, scheduledTime);
            }
        } else if (scheduleMode === 'ai') {
            // Let AI determine optimal times
            await scheduleWithAI(posts.map(p => p.id));
        }

        res.status(201).json(posts);
    } catch (error) {
        next(error);
    }
});

// Get all posts
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { status } = req.query;

        const where = {
            video: { userId: req.userId },
            ...(status && { status: status.toUpperCase() }),
        };

        const posts = await prisma.videoPost.findMany({
            where,
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailPath: true,
                    },
                },
                analytics: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(posts);
    } catch (error) {
        next(error);
    }
});

// Update post
router.patch('/:id', authenticate, async (req, res, next) => {
    try {
        const { scheduledTime } = req.body;

        // Verify post belongs to user
        const post = await prisma.videoPost.findFirst({
            where: {
                id: req.params.id,
                video: { userId: req.userId },
            },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Update scheduled time
        const updated = await prisma.videoPost.update({
            where: { id: req.params.id },
            data: {
                scheduledTime: new Date(scheduledTime),
                status: 'SCHEDULED',
            },
        });

        // Reschedule in queue
        await schedulePost(updated.id, scheduledTime);

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// Cancel/delete post
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        // Verify post belongs to user
        const post = await prisma.videoPost.findFirst({
            where: {
                id: req.params.id,
                video: { userId: req.userId },
            },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Delete post (queue job will be automatically cleaned)
        await prisma.videoPost.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Post cancelled successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
