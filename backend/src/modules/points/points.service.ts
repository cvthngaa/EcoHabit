import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PointTransaction } from './entities/point-transaction.entity';
import { PointRule } from './entities/point-rule.entity';
import { PointTransactionType } from './enums/point-transaction-type.enum';
import { PointSourceType } from './enums/point-source-type.enum';
import { PointHistoryItem } from './types/point-history-item.type';
import { ListPointTransactionsQueryDto } from './dto/list-point-transactions-query.dto';
import { AdjustPointsDto } from './dto/adjust-points.dto';
import { CreatePointRuleDto } from './dto/create-point-rule.dto';
import { UpdatePointRuleDto } from './dto/update-point-rule.dto';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { AdminAuditAction } from '../audit/enums/admin-audit-action.enum';
import { FraudService } from '../fraud/fraud.service';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly transactionRepo: Repository<PointTransaction>,

    @InjectRepository(PointRule)
    private readonly ruleRepo: Repository<PointRule>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly dataSource: DataSource,

    private readonly auditService: AuditService,
    private readonly fraudService: FraudService,
  ) {}

  private getTransactionRepository(manager?: EntityManager) {
    return manager
      ? manager.getRepository(PointTransaction)
      : this.transactionRepo;
  }

  private getRuleRepository(manager?: EntityManager) {
    return manager ? manager.getRepository(PointRule) : this.ruleRepo;
  }

  async addPoint(
    userId: string,
    amount: number,
    type: PointTransactionType,
    sourceType?: PointSourceType,
    sourceId?: string,
    reasonCode?: string,
    note?: string,
    manager?: EntityManager,
  ): Promise<PointTransaction> {
    if (amount === 0) {
      throw new BadRequestException('Amount must not be zero');
    }

    const transactionRepo = this.getTransactionRepository(manager);
    const currentBalance = await this.getBalanceByUserId(userId, manager);

    const balanceAfter = currentBalance + amount;

    // Dùng raw query để bypass TypeORM tự động chèn các cột không tồn tại (reason_code, note)
    const id = randomUUID();
    const res = await transactionRepo.query(
      `INSERT INTO point_transactions (id, user_id, type, points, balance_after, source_type, source_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, userId, type, amount, balanceAfter, sourceType, sourceId],
    );

    // Update the points_balance directly on the users table
    await transactionRepo.query(
      `UPDATE users SET points_balance = points_balance + $1 WHERE id = $2`,
      [amount, userId],
    );

    if (type === PointTransactionType.EARN) {
      void this.fraudService.checkDailyPointLimit(userId);
    }

    return res[0] as PointTransaction;
  }

  async getBalanceByUserId(
    userId: string,
    manager?: EntityManager,
  ): Promise<number> {
    const transactionRepo = this.getTransactionRepository(manager);

    const result = await transactionRepo
      .createQueryBuilder('pt')
      .innerJoin('pt.user', 'u')
      .select('SUM(pt.points)', 'total')
      .where('u.id = :userId', { userId })
      .getRawOne();

    return parseInt(result?.total ?? '0', 10);
  }

  async getPoint(userId: string): Promise<PointHistoryItem[]> {
    const transactions = await this.transactionRepo
      .createQueryBuilder('pt')
      .select([
        'pt.id',
        'pt.type',
        'pt.points',
        'pt.balanceAfter',
        'pt.sourceType',
        'pt.sourceId',
        'pt.createdAt',
      ])
      .innerJoin('pt.user', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('pt.createdAt', 'DESC')
      .getMany();

    const result: PointHistoryItem[] = [];
    for (const tx of transactions) {
      let title = '';
      if (
        tx.sourceType === PointSourceType.TRASH_CLASSIFICATION &&
        tx.sourceId
      ) {
        const res = await this.transactionRepo.manager.query(
          `SELECT predicted_label FROM trash_classifications WHERE id = $1`,
          [tx.sourceId],
        );
        if (res && res.length > 0) {
          title = res[0].predicted_label;
        }
      } else if (tx.sourceType === PointSourceType.REDEMPTION) {
        title = 'Đổi quà';
      } else if (tx.sourceType === PointSourceType.DROPOFF_TRANSACTION) {
        title = 'Điểm thu gom';
      } else if (tx.sourceType === PointSourceType.ADMIN) {
        title = 'Hệ thống thưởng';
      } else if (tx.sourceType === PointSourceType.QUIZ) {
        title = tx.sourceId ? `Quiz: ${tx.sourceId}` : 'Quiz hàng ngày';
      }

      result.push({
        ...tx,
        title: title || 'Hoạt động',
      });
    }
    return result;
  }

  async hasTransactionForSource(
    userId: string,
    sourceType: PointSourceType,
    sourceId: string,
    type?: PointTransactionType,
    manager?: EntityManager,
  ): Promise<boolean> {
    return this.getTransactionRepository(manager).exists({
      where: {
        user: { id: userId },
        sourceType,
        sourceId,
        ...(type ? { type } : {}),
      },
    });
  }

  async updatePoint(
    ruleId: string,
    data: Partial<PointRule>,
    manager?: EntityManager,
  ): Promise<PointRule> {
    const ruleRepo = this.getRuleRepository(manager);
    const rule = await ruleRepo.findOne({ where: { id: ruleId } });
    if (!rule) throw new NotFoundException(`Rule ${ruleId} not found`);

    Object.assign(rule, data);
    return ruleRepo.save(rule);
  }

  async deductPoints(
    userId: string,
    amount: number,
    sourceType?: PointSourceType,
    sourceId?: string,
    reasonCode?: string,
    note?: string,
    manager?: EntityManager,
  ): Promise<PointTransaction> {
    const currentBalance = await this.getBalanceByUserId(userId, manager);

    if (currentBalance < amount) {
      throw new BadRequestException('Not enough points');
    }

    return this.addPoint(
      userId,
      -amount,
      PointTransactionType.SPEND,
      sourceType,
      sourceId,
      reasonCode,
      note,
      manager,
    );
  }

  async deletePoint(transactionId: string): Promise<void> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });
    if (!transaction)
      throw new NotFoundException(`Transaction ${transactionId} not found`);

    await this.transactionRepo.remove(transaction);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Admin methods
  // ─────────────────────────────────────────────────────────────────────────

  /** Lấy danh sách giao dịch điểm với phân trang và filter. */
  async listTransactions(query: ListPointTransactionsQueryDto): Promise<{
    data: PointTransaction[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      userId,
      type,
      sourceType,
      sourceId,
      from,
      to,
      sortOrder,
      page,
      limit,
    } = query;

    const take = limit ?? 20;
    const skip = ((page ?? 1) - 1) * take;

    const qb = this.transactionRepo
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.user', 'user')
      .orderBy('pt.createdAt', sortOrder ?? 'DESC')
      .take(take)
      .skip(skip);

    if (userId) {
      qb.andWhere('user.id = :userId', { userId });
    }
    if (type) {
      qb.andWhere('pt.type = :type', { type });
    }
    if (sourceType) {
      qb.andWhere('pt.sourceType = :sourceType', { sourceType });
    }
    if (sourceId) {
      qb.andWhere('pt.sourceId = :sourceId', { sourceId });
    }
    if (from) {
      qb.andWhere('pt.createdAt >= :from', { from: new Date(from) });
    }
    if (to) {
      qb.andWhere('pt.createdAt <= :to', { to: new Date(to) });
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

  /** Lấy tất cả PointRule, sort theo createdAt DESC. */
  async getRules(): Promise<PointRule[]> {
    return this.ruleRepo.find({ order: { createdAt: 'DESC' } });
  }

  /** Tạo PointRule mới. Ném ConflictException nếu code đã tồn tại. */
  async createRule(dto: CreatePointRuleDto): Promise<PointRule> {
    const existing = await this.ruleRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(
        `Point rule with code "${dto.code}" already exists`,
      );
    }

    const rule = this.ruleRepo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      eventType: dto.eventType,
      points: dto.points,
      isActive: dto.isActive ?? true,
    });

    return this.ruleRepo.save(rule);
  }

  /** Cập nhật PointRule theo id. Ném NotFoundException nếu không tìm thấy. */
  async updateRule(id: string, dto: UpdatePointRuleDto): Promise<PointRule> {
    const rule = await this.ruleRepo.findOne({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Point rule with id "${id}" not found`);
    }

    Object.assign(rule, dto);
    return this.ruleRepo.save(rule);
  }

  /**
   * Điều chỉnh điểm thủ công cho user bởi admin.
   * - points > 0: cộng điểm
   * - points < 0: trừ điểm (không cho balance âm)
   * - Luôn tạo ledger trong point_transactions
   * - Ghi audit log sau khi thực hiện
   */
  async adjustUserPoints(
    adminId: string,
    targetUserId: string,
    dto: AdjustPointsDto,
    adminEmail?: string,
  ): Promise<{ transaction: PointTransaction; balanceAfter: number }> {
    // Kiểm tra target user tồn tại
    const targetUser = await this.userRepo.findOne({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException(`User with id "${targetUserId}" not found`);
    }

    const { points, reason, note } = dto;

    // Lấy balance trước khi chỉnh
    const balanceBefore = await this.getBalanceByUserId(targetUserId);

    // Validate không cho balance âm khi trừ điểm
    if (points < 0 && balanceBefore + points < 0) {
      throw new BadRequestException(
        `Cannot deduct ${Math.abs(points)} points: user only has ${balanceBefore} points`,
      );
    }

    const type =
      points > 0 ? PointTransactionType.EARN : PointTransactionType.SPEND;

    // Dùng transaction DB để đảm bảo consistency
    let transaction: PointTransaction;
    let balanceAfter: number;

    await this.dataSource.transaction(async (manager) => {
      const txRepo = manager.getRepository(PointTransaction);

      // Lấy lại balance trong transaction để tránh race condition
      const balanceResult = await txRepo
        .createQueryBuilder('pt')
        .innerJoin('pt.user', 'u')
        .select('SUM(pt.points)', 'total')
        .where('u.id = :userId', { userId: targetUserId })
        .getRawOne();

      const currentBalance = parseInt(balanceResult?.total ?? '0', 10);

      if (points < 0 && currentBalance + points < 0) {
        throw new BadRequestException(
          `Cannot deduct ${Math.abs(points)} points: user only has ${currentBalance} points`,
        );
      }

      balanceAfter = currentBalance + points;

      const id = randomUUID();
      // Insert với note và reason_code đầy đủ (entity có 2 cột này)
      const res = await txRepo.query(
        `INSERT INTO point_transactions
           (id, user_id, type, points, balance_after, source_type, source_id, reason_code, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          id,
          targetUserId,
          type,
          points,
          balanceAfter,
          PointSourceType.ADMIN,
          adminId,        // sourceId = adminId để truy vết
          reason,         // reason_code
          note ?? null,   // note
        ],
      );

      transaction = res[0] as PointTransaction;

      // Cập nhật points_balance trên users table
      await txRepo.query(
        `UPDATE users SET points_balance = points_balance + $1 WHERE id = $2`,
        [points, targetUserId],
      );
    });

    // Ghi audit log sau khi transaction DB thành công
    await this.auditService.log(
      adminId,
      adminEmail ?? '',
      AdminAuditAction.POINTS_ADJUST,
      targetUserId,
      {
        targetUserId,
        points,
        reason,
        note: note ?? null,
        balanceBefore,
        balanceAfter: balanceAfter!,
      },
    );

    return { transaction: transaction!, balanceAfter: balanceAfter! };
  }
}
