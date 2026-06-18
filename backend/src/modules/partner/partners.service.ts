import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UpdatePartnerApprovalDto } from './dto/update-partner-approval.dto';
import { UpdatePartnerProfileDto } from './dto/update-partner-profile.dto';
import { UpdatePartnerRolesDto } from './dto/update-partner-roles.dto';
import { UpdatePartnerUserStatusDto } from './dto/update-partner-user-status.dto';
import { ListPartnersQueryDto } from './dto/list-partners-query.dto';
import { PartnerProfile } from './entity/partner-profile.entity';
import { PartnerRoleTypeEntity } from './entity/partner-role-type.entity';
import { User } from '../users/entities/user.entity';
import { PartnerApprovalStatus } from './enum/partner-approval-status.enum';
import { PartnerRoleType } from './enum/partner-role-type.enum';
import { AuditService } from '../audit/audit.service';
import { AdminAuditAction } from '../audit/enums/admin-audit-action.enum';
import { Location } from '../locations/entities/location.entity';
import { LocationStatus } from '../locations/enums/location-status.enum';
import { UserStatus } from '../users/enums/user-status.enum';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(PartnerProfile)
    private readonly partnerProfileRepository: Repository<PartnerProfile>,
    @InjectRepository(PartnerRoleTypeEntity)
    private readonly partnerRoleTypeRepository: Repository<PartnerRoleTypeEntity>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly auditService: AuditService,
  ) {}

  async createPartnerProfile(user: User, data: { organizationName: string, contactName: string, contactPhone: string, contactEmail: string }) {
    const profile = this.partnerProfileRepository.create({
      user,
      organizationName: data.organizationName,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      approvalStatus: PartnerApprovalStatus.PENDING
    });
    return this.partnerProfileRepository.save(profile);
  }

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

  // ─── ADMIN ──────────────────────────────────────────────────────────────────

  async getAdminPartnerStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPartners,
      pendingPartners,
      approvedPartners,
      rejectedPartners,
      collectorPartners,
      rewardProviderPartners,
      newPartnersThisMonth,
    ] = await Promise.all([
      this.partnerProfileRepository.count(),
      this.partnerProfileRepository.count({ where: { approvalStatus: PartnerApprovalStatus.PENDING } }),
      this.partnerProfileRepository.count({ where: { approvalStatus: PartnerApprovalStatus.APPROVED } }),
      this.partnerProfileRepository.count({ where: { approvalStatus: PartnerApprovalStatus.REJECTED } }),
      this.partnerRoleTypeRepository.count({ where: { roleType: PartnerRoleType.COLLECTOR, isActive: true } }),
      this.partnerRoleTypeRepository.count({ where: { roleType: PartnerRoleType.REWARD_PROVIDER, isActive: true } }),
      this.partnerProfileRepository
        .createQueryBuilder('p')
        .where('p.created_at >= :start', { start: startOfMonth })
        .getCount(),
    ]);

    return {
      totalPartners,
      pendingPartners,
      approvedPartners,
      rejectedPartners,
      collectorPartners,
      rewardProviderPartners,
      newPartnersThisMonth,
    };
  }

  async getAllPartners(query: ListPartnersQueryDto) {
    const {
      search,
      approvalStatus,
      roleType,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const qb = this.partnerProfileRepository
      .createQueryBuilder('pp')
      .leftJoinAndSelect('pp.user', 'user')
      .leftJoinAndSelect('pp.roleTypes', 'roleTypes');

    if (search) {
      qb.andWhere(
        '(pp.organization_name ILIKE :search OR user.email ILIKE :search OR user.full_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (approvalStatus) {
      qb.andWhere('pp.approval_status = :approvalStatus', { approvalStatus });
    }

    if (roleType) {
      qb.andWhere('roleTypes.role_type = :roleType AND roleTypes.is_active = true', { roleType });
    }

    const sortColumn = sortBy === 'organizationName' ? 'pp.organizationName'
      : sortBy === 'approvalStatus' ? 'pp.approvalStatus'
      : 'pp.createdAt';

    qb.orderBy(sortColumn, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    const sanitized = data.map((p) => this.sanitizePartner(p));

    return {
      data: sanitized,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPartnerDetail(id: string) {
    const profile = await this.partnerProfileRepository.findOne({
      where: { id },
      relations: ['user', 'roleTypes'],
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác');
    }

    return this.sanitizePartner(profile);
  }

  async updatePartnerApproval(
    id: string,
    data: UpdatePartnerApprovalDto,
    adminUserId: string,
    adminName: string,
  ) {
    const profile = await this.partnerProfileRepository.findOne({
      where: { id },
      relations: ['user', 'roleTypes'],
    });
    if (!profile) throw new NotFoundException('Không tìm thấy hồ sơ đối tác');

    profile.approvalStatus = data.status;
    profile.approvedBy = adminUserId;
    profile.approvedAt = new Date();

    await this.partnerProfileRepository.save(profile);

    await this.auditService.log(adminUserId, adminName, AdminAuditAction.PARTNER_APPROVAL, profile.user?.id, {
      partnerProfileId: id,
      organizationName: profile.organizationName,
      newStatus: data.status,
      rejectionReason: data.rejectionReason ?? null,
    });

    return this.sanitizePartner(profile);
  }

  async updatePartnerRoles(
    id: string,
    data: UpdatePartnerRolesDto,
    adminUserId: string,
    adminName: string,
  ) {
    const profile = await this.partnerProfileRepository.findOne({
      where: { id },
      relations: ['user', 'roleTypes'],
    });
    if (!profile) throw new NotFoundException('Không tìm thấy hồ sơ đối tác');

    // Delete existing roles then insert new ones (avoids duplicates)
    await this.partnerRoleTypeRepository.delete({ partnerProfile: { id } });

    const newRoles = data.roles.map((role) => {
      const roleEntity = new PartnerRoleTypeEntity();
      roleEntity.partnerProfile = profile;
      roleEntity.roleType = role;
      roleEntity.isActive = true;
      return roleEntity;
    });

    await this.partnerRoleTypeRepository.save(newRoles);

    await this.auditService.log(adminUserId, adminName, AdminAuditAction.PARTNER_ROLES_UPDATE, profile.user?.id, {
      partnerProfileId: id,
      organizationName: profile.organizationName,
      newRoles: data.roles,
    });

    return this.getPartnerDetail(id);
  }

  async updatePartnerUserStatus(
    id: string,
    dto: UpdatePartnerUserStatusDto,
    adminUserId: string,
    adminName: string,
  ) {
    const profile = await this.partnerProfileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Không tìm thấy hồ sơ đối tác');
    if (!profile.user) throw new InternalServerErrorException('Partner profile has no associated user');

    const user = await this.userRepository.findOne({ where: { id: profile.user.id } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản người dùng');

    user.status = dto.status;
    if (dto.reason) user.lockedReason = dto.reason;
    await this.userRepository.save(user);

    let disabledLocations = 0;
    if (dto.status === UserStatus.LOCKED || dto.status === UserStatus.BANNED) {
      const result = await this.locationRepository
        .createQueryBuilder()
        .update(Location)
        .set({ status: LocationStatus.INACTIVE })
        .where('partner_profile_id = :partnerProfileId', {
          partnerProfileId: profile.id,
        })
        .andWhere('status IN (:...statuses)', {
          statuses: [LocationStatus.APPROVED, LocationStatus.PENDING],
        })
        .execute();

      disabledLocations = result.affected ?? 0;
    }

    await this.auditService.log(adminUserId, adminName, AdminAuditAction.USER_STATUS_CHANGE, user.id, {
      partnerProfileId: id,
      newStatus: dto.status,
      reason: dto.reason ?? null,
      disabledLocations,
    });

    return {
      message: `Partner account status updated to ${dto.status}`,
      userId: user.id,
      status: dto.status,
      disabledLocations,
    };
  }

  // ─── HELPERS ────────────────────────────────────────────────────────────────

  private sanitizePartner(profile: PartnerProfile) {
    const { user, ...rest } = profile as any;
    return {
      ...rest,
      user: user ? {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      } : null,
      roleTypes: profile.roleTypes?.map((rt) => rt.roleType) ?? [],
    };
  }
}
