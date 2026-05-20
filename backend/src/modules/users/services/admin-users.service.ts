import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserStatus } from '../enums/user-status.enum';
import { PointTransaction } from '../../points/entities/point-transaction.entity';
import { Redemption } from '../../rewards/entities/redemption.entity';
import { DropoffTransaction } from '../../locations/entities/dropoff-transaction.entity';
import { TrashClassification } from '../../ai/entities/trash-classification.entity';
import { AuditService } from '../../audit/audit.service';
import { AdminAuditAction } from '../../audit/enums/admin-audit-action.enum';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(PointTransaction)
    private readonly pointTxRepository: Repository<PointTransaction>,

    @InjectRepository(Redemption)
    private readonly redemptionRepository: Repository<Redemption>,

    @InjectRepository(DropoffTransaction)
    private readonly dropoffRepository: Repository<DropoffTransaction>,

    @InjectRepository(TrashClassification)
    private readonly classificationRepository: Repository<TrashClassification>,

    private readonly auditService: AuditService,
  ) {}

  // ─── GET /admin/users ───────────────────────────────────────────────────────

  async listUsers(query: ListUsersQueryDto) {
    const { role, status, search, page = 1, limit = 20 } = query;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    // search khớp email hoặc fullName
    const whereConditions = search
      ? [
          { ...where, email: ILike(`%${search}%`) },
          { ...where, fullName: ILike(`%${search}%`) },
        ]
      : [where];

    const [users, total] = await this.userRepository.findAndCount({
      where: whereConditions,
      select: [
        'id',
        'email',
        'fullName',
        'avatarUrl',
        'role',
        'status',
        'pointsBalance',
        'createdAt',
        'lockedAt',
        'lockedReason',
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── GET /admin/users/:id ───────────────────────────────────────────────────

  async getUserDetail(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'fullName',
        'avatarUrl',
        'role',
        'status',
        'pointsBalance',
        'lockedReason',
        'lockedAt',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User ${id} không tồn tại`);
    }

    return user;
  }

  // ─── PATCH /admin/users/:id/status ─────────────────────────────────────────

  async updateUserStatus(
    id: string,
    dto: UpdateUserStatusDto,
    adminId: string,
    adminEmail: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} không tồn tại`);

    const isRestricted =
      dto.status === UserStatus.LOCKED || dto.status === UserStatus.BANNED;

    if (isRestricted && !dto.reason?.trim()) {
      throw new BadRequestException(
        'Bắt buộc cung cấp lý do khi khóa hoặc ban tài khoản',
      );
    }

    const previousStatus = user.status;

    user.status = dto.status;
    user.lockedReason = isRestricted ? dto.reason!.trim() : null;
    user.lockedAt = isRestricted ? new Date() : null;

    await this.userRepository.save(user);

    // Ghi audit log
    await this.auditService.log(adminId, adminEmail, AdminAuditAction.USER_STATUS_CHANGE, id, {
      previousStatus,
      newStatus: dto.status,
      reason: dto.reason ?? null,
    });

    return {
      message: `Trạng thái user đã được cập nhật thành ${dto.status}`,
      userId: id,
      status: dto.status,
    };
  }

  // ─── PATCH /admin/users/:id/profile ────────────────────────────────────────

  async updateUserProfile(
    id: string,
    dto: UpdateUserProfileDto,
    adminId: string,
    adminEmail: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} không tồn tại`);

    const changes: Record<string, any> = {};
    if (dto.fullName !== undefined) {
      changes.fullName = { from: user.fullName, to: dto.fullName };
      user.fullName = dto.fullName;
    }
    if (dto.avatarUrl !== undefined) {
      changes.avatarUrl = { from: user.avatarUrl, to: dto.avatarUrl };
      user.avatarUrl = dto.avatarUrl;
    }

    if (Object.keys(changes).length === 0) {
      return { message: 'Không có thay đổi nào được gửi lên' };
    }

    await this.userRepository.save(user);

    await this.auditService.log(adminId, adminEmail, AdminAuditAction.USER_PROFILE_UPDATE, id, {
      changes,
    });

    return {
      message: 'Hồ sơ user đã được cập nhật',
      userId: id,
    };
  }

  // ─── GET /admin/users/:id/activity ─────────────────────────────────────────

  async getUserActivity(id: string) {
    const userExists = await this.userRepository.findOne({
      where: { id },
      select: ['id'],
    });
    if (!userExists) throw new NotFoundException(`User ${id} không tồn tại`);

    const [pointTransactions, redemptions, dropoffs, classifications] =
      await Promise.all([
        // Lịch sử giao dịch điểm
        this.pointTxRepository.find({
          where: { user: { id } },
          order: { createdAt: 'DESC' },
          take: 50,
          select: [
            'id',
            'type',
            'points',
            'balanceAfter',
            'sourceType',
            'sourceId',
            'reasonCode',
            'note',
            'createdAt',
          ],
        }),

        // Lịch sử đổi quà
        this.redemptionRepository.find({
          where: { user: { id } },
          relations: ['reward'],
          order: { createdAt: 'DESC' },
          take: 50,
        }),

        // Lịch sử thu gom
        this.dropoffRepository.find({
          where: { user: { id } },
          relations: ['location', 'acceptedWasteType'],
          order: { createdAt: 'DESC' },
          take: 50,
        }),

        // Lịch sử phân loại rác
        this.classificationRepository.find({
          where: { user: { id } },
          order: { createdAt: 'DESC' },
          take: 50,
          select: [
            'id',
            'predictedLabel',
            'predictedWasteType',
            'confidence',
            'suggestedBin',
            'status',
            'createdAt',
          ],
        }),
      ]);

    return {
      userId: id,
      pointTransactions,
      redemptions,
      dropoffs,
      trashClassifications: classifications,
    };
  }
}
