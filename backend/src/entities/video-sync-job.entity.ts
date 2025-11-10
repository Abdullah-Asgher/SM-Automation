import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { YoutubeChannel } from './youtube-channel.entity';

export enum JobStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  UPLOADING = 'uploading',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('video_sync_jobs')
export class VideoSyncJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  youtubeChannelId: string;

  @ManyToOne(() => YoutubeChannel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'youtubeChannelId' })
  youtubeChannel: YoutubeChannel;

  @Column()
  youtubeVideoId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  hashtags: string[];

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  localVideoPath: string; // temp storage path

  @Column({ nullable: true })
  s3VideoUrl: string; // S3 storage URL

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column({ type: 'json', nullable: true })
  uploadStatuses: any; // track upload status per platform {facebook: 'success', instagram: 'pending', ...}

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ default: false })
  requiresUserEdit: boolean; // if user enabled manual editing toggle

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

