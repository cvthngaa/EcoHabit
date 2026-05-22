import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PartnerRoles } from '../../../common/decorators/partner-roles.decorator';
import { PartnerRoleGuard } from '../../../common/guards/partner-role.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { PartnerRoleType } from '../../partner/enum/partner-role-type.enum';
import { RewardsService } from '../rewards.service';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';
import { UpdateRedemptionStatusDto } from '../dto/update-redemption-status.dto';
import { PartnersService } from '../../partner/partners.service';

@UseGuards(AuthGuard('jwt'), RolesGuard, PartnerRoleGuard)
@Roles(UserRole.PARTNER)
@PartnerRoles(PartnerRoleType.REWARD_PROVIDER)
@Controller('partner/rewards')
export class PartnerRewardsController {
  constructor(
    private readonly rewardsService: RewardsService,
    private readonly partnersService: PartnersService,
  ) {}

  @Get()
  async getMyRewards(@Request() req: any) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(req.user.userId);
    if (!partnerProfile) {
      throw new ForbiddenException('Partner profile not found');
    }
    return this.rewardsService.getPartnerRewards(partnerProfile.id);
  }

  @Post()
  async createRewards(@Request() req: any, @Body() data: CreateRewardDto) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(req.user.userId);
    if (!partnerProfile) {
      throw new ForbiddenException('Partner profile not found');
    }
    return this.rewardsService.createRewards(data, partnerProfile.id);
  }

  @Put(':id')
  async updateRewards(@Request() req: any, @Param('id') id: string, @Body() data: UpdateRewardDto) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(req.user.userId);
    if (!partnerProfile) {
      throw new ForbiddenException('Partner profile not found');
    }
    return this.rewardsService.updateRewards(id, data, partnerProfile.id);
  }

  @Delete(':id')
  async deleteRewards(@Request() req: any, @Param('id') id: string) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(req.user.userId);
    if (!partnerProfile) {
      throw new ForbiddenException('Partner profile not found');
    }
    return this.rewardsService.deleteRewards(id, partnerProfile.id);
  }

  @Get('redemptions')
  async getPartnerRedemptions(@Request() req: any) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(req.user.userId);
    if (!partnerProfile) {
      throw new ForbiddenException('Partner profile not found');
    }
    return this.rewardsService.getPartnerRedemptions(partnerProfile.id);
  }

  @Patch('redemptions/:id/status')
  async updatePartnerRedemptionStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateRedemptionStatusDto,
  ) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(req.user.userId);
    if (!partnerProfile) {
      throw new ForbiddenException('Partner profile not found');
    }
    return this.rewardsService.updateRedemptionStatus(id, data, partnerProfile.id);
  }
}
