import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PointsService } from './points.service';
import { PointTransaction } from './entities/point-transaction.entity';
import { PointRule } from './entities/point-rule.entity';

describe('PointsService', () => {
  let service: PointsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        {
          provide: getRepositoryToken(PointTransaction),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PointRule),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
