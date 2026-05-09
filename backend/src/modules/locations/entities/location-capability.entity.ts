import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Location } from './location.entity';
import { LocationCapabilityType } from '../enums/location-capability-type.enum';

@Entity('location_capabilities')
export class LocationCapability extends BaseEntity {
  @ManyToOne(() => Location, (location) => location.capabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({
    name: 'capability',
    type: 'enum',
    enum: LocationCapabilityType,
  })
  capability: LocationCapabilityType;
}
