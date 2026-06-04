import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';
import { UserRole } from '../../users/enums/user-role.enum';
import { FraudService } from '../fraud.service';
import { ListFraudFlagsQueryDto } from '../dto/list-fraud-flags-query.dto';
import { UpdateFraudFlagStatusDto } from '../dto/update-fraud-flag-status.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/fraud')
export class AdminFraudController {
  constructor(private readonly fraudService: FraudService) {}

  /**
   * GET /api/admin/fraud
   * Danh sách fraud flags với phân trang và filter.
   */
  @Get()
  listFlags(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ListFraudFlagsQueryDto,
  ) {
    return this.fraudService.listFlags(query);
  }

  /**
   * GET /api/admin/fraud/stats
   * PHẢI đứng trước /:id để tránh NestJS hiểu "stats" là id.
   */
  @Get('stats')
  getStats() {
    return this.fraudService.getStats();
  }

  /**
   * GET /api/admin/fraud/:id
   * Chi tiết một fraud flag.
   */
  @Get(':id')
  getFlagDetail(@Param('id') id: string) {
    return this.fraudService.getFlagDetail(id);
  }

  /**
   * PATCH /api/admin/fraud/:id/status
   * Admin cập nhật trạng thái flag và ghi audit log.
   */
  @Patch(':id/status')
  updateFlagStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateFraudFlagStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.fraudService.updateFlagStatus(
      id,
      dto,
      req.user.userId,
      req.user.email,
    );
  }
}
