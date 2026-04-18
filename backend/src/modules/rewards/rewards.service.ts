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

      const pointTransaction = await this.pointsService.deductPoints(
        userId,
        pointsCost,
        PointSourceType.REDEMPTION,
        dto.rewardId,
        'REDEMPTION',
        `Redeemed reward ${reward.id}`,
        manager,
      );

      if (stock !== null) {
        reward.stock = stock - 1;
        await rewardRepo.save(reward);
      }

      const redemption = redemptionRepo.create({
        user: { id: userId },
        reward: { id: reward.id },
        pointsSpent: pointsCost,
        status: RedemptionStatus.PENDING,
      });

      const savedRedemption = await redemptionRepo.save(redemption);

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

  private assertRewardRedeemable(reward: Reward) {
    if (reward.status !== RewardStatus.ACTIVE) {
      throw new BadRequestException('Reward is not available for redemption');
    }
  }
}
