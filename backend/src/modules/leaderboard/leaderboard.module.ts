import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    // PointsModule already exports TypeOrmModule with PointTransaction + User
    PointsModule,
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
