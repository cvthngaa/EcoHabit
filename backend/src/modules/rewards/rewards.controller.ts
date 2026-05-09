import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';

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
}
