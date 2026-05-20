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

  @Column({ name: 'organization_name', type: 'text' })
  organizationName: string;

  @Column({ name: 'organization_type', type: 'text', nullable: true })
  organizationType?: string;

  @Column({ name: 'contact_name', type: 'text', nullable: true })
  contactName?: string;

  @Column({ name: 'contact_phone', type: 'text', nullable: true })
  contactPhone?: string;

  @Column({ name: 'contact_email', type: 'text', nullable: true })
  contactEmail?: string;

  @Column({ name: 'tax_code', type: 'text', nullable: true })
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
