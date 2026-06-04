import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { AdminAuditAction } from './enums/admin-audit-action.enum';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AdminAuditLog)
    private readonly auditLogRepository: Repository<AdminAuditLog>,
  ) {}

  /** Ghi một audit log entry. Giữ nguyên chữ ký để tương thích với các module đang gọi. */
  async log(
    adminId: string,
    adminEmail: string,
    action: AdminAuditAction,
    targetUserId?: string | null,
    metadata?: Record<string, any> | null,
  ): Promise<void> {
    const entry = this.auditLogRepository.create({
      adminId,
      adminEmail,
      action,
      targetUserId: targetUserId ?? null,
      metadata: metadata ?? null,
    });
    await this.auditLogRepository.save(entry);
  }

  /** Lấy danh sách audit logs với phân trang, filter và sort. */
  async listLogs(query: ListAuditLogsQueryDto): Promise<{
    data: AdminAuditLog[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { action, actorEmail, targetUserId, from, to, sortOrder, page, limit } = query;
    const take = limit ?? 20;
    const skip = ((page ?? 1) - 1) * take;

    const qb = this.auditLogRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', sortOrder ?? 'DESC')
      .take(take)
      .skip(skip);

    if (action) {
      qb.andWhere('log.action = :action', { action });
    }

    if (actorEmail) {
      qb.andWhere('log.adminEmail ILIKE :adminEmail', { adminEmail: `%${actorEmail}%` });
    }

    if (targetUserId) {
      qb.andWhere('log.targetUserId = :targetUserId', { targetUserId });
    }

    if (from) {
      qb.andWhere('log.createdAt >= :from', { from: new Date(from) });
    }

    if (to) {
      qb.andWhere('log.createdAt <= :to', { to: new Date(to) });
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

  /** Lấy một audit log theo id. Throw NotFoundException nếu không tồn tại. */
  async getLogById(id: string): Promise<AdminAuditLog> {
    const log = await this.auditLogRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Audit log with id "${id}" not found`);
    }
    return log;
  }
}
