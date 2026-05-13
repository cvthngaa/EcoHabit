import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RewardsService } from '../rewards.service';
import { RedeemDto } from '../dto/redeem.dto';
import { UpdateRedemptionStatusDto } from '../dto/update-redemption-status.dto';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';

@Controller('redemptions')
export class RedemptionsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMyRedemptions(@Request() req: AuthenticatedRequest) {
    return this.rewardsService.getUserRedemptions(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async redeemReward(
    @Body() data: RedeemDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.rewardsService.redeemReward(req.user.userId, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateRedemptionStatus(
    @Param('id') id: string,
    @Body() data: UpdateRedemptionStatusDto,
  ) {
    return this.rewardsService.updateRedemptionStatus(id, data);
  }
}
