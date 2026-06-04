import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { FraudSourceType } from '../enums/fraud-source-type.enum';
import { FraudSeverity } from '../enums/fraud-severity.enum';
import { FraudStatus } from '../enums/fraud-status.enum';

@Entity('fraud_flags')
export class FraudFlag extends BaseEntity {
  /** User bị gắn flag (nullable nếu chưa xác định) */
  @Index()
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  /** Nguồn phát sinh cảnh báo */
  @Index()
  @Column({
    name: 'source_type',
    type: 'enum',
    enum: FraudSourceType,
    enumName: 'fraud_source_type',
  })
  sourceType: FraudSourceType;

  /** ID của bản ghi nguồn (transaction ID, classification ID, …) */
  @Column({ name: 'source_id', type: 'varchar', length: 255, nullable: true })
  sourceId?: string | null;

  /** Mã flag ngắn, dùng để filter (e.g. CHECKIN_TOO_FAR) */
  @Index()
  @Column({ name: 'flag_code', type: 'varchar', length: 100 })
  flagCode: string;

  /** Mô tả chi tiết cảnh báo */
  @Column({ name: 'description', type: 'text' })
  description: string;

  /** Mức độ nghiêm trọng */
  @Column({
    name: 'severity',
    type: 'enum',
    enum: FraudSeverity,
    enumName: 'fraud_severity',
  })
  severity: FraudSeverity;

  /** Trạng thái xử lý */
  @Index()
  @Column({
    name: 'status',
    type: 'enum',
    enum: FraudStatus,
    enumName: 'fraud_status',
    default: FraudStatus.OPEN,
  })
  status: FraudStatus;

  /** Metadata bổ sung (distanceKm, dailyPoints, …) */
  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  /** Admin đã review flag */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: User | null;

  /** Thời điểm admin review */
  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;
}
