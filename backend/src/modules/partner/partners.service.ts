import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdatePartnerApprovalDto } from './dto/update-partner-approval.dto';
import { UpdatePartnerProfileDto } from './dto/update-partner-profile.dto';
import { UpdatePartnerRolesDto } from './dto/update-partner-roles.dto';
import { PartnerProfile } from './entity/partner-profile.entity';
import { PartnerRoleTypeEntity } from './entity/partner-role-type.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(PartnerProfile)
    private readonly partnerProfileRepository: Repository<PartnerProfile>,
    @InjectRepository(PartnerRoleTypeEntity)
    private readonly partnerRoleTypeRepository: Repository<PartnerRoleTypeEntity>,
  ) {}

  async getPartnerSummaryByUserId(userId: string) {
    const profile = await this.partnerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['roleTypes'],
    });

    if (!profile) return null;

    return {
      id: profile.id,
      organizationName: profile.organizationName,
      approvalStatus: profile.approvalStatus,
      roleTypes: profile.roleTypes.map((rt) => rt.roleType),
    };
  }

  async getMyProfile(userId: string) {
    const profile = await this.partnerProfileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['roleTypes'],
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác cho người dùng này');
    }

    return profile;
  }

  async updateMyProfile(userId: string, data: UpdatePartnerProfileDto) {
    const profile = await this.getMyProfile(userId);

    Object.assign(profile, data);
    return this.partnerProfileRepository.save(profile);
  }

  async getAllPartners() {
    return this.partnerProfileRepository.find({
      relations: ['user', 'roleTypes'],
    });
  }

  async getPartnerDetail(id: string) {
    const profile = await this.partnerProfileRepository.findOne({
      where: { id },
      relations: ['user', 'roleTypes'],
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác');
    }

    return profile;
  }

  async updatePartnerApproval(
    id: string,
    data: UpdatePartnerApprovalDto,
    adminUserId: string,
  ) {
    const profile = await this.getPartnerDetail(id);

    profile.approvalStatus = data.status;
    profile.approvedBy = adminUserId;
    profile.approvedAt = new Date();

    return this.partnerProfileRepository.save(profile);
  }

  async updatePartnerRoles(id: string, data: UpdatePartnerRolesDto) {
    const profile = await this.getPartnerDetail(id);

    // Delete existing roles
    await this.partnerRoleTypeRepository.delete({ partnerProfile: { id } });

    // Insert new roles
    const newRoles = data.roles.map((role) => {
      const roleEntity = new PartnerRoleTypeEntity();
      roleEntity.partnerProfile = profile;
      roleEntity.roleType = role;
      roleEntity.isActive = true;
      return roleEntity;
    });

    await this.partnerRoleTypeRepository.save(newRoles);

    // Reload profile with new roles
    return this.getPartnerDetail(id);
  }
}
