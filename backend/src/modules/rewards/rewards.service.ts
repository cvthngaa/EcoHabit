import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, ILike, Between, IsNull, Not } from 'typeorm';
import { Reward } from './entities/reward.entity';
import { RewardPickupOption } from './entities/reward-pickup-option.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Redemption } from './entities/redemption.entity';
import { RedeemDto } from './dto/redeem.dto';
import { RewardStatus } from './enums/reward-status.enum';
import { RedemptionStatus } from './enums/redemption-status.enum';
import { PointsService } from '../points/points.service';
import { PointSourceType } from '../points/enums/point-source-type.enum';
import { PointTransactionType } from '../points/enums/point-transaction-type.enum';
import { UpdateRedemptionStatusDto } from './dto/update-redemption-status.dto';
import { AuditService } from '../audit/audit.service';
import { AdminAuditAction } from '../audit/enums/admin-audit-action.enum';
import { ListRewardsQueryDto } from './dto/list-rewards-query.dto';
import { ListRedemptionsQueryDto } from './dto/list-redemptions-query.dto';
import { UpdateRewardStatusDto } from './dto/update-reward-status.dto';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepo: Repository<Reward>,
    @InjectRepository(Redemption)
    private readonly redemptionRepo: Repository<Redemption>,
    @InjectRepository(RewardPickupOption)
    private readonly pickupOptionRepo: Repository<RewardPickupOption>,
    private readonly dataSource: DataSource,
    private readonly pointsService: PointsService,
    private readonly auditService: AuditService,
  ) {}

  async getAllRewards() {
    return this.rewardRepo.find();
  }

  async getTopRewards(limit = 5) {
    const safeLimit = Math.min(Math.max(limit, 1), 20);
    const countedStatuses = [
      RedemptionStatus.PENDING,
      RedemptionStatus.APPROVED,
      RedemptionStatus.FULFILLED,
    ];

    return this.rewardRepo
      .createQueryBuilder('reward')
      .leftJoin(
        'reward.redemptions',
        'redemption',
        'redemption.status IN (:...countedStatuses)',
        { countedStatuses },
      )
      .where('reward.status = :active', { active: RewardStatus.ACTIVE })
      .select('reward.id', 'id')
      .addSelect('reward.name', 'name')
      .addSelect('reward.description', 'description')
      .addSelect('reward.pointsCost', 'pointsCost')
      .addSelect('reward.stock', 'stock')
      .addSelect('reward.status', 'status')
      .addSelect('COUNT(redemption.id)', 'redeemCount')
      .groupBy('reward.id')
      .addGroupBy('reward.name')
      .addGroupBy('reward.description')
      .addGroupBy('reward.pointsCost')
      .addGroupBy('reward.stock')
      .addGroupBy('reward.status')
      .orderBy('COUNT(redemption.id)', 'DESC')
      .addOrderBy('reward.id', 'ASC')
      .limit(safeLimit)
      .getRawMany();
  }

  async getRewards(id: string) {
    return this.rewardRepo.findOne({ 
      where: { id },
      relations: ['pickupOptions', 'pickupOptions.location', 'partnerProfile'] 
    });
  }

  async getPartnerRewards(partnerProfileId: string) {
    return this.rewardRepo.find({
      where: { partnerProfile: { id: partnerProfileId } },
      relations: ['pickupOptions', 'pickupOptions.location'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── ADMIN REWARDS ──────────────────────────────────────────────────────────

  async getAdminRewards(query: ListRewardsQueryDto) {
    const {
      search,
      status,
      partnerId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};
    if (status) where.status = status;
    if (partnerId) where.partnerProfile = { id: partnerId };
    
    const whereConditions = search
      ? [
          { ...where, name: ILike(`%${search}%`) },
        ]
      : [where];

    const [data, total] = await this.rewardRepo.findAndCount({
      where: whereConditions,
      relations: ['partnerProfile'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminRewardStats() {
    // Low stock condition: stock <= 10 and stock > 0
    const [
      totalRewards,
      activeRewards,
      inactiveRewards,
      outOfStockRewards,
      lowStockRewards,
      totalRedemptions,
      pendingRedemptions,
      completedRedemptions,
      cancelledRedemptions,
    ] = await Promise.all([
      this.rewardRepo.count(),
      this.rewardRepo.count({ where: { status: RewardStatus.ACTIVE } }),
      this.rewardRepo.count({ where: { status: RewardStatus.INACTIVE } }),
      this.rewardRepo.count({ where: { stock: 0 } }),
      this.rewardRepo.count({ where: { stock: Between(1, 10) } }),
      
      this.redemptionRepo.count(),
      this.redemptionRepo.count({ where: { status: RedemptionStatus.PENDING } }),
      this.redemptionRepo.count({ where: { status: RedemptionStatus.FULFILLED } }),
      this.redemptionRepo.count({ where: { status: RedemptionStatus.CANCELED } }),
    ]);

    return {
      totalRewards,
      activeRewards,
      inactiveRewards,
      outOfStockRewards,
      lowStockRewards,
      totalRedemptions,
      pendingRedemptions,
      completedRedemptions,
      cancelledRedemptions,
    };
  }

  // ─── CRUD REWARDS ───────────────────────────────────────────────────────────

  async createRewards(
    data: CreateRewardDto, 
    partnerProfileId?: string,
    adminId?: string,
    adminEmail?: string,
  ) {
    const { pickupLocationIds, ...rewardData } = data;
    
    const reward = this.rewardRepo.create({
      ...rewardData,
      partnerProfile: partnerProfileId ? { id: partnerProfileId } : null,
    });
    const savedReward = await this.rewardRepo.save(reward);

    if (pickupLocationIds && pickupLocationIds.length > 0) {
      const options = pickupLocationIds.map(locId => this.pickupOptionRepo.create({
        reward: { id: savedReward.id },
        location: { id: locId },
      }));
      await this.pickupOptionRepo.save(options);
    }

    if (adminId && adminEmail) {
      await this.auditService.log(adminId, adminEmail, AdminAuditAction.REWARD_CREATE, null, {
        rewardId: savedReward.id,
        rewardName: savedReward.name,
      });
    }

    return this.getRewards(savedReward.id);
  }

  async updateRewards(
    id: string, 
    data: UpdateRewardDto, 
    partnerProfileId?: string,
    adminId?: string,
    adminEmail?: string,
  ) {
    const reward = await this.rewardRepo.findOne({ where: { id }, relations: ['partnerProfile'] });
    if (!reward) throw new NotFoundException(`Reward ${id} not found`);

    if (partnerProfileId && reward.partnerProfile?.id !== partnerProfileId) {
      throw new ForbiddenException('You can only update your own rewards');
    }

    const { pickupLocationIds, ...rewardData } = data;
    const previousState = { name: reward.name, pointsCost: reward.pointsCost, stock: reward.stock };
    
    Object.assign(reward, rewardData);
    const updatedReward = await this.rewardRepo.save(reward);

    if (pickupLocationIds !== undefined) {
      // Clear old
      await this.pickupOptionRepo.delete({ reward: { id: updatedReward.id } });
      
      // Add new
      if (pickupLocationIds.length > 0) {
        const options = pickupLocationIds.map(locId => this.pickupOptionRepo.create({
          reward: { id: updatedReward.id },
          location: { id: locId },
        }));
        await this.pickupOptionRepo.save(options);
      }
    }

    if (adminId && adminEmail) {
      await this.auditService.log(adminId, adminEmail, AdminAuditAction.REWARD_UPDATE, null, {
        rewardId: updatedReward.id,
        changes: rewardData,
        previousState,
      });
    }

    return this.getRewards(updatedReward.id);
  }

  async updateRewardStatus(
    id: string,
    dto: UpdateRewardStatusDto,
    adminId: string,
    adminEmail: string,
  ) {
    const reward = await this.rewardRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException(`Reward ${id} not found`);

    const previousStatus = reward.status;
    reward.status = dto.status;
    await this.rewardRepo.save(reward);

    await this.auditService.log(adminId, adminEmail, AdminAuditAction.REWARD_UPDATE, null, {
      rewardId: id,
      action: 'STATUS_CHANGE',
      previousStatus,
      newStatus: dto.status,
    });

    return {
      message: `Reward status updated to ${dto.status}`,
      rewardId: id,
      status: dto.status,
    };
  }

  async deleteRewards(
    id: string, 
    partnerProfileId?: string,
    adminId?: string,
    adminEmail?: string,
  ) {
    const reward = await this.rewardRepo.findOne({ where: { id }, relations: ['partnerProfile'] });
    if (!reward) throw new NotFoundException(`Reward ${id} not found`);
    
    if (partnerProfileId && reward.partnerProfile?.id !== partnerProfileId) {
      throw new ForbiddenException('You can only delete your own rewards');
    }

    const result = await this.rewardRepo.remove(reward);

    if (adminId && adminEmail) {
      await this.auditService.log(adminId, adminEmail, AdminAuditAction.REWARD_DELETE, null, {
        rewardId: id,
        rewardName: reward.name,
      });
    }

    return result;
  }

  // ─── REDEMPTIONS ────────────────────────────────────────────────────────────

  async redeemReward(userId: string, dto: RedeemDto) {
    return this.dataSource.transaction(async (manager) => {
      const rewardRepo = manager.getRepository(Reward);
      const redemptionRepo = manager.getRepository(Redemption);

      const reward = await rewardRepo.findOne({ where: { id: dto.rewardId } });
      if (!reward) {
        throw new NotFoundException(`Reward ${dto.rewardId} not found`);
      }

      this.assertRewardRedeemable(reward);

      const pointsCost = reward.pointsCost ?? 0;
      if (pointsCost <= 0) {
        throw new BadRequestException('Reward points cost is invalid');
      }

      const stock = reward.stock ?? null;
      if (stock !== null && stock <= 0) {
        throw new BadRequestException('Reward is out of stock');
      }

      const redemption = redemptionRepo.create({
        user: { id: userId },
        reward: { id: reward.id },
        pointsSpent: pointsCost,
        status: RedemptionStatus.PENDING,
      });

      const savedRedemption = await redemptionRepo.save(redemption);

      const pointTransaction = await this.pointsService.deductPoints(
        userId,
        pointsCost,
        PointSourceType.REDEMPTION,
        savedRedemption.id,
        'REDEMPTION',
        `Redeemed reward ${reward.id}`,
        manager,
      );

      if (stock !== null) {
        reward.stock = stock - 1;
        await rewardRepo.save(reward);
      }

      return {
        redemption: savedRedemption,
        reward: {
          id: reward.id,
          name: reward.name,
          stock: reward.stock,
          status: reward.status,
        },
        pointsSpent: pointsCost,
        balanceAfter: pointTransaction.balanceAfter,
      };
    });
  }

  async getUserRedemptions(userId: string) {
    return this.redemptionRepo.find({
      where: { user: { id: userId } },
      relations: ['reward', 'reward.pickupOptions', 'reward.pickupOptions.location'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPartnerRedemptions(partnerProfileId: string) {
    return this.redemptionRepo.find({
      where: { reward: { partnerProfile: { id: partnerProfileId } } },
      relations: ['user', 'reward', 'reward.pickupOptions', 'reward.pickupOptions.location'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminRedemptions(query: ListRedemptionsQueryDto) {
    const {
      status,
      userId,
      rewardId,
      partnerId,
      from,
      to,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.user = { id: userId };
    if (rewardId) where.reward = { id: rewardId };
    if (partnerId) where.reward = { ...where.reward, partnerProfile: { id: partnerId } };
    
    if (from || to) {
      where.createdAt = Between(
        from ? new Date(from) : new Date(0),
        to ? new Date(to) : new Date(),
      );
    }

    const [data, total] = await this.redemptionRepo.findAndCount({
      where,
      relations: ['user', 'reward', 'reward.partnerProfile'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdminRedemptionDetail(id: string) {
    const redemption = await this.redemptionRepo.findOne({
      where: { id },
      relations: ['user', 'reward', 'reward.partnerProfile', 'reward.pickupOptions', 'reward.pickupOptions.location'],
    });

    if (!redemption) {
      throw new NotFoundException(`Redemption ${id} not found`);
    }

    return redemption;
  }

  async updateRedemptionStatus(
    redemptionId: string,
    dto: UpdateRedemptionStatusDto,
    partnerProfileId?: string,
    adminId?: string,
    adminEmail?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const redemptionRepo = manager.getRepository(Redemption);
      const rewardRepo = manager.getRepository(Reward);

      const redemption = await redemptionRepo.findOne({
        where: { id: redemptionId },
        relations: ['user', 'reward', 'reward.partnerProfile'],
      });

      if (!redemption) {
        throw new NotFoundException(`Redemption ${redemptionId} not found`);
      }

      if (partnerProfileId && redemption.reward?.partnerProfile?.id !== partnerProfileId) {
        throw new ForbiddenException('You can only process redemptions for your own rewards');
      }

      const nextStatus = dto.status;
      const currentStatus = redemption.status;

      if (!currentStatus) {
        throw new BadRequestException('Redemption status is invalid');
      }

      if (currentStatus === nextStatus) {
        return redemption;
      }

      this.assertValidRedemptionTransition(currentStatus, nextStatus);

      const isCanceling =
        nextStatus === RedemptionStatus.REJECTED ||
        nextStatus === RedemptionStatus.CANCELED;

      if (isCanceling) {
        const reward = redemption.reward;
        const user = redemption.user;

        if (!reward || !user) {
          throw new BadRequestException(
            'Redemption is missing reward or user information',
          );
        }

        const pointsSpent = redemption.pointsSpent ?? 0;
        if (pointsSpent > 0) {
          await this.pointsService.addPoint(
            user.id,
            pointsSpent,
            PointTransactionType.EARN,
            PointSourceType.REDEMPTION,
            redemption.id,
            'REDEMPTION_REFUND',
            `Refund for redemption ${redemption.id}`,
            manager,
          );
        }

        if (reward.stock !== null && reward.stock !== undefined) {
          reward.stock += 1;
          await rewardRepo.save(reward);
        }
      }

      redemption.status = nextStatus;
      const savedRedemption = await redemptionRepo.save(redemption);

      if (adminId && adminEmail) {
        await this.auditService.log(adminId, adminEmail, AdminAuditAction.REDEMPTION_STATUS_UPDATE, redemption.user?.id, {
          redemptionId: redemption.id,
          previousStatus: currentStatus,
          newStatus: nextStatus,
        });
      }

      return savedRedemption;
    });
  }

  private assertRewardRedeemable(reward: Reward) {
    if (reward.status !== RewardStatus.ACTIVE) {
      throw new BadRequestException('Reward is not available for redemption');
    }
  }

  private assertValidRedemptionTransition(
    currentStatus: RedemptionStatus,
    nextStatus: RedemptionStatus,
  ) {
    const allowedTransitions: Record<RedemptionStatus, RedemptionStatus[]> = {
      [RedemptionStatus.PENDING]: [
        RedemptionStatus.APPROVED,
        RedemptionStatus.FULFILLED,
        RedemptionStatus.REJECTED,
        RedemptionStatus.CANCELED,
      ],
      [RedemptionStatus.APPROVED]: [
        RedemptionStatus.FULFILLED,
        RedemptionStatus.REJECTED,
        RedemptionStatus.CANCELED,
      ],
      [RedemptionStatus.FULFILLED]: [],
      [RedemptionStatus.REJECTED]: [],
      [RedemptionStatus.CANCELED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot change redemption status from ${currentStatus} to ${nextStatus}`,
      );
    }
  }
}
