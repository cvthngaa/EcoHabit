import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { PartnerDashboardController } from './controllers/partner-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DropoffTransaction } from '../locations/entities/dropoff-transaction.entity';
import { Location } from '../locations/entities/location.entity';
import { Reward } from '../rewards/entities/reward.entity';
import { Redemption } from '../rewards/entities/redemption.entity';
import { User } from '../users/entities/user.entity';
import { PartnerProfile } from '../partner/entity/partner-profile.entity';
import { AiFeedback } from '../ai/entities/ai-feedback.entity';
import { TrashClassification } from '../ai/entities/trash-classification.entity';
import { FraudFlag } from '../fraud/entities/fraud-flag.entity';
import { PointTransaction } from '../points/entities/point-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DropoffTransaction,
      Location,
      Reward,
      Redemption,
      User,
      PartnerProfile,
      AiFeedback,
      TrashClassification,
      FraudFlag,
      PointTransaction,
    ]),
  ],
  controllers: [AdminDashboardController, PartnerDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule { }
