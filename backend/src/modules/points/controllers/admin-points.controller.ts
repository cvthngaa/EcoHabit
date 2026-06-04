import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';
import { PointsService } from '../points.service';
import { ListPointTransactionsQueryDto } from '../dto/list-point-transactions-query.dto';
import { AdjustPointsDto } from '../dto/adjust-points.dto';
import { CreatePointRuleDto } from '../dto/create-point-rule.dto';
import { UpdatePointRuleDto } from '../dto/update-point-rule.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/points')
export class AdminPointsController {
  constructor(private readonly pointsService: PointsService) {}

  /** GET /api/admin/points/transactions — Lịch sử giao dịch điểm (phân trang + filter). */
  @Get('transactions')
  listTransactions(@Query() query: ListPointTransactionsQueryDto) {
    return this.pointsService.listTransactions(query);
  }

  /** GET /api/admin/points/rules — Danh sách quy tắc điểm. */
  @Get('rules')
  getRules() {
    return this.pointsService.getRules();
  }

  /** POST /api/admin/points/rules — Tạo quy tắc điểm mới. */
  @Post('rules')
  createRule(@Body() dto: CreatePointRuleDto) {
    return this.pointsService.createRule(dto);
  }

  /** PATCH /api/admin/points/rules/:id — Cập nhật quy tắc điểm. */
  @Patch('rules/:id')
  updateRule(@Param('id') id: string, @Body() dto: UpdatePointRuleDto) {
    return this.pointsService.updateRule(id, dto);
  }

  /** POST /api/admin/points/users/:id/adjust — Điều chỉnh điểm thủ công cho user. */
  @Post('users/:id/adjust')
  adjustUserPoints(
    @Request() req: AuthenticatedRequest,
    @Param('id') targetUserId: string,
    @Body() dto: AdjustPointsDto,
  ) {
    return this.pointsService.adjustUserPoints(
      req.user.userId,
      targetUserId,
      dto,
      req.user.email,
    );
  }
}
