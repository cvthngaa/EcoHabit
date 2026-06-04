import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { Redemption } from './entities/redemption.entity';
import { RewardPickupOption } from './entities/reward-pickup-option.entity';
import { PointsModule } from '../points/points.module';
import { PartnersModule } from '../partner/partners.module';
import { FraudModule } from '../fraud/fraud.module';

import { RewardsController } from './controllers/rewards.controller';
import { AdminRewardsController } from './controllers/admin-rewards.controller';
import { PartnerRewardsController } from './controllers/partner-rewards.controller';
import { RedemptionsController } from './controllers/redemptions.controller';
import { AdminRedemptionsController } from './controllers/admin-redemptions.controller';
import { RewardsService } from './rewards.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, Redemption, RewardPickupOption]),
    PointsModule,
    PartnersModule,
    AuditModule,
    FraudModule,
  ],
  controllers: [
    RewardsController,
    AdminRewardsController,
    PartnerRewardsController,
    RedemptionsController,
    AdminRedemptionsController,
  ],
  providers: [RewardsService],
})
export class RewardsModule {}
