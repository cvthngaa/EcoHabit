import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from 'src/common/database/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Location } from './location.entity';
import { AcceptedWasteType } from './accepted-waste-type.entity';
import { DropoffStatus } from '../enums/dropoff-status.enum';

@Entity('dropoff_transactions')
export class DropoffTransaction extends BaseEntity {
  @ManyToOne(() => User, (user) => user.dropoffTransactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @ManyToOne(() => Location, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'location_id' })
  location?: Location | null;

  @ManyToOne(() => AcceptedWasteType, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'accepted_waste_type_id' })
  acceptedWasteType?: AcceptedWasteType | null;

  @ManyToOne(() => User, (user) => user.verifiedDropoffs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy?: User | null;

  @Column({
    name: 'quantity_value',
    type: 'float',
    nullable: true,
  })
  quantityValue?: number | null;

  @Column({
    name: 'quantity_unit',
    type: 'text',
    nullable: true,
  })
  quantityUnit?: string | null;

  @Column({
    name: 'points_awarded',
    type: 'int',
    nullable: true,
  })
  pointsAwarded?: number | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DropoffStatus,
    enumName: 'dropoff_status',
    nullable: true,
  })
  status?: DropoffStatus | null;
}
