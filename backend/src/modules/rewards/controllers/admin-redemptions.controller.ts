import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { RewardsService } from '../rewards.service';
import { ListRedemptionsQueryDto } from '../dto/list-redemptions-query.dto';
import { UpdateRedemptionStatusDto } from '../dto/update-redemption-status.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/redemptions')
export class AdminRedemptionsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async getRedemptions(@Query() query: ListRedemptionsQueryDto) {
    return this.rewardsService.getAdminRedemptions(query);
  }

  @Get(':id')
  async getRedemptionDetail(@Param('id') id: string) {
    return this.rewardsService.getAdminRedemptionDetail(id);
  }

  @Patch(':id/status')
  async updateRedemptionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRedemptionStatusDto,
    @Req() req: any,
  ) {
    return this.rewardsService.updateRedemptionStatus(
      id,
      dto,
      undefined, // partnerProfileId
      req.user.id,
      req.user.email,
    );
  }
}
