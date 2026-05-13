import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { CollectionTransactionsService } from './collection-transactions.service';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { Location } from './entities/location.entity';
import { DropoffStatus } from './enums/dropoff-status.enum';
import { LocationCapabilityType } from './enums/location-capability-type.enum';
import { PartnersService } from '../partner/partners.service';
import { PointsService } from '../points/points.service';
import { QrService } from './qr.service';
import { PartnerRoleType } from '../partner/enum/partner-role-type.enum';
import { CreateCheckinDto } from './dto/create-checkin.dto';

// ───── Helpers ──────────────────────────────────────────────
const mockLocation = (overrides: Partial<Location> = {}): Location =>
  ({
    id: 'loc-1',
    latitude: 10.762622,
    longitude: 106.660172,
    capabilities: [{ capability: LocationCapabilityType.COLLECTION }],
    partnerProfile: { id: 'partner-1' },
    ...overrides,
  }) as unknown as Location;

const baseCheckinDto: CreateCheckinDto = {
  locationId: 'loc-1',
  userLatitude: 10.762622,
  userLongitude: 106.660172,
};

const savedDropoff = (overrides = {}) => ({
  id: 'drop-1',
  status: DropoffStatus.PENDING,
  user: { id: 'user-1' },
  location: mockLocation({ partnerProfile: { id: 'partner-1' } } as any),
  ...overrides,
});

// ───── Mocks ────────────────────────────────────────────────
const createMockDropoffRepo = () => ({
  create: jest.fn((data) => ({ id: 'drop-1', ...data })),
  save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id ?? 'drop-1' })),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn(),
});

const createMockLocationRepo = () => ({
  findOne: jest.fn(),
});

const createMockPartnersService = () => ({
  getPartnerSummaryByUserId: jest.fn(),
});

const createMockPointsService = () => ({
  hasTransactionForSource: jest.fn().mockResolvedValue(false),
  addPoint: jest.fn().mockResolvedValue({}),
});

const createMockQrService = () => ({
  validateAndUseQr: jest.fn().mockResolvedValue(undefined),
  generateQr: jest.fn().mockResolvedValue('qr-token-123'),
});

