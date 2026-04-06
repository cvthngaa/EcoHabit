import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/common/database/base.entity';
import { RewardStatus } from '../enums/reward-status.enum';
import { Redemption } from './redemption.entity';

@Entity('rewards')
export class Reward extends BaseEntity {
  @Column({
    name: 'name',
    type: 'text',
    nullable: true,
  })
  name?: string | null;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'points_cost',
    type: 'int',
    nullable: true,
  })
  pointsCost?: number | null;

  @Column({
    name: 'stock',
    type: 'int',
    nullable: true,
  })
  stock?: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: RewardStatus,
    enumName: 'reward_status',
    nullable: true,
  })
  status?: RewardStatus | null;


  @OneToMany(() => Redemption, (redemption) => redemption.reward)
  redemptions: Redemption[];
}
