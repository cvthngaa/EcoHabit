import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminDashboardController } from './controllers/admin-dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DropoffTransaction } from '../locations/entities/dropoff-transaction.entity';
import { Location } from '../locations/entities/location.entity';
import { Reward } from '../rewards/entities/reward.entity';
import { Redemption } from '../rewards/entities/redemption.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DropoffTransaction,
      Location,
      Reward,
      Redemption,
      User,
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
