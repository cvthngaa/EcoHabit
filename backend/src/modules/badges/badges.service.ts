import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { BadgeConditionType } from './enums/badge-condition-type.enum';
import { BadgeResponseDto } from './dto/badge-response.dto';
import { QuizAttempt } from '../quiz/entities/quiz-attempt.entity';
import { TrashClassification } from '../ai/entities/trash-classification.entity';
import { DropoffTransaction } from '../locations/entities/dropoff-transaction.entity';
import { User } from '../users/entities/user.entity';
import { DropoffStatus } from '../locations/enums/dropoff-status.enum';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(QuizAttempt)
    private readonly quizAttemptRepo: Repository<QuizAttempt>,
    @InjectRepository(TrashClassification)
    private readonly classificationRepo: Repository<TrashClassification>,
    @InjectRepository(DropoffTransaction)
    private readonly dropoffRepo: Repository<DropoffTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ─── Public API ────────────────────────────────────────────────────────────

  /** List all active badges with earned status + progress for the given user */
  async getMyBadges(userId: string): Promise<BadgeResponseDto[]> {
    const [badges, earnedMap, progressMap] = await Promise.all([
      this.badgeRepo.find({ where: { isActive: true }, order: { createdAt: 'ASC' } }),
      this.getEarnedMap(userId),
      this.buildProgressMap(userId),
    ]);

    // Asynchronously trigger an evaluation just in case the user met conditions
    // from past activities before the badge system was introduced.
    void this.evaluateUserBadges(userId);

    return badges.map((badge) => {
      const earned = earnedMap.get(badge.id);
      return {
        id: badge.id,
        code: badge.code,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        conditionType: badge.conditionType,
        threshold: badge.threshold,
        isEarned: !!earned,
        earnedAt: earned?.awardedAt?.toISOString() ?? null,
        progress: progressMap.get(badge.conditionType) ?? 0,
      };
    });
  }

  /** List all active badges (public, no user context) */
  async getAllBadges(): Promise<Badge[]> {
    return this.badgeRepo.find({ where: { isActive: true }, order: { createdAt: 'ASC' } });
  }

  /**
   * Evaluate all active badges for a user and award any newly earned ones.
   * Safe to call fire-and-forget: errors are caught and logged.
   */
  async evaluateUserBadges(userId: string): Promise<void> {
    try {
      const badges = await this.badgeRepo.find({ where: { isActive: true } });
      const earnedMap = await this.getEarnedMap(userId);
      const progressMap = await this.buildProgressMap(userId);

      for (const badge of badges) {
        if (earnedMap.has(badge.id)) continue; // Already earned

        const current = progressMap.get(badge.conditionType) ?? 0;
        if (current >= badge.threshold) {
          await this.awardBadge(userId, badge.id);
        }
      }
    } catch (err) {
      this.logger.error(`evaluateUserBadges failed for user ${userId}: ${err}`);
    }
  }

  /**
   * Award a badge to a user. Uses INSERT … ON CONFLICT DO NOTHING for idempotency.
   */
  async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      await this.userBadgeRepo.query(
        `INSERT INTO user_badges (id, user_id, badge_id, awarded_at)
         VALUES (gen_random_uuid(), $1, $2, NOW())
         ON CONFLICT (user_id, badge_id) DO NOTHING`,
        [userId, badgeId],
      );
      this.logger.log(`Badge ${badgeId} awarded to user ${userId}`);
    } catch (err) {
      this.logger.error(`awardBadge failed: ${err}`);
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /** Map badgeId → UserBadge for earned badges of a user */
  private async getEarnedMap(userId: string): Promise<Map<string, UserBadge>> {
    const earned = await this.userBadgeRepo.find({
      where: { userId },
      relations: ['badge'],
    });
    return new Map(earned.map((ub) => [ub.badgeId, ub]));
  }

  /**
   * Build a map of conditionType → current progress value for the given user.
   * Each condition type is computed once and shared across all badges of that type.
   */
  private async buildProgressMap(userId: string): Promise<Map<BadgeConditionType, number>> {
    const map = new Map<BadgeConditionType, number>();

    const [
      quizCount,
      classificationCount,
      dropoffCount,
      pointsBalance,
    ] = await Promise.all([
      this.countCompletedQuizzes(userId),
      this.countClassifications(userId),
      this.countConfirmedDropoffs(userId),
      this.getPointsBalance(userId),
    ]);

    // FIRST_QUIZ_COMPLETED shares the same count as QUIZ_COMPLETED_COUNT
    map.set(BadgeConditionType.FIRST_QUIZ_COMPLETED, quizCount);
    map.set(BadgeConditionType.QUIZ_COMPLETED_COUNT, quizCount);
    map.set(BadgeConditionType.CLASSIFICATION_COUNT, classificationCount);
    map.set(BadgeConditionType.DROPOFF_CONFIRMED_COUNT, dropoffCount);
    map.set(BadgeConditionType.POINTS_BALANCE_REACHED, pointsBalance);

    return map;
  }

  private async countCompletedQuizzes(userId: string): Promise<number> {
    return this.quizAttemptRepo.count({
      where: { userId, isRewarded: true },
    });
  }

  private async countClassifications(userId: string): Promise<number> {
    return this.classificationRepo.count({
      where: { user: { id: userId } },
    });
  }

  private async countConfirmedDropoffs(userId: string): Promise<number> {
    return this.dropoffRepo.count({
      where: {
        user: { id: userId },
        status: DropoffStatus.VERIFIED,
      },
    });
  }

  private async getPointsBalance(userId: string): Promise<number> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['pointsBalance'],
    });
    return user?.pointsBalance ?? 0;
  }
}
