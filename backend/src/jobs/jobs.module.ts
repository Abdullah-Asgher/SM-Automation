import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeChannel, VideoSyncJob, ConnectedAccount } from '../entities';
import { YoutubePollingService } from './youtube-polling.service';
import { VideoDownloadProcessor } from './video-download.processor';
import { VideoUploadProcessor } from './video-upload.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue(
      { name: 'video-download' },
      { name: 'video-upload' },
    ),
    TypeOrmModule.forFeature([YoutubeChannel, VideoSyncJob, ConnectedAccount]),
  ],
  providers: [YoutubePollingService, VideoDownloadProcessor, VideoUploadProcessor],
  exports: [YoutubePollingService],
})
export class JobsModule {}

