import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Badge } from './badge.entity';

@Entity('user_badges')
@Unique(['userId', 'badgeId'])
export class UserBadge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'badge_id', type: 'uuid' })
  badgeId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Badge, (badge) => badge.userBadges, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'badge_id' })
  badge: Badge;

  @CreateDateColumn({ name: 'awarded_at', type: 'timestamp' })
  awardedAt: Date;
}
