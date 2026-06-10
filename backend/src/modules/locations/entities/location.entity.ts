import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, BeforeInsert } from 'typeorm';
import * as crypto from 'crypto';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { LocationStatus } from '../enums/location-status.enum';
import { AcceptedWasteType } from './accepted-waste-type.entity';
import { PartnerProfile } from '../../partner/entity/partner-profile.entity';
import { LocationCapability } from './location-capability.entity';
import { CollectionLocationProfile } from './collection-location-profile.entity';

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
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address?: string | null;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  contactPhone?: string | null;

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

  @ManyToOne(() => PartnerProfile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'partner_profile_id' })
  partnerProfile?: PartnerProfile | null;

  @OneToMany(() => LocationCapability, (capability) => capability.location)
  capabilities: LocationCapability[];

  @OneToOne(() => CollectionLocationProfile, (profile) => profile.location)
  collectionProfile?: CollectionLocationProfile;
}
