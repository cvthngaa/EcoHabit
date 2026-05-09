import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Location } from './location.entity';
import { CollectionSiteType } from '../enums/collection-site-type.enum';

@Entity('collection_location_profiles')
export class CollectionLocationProfile extends BaseEntity {
  @OneToOne(() => Location, (location) => location.collectionProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({
    name: 'site_type',
    type: 'enum',
    enum: CollectionSiteType,
    default: CollectionSiteType.BIN,
  })
  siteType: CollectionSiteType;

  @Column({ name: 'instructions', type: 'text', nullable: true })
  instructions?: string;

  @Column({ name: 'requires_staff_confirmation', type: 'boolean', default: false })
  requiresStaffConfirmation: boolean;
}
