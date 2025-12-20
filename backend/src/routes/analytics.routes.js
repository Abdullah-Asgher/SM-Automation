import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get analytics overview
router.get('/overview', authenticate, async (req, res, next) => {
    try {
        const posts = await prisma.videoPost.findMany({
            where: {
                video: { userId: req.userId },
                status: 'POSTED',
            },
            include: {
                analytics: true,
            },
        });

        const totalPosts = posts.length;
        const totalViews = posts.reduce((sum, p) => sum + (p.analytics?.views || 0), 0);
        const totalLikes = posts.reduce((sum, p) => sum + (p.analytics?.likes || 0), 0);
        const totalComments = posts.reduce((sum, p) => sum + (p.analytics?.comments || 0), 0);
        const totalShares = posts.reduce((sum, p) => sum + (p.analytics?.shares || 0), 0);

        // Group by platform
        const byPlatform = {};
        for (const post of posts) {
            const platform = post.platform.toLowerCase();
            if (!byPlatform[platform]) {
                byPlatform[platform] = {
                    posts: 0,
                    views: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                };
            }
            byPlatform[platform].posts++;
            byPlatform[platform].views += post.analytics?.views || 0;
            byPlatform[platform].likes += post.analytics?.likes || 0;
            byPlatform[platform].comments += post.analytics?.comments || 0;
            byPlatform[platform].shares += post.analytics?.shares || 0;
        }

        res.json({
            overview: {
                totalPosts,
                totalViews,
                totalLikes,
                totalComments,
                totalShares,
            },
            byPlatform,
        });
    } catch (error) {
        next(error);
    }
});

// Get platform-specific analytics
router.get('/:platform', authenticate, async (req, res, next) => {
    try {
        const { platform } = req.params;

        const posts = await prisma.videoPost.findMany({
            where: {
                video: { userId: req.userId },
                platform: platform.toUpperCase(),
                status: 'POSTED',
            },
            include: {
                video: {
                    select: {
                        title: true,
                        thumbnailPath: true,
                    },
                },
                analytics: true,
            },
            orderBy: { postedAt: 'desc' },
        });

        res.json(posts);
    } catch (error) {
        next(error);
    }
});

export default router;
