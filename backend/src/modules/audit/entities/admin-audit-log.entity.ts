import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminAuditAction } from '../enums/admin-audit-action.enum';

@Entity('admin_audit_logs')
export class AdminAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'admin_id', type: 'uuid' })
  adminId: string;

  @Column({ name: 'admin_email', type: 'varchar', length: 255 })
  adminEmail: string;

  @Index()
  @Column({ name: 'target_user_id', type: 'uuid', nullable: true })
  targetUserId?: string | null;

  @Column({
    name: 'action',
    type: 'enum',
    enum: AdminAuditAction,
    enumName: 'admin_audit_action',
  })
  action: AdminAuditAction;

  @Column({ name: 'metadata', type: 'json', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
