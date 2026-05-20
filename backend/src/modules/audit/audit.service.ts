import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuditLog } from './entities/admin-audit-log.entity';
import { AdminAuditAction } from './enums/admin-audit-action.enum';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AdminAuditLog)
    private readonly auditLogRepository: Repository<AdminAuditLog>,
  ) {}

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
}
