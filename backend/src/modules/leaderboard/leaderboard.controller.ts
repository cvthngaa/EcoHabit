import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaderboardService } from './leaderboard.service';
import type { LeaderboardPeriod } from './leaderboard.service';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@UseGuards(AuthGuard('jwt'))
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * GET /leaderboard?period=all_time|weekly|monthly&limit=20
   * Returns ranked list of users.
   */
  @Get()
  getLeaderboard(
    @Req() req: AuthenticatedRequest,
    @Query('period') period: LeaderboardPeriod = 'all_time',
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.leaderboardService.getLeaderboard(
      req.user.userId,
      period,
      parsedLimit,
    );
  }

  /**
   * GET /leaderboard/me?period=all_time|weekly|monthly
   * Returns the requesting user's current rank and points.
   */
  @Get('me')
  getMyRank(
    @Req() req: AuthenticatedRequest,
    @Query('period') period: LeaderboardPeriod = 'all_time',
  ) {
    return this.leaderboardService.getMyRank(req.user.userId, period);
  }
}