// ─────────────────────────────────────────────────────────────
describe('CollectionTransactionsService', () => {
  let service: CollectionTransactionsService;
  let dropoffRepo: ReturnType<typeof createMockDropoffRepo>;
  let locationRepo: ReturnType<typeof createMockLocationRepo>;
  let partnersService: ReturnType<typeof createMockPartnersService>;
  let pointsService: ReturnType<typeof createMockPointsService>;
  let qrService: ReturnType<typeof createMockQrService>;

  beforeEach(async () => {
    dropoffRepo = createMockDropoffRepo();
    locationRepo = createMockLocationRepo();
    partnersService = createMockPartnersService();
    pointsService = createMockPointsService();
    qrService = createMockQrService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionTransactionsService,
        { provide: getRepositoryToken(DropoffTransaction), useValue: dropoffRepo },
        { provide: getRepositoryToken(Location), useValue: locationRepo },
        { provide: PartnersService, useValue: partnersService },
        { provide: PointsService, useValue: pointsService },
        { provide: QrService, useValue: qrService },
      ],
    }).compile();

    service = module.get<CollectionTransactionsService>(CollectionTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ════════════════════════════════════════════════════════════
  //  CHECK-IN
  // ════════════════════════════════════════════════════════════
  describe('checkIn', () => {
    it('should throw NotFoundException if location does not exist', async () => {
      locationRepo.findOne.mockResolvedValue(null);

      await expect(service.checkIn('user-1', baseCheckinDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if location has no COLLECTION capability', async () => {
      locationRepo.findOne.mockResolvedValue(
        mockLocation({ capabilities: [] }),
      );

      await expect(service.checkIn('user-1', baseCheckinDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject check-in when user is too far from location (> 500m)', async () => {
      // Location in HCMC, user ~50 km away (Vung Tau)
      locationRepo.findOne.mockResolvedValue(mockLocation());

      const farDto: CreateCheckinDto = {
        ...baseCheckinDto,
        userLatitude: 10.346,
        userLongitude: 107.084,
      };

      await expect(service.checkIn('user-1', farDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.checkIn('user-1', farDto)).rejects.toThrow(
        /too far/i,
      );
    });

    it('should accept check-in when user is within 500m', async () => {
      locationRepo.findOne.mockResolvedValue(mockLocation());

      // Essentially the same coordinates → ~0 km distance
      const nearDto: CreateCheckinDto = {
        ...baseCheckinDto,
        userLatitude: 10.76265,
        userLongitude: 106.66020,
      };

      const result = await service.checkIn('user-1', nearDto);

      expect(dropoffRepo.create).toHaveBeenCalled();
      expect(dropoffRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should store userLatitude, userLongitude, and distanceKm on the dropoff', async () => {
      locationRepo.findOne.mockResolvedValue(mockLocation());

      await service.checkIn('user-1', baseCheckinDto);

      const createdEntity = dropoffRepo.create.mock.calls[0][0];
      expect(createdEntity.userLatitude).toBe(baseCheckinDto.userLatitude);
      expect(createdEntity.userLongitude).toBe(baseCheckinDto.userLongitude);
      expect(typeof createdEntity.distanceKm).toBe('number');
      expect(createdEntity.distanceKm).toBeGreaterThanOrEqual(0);
    });

    it('should set status to PENDING', async () => {
      locationRepo.findOne.mockResolvedValue(mockLocation());

      await service.checkIn('user-1', baseCheckinDto);

      const createdEntity = dropoffRepo.create.mock.calls[0][0];
      expect(createdEntity.status).toBe(DropoffStatus.PENDING);
    });

    it('should validate QR token if provided', async () => {
      locationRepo.findOne.mockResolvedValue(mockLocation());

      const dtoWithQr: CreateCheckinDto = {
        ...baseCheckinDto,
        qrToken: 'qr-abc-123',
      };

      await service.checkIn('user-1', dtoWithQr);

      expect(qrService.validateAndUseQr).toHaveBeenCalledWith('loc-1', 'qr-abc-123');
    });

    it('should not call QR validation when qrToken is absent', async () => {
      locationRepo.findOne.mockResolvedValue(mockLocation());

      await service.checkIn('user-1', baseCheckinDto);

      expect(qrService.validateAndUseQr).not.toHaveBeenCalled();
    });

    it('should allow check-in when location has no coordinates (distance = null)', async () => {
      locationRepo.findOne.mockResolvedValue(
        mockLocation({ latitude: null, longitude: null }),
      );

      await service.checkIn('user-1', baseCheckinDto);

      const createdEntity = dropoffRepo.create.mock.calls[0][0];
      expect(createdEntity.distanceKm).toBeNull();
      expect(dropoffRepo.save).toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════
  //  VERIFY TRANSACTION
  // ════════════════════════════════════════════════════════════
  describe('verifyTransaction', () => {
    const setupVerify = () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      dropoffRepo.findOne.mockResolvedValue(savedDropoff());
    };

    it('should throw ForbiddenException if user is not a collector', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue(null);

      await expect(
        service.verifyTransaction('user-partner', 'drop-1', 50),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      dropoffRepo.findOne.mockResolvedValue(null);

      await expect(
        service.verifyTransaction('user-partner', 'drop-1', 50),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if transaction is not PENDING', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      dropoffRepo.findOne.mockResolvedValue(
        savedDropoff({ status: DropoffStatus.VERIFIED }),
      );

      await expect(
        service.verifyTransaction('user-partner', 'drop-1', 50),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set pointsAwarded on the dropoff record', async () => {
      setupVerify();

      await service.verifyTransaction('user-partner', 'drop-1', 100);

      const saved = dropoffRepo.save.mock.calls[0][0];
      expect(saved.pointsAwarded).toBe(100);
    });

    it('should set confirmedAt to a Date on verify', async () => {
      setupVerify();

      await service.verifyTransaction('user-partner', 'drop-1', 50);

      const saved = dropoffRepo.save.mock.calls[0][0];
      expect(saved.confirmedAt).toBeInstanceOf(Date);
    });

    it('should set status to VERIFIED', async () => {
      setupVerify();

      await service.verifyTransaction('user-partner', 'drop-1', 50);

      const saved = dropoffRepo.save.mock.calls[0][0];
      expect(saved.status).toBe(DropoffStatus.VERIFIED);
    });

    it('should award points via PointsService when not already awarded', async () => {
      setupVerify();
      pointsService.hasTransactionForSource.mockResolvedValue(false);

      await service.verifyTransaction('user-partner', 'drop-1', 75);

      expect(pointsService.addPoint).toHaveBeenCalledWith(
        'user-1',
        75,
        expect.anything(),
        expect.anything(),
        'drop-1',
      );
    });

    it('should NOT double-award points if already awarded', async () => {
      setupVerify();
      pointsService.hasTransactionForSource.mockResolvedValue(true);

      await service.verifyTransaction('user-partner', 'drop-1', 75);

      expect(pointsService.addPoint).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════
  //  REJECT TRANSACTION
  // ════════════════════════════════════════════════════════════
  describe('rejectTransaction', () => {
    const setupReject = () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      dropoffRepo.findOne.mockResolvedValue(savedDropoff());
    };

    it('should throw ForbiddenException if user is not a collector', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue(null);

      await expect(
        service.rejectTransaction('user-partner', 'drop-1', 'Invalid waste'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should set status to REJECTED', async () => {
      setupReject();

      await service.rejectTransaction('user-partner', 'drop-1', 'Contaminated');

      const saved = dropoffRepo.save.mock.calls[0][0];
      expect(saved.status).toBe(DropoffStatus.REJECTED);
    });

    it('should store the rejectionReason on the dropoff', async () => {
      setupReject();

      await service.rejectTransaction('user-partner', 'drop-1', 'Wrong waste type');

      const saved = dropoffRepo.save.mock.calls[0][0];
      expect(saved.rejectionReason).toBe('Wrong waste type');
    });

    it('should set confirmedAt to a Date on reject', async () => {
      setupReject();

      await service.rejectTransaction('user-partner', 'drop-1', 'Bad quality');

      const saved = dropoffRepo.save.mock.calls[0][0];
      expect(saved.confirmedAt).toBeInstanceOf(Date);
    });

    it('should set rejectionReason to null when empty string provided', async () => {
      setupReject();

      await service.rejectTransaction('user-partner', 'drop-1', '');

      const saved = dropoffRepo.save.mock.calls[0][0];
      expect(saved.rejectionReason).toBeNull();
    });

    it('should throw BadRequestException if transaction is not PENDING', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      dropoffRepo.findOne.mockResolvedValue(
        savedDropoff({ status: DropoffStatus.REJECTED }),
      );

      await expect(
        service.rejectTransaction('user-partner', 'drop-1', 'Already rejected'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ════════════════════════════════════════════════════════════
  //  GENERATE LOCATION QR
  // ════════════════════════════════════════════════════════════
  describe('generateLocationQr', () => {
    it('should throw ForbiddenException if user is not a collector', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [],
      });

      await expect(
        service.generateLocationQr('user-partner', 'loc-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if location is not found', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      locationRepo.findOne.mockResolvedValue(null);

      await expect(
        service.generateLocationQr('user-partner', 'loc-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if location belongs to a different partner', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      locationRepo.findOne.mockResolvedValue(
        mockLocation({ partnerProfile: { id: 'partner-2' } } as any)
      );

      await expect(
        service.generateLocationQr('user-partner', 'loc-1'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.generateLocationQr('user-partner', 'loc-1'),
      ).rejects.toThrow(/only generate QR codes for your own locations/i);
    });

    it('should successfully generate and return QR token if location belongs to partner', async () => {
      partnersService.getPartnerSummaryByUserId.mockResolvedValue({
        id: 'partner-1',
        roleTypes: [PartnerRoleType.COLLECTOR],
      });
      locationRepo.findOne.mockResolvedValue(
        mockLocation({ partnerProfile: { id: 'partner-1' } } as any)
      );

      const result = await service.generateLocationQr('user-partner', 'loc-1');

      expect(qrService.generateQr).toHaveBeenCalledWith('loc-1');
      expect(result).toBe('qr-token-123');
    });
  });

  // ════════════════════════════════════════════════════════════
  //  GET MY CHECKINS
  // ════════════════════════════════════════════════════════════
  describe('getMyCheckins', () => {
    it('should query dropoffs for the given userId', async () => {
      dropoffRepo.find.mockResolvedValue([]);

      const result = await service.getMyCheckins('user-1');

      expect(dropoffRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user: { id: 'user-1' } },
        }),
      );
      expect(result).toEqual([]);
    });
  });
});
