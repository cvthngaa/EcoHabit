import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { RewardsService } from '../rewards.service';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';
import { ListRewardsQueryDto } from '../dto/list-rewards-query.dto';
import { UpdateRewardStatusDto } from '../dto/update-reward-status.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/rewards')
export class AdminRewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async getRewards(@Query() query: ListRewardsQueryDto) {
    return this.rewardsService.getAdminRewards(query);
  }

  @Get('stats')
  async getRewardStats() {
    return this.rewardsService.getAdminRewardStats();
  }

  @Get(':id')
  async getRewardDetail(@Param('id') id: string) {
    return this.rewardsService.getRewards(id);
  }

  @Post()
  async createRewards(@Body() data: CreateRewardDto, @Req() req: any) {
    return this.rewardsService.createRewards(
      data,
      undefined, // partnerProfileId
      req.user.id,
      req.user.email,
    );
  }

  @Put(':id')
  async updateRewards(
    @Param('id') id: string, 
    @Body() data: UpdateRewardDto,
    @Req() req: any,
  ) {
    return this.rewardsService.updateRewards(
      id, 
      data,
      undefined,
      req.user.id,
      req.user.email,
    );
  }

  @Patch(':id/status')
  async updateRewardStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRewardStatusDto,
    @Req() req: any,
  ) {
    return this.rewardsService.updateRewardStatus(
      id,
      dto,
      req.user.id,
      req.user.email,
    );
  }

  @Delete(':id')
  async deleteRewards(@Param('id') id: string, @Req() req: any) {
    return this.rewardsService.deleteRewards(
      id,
      undefined,
      req.user.id,
      req.user.email,
    );
  }
}
