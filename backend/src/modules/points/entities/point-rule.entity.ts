import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { PointEventType } from '../enums/point-event-type.enum';
import { User } from '../../users/entities/user.entity';

@Entity('point_rules')
export class PointRule extends BaseEntity {
  @Index({ unique: true })
  @Column({
    name: 'code',
    type: 'varchar',
    length: 50,
  })
  code: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: PointEventType,
  })
  eventType: PointEventType;

  @Column({
    name: 'points',
    type: 'int',
  })
  points: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.createdPointRules, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User | null;
}
