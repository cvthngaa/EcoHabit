import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { PartnerRoleType } from '../enum/partner-role-type.enum';
import { PartnerProfile } from './partner-profile.entity';

@Entity('partner_role_types')
export class PartnerRoleTypeEntity extends BaseEntity {
  @ManyToOne(() => PartnerProfile, (profile) => profile.roleTypes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'partner_profile_id' })
  partnerProfile: PartnerProfile;

  @Column({
    name: 'role_type',
    type: 'enum',
    enum: PartnerRoleType,
  })
  roleType: PartnerRoleType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
