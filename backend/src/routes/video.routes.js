import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.middleware.js';
import { PrismaClient } from '@prisma/client';
import { processVideo, generateThumbnail } from '../services/video-processor.service.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { generateThumbnailGrid, extractThumbnail, saveUploadedThumbnail } from '../utils/thumbnail.util.js';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || './uploads';
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 524288000, // 500MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|mov|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only video files (MP4, MOV, WebM) are allowed'));
    },
});

// Upload video
router.post('/upload', authenticate, upload.single('video'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const { title, description } = req.body;
        const filePath = req.file.path;

        // Process video to get metadata
        const metadata = await processVideo(filePath);

        // Generate thumbnail
        const thumbnailPath = await generateThumbnail(filePath);

        // Save to database
        const video = await prisma.video.create({
            data: {
                userId: req.userId,
                title,
                description,
                filePath,
                thumbnailPath,
                duration: metadata.duration,
                fileSize: BigInt(req.file.size),
            },
        });

        res.status(201).json({
            id: video.id,
            title: video.title,
            description: video.description,
            thumbnailPath: video.thumbnailPath,
            duration: video.duration,
            fileSize: video.fileSize.toString(),
        });
    } catch (error) {
        next(error);
    }
});

// Generate thumbnail frames for selection
router.post('/generate-frames', authenticate, upload.single('video'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file provided' });
        }

        const filePath = req.file.path;
        const { platform = 'youtube', format = 'regular' } = req.body;

        // Generate 6 thumbnail frames with platform-specific aspect ratio
        const frames = await generateThumbnailGrid(filePath, 6, 'uploads/thumbnails', platform, format);

        // Delete the temp video file after extracting frames
        await fs.unlink(filePath).catch(() => { });

        res.json({ frames });
    } catch (error) {
        next(error);
    }
});

// Upload custom thumbnail
const thumbnailUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files (JPEG, PNG) are allowed'));
    },
});

router.post('/:id/thumbnail/upload', authenticate, thumbnailUpload.single('thumbnail'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No thumbnail provided' });
        }

        const video = await prisma.video.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Save uploaded thumbnail
        const thumbnailPath = await saveUploadedThumbnail(req.file, video.id);

        //Update video record
        await prisma.video.update({
            where: { id: video.id },
            data: { thumbnailPath },
        });

        res.json({ thumbnailPath });
    } catch (error) {
        next(error);
    }
});

// Select frame as thumbnail
router.post('/:id/thumbnail/select', authenticate, async (req, res, next) => {
    try {
        const { framePath } = req.body;

        const video = await prisma.video.findFirst({
            where: { id: req.params.id, userId: req.userId },
        });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Update video record with selected frame path
        await prisma.video.update({
            where: { id: video.id },
            data: { thumbnailPath: framePath },
        });

        res.json({ thumbnailPath: framePath });
    } catch (error) {
        next(error);
    }
});

// Get all user's videos
router.get('/', authenticate, async (req, res, next) => {
    try {
        const videos = await prisma.video.findMany({
            where: { userId: req.userId },
            orderBy: { uploadedAt: 'desc' },
            include: {
                posts: {
                    select: {
                        platform: true,
                        status: true,
                        postedAt: true,
                    },
                },
            },
        });

        res.json(videos);
    } catch (error) {
        next(error);
    }
});

// Get single video
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const video = await prisma.video.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
            include: {
                posts: {
                    include: {
                        analytics: true,
                    },
                },
            },
        });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        next(error);
    }
});

// Delete video
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const video = await prisma.video.findFirst({
            where: {
                id: req.params.id,
                userId: req.userId,
            },
        });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Delete files
        await fs.unlink(video.filePath).catch(() => { });
        if (video.thumbnailPath) {
            await fs.unlink(video.thumbnailPath).catch(() => { });
        }

        // Delete from database (cascade will delete posts and analytics)
        await prisma.video.delete({
            where: { id: req.params.id },
        });

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
