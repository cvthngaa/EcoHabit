import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RedeemDto } from './dto/redeem.dto';
import { UpdateRedemptionStatusDto } from './dto/update-redemption-status.dto';
import { UserRole } from '../users/enums/user-role.enum';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async getAllRewards() {
    return this.rewardsService.getAllRewards();
  }

  @Get('top')
  async getTopRewards(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ) {
    return this.rewardsService.getTopRewards(limit);
  }

  @Get(':id')
  async getRewards(@Param('id') id: string) {
    return this.rewardsService.getRewards(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('redeem')
  async redeemReward(
    @Body() data: RedeemDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.rewardsService.redeemReward(req.user.userId, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('redemptions/:id/status')
  async updateRedemptionStatus(
    @Param('id') id: string,
    @Body() data: UpdateRedemptionStatusDto,
  ) {
    return this.rewardsService.updateRedemptionStatus(id, data);
  }

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
