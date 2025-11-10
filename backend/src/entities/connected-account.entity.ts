import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum SocialPlatform {
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
}

@Entity('connected_accounts')
export class ConnectedAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, user => user.connectedAccounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: SocialPlatform })
  platform: SocialPlatform;

  @Column()
  accountId: string; // platform-specific user/page ID

  @Column({ nullable: true })
  accountName: string;

  @Column({ type: 'text' })
  accessToken: string; // encrypted in production

  @Column({ type: 'text', nullable: true })
  refreshToken: string; // encrypted in production

  @Column({ type: 'bigint', nullable: true })
  expiresAt: number; // Unix timestamp

  @Column({ type: 'json', nullable: true })
  metadata: any; // store extra platform-specific data

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

