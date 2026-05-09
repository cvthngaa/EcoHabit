import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerProfile } from './entity/partner-profile.entity';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(PartnerProfile)
    private readonly partnerProfileRepository: Repository<PartnerProfile>,
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

  getMyProfile(userId: string) {
    throw new NotImplementedException(
      `Partner profile lookup is not implemented yet for user ${userId}`,
    );
  }

  updateMyProfile(userId: string, _data: unknown) {
    throw new NotImplementedException(
      `Partner profile update is not implemented yet for user ${userId}`,
    );
  }

  getAllPartners() {
    throw new NotImplementedException('Partner listing is not implemented yet');
  }

  getPartnerDetail(id: string) {
    throw new NotImplementedException(
      `Partner detail lookup is not implemented yet for partner ${id}`,
    );
  }

  updatePartnerApproval(id: string, _data: unknown, adminUserId: string) {
    throw new NotImplementedException(
      `Partner approval update is not implemented yet for partner ${id} by admin ${adminUserId}`,
    );
  }

  updatePartnerRoles(id: string, _data: unknown) {
    throw new NotImplementedException(
      `Partner role update is not implemented yet for partner ${id}`,
    );
  }
}
