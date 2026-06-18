import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointTransaction } from '../points/entities/point-transaction.entity';
import { User } from '../users/entities/user.entity';
import { PointTransactionType } from '../points/enums/point-transaction-type.enum';

export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  isMe: boolean;
}

export interface MyRankResult {
  rank: number | null;
  points: number;
  period: LeaderboardPeriod;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly txRepo: Repository<PointTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getLeaderboard(
    requestingUserId: string,
    period: LeaderboardPeriod = 'all_time',
    limit = 20,
  ): Promise<LeaderboardEntry[]> {
    const rows = await this.queryLeaderboard(period, limit);

    return rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      fullName: row.full_name,
      avatarUrl: row.avatar_url ?? null,
      points: Number(row.points),
      isMe: row.user_id === requestingUserId,
    }));
  }

  async getMyRank(
    userId: string,
    period: LeaderboardPeriod = 'all_time',
  ): Promise<MyRankResult> {
    // Get full leaderboard (up to 500 to find user's position)
    const rows = await this.queryLeaderboard(period, 500);
    const index = rows.findIndex((r) => r.user_id === userId);

    if (index === -1) {
      const myPoints = await this.getUserPoints(userId, period);
      return { rank: null, points: myPoints, period };
    }

    return {
      rank: index + 1,
      points: Number(rows[index].points),
      period,
    };
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private async queryLeaderboard(
    period: LeaderboardPeriod,
    limit: number,
  ): Promise<any[]> {
    if (period === 'all_time') {
      return this.userRepo.query(
        `SELECT u.id AS user_id, u.full_name, u.avatar_url, u.points_balance AS points
         FROM users u
         WHERE u.status = 'ACTIVE' AND u.role = 'USER'
         ORDER BY u.points_balance DESC
         LIMIT $1`,
        [limit],
      );
    }

    const dateFilter = period === 'weekly'
      ? `NOW() - INTERVAL '7 days'`
      : `DATE_TRUNC('month', NOW())`;

    return this.txRepo.query(
      `SELECT u.id AS user_id, u.full_name, u.avatar_url,
              COALESCE(SUM(pt.points), 0) AS points
       FROM users u
       INNER JOIN point_transactions pt ON pt.user_id = u.id
       WHERE pt.type = $1
         AND pt.created_at >= ${dateFilter}
         AND u.status = 'ACTIVE'
         AND u.role = 'USER'
       GROUP BY u.id, u.full_name, u.avatar_url
       ORDER BY points DESC
       LIMIT $2`,
      [PointTransactionType.EARN, limit],
    );
  }

  private async getUserPoints(userId: string, period: LeaderboardPeriod): Promise<number> {
    if (period === 'all_time') {
      const user = await this.userRepo.findOne({
        where: { id: userId },
        select: ['pointsBalance'],
      });
      return user?.pointsBalance ?? 0;
    }

    const dateFilter = period === 'weekly'
      ? `NOW() - INTERVAL '7 days'`
      : `DATE_TRUNC('month', NOW())`;

    const result = await this.txRepo.query(
      `SELECT COALESCE(SUM(points), 0) AS points
       FROM point_transactions
       WHERE user_id = $1
         AND type = $2
         AND created_at >= ${dateFilter}`,
      [userId, PointTransactionType.EARN],
    );
    return Number(result[0]?.points ?? 0);
  }
}
