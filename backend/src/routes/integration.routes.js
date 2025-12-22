import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';
import {
    getYouTubeAuthUrl,
    handleYouTubeCallback
} from '../services/youtube.service.js';
import {
    getTikTokAuthUrl,
    handleTikTokCallback
} from '../services/tiktok.service.js';
import {
    getInstagramAuthUrl,
    handleInstagramCallback
} from '../services/instagram.service.js';
import {
    getFacebookAuthUrl,
    handleFacebookCallback
} from '../services/facebook.service.js';

const router = Router();
const prisma = new PrismaClient();

// Get all platform connections
router.get('/', authenticate, async (req, res, next) => {
    try {
        const connections = await prisma.platformConnection.findMany({
            where: { userId: req.userId },
            select: {
                id: true,
                platform: true,
                isActive: true,
                connectedAt: true,
            },
        });

        // Add Facebook/Instagram as connected if access token exists in env
        const hasAccessToken = !!process.env.FACEBOOK_ACCESS_TOKEN;

        if (hasAccessToken) {
            const platformsToAdd = ['FACEBOOK', 'INSTAGRAM'];

            for (const platform of platformsToAdd) {
                const existingConnection = connections.find(c => c.platform === platform);

                if (!existingConnection) {
                    connections.push({
                        id: `env-${platform.toLowerCase()}`,
                        platform,
                        isActive: true,
                        connectedAt: new Date(),
                    });
                }
            }
        }

        res.json(connections);
    } catch (error) {
        next(error);
    }
});

// YouTube OAuth
router.get('/youtube/connect', authenticate, (req, res) => {
    const authUrl = getYouTubeAuthUrl(req.userId);
    res.json({ authUrl });
});

router.get('/youtube/callback', async (req, res, next) => {
    try {
        const { code, state: userId } = req.query;
        await handleYouTubeCallback(code, userId);
        res.redirect('http://localhost:5173/integrations?success=youtube');
    } catch (error) {
        next(error);
    }
});

// TikTok OAuth
router.get('/tiktok/connect', authenticate, (req, res) => {
    const authUrl = getTikTokAuthUrl(req.userId);
    res.json({ authUrl });
});

router.get('/tiktok/callback', async (req, res, next) => {
    try {
        const { code, state: userId } = req.query;
        await handleTikTokCallback(code, userId);
        res.redirect('http://localhost:5173/integrations?success=tiktok');
    } catch (error) {
        next(error);
    }
});

// Instagram - Simplified (uses Facebook access token)
router.get('/instagram/connect', authenticate, (req, res) => {
    // For personal use, Instagram uses the same Facebook access token
    if (process.env.FACEBOOK_ACCESS_TOKEN) {
        res.json({
            success: true,
            message: 'Instagram connected via Facebook access token'
        });
    } else {
        res.status(400).json({
            error: 'Facebook access token not configured. Add FACEBOOK_ACCESS_TOKEN to .env'
        });
    }
});

router.get('/instagram/callback', async (req, res, next) => {
    try {
        const { code, state: userId } = req.query;
        await handleInstagramCallback(code, userId);
        res.redirect('http://localhost:5173/integrations?success=instagram');
    } catch (error) {
        next(error);
    }
});

// Facebook - Simplified (uses access token from env)
router.get('/facebook/connect', authenticate, (req, res) => {
    // For personal use, use the access token from .env
    if (process.env.FACEBOOK_ACCESS_TOKEN) {
        res.json({
            success: true,
            message: 'Facebook connected via access token'
        });
    } else {
        res.status(400).json({
            error: 'Facebook access token not configured. Add FACEBOOK_ACCESS_TOKEN to .env'
        });
    }
});

router.get('/facebook/callback', async (req, res, next) => {
    try {
        const { code, state: userId } = req.query;
        await handleFacebookCallback(code, userId);
        res.redirect('http://localhost:5173/integrations?success=facebook');
    } catch (error) {
        next(error);
    }
});

// Disconnect platform
router.delete('/:platform', authenticate, async (req, res, next) => {
    try {
        const { platform } = req.params;

        await prisma.platformConnection.deleteMany({
            where: {
                userId: req.userId,
                platform: platform.toUpperCase(),
            },
        });

        res.json({ message: 'Platform disconnected successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
