import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { Redemption } from './entities/redemption.entity';
import { RewardPickupOption } from './entities/reward-pickup-option.entity';
import { PointsModule } from '../points/points.module';
import { PartnersModule } from '../partner/partners.module';

import { RewardsController } from './rewards.controller';
import { AdminRewardsController } from './admin-rewards.controller';
import { PartnerRewardsController } from './partner-rewards.controller';
import { RedemptionsController } from './redemptions.controller';
import { RewardsService } from './rewards.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, Redemption, RewardPickupOption]),
    PointsModule,
    PartnersModule,
  ],
  controllers: [
    RewardsController,
    AdminRewardsController,
    PartnerRewardsController,
    RedemptionsController,
  ],
  providers: [RewardsService],
})
export class RewardsModule {}
