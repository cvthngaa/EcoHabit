import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RewardsService } from './rewards.service';
import { Reward } from './entities/reward.entity';
import { Redemption } from './entities/redemption.entity';
import { RewardPickupOption } from './entities/reward-pickup-option.entity';
import { PointsService } from '../points/points.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateRedemptionStatusDto } from './dto/update-redemption-status.dto';
import { RedemptionStatus } from './enums/redemption-status.enum';

const mockRedemptionRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
});

describe('RewardsService', () => {
  let service: RewardsService;
  let redemptionRepo: any;

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
          useFactory: mockRedemptionRepo,
        },
        {
          provide: getRepositoryToken(RewardPickupOption),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: PointsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RewardsService>(RewardsService);
    redemptionRepo = module.get(getRepositoryToken(Redemption));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserRedemptions', () => {
    it('should query redemptions by user id', async () => {
      redemptionRepo.find.mockResolvedValue([]);
      await service.getUserRedemptions('user-1');
      expect(redemptionRepo.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
        relations: ['reward', 'reward.pickupOptions', 'reward.pickupOptions.location'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getPartnerRedemptions', () => {
    it('should query redemptions by partner profile id', async () => {
      redemptionRepo.find.mockResolvedValue([]);
      await service.getPartnerRedemptions('partner-1');
      expect(redemptionRepo.find).toHaveBeenCalledWith({
        where: { reward: { partnerProfile: { id: 'partner-1' } } },
        relations: ['user', 'reward', 'reward.pickupOptions', 'reward.pickupOptions.location'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('updateRedemptionStatus', () => {
    it('should throw ForbiddenException if partner tries to process a redemption for a reward they do not own', async () => {
      // Mock transaction runner to directly execute the callback
      const dataSource = {
        transaction: jest.fn().mockImplementation((cb) => cb({
          getRepository: () => ({
            findOne: jest.fn().mockResolvedValue({
              id: 'redemption-1',
              reward: { partnerProfile: { id: 'partner-other' } }
            })
          })
        }))
      };
      
      // We manually overwrite the service's dataSource for this specific test
      (service as any).dataSource = dataSource;

      const dto: UpdateRedemptionStatusDto = { status: RedemptionStatus.APPROVED };
      await expect(service.updateRedemptionStatus('redemption-1', dto, 'partner-me')).rejects.toThrow(ForbiddenException);
    });
  });
});
