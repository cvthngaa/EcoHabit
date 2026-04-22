import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reward } from './entities/reward.entity';
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

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepo: Repository<Reward>,
    @InjectRepository(Redemption)
    private readonly redemptionRepo: Repository<Redemption>,
    private readonly dataSource: DataSource,
    private readonly pointsService: PointsService,
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
    return this.rewardRepo.findOne({ where: { id } });
  }

  async createRewards(data: CreateRewardDto) {
    const reward = this.rewardRepo.create(data);
    return this.rewardRepo.save(reward);
  }

  async updateRewards(id: string, data: UpdateRewardDto) {
    const reward = await this.rewardRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException(`Reward ${id} not found`);
    Object.assign(reward, data);
    return this.rewardRepo.save(reward);
  }

  async deleteRewards(id: string) {
    const reward = await this.rewardRepo.findOne({ where: { id } });
    if (!reward) throw new NotFoundException(`Reward ${id} not found`);
    return this.rewardRepo.remove(reward);
  }

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

  async updateRedemptionStatus(
    redemptionId: string,
    dto: UpdateRedemptionStatusDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const redemptionRepo = manager.getRepository(Redemption);
      const rewardRepo = manager.getRepository(Reward);

      const redemption = await redemptionRepo.findOne({
        where: { id: redemptionId },
        relations: ['user', 'reward'],
      });

      if (!redemption) {
        throw new NotFoundException(`Redemption ${redemptionId} not found`);
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
      return redemptionRepo.save(redemption);
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
