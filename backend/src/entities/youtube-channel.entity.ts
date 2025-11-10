import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('youtube_channels')
export class YoutubeChannel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  channelId: string; // YouTube channel ID

  @Column()
  channelName: string;

  @Column({ nullable: true })
  channelThumbnail: string;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @Column({ nullable: true })
  lastVideoId: string; // track the last synced video to detect new uploads

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

