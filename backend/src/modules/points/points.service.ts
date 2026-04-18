import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

    private getTransactionRepository(manager?: EntityManager) {
        return manager
            ? manager.getRepository(PointTransaction)
            : this.transactionRepo;
    }

    private getRuleRepository(manager?: EntityManager) {
        return manager
            ? manager.getRepository(PointRule)
            : this.ruleRepo;
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

        const transaction = transactionRepo.create({
            user: { id: userId },
            type,
            points: amount,
            balanceAfter: currentBalance + amount,
            sourceType,
            sourceId,
            reasonCode,
            note,
        });

        return transactionRepo.save(transaction);
    }

    async getBalanceByUserId(userId: string, manager?: EntityManager): Promise<number> {
        const transactionRepo = this.getTransactionRepository(manager);

        const result = await transactionRepo
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

    async updatePoint(ruleId: string, data: Partial<PointRule>, manager?: EntityManager): Promise<PointRule> {
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
        if (!transaction) throw new NotFoundException(`Transaction ${transactionId} not found`);

        await this.transactionRepo.remove(transaction);
    }


}
