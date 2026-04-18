import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';
import { Redemption } from './entities/redemption.entity';
import { PointsService } from '../points/points.service';

describe('RewardsService', () => {
  let service: RewardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsService,
        {
          provide: getRepositoryToken(Reward),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Redemption),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: PointsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
