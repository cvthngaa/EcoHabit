import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PointTransaction } from './entities/point-transaction.entity';
import { PointRule } from './entities/point-rule.entity';
import { PointTransactionType } from './enums/point-transaction-type.enum';
import { PointSourceType } from './enums/point-source-type.enum';
import { PointHistoryItem } from './types/point-history-item.type';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly transactionRepo: Repository<PointTransaction>,

    @InjectRepository(PointRule)
    private readonly ruleRepo: Repository<PointRule>,
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
}
