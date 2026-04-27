import { Column, Entity, OneToMany, DeleteDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { TrashClassification } from '../../ai/entities/trash-classification.entity';
import { ForumComment } from '../../forum/entities/forum-comment.entity';
import { ForumPost } from '../../forum/entities/forum-post.entity';
import { ForumReport } from '../../forum/entities/forum-report.entity';
import { DropoffTransaction } from '../../locations/entities/dropoff-transaction.entity';
import { Location } from '../../locations/entities/location.entity';
import { PointRule } from '../../points/entities/point-rule.entity';
import { PointTransaction } from '../../points/entities/point-transaction.entity';
import { Redemption } from '../../rewards/entities/redemption.entity';
import { AiFeedback } from '../../ai/entities/ai-feedback.entity';

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

  @OneToMany(() => ForumPost, (post) => post.author)
  forumPosts: ForumPost[];

  @OneToMany(() => ForumComment, (comment) => comment.author)
  forumComments: ForumComment[];

  @OneToMany(() => ForumReport, (report) => report.reporter)
  forumReports: ForumReport[];
}
