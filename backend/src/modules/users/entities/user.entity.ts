import { Column, Entity, OneToMany, Index, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { TrashClassification } from '../../ai/entities/trash-classification.entity';

import { DropoffTransaction } from '../../locations/entities/dropoff-transaction.entity';
import { Location } from '../../locations/entities/location.entity';
import { PointRule } from '../../points/entities/point-rule.entity';
import { PointTransaction } from '../../points/entities/point-transaction.entity';
import { Redemption } from '../../rewards/entities/redemption.entity';
import { AiFeedback } from '../../ai/entities/ai-feedback.entity';
import { PartnerProfile } from '../../partner/entity/partner-profile.entity';

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
  })
  passwordHash: string;

  @Column({
    name: 'full_name',
    type: 'varchar',
    length: 100,
  })
  fullName: string;

  @Column({
    name: 'avatar_url',
    type: 'text',
    nullable: true,
  })
  avatarUrl?: string | null;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date | null;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    name: 'points_balance',
    type: 'int',
    default: 0,
  })
  pointsBalance: number;

  @Column({
    name: 'locked_reason',
    type: 'text',
    nullable: true,
  })
  lockedReason?: string | null;

  @Column({
    name: 'locked_at',
    type: 'timestamp',
    nullable: true,
  })
  lockedAt?: Date | null;

  @OneToMany(() => PointRule, (pointRule) => pointRule.createdBy)
  createdPointRules: PointRule[];

  @OneToMany(
    () => PointTransaction,
    (pointTransaction) => pointTransaction.user,
  )
  pointTransactions: PointTransaction[];

  @OneToMany(
    () => TrashClassification,
    (trashClassification) => trashClassification.user,
  )
  trashClassifications: TrashClassification[];

  @OneToMany(() => AiFeedback, (aiFeedback) => aiFeedback.user)
  aiFeedbacks: AiFeedback[];

  @OneToMany(() => Location, (location) => location.createdBy)
  createdLocations: Location[];

  @OneToMany(() => Location, (location) => location.verifiedBy)
  verifiedLocations: Location[];

  @OneToMany(() => DropoffTransaction, (dropoff) => dropoff.user)
  dropoffTransactions: DropoffTransaction[];

  @OneToMany(() => DropoffTransaction, (dropoff) => dropoff.verifiedBy)
  verifiedDropoffs: DropoffTransaction[];

  @OneToMany(() => Redemption, (redemption) => redemption.user)
  redemptions: Redemption[];


  @OneToOne(() => PartnerProfile, (profile) => profile.user)
  partnerProfile?: PartnerProfile;
}
