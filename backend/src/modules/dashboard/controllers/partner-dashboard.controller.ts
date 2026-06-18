import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';
import { UserRole } from '../../users/enums/user-role.enum';
import { DashboardService } from '../dashboard.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.PARTNER)
@Controller('partner/dashboard')
export class PartnerDashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(
    @Request() req: AuthenticatedRequest,
    @Query('filter') filter: 'today' | 'week' | 'month' | 'year',
  ) {
    return this.dashboardService.getPartnerDashboardStats(req.user.userId, filter || 'month');
  }
}
