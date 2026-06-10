import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import * as crypto from 'crypto';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { Location } from './entities/location.entity';
import { DropoffStatus } from './enums/dropoff-status.enum';
import { LocationCapabilityType } from './enums/location-capability-type.enum';
import { PartnersService } from '../partner/partners.service';
import { PointsService } from '../points/points.service';
import { PointTransactionType } from '../points/enums/point-transaction-type.enum';
import { PointSourceType } from '../points/enums/point-source-type.enum';
import { PartnerRoleType } from '../partner/enum/partner-role-type.enum';
import { FraudService } from '../fraud/fraud.service';
import { LocationStatus } from './enums/location-status.enum';
import { BadgesService } from '../badges/badges.service';
import { JwtService } from '@nestjs/jwt';
import { ScanUserQrDto } from './dto/scan-user-qr.dto';
import { AcceptedWasteType } from './entities/accepted-waste-type.entity';

@Injectable()
export class CollectionTransactionsService {
  constructor(
    @InjectRepository(DropoffTransaction)
    private readonly dropoffRepo: Repository<DropoffTransaction>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly partnersService: PartnersService,
    private readonly pointsService: PointsService,
    private readonly fraudService: FraudService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    @Optional() private readonly badgesService: BadgesService,
  ) {
    const redisUrl = process.env.REDIS_URL?.trim();
    if (redisUrl && redisUrl.startsWith('redis')) {
      this.redisClient = new Redis(redisUrl);
    } else {
      this.redisClient = new Redis(); // localhost:6379
    }
  }

  private redisClient: Redis;

  // ✅ OPTION 3: PARTNER QUÉT MÃ QR CỦA USER
  async scanUserQr(partnerUserId: string, data: ScanUserQrDto) {
    // 1. Kiểm tra Partner có quyền COLLECTOR và có sở hữu Location này không
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(partnerUserId);
    if (!partnerProfile || !partnerProfile.roleTypes.includes(PartnerRoleType.COLLECTOR)) {
      throw new ForbiddenException('Bạn không có quyền thu gom.');
    }

    const location = await this.locationRepo.findOne({
      where: { id: data.locationId },
      relations: ['partnerProfile'],
    });

    if (!location) {
      throw new NotFoundException('Trạm thu gom không tồn tại.');
    }

    if (location.partnerProfile?.id !== partnerProfile.id) {
      throw new ForbiddenException('Bạn không có quyền quản lý trạm thu gom này.');
    }

    // 2. Giải mã qrToken từ máy User
    let userId = '';
    try {
      const decoded = this.jwtService.verify(data.qrToken);
      if (decoded.type !== 'PERSONAL_QR') {
        throw new Error('Invalid token type');
      }
      userId = decoded.sub;
    } catch (e) {
      throw new BadRequestException('Mã QR không hợp lệ hoặc đã hết hạn.');
    }

    // 2.5 Chống Replay Attack (Mỗi QR token chỉ được dùng 1 lần)
    const tokenHash = crypto.createHash('sha256').update(data.qrToken).digest('hex');
    const redisKey = `used_qr:${tokenHash}`;
    const isUsed = await this.redisClient.get(redisKey);
    if (isUsed) {
      throw new BadRequestException('Mã QR này đã được sử dụng. Vui lòng tạo mã mới.');
    }
    
    // Lưu vào Redis, hết hạn sau 5 phút (300s)
    await this.redisClient.set(redisKey, '1', 'EX', 300);

    // 3. Tạo giao dịch và duyệt ngay lập tức (Vì Partner quét trực tiếp) trong Transaction
    const saved = await this.dataSource.transaction(async (manager) => {
      const dropoff = manager.create(DropoffTransaction, {
        location: { id: location.id } as any,
        user: { id: userId } as any,
        status: DropoffStatus.VERIFIED,
        confirmedAt: new Date(),
        verifiedBy: { id: partnerUserId } as any,
        pointsAwarded: data.pointsAwarded,
        quantityValue: data.quantityValue ?? null,
        quantityUnit: data.quantityUnit ?? null,
      });

      if (data.acceptedWasteTypeId) {
        dropoff.acceptedWasteType = { id: data.acceptedWasteTypeId } as AcceptedWasteType;
      }

      const savedTx = await manager.save(DropoffTransaction, dropoff);

      // 4. Cộng điểm cho User
      if (data.pointsAwarded > 0) {
        await this.pointsService.addPoint(
          userId,
          data.pointsAwarded,
          PointTransactionType.EARN,
          PointSourceType.DROPOFF_TRANSACTION,
          savedTx.id,
          undefined,
          undefined,
          manager,
        );
      }
      return savedTx;
    });

    // Evaluate badge conditions asynchronously
    if (this.badgesService) {
      void this.badgesService.evaluateUserBadges(userId);
    }

    return saved;
  }

  async getMyCheckins(userId: string) {
    return this.dropoffRepo.find({
      where: { user: { id: userId } },
      relations: ['location', 'acceptedWasteType'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAdminTransactions() {
    return this.dropoffRepo.find({
      relations: ['user', 'location', 'acceptedWasteType'],
      order: { createdAt: 'DESC' },
      take: 100
    });
  }

  async getPartnerTransactions(userId: string) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(userId);
    if (!partnerProfile || !partnerProfile.roleTypes.includes(PartnerRoleType.COLLECTOR)) {
      throw new ForbiddenException('Only approved collectors can view these transactions');
    }

    return this.dropoffRepo.find({
      where: { location: { partnerProfile: { id: partnerProfile.id } } },
      relations: ['user', 'location', 'acceptedWasteType'],
      order: { createdAt: 'DESC' },
    });
  }

}
