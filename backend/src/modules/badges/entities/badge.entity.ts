import {
  Column,
  Entity,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { BadgeConditionType } from '../enums/badge-condition-type.enum';
import { UserBadge } from './user-badge.entity';

@Entity('badges')
export class Badge extends BaseEntity {
  @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ name: 'name', type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'icon', type: 'varchar', length: 255, nullable: true })
  icon: string | null;

  @Column({
    name: 'condition_type',
    type: 'enum',
    enum: BadgeConditionType,
  })
  conditionType: BadgeConditionType;

  @Column({ name: 'threshold', type: 'int', default: 1 })
  threshold: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => UserBadge, (ub) => ub.badge)
  userBadges: UserBadge[];
}
