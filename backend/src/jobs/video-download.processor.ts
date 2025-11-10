import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VideoSyncJob, JobStatus } from '../entities/video-sync-job.entity';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Processor('video-download')
export class VideoDownloadProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoDownloadProcessor.name);

  constructor(
    @InjectRepository(VideoSyncJob)
    private videoSyncJobRepo: Repository<VideoSyncJob>,
    @InjectQueue('video-upload') private videoUploadQueue: Queue,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { jobId, videoId } = job.data;

    this.logger.log(`Processing download for job ${jobId}, video ${videoId}`);

    const syncJob = await this.videoSyncJobRepo.findOne({ where: { id: jobId } });
    if (!syncJob) {
      this.logger.error(`Sync job ${jobId} not found`);
      return;
    }

    try {
      syncJob.status = JobStatus.DOWNLOADING;
      await this.videoSyncJobRepo.save(syncJob);

      // TODO: Implement actual video download using ytdl-core or similar
      // For now, mock the download
      const videoPath = await this.downloadVideo(videoId);

      syncJob.localVideoPath = videoPath;
      syncJob.status = JobStatus.UPLOADING;
      await this.videoSyncJobRepo.save(syncJob);

      // Add to upload queue
      await this.videoUploadQueue.add('upload-video', {
        jobId: syncJob.id,
      });

      this.logger.log(`Video ${videoId} downloaded successfully`);
    } catch (error) {
      this.logger.error(`Error downloading video ${videoId}: ${error.message}`);
      syncJob.status = JobStatus.FAILED;
      syncJob.errorMessage = error.message;
      await this.videoSyncJobRepo.save(syncJob);
    }
  }

  private async downloadVideo(videoId: string): Promise<string> {
    // TODO: Implement actual download logic with ytdl-core
    // Mock implementation for now
    const downloadDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const videoPath = path.join(downloadDir, `${videoId}.mp4`);
    
    // Placeholder: In production, use ytdl-core or YouTube API
    this.logger.warn('Video download is mocked - implement ytdl-core integration');
    
    return videoPath;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}

