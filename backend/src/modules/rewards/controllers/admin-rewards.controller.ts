import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { RewardsService } from '../rewards.service';
import { CreateRewardDto } from '../dto/create-reward.dto';
import { UpdateRewardDto } from '../dto/update-reward.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/rewards')
export class AdminRewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  async createRewards(@Body() data: CreateRewardDto) {
    return this.rewardsService.createRewards(data);
  }

  @Put(':id')
  async updateRewards(@Param('id') id: string, @Body() data: UpdateRewardDto) {
    return this.rewardsService.updateRewards(id, data);
  }

  @Delete(':id')
  async deleteRewards(@Param('id') id: string) {
    return this.rewardsService.deleteRewards(id);
  }
}
