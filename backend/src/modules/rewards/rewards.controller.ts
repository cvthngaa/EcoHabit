import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RedeemDto } from './dto/redeem.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  async getAllRewards() {
    return this.rewardsService.getAllRewards();
  }

  @Get(':id')
  async getRewards(@Param('id') id: string) {
    return this.rewardsService.getRewards(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('redeem')
  async redeemReward(@Body() data: RedeemDto, @Request() req: any) {
    return this.rewardsService.redeemReward(req.user.userId, data);
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
