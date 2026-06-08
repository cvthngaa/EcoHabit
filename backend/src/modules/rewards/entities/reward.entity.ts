import { Column, Entity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { RewardStatus } from '../enums/reward-status.enum';
import { Redemption } from './redemption.entity';
import { PartnerProfile } from '../../partner/entity/partner-profile.entity';
import { RewardPickupOption } from './reward-pickup-option.entity';

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
    name: 'thumbnail_url',
    type: 'text',
    nullable: true,
  })
  thumbnailUrl?: string | null;

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

  @ManyToOne(() => PartnerProfile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_profile_id' })
  partnerProfile?: PartnerProfile | null;

  @OneToMany(() => RewardPickupOption, (option) => option.reward)
  pickupOptions: RewardPickupOption[];
}
