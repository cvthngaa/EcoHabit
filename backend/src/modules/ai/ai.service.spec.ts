import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { TrashClassification } from './entities/trash-classification.entity';
import { AiFeedback } from './entities/ai-feedback.entity';
import { PointsService } from '../points/points.service';
import { WasteType } from './enums/waste-type.enum';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getRepositoryToken(TrashClassification),
          useValue: {},
        },
        {
          provide: getRepositoryToken(AiFeedback),
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: PointsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('awards points only when confidence reaches threshold', () => {
    expect(
      service['calculateClassificationPoints'](WasteType.PLASTIC, 0.5),
    ).toBe(20);
    expect(
      service['calculateClassificationPoints'](WasteType.PLASTIC, 0.49),
    ).toBe(0);
  });

  it('returns zero points when waste type is missing', () => {
    expect(service['calculateClassificationPoints'](null, 0.9)).toBe(0);
  });
});
