import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { PartnerApprovalStatus } from '../enum/partner-approval-status.enum';
import { PartnerRoleTypeEntity } from './partner-role-type.entity';

@Entity('partner_profiles')
export class PartnerProfile extends BaseEntity {
  @OneToOne(() => User, (user) => user.partnerProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'organization_name', type: 'varchar', length: 255 })
  organizationName: string;

  @Column({ name: 'organization_type', type: 'varchar', length: 100, nullable: true })
  organizationType?: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 100 })
  contactName: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20 })
  contactPhone: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255 })
  contactEmail: string;

  @Column({ name: 'tax_code', type: 'varchar', length: 50, nullable: true })
  taxCode?: string;

  @Column({ name: 'business_license_url', type: 'text', nullable: true })
  businessLicenseUrl?: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({
    name: 'approval_status',
    type: 'enum',
    enum: PartnerApprovalStatus,
    default: PartnerApprovalStatus.PENDING,
  })
  approvalStatus: PartnerApprovalStatus;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @OneToMany(() => PartnerRoleTypeEntity, (role) => role.partnerProfile, { cascade: true })
  roleTypes: PartnerRoleTypeEntity[];
}
