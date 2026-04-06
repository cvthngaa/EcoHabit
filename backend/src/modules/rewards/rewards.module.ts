import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { Redemption } from './entities/redemption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reward, Redemption])],
  controllers: [RewardsController],
  providers: [RewardsService]
})
export class RewardsModule { }
