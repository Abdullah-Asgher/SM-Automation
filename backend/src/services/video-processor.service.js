import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promisify } from 'util';

// Get video metadata
export async function processVideo(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');

            resolve({
                duration: Math.floor(metadata.format.duration),
                width: videoStream?.width || 0,
                height: videoStream?.height || 0,
                codec: videoStream?.codec_name || 'unknown',
                bitrate: metadata.format.bit_rate || 0,
            });
        });
    });
}

// Generate thumbnail from video
export async function generateThumbnail(videoPath, timestamp = '00:00:01') {
    const thumbnailPath = videoPath.replace(path.extname(videoPath), '_thumb.jpg');

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                timestamps: [timestamp],
                filename: path.basename(thumbnailPath),
                folder: path.dirname(thumbnailPath),
                size: '640x?',
            })
            .on('end', () => resolve(thumbnailPath))
            .on('error', reject);
    });
}

// Optimize video for specific platform
export async function optimizeForPlatform(videoPath, platform) {
    const outputPath = videoPath.replace(
        path.extname(videoPath),
        `_${platform}${path.extname(videoPath)}`
    );

    const platformSpecs = {
        youtube: {
            size: '1080x1920',  // 9:16 vertical
            videoBitrate: '5000k',
            audioBitrate: '128k',
        },
        tiktok: {
            size: '1080x1920',  // 9:16 vertical
            videoBitrate: '4000k',
            audioBitrate: '128k',
        },
        instagram: {
            size: '1080x1920',  // 9:16 vertical
            videoBitrate: '3500k',
            audioBitrate: '128k',
        },
        facebook: {
            size: '1080x1920',  // 9:16 vertical
            videoBitrate: '4000k',
            audioBitrate: '128k',
        },
    };

    const specs = platformSpecs[platform.toLowerCase()] || platformSpecs.youtube;

    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .size(specs.size)
            .videoBitrate(specs.videoBitrate)
            .audioBitrate(specs.audioBitrate)
            .videoCodec('libx264')
            .audioCodec('aac')
            .format('mp4')
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', reject)
            .run();
    });
}

// Validate video meets platform requirements
export async function validateVideo(filePath) {
    const metadata = await processVideo(filePath);

    const errors = [];

    // Check duration (max 60 seconds for shorts)
    if (metadata.duration > 60) {
        errors.push('Video must be 60 seconds or less for shorts');
    }

    // Check aspect ratio (should be 9:16 for shorts)
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio < 0.5 || aspectRatio > 0.6) {
        // Not strictly 9:16, but we can fix this with optimization
        console.warn('Video aspect ratio is not 9:16, will be optimized');
    }

    return {
        valid: errors.length === 0,
        errors,
        metadata,
    };
}
