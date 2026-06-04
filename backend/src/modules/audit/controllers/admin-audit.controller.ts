import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { AuditService } from '../audit.service';
import { ListAuditLogsQueryDto } from '../dto/list-audit-logs-query.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/audit')
export class AdminAuditController {
  constructor(private readonly auditService: AuditService) {}

  /** GET /api/admin/audit — Danh sách audit logs với phân trang và filter */
  @Get()
  async listLogs(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ListAuditLogsQueryDto,
  ) {
    return this.auditService.listLogs(query);
  }

  /** GET /api/admin/audit/:id — Chi tiết một audit log */
  @Get(':id')
  async getLogById(@Param('id') id: string) {
    return this.auditService.getLogById(id);
  }
}
