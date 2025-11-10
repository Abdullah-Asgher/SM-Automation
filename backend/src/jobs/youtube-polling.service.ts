import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { YoutubeChannel } from '../entities/youtube-channel.entity';
import { VideoSyncJob, JobStatus } from '../entities/video-sync-job.entity';
import axios from 'axios';

@Injectable()
export class YoutubePollingService {
  private readonly logger = new Logger(YoutubePollingService.name);

  constructor(
    @InjectRepository(YoutubeChannel)
    private youtubeChannelRepo: Repository<YoutubeChannel>,
    @InjectRepository(VideoSyncJob)
    private videoSyncJobRepo: Repository<VideoSyncJob>,
    @InjectQueue('video-download') private videoDownloadQueue: Queue,
  ) {}

  // Run every 3 hours
  @Cron(CronExpression.EVERY_3_HOURS)
  async pollYoutubeChannels() {
    this.logger.log('Starting YouTube channel polling...');
    
    const channels = await this.youtubeChannelRepo.find({
      where: { isActive: true },
      relations: ['user'],
    });

    for (const channel of channels) {
      try {
        await this.checkForNewVideos(channel);
      } catch (error) {
        this.logger.error(`Error polling channel ${channel.channelId}: ${error.message}`);
      }
    }

    this.logger.log(`Polling completed for ${channels.length} channels.`);
  }

  private async checkForNewVideos(channel: YoutubeChannel) {
    // TODO: Use YouTube Data API to fetch latest videos
    // For now, this is a stub implementation
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      this.logger.warn('YouTube API key not configured');
      return;
    }

    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            key: apiKey,
            channelId: channel.channelId,
            part: 'snippet',
            order: 'date',
            maxResults: 5,
          },
        },
      );

      const videos = response.data.items || [];
      
      for (const video of videos) {
        if (video.id.kind === 'youtube#video') {
          const videoId = video.id.videoId;
          
          // Check if we already processed this video
          const existing = await this.videoSyncJobRepo.findOne({
            where: { youtubeVideoId: videoId, youtubeChannelId: channel.id },
          });

          if (!existing && videoId !== channel.lastVideoId) {
            // New video detected! Create a sync job
            const syncJob = this.videoSyncJobRepo.create({
              userId: channel.userId,
              youtubeChannelId: channel.id,
              youtubeVideoId: videoId,
              title: video.snippet.title,
              description: video.snippet.description,
              thumbnailUrl: video.snippet.thumbnails?.high?.url,
              status: JobStatus.PENDING,
            });

            await this.videoSyncJobRepo.save(syncJob);

            // Add to download queue
            await this.videoDownloadQueue.add('download-video', {
              jobId: syncJob.id,
              videoId: videoId,
            });

            this.logger.log(`New video detected: ${videoId} for channel ${channel.channelName}`);
            
            // Update last video ID
            channel.lastVideoId = videoId;
          }
        }
      }

      channel.lastCheckedAt = new Date();
      await this.youtubeChannelRepo.save(channel);

    } catch (error) {
      this.logger.error(`YouTube API error for channel ${channel.channelId}: ${error.message}`);
    }
  }
}

