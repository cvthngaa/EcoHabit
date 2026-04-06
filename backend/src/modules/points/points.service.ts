import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointTransaction } from './entities/point-transaction.entity';
import { PointRule } from './entities/point-rule.entity';
import { PointTransactionType } from './enums/point-transaction-type.enum';
import { PointSourceType } from './enums/point-source-type.enum';

@Injectable()
export class PointsService {
    constructor(
        @InjectRepository(PointTransaction)
        private readonly transactionRepo: Repository<PointTransaction>,

        @InjectRepository(PointRule)
        private readonly ruleRepo: Repository<PointRule>,
    ) { }

    async addPoint(
        userId: string,
        amount: number,
        type: PointTransactionType,
        sourceType?: PointSourceType,
        sourceId?: string,
        reasonCode?: string,
        note?: string,
    ): Promise<PointTransaction> {
        if (amount === 0) {
            throw new BadRequestException('Amount must not be zero');
        }

        const currentBalance = await this.getBalanceByUserId(userId);

        const transaction = this.transactionRepo.create({
            user: { id: userId },
            type,
            points: amount,
            balanceAfter: currentBalance + amount,
            sourceType,
            sourceId,
            reasonCode,
            note,
        });

        return this.transactionRepo.save(transaction);
    }

    async getBalanceByUserId(userId: string): Promise<number> {
        const result = await this.transactionRepo
            .createQueryBuilder('pt')
            .innerJoin('pt.user', 'u')
            .select('SUM(pt.points)', 'total')
            .where('u.id = :userId', { userId })
            .getRawOne();

        return parseInt(result?.total ?? '0', 10);
    }

    async getPoint(userId: string): Promise<PointTransaction[]> {
        return this.transactionRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }

    async updatePoint(ruleId: string, data: Partial<PointRule>): Promise<PointRule> {
        const rule = await this.ruleRepo.findOne({ where: { id: ruleId } });
        if (!rule) throw new NotFoundException(`Rule ${ruleId} not found`);

        Object.assign(rule, data);
        return this.ruleRepo.save(rule);
    }

    async deductPoints(
        userId: string,
        amount: number,
        sourceType?: PointSourceType,
        sourceId?: string,
        reasonCode?: string,
        note?: string,
    ): Promise<PointTransaction> {
        const currentBalance = await this.getBalanceByUserId(userId);

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
        );
    }

    async deletePoint(transactionId: string): Promise<void> {
        const transaction = await this.transactionRepo.findOne({
            where: { id: transactionId },
        });
        if (!transaction) throw new NotFoundException(`Transaction ${transactionId} not found`);

        await this.transactionRepo.remove(transaction);
    }


}
