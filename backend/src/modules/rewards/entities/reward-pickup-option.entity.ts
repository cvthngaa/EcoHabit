import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Reward } from './reward.entity';
import { Location } from '../../locations/entities/location.entity';

@Entity('reward_pickup_options')
export class RewardPickupOption extends BaseEntity {
  @ManyToOne(() => Reward, (reward) => reward.pickupOptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reward_id' })
  reward: Reward;

  @ManyToOne(() => Location, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
