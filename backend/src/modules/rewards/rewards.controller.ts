import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
@Controller('rewards')
export class RewardsController {
    constructor(
        private readonly rewardsService: RewardsService,
    ) { }

    @Get()
    async getAllRewards() {
        return this.rewardsService.getAllRewards();
    }

    @Get(':id')
    async getRewards(@Param('id') id: string) {
        return this.rewardsService.getRewards(id);
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
