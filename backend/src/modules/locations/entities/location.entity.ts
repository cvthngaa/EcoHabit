import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { LocationType } from '../enums/location-type.enum';
import { LocationStatus } from '../enums/location-status.enum';
import { AcceptedWasteType } from './accepted-waste-type.entity';

@Entity('locations')
export class Location extends BaseEntity {
  @ManyToOne(() => User, (user) => user.createdLocations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User | null;

  @ManyToOne(() => User, (user) => user.verifiedLocations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy?: User | null;

  @Column({
    name: 'name',
    type: 'text',
    nullable: true,
  })
  name?: string | null;

  @Column({
    name: 'type',
    type: 'enum',
    enum: LocationType,
    enumName: 'location_type',
    nullable: true,
  })
  type?: LocationType | null;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address?: string | null;

  @Column({
    name: 'latitude',
    type: 'float',
    nullable: true,
  })
  latitude?: number | null;

  @Column({
    name: 'longitude',
    type: 'float',
    nullable: true,
  })
  longitude?: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: LocationStatus,
    enumName: 'location_status',
    nullable: true,
  })
  status?: LocationStatus | null;

  @OneToMany(() => AcceptedWasteType, (accepted) => accepted.location)
  acceptedWasteTypes: AcceptedWasteType[];
}
