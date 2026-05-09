import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Location } from './location.entity';

@Entity('collection_qr_sessions')
export class CollectionQrSession extends BaseEntity {
  @ManyToOne(() => Location, (location) => location.qrSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ name: 'qr_token', type: 'varchar', length: 255 })
  qrToken: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;
}
