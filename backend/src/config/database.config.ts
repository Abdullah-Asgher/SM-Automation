import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ConnectedAccount } from '../entities/connected-account.entity';
import { YoutubeChannel } from '../entities/youtube-channel.entity';
import { VideoSyncJob } from '../entities/video-sync-job.entity';
import { Notification } from '../entities/notification.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sm_automation',
  entities: [User, ConnectedAccount, YoutubeChannel, VideoSyncJob, Notification],
  synchronize: process.env.NODE_ENV === 'development', // auto-sync in dev, use migrations in prod
  logging: process.env.NODE_ENV === 'development',
};

