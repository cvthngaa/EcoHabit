import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';

@Injectable()
export class RewardsService {
    constructor(
        @InjectRepository(Reward)
        private readonly rewardRepo: Repository<Reward>,
    ) { }

    async getAllRewards() {
        return this.rewardRepo.find();
    }

    async getRewards(id: string) {
        return this.rewardRepo.findOne(
            { where: { id: id } }
        )
    }

    async createRewards(data: CreateRewardDto) {
        const reward = this.rewardRepo.create(data);
        return this.rewardRepo.save(reward);
    }

    async updateRewards(id: string, data: UpdateRewardDto) {
        const reward = await this.rewardRepo.findOne({ where: { id: id } });
        if (!reward) throw new NotFoundException(`Reward ${id} not found`);
        Object.assign(reward, data);
        return this.rewardRepo.save(reward);
    }

    async deleteRewards(id: string) {
        const reward = await this.rewardRepo.findOne({ where: { id: id } });
        if (!reward) throw new NotFoundException(`Reward ${id} not found`);
        return this.rewardRepo.remove(reward);
    }
}
