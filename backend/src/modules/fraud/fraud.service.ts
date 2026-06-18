import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FraudFlag } from './entities/fraud-flag.entity';
import { FraudSourceType } from './enums/fraud-source-type.enum';
import { FraudSeverity } from './enums/fraud-severity.enum';
import { FraudStatus } from './enums/fraud-status.enum';
import { CreateFraudFlagDto } from './dto/create-fraud-flag.dto';
import { ListFraudFlagsQueryDto } from './dto/list-fraud-flags-query.dto';
import { UpdateFraudFlagStatusDto } from './dto/update-fraud-flag-status.dto';

import { AuditService } from '../audit/audit.service';
import { AdminAuditAction } from '../audit/enums/admin-audit-action.enum';

// ─── Ngưỡng cảnh báo (có thể điều chỉnh sau) ────────────────────────────────
const MAX_DAILY_POINTS = 500;
const MAX_DAILY_AI_CLASSIFICATIONS = 20;
const MAX_DAILY_REDEMPTIONS = 5;
const MAX_COLLECTION_KG = 50;
const MAX_COLLECTION_LITERS = 100;
const MAX_COLLECTION_PIECES = 100;
const MAX_COLLECTION_POINTS = 500;

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(
    @InjectRepository(FraudFlag)
    private readonly fraudFlagRepo: Repository<FraudFlag>,
    private readonly auditService: AuditService,
  ) {}

  // ─── Core CRUD ────────────────────────────────────────────────────────────

  /**
   * Tạo một FraudFlag mới.
   * Nếu đã có flag cùng user/sourceType/sourceId/flagCode đang OPEN hoặc REVIEWING
   * thì trả về flag cũ, không tạo trùng.
   * Không throw lỗi ngoài log — caller có thể gọi async fire-and-forget.
   */
  async createFlag(input: CreateFraudFlagDto): Promise<FraudFlag | null> {
    try {
      // Kiểm tra trùng lặp để tránh flood flag
      if (input.userId || input.sourceId) {
        const existing = await this.fraudFlagRepo.findOne({
          where: {
            ...(input.userId ? { user: { id: input.userId } } : {}),
            sourceType: input.sourceType,
            ...(input.sourceId ? { sourceId: input.sourceId } : {}),
            flagCode: input.flagCode,
            status: In([FraudStatus.OPEN, FraudStatus.REVIEWING]),
          },
        });

        if (existing) {
          return existing;
        }
      }

      const flag = this.fraudFlagRepo.create({
        ...(input.userId ? { user: { id: input.userId } as any } : {}),
        sourceType: input.sourceType,
        sourceId: input.sourceId ?? null,
        flagCode: input.flagCode,
        description: input.description,
        severity: input.severity,
        status: FraudStatus.OPEN,
        metadata: input.metadata ?? null,
      });

      return await this.fraudFlagRepo.save(flag);
    } catch (err) {
      this.logger.error(`createFlag failed: ${(err as Error).message}`, (err as Error).stack);
      return null;
    }
  }

  /** Danh sách flags với phân trang và filter */
  async listFlags(query: ListFraudFlagsQueryDto): Promise<{
    data: FraudFlag[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      status,
      severity,
      sourceType,
      userId,
      flagCode,
      from,
      to,
      sortOrder,
      page,
      limit,
    } = query;

    const take = limit ?? 20;
    const skip = ((page ?? 1) - 1) * take;

    const qb = this.fraudFlagRepo
      .createQueryBuilder('ff')
      .leftJoinAndSelect('ff.user', 'user')
      .leftJoinAndSelect('ff.reviewedBy', 'reviewedBy')
      .orderBy('ff.createdAt', sortOrder ?? 'DESC')
      .take(take)
      .skip(skip);

    if (status) {
      qb.andWhere('ff.status = :status', { status });
    }
    if (severity) {
      qb.andWhere('ff.severity = :severity', { severity });
    }
    if (sourceType) {
      qb.andWhere('ff.sourceType = :sourceType', { sourceType });
    }
    if (userId) {
      qb.andWhere('user.id = :userId', { userId });
    }
    if (flagCode) {
      qb.andWhere('ff.flagCode = :flagCode', { flagCode });
    }
    if (from) {
      qb.andWhere('ff.createdAt >= :from', { from: new Date(from) });
    }
    if (to) {
      qb.andWhere('ff.createdAt <= :to', { to: new Date(to) });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: page ?? 1,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /** Chi tiết một flag theo id */
  async getFlagDetail(id: string): Promise<FraudFlag> {
    const flag = await this.fraudFlagRepo.findOne({
      where: { id },
      relations: ['user', 'reviewedBy'],
    });

    if (!flag) {
      throw new NotFoundException(`FraudFlag with id "${id}" not found`);
    }

    return flag;
  }

  /** Admin cập nhật trạng thái flag và ghi audit log */
  async updateFlagStatus(
    id: string,
    dto: UpdateFraudFlagStatusDto,
    adminId: string,
    adminEmail?: string,
  ): Promise<FraudFlag> {
    const flag = await this.fraudFlagRepo.findOne({
      where: { id },
      relations: ['user', 'reviewedBy'],
    });

    if (!flag) {
      throw new NotFoundException(`FraudFlag with id "${id}" not found`);
    }

    const previousStatus = flag.status;
    flag.status = dto.status;
    flag.reviewedBy = { id: adminId } as any;
    flag.reviewedAt = new Date();

    if (dto.reviewNote) {
      flag.metadata = {
        ...(flag.metadata ?? {}),
        reviewNote: dto.reviewNote,
      };
    }

    const updated = await this.fraudFlagRepo.save(flag);

    // Ghi audit log — không chặn nếu lỗi
    try {
      await this.auditService.log(
        adminId,
        adminEmail ?? '',
        AdminAuditAction.FRAUD_STATUS_UPDATE,
        flag.user?.id ?? null,
        {
          fraudFlagId: id,
          flagCode: flag.flagCode,
          previousStatus,
          newStatus: dto.status,
          reviewNote: dto.reviewNote ?? null,
        },
      );
    } catch (err) {
      this.logger.error(`audit log failed for flag ${id}: ${(err as Error).message}`);
    }

    return updated;
  }

  /** Thống kê tổng quan fraud */
  async getStats(): Promise<{
    total: number;
    open: number;
    reviewing: number;
    resolved: number;
    rejected: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    bySourceType: Record<string, number>;
    recentOpenCount: number;
  }> {
    const [
      total,
      open,
      reviewing,
      resolved,
      rejected,
      highSeverity,
      mediumSeverity,
      lowSeverity,
    ] = await Promise.all([
      this.fraudFlagRepo.count(),
      this.fraudFlagRepo.count({ where: { status: FraudStatus.OPEN } }),
      this.fraudFlagRepo.count({ where: { status: FraudStatus.REVIEWING } }),
      this.fraudFlagRepo.count({ where: { status: FraudStatus.RESOLVED } }),
      this.fraudFlagRepo.count({ where: { status: FraudStatus.REJECTED } }),
      this.fraudFlagRepo.count({ where: { severity: FraudSeverity.HIGH } }),
      this.fraudFlagRepo.count({ where: { severity: FraudSeverity.MEDIUM } }),
      this.fraudFlagRepo.count({ where: { severity: FraudSeverity.LOW } }),
    ]);

    // Đếm theo sourceType
    const sourceRows: Array<{ sourceType: string; count: string }> =
      await this.fraudFlagRepo
        .createQueryBuilder('ff')
        .select('ff.sourceType', 'sourceType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('ff.sourceType')
        .getRawMany();

    const bySourceType: Record<string, number> = {};
    for (const row of sourceRows) {
      bySourceType[row.sourceType] = parseInt(row.count, 10);
    }

    // Flags mở trong 24h gần nhất
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentOpenCount = await this.fraudFlagRepo
      .createQueryBuilder('ff')
      .where('ff.status = :status', { status: FraudStatus.OPEN })
      .andWhere('ff.createdAt >= :since', { since: yesterday })
      .getCount();

    return {
      total,
      open,
      reviewing,
      resolved,
      rejected,
      highSeverity,
      mediumSeverity,
      lowSeverity,
      bySourceType,
      recentOpenCount,
    };
  }

  // ─── Rule checks ──────────────────────────────────────────────────────────

  async flagDuplicateQr(input: {
    userId: string;
    locationId: string;
    tokenHash: string;
  }): Promise<void> {
    await this.createFlag({
      userId: input.userId,
      sourceType: FraudSourceType.COLLECTION,
      sourceId: input.tokenHash,
      flagCode: 'DUPLICATE_QR',
      description: 'User QR token was submitted more than once',
      severity: FraudSeverity.HIGH,
      metadata: {
        locationId: input.locationId,
        tokenHash: input.tokenHash,
      },
    });
  }

  async checkAbnormalCollectionVolume(input: {
    userId: string;
    locationId: string;
    quantityValue?: number | null;
    quantityUnit?: string | null;
    pointsAwarded?: number | null;
  }): Promise<boolean> {
    const quantityValue = input.quantityValue ?? 0;
    const quantityUnit = input.quantityUnit?.toUpperCase() ?? '';
    const pointsAwarded = input.pointsAwarded ?? 0;

    let threshold: number | null = null;
    let normalizedValue = quantityValue;
    let normalizedUnit = quantityUnit || 'UNKNOWN';

    if (quantityUnit === 'GRAM') {
      threshold = MAX_COLLECTION_KG;
      normalizedValue = quantityValue / 1000;
      normalizedUnit = 'KG';
    } else if (quantityUnit === 'KG' || quantityUnit === 'KILOGRAM') {
      threshold = MAX_COLLECTION_KG;
      normalizedUnit = 'KG';
    } else if (quantityUnit === 'LITER' || quantityUnit === 'LITRE') {
      threshold = MAX_COLLECTION_LITERS;
      normalizedUnit = 'LITER';
    } else if (quantityUnit === 'PIECE') {
      threshold = MAX_COLLECTION_PIECES;
      normalizedUnit = 'PIECE';
    }

    const quantityExceeded = threshold !== null && normalizedValue > threshold;
    const pointsExceeded = pointsAwarded > MAX_COLLECTION_POINTS;

    if (!quantityExceeded && !pointsExceeded) {
      return false;
    }

    await this.createFlag({
      userId: input.userId,
      sourceType: FraudSourceType.COLLECTION,
      sourceId: input.locationId,
      flagCode: 'ABNORMAL_VOLUME',
      description: `Collection volume or points exceeded expected threshold`,
      severity: pointsExceeded || normalizedUnit === 'KG' ? FraudSeverity.HIGH : FraudSeverity.MEDIUM,
      metadata: {
        locationId: input.locationId,
        quantityValue: input.quantityValue ?? null,
        quantityUnit: input.quantityUnit ?? null,
        normalizedValue,
        normalizedUnit,
        threshold,
        pointsAwarded,
        pointsThreshold: MAX_COLLECTION_POINTS,
        quantityExceeded,
        pointsExceeded,
      },
    });

    return true;
  }

  /**
   * Kiểm tra tổng điểm kiếm được trong ngày hôm nay.
   * Trả true nếu vượt MAX_DAILY_POINTS.
   */
  async checkDailyPointLimit(userId: string): Promise<boolean> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result: Array<{ total: string }> = await this.fraudFlagRepo.manager.query(
        `SELECT COALESCE(SUM(points), 0) AS total
         FROM point_transactions
         WHERE user_id = $1
           AND type = 'EARN'
           AND created_at >= $2`,
        [userId, today],
      );

      const dailyPoints = parseInt(result[0]?.total ?? '0', 10);

      if (dailyPoints > MAX_DAILY_POINTS) {
        await this.createFlag({
          userId,
          sourceType: FraudSourceType.POINTS,
          flagCode: 'DAILY_POINT_LIMIT_EXCEEDED',
          description: `User earned ${dailyPoints} points today (limit: ${MAX_DAILY_POINTS})`,
          severity: FraudSeverity.HIGH,
          metadata: { dailyPoints, threshold: MAX_DAILY_POINTS },
        });
        return true;
      }
    } catch (err) {
      this.logger.warn(`checkDailyPointLimit error: ${(err as Error).message}`);
    }
    return false;
  }

  /**
   * Kiểm tra quiz abuse: quá nhiều topic trong ngày (flag QUIZ_ABUSE).
   * QuizService đã chặn duplicate submit — đây chỉ là flag thêm.
   */
  async checkQuizAbuse(userId: string, topicId?: string): Promise<void> {
    // Không cần query DB vì QuizService đã dùng Redis để theo dõi;
    // Chỉ tạo flag khi được gọi với dữ liệu cụ thể từ ngoài.
    await this.createFlag({
      userId,
      sourceType: FraudSourceType.QUIZ,
      sourceId: topicId,
      flagCode: 'QUIZ_REPEAT_ATTEMPT',
      description: `User attempted to submit quiz topic "${topicId}" more than once today`,
      severity: FraudSeverity.LOW,
      metadata: { topicId },
    });
  }

  /**
   * Kiểm tra reward redemption quá nhiều lần trong ngày.
   * Trả true nếu vượt ngưỡng.
   */
  async checkRewardAbuse(userId: string, rewardId?: string): Promise<boolean> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result: Array<{ count: string }> = await this.fraudFlagRepo.manager.query(
        `SELECT COUNT(*) AS count
         FROM redemptions
         WHERE user_id = $1
           AND created_at >= $2`,
        [userId, today],
      );

      const countToday = parseInt(result[0]?.count ?? '0', 10);

      if (countToday >= MAX_DAILY_REDEMPTIONS) {
        await this.createFlag({
          userId,
          sourceType: FraudSourceType.REWARD,
          sourceId: rewardId,
          flagCode: 'REWARD_REDEMPTION_FREQUENCY_HIGH',
          description: `User redeemed ${countToday} rewards today (limit: ${MAX_DAILY_REDEMPTIONS})`,
          severity: FraudSeverity.MEDIUM,
          metadata: { countToday, rewardId, threshold: MAX_DAILY_REDEMPTIONS },
        });
        return true;
      }
    } catch (err) {
      this.logger.warn(`checkRewardAbuse error: ${(err as Error).message}`);
    }
    return false;
  }

  /**
   * Kiểm tra số lần phân loại AI trong ngày.
   * Chỉ tạo flag cảnh báo, không chặn.
   */
  async checkAiClassificationAbuse(userId: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result: Array<{ count: string }> = await this.fraudFlagRepo.manager.query(
        `SELECT COUNT(*) AS count
         FROM trash_classifications
         WHERE user_id = $1
           AND created_at >= $2`,
        [userId, today],
      );

      const countToday = parseInt(result[0]?.count ?? '0', 10);

      if (countToday > MAX_DAILY_AI_CLASSIFICATIONS) {
        await this.createFlag({
          userId,
          sourceType: FraudSourceType.AI_CLASSIFICATION,
          flagCode: 'AI_CLASSIFICATION_FREQUENCY_HIGH',
          description: `User classified ${countToday} images today (limit: ${MAX_DAILY_AI_CLASSIFICATIONS})`,
          severity: FraudSeverity.LOW,
          metadata: { countToday, threshold: MAX_DAILY_AI_CLASSIFICATIONS },
        });
      }
    } catch (err) {
      this.logger.warn(`checkAiClassificationAbuse error: ${(err as Error).message}`);
    }
  }
}
