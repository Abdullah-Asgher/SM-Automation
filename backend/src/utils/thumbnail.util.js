import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import fs from 'fs/promises';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Platform configurations for thumbnails
 */
const PLATFORM_CONFIGS = {
    'youtube-shorts': {
        aspectRatio: '9:16',
        width: 1080,
        height: 1920
    },
    'youtube-regular': {
        aspectRatio: '16:9',
        width: 1280,
        height: 720
    },
    'tiktok': {
        aspectRatio: '9:16',
        width: 1080,
        height: 1920
    },
    'instagram': {
        aspectRatio: '9:16',
        width: 1080,
        height: 1920
    },
    'facebook': {
        aspectRatio: '9:16',
        width: 1080,
        height: 1920
    }
};

/**
 * Get platform configuration
 * @param {string} platform - Platform name (youtube, tiktok, instagram, facebook)
 * @param {string} format - Format for YouTube (shorts, regular), ignored for other platforms
 * @returns {object} Platform config with aspectRatio, width, height
 */
export function getPlatformConfig(platform, format = 'shorts') {
    const key = platform === 'youtube' ? `youtube-${format}` : platform;
    return PLATFORM_CONFIGS[key] || PLATFORM_CONFIGS['youtube-regular'];
}

/**
 * Get video duration in seconds
 */
export async function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
        });
    });
}

/**
 * Extract thumbnail from video at specific timestamp
 * @param {string} videoPath - Path to video file
 * @param {string|number} timestamp - Time in seconds or HH:MM:SS format
 * @param {string} outputDir - Directory to save thumbnail
 * @returns {Promise<string>} Path to generated thumbnail
 */
export async function extractThumbnail(videoPath, timestamp = 3, outputDir = 'uploads/thumbnails') {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    const filename = `thumb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
    const outputPath = path.join(outputDir, filename);

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: [timestamp],
                filename: filename,
                folder: outputDir,
                size: '640x360'
            })
            .on('end', () => resolve(outputPath))
            .on('error', reject);
    });
}

/**
 * Generate multiple thumbnail frames from video
 * @param {string} videoPath - Path to video file
 * @param {number} count - Number of frames to extract (default: 6)
 * @param {string} outputDir - Directory to save thumbnails
 * @param {string} platform - Platform name (youtube, tiktok, instagram, facebook)
 * @param {string} format - Format for YouTube (shorts, regular)
 * @returns {Promise<Array>} Array of {time, path, url} objects
 */
export async function generateThumbnailGrid(videoPath, count = 6, outputDir = 'uploads/thumbnails', platform = 'youtube', format = 'regular') {
    try {
        // Get video duration
        const duration = await getVideoDuration(videoPath);

        // Get platform configuration
        const config = getPlatformConfig(platform, format);

        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Generate timestamps evenly distributed
        // Skip first and last 5% to avoid black frames
        const start = duration * 0.05;
        const end = duration * 0.95;
        const interval = (end - start) / (count + 1);

        const frames = [];

        for (let i = 1; i <= count; i++) {
            const timestamp = start + (interval * i);
            const filename = `frame-${Date.now()}-${i}.jpg`;
            const outputPath = path.join(outputDir, filename);

            await new Promise((resolve, reject) => {
                ffmpeg(videoPath)
                    .screenshots({
                        timestamps: [timestamp],
                        filename: filename,
                        folder: outputDir,
                        size: `${config.width}x${config.height}`
                    })
                    .on('end', resolve)
                    .on('error', reject);
            });

            frames.push({
                time: timestamp,
                path: outputPath.replace(/\\/g, '/'), // Normalize path separators
                url: `http://localhost:3000/${outputPath.replace(/\\/g, '/')}` // Full URL with normalized slashes
            });
        }

        return frames;
    } catch (error) {
        console.error('Error generating thumbnail grid:', error);
        throw new Error(`Failed to generate thumbnails: ${error.message}`);
    }
}

/**
 * Extract auto thumbnail from video (at 3 seconds or 10% of duration, whichever is less)
 * @param {string} videoPath - Path to video file
 * @param {string} outputDir - Directory to save thumbnail
 * @returns {Promise<string>} Path to generated thumbnail
 */
export async function extractAutoThumbnail(videoPath, outputDir = 'uploads/thumbnails') {
    try {
        const duration = await getVideoDuration(videoPath);
        const timestamp = Math.min(3, duration * 0.1); // 3 seconds or 10% of duration

        return await extractThumbnail(videoPath, timestamp, outputDir);
    } catch (error) {
        console.error('Error extracting auto thumbnail:', error);
        throw new Error(`Failed to extract thumbnail: ${error.message}`);
    }
}

/**
 * Save uploaded thumbnail
 * @param {File} thumbnailFile - Uploaded thumbnail file
 * @param {string} videoId - Video ID for naming
 * @param {string} outputDir - Directory to save thumbnail
 * @returns {Promise<string>} Path to saved thumbnail
 */
export async function saveUploadedThumbnail(thumbnailFile, videoId, outputDir = 'uploads/thumbnails') {
    await fs.mkdir(outputDir, { recursive: true });

    const ext = path.extname(thumbnailFile.originalname);
    const filename = `custom-${videoId}${ext}`;
    const outputPath = path.join(outputDir, filename);

    await fs.writeFile(outputPath, thumbnailFile.buffer);

    return outputPath;
}
