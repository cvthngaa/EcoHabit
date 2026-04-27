import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Reward } from './reward.entity';
import { RedemptionStatus } from '../enums/redemption-status.enum';

@Entity('redemptions')
export class Redemption extends BaseEntity {
  @ManyToOne(() => User, (user) => user.redemptions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @ManyToOne(() => Reward, (reward) => reward.redemptions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reward_id' })
  reward?: Reward | null;

  @Column({
    name: 'points_spent',
    type: 'int',
    nullable: true,
  })
  pointsSpent?: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: RedemptionStatus,
    enumName: 'redemption_status',
    nullable: true,
  })
  status?: RedemptionStatus | null;
}
