import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
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
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { FraudService } from '../fraud/fraud.service';
import { LocationStatus } from './enums/location-status.enum';

/** Maximum allowed distance (km) between user GPS and location for a valid check-in */
const MAX_CHECKIN_DISTANCE_KM = 0.5; // 500 metres

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
  ) {}

  /**
   * Haversine formula — returns distance in kilometres between two GPS points.
   */
  private calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async checkIn(userId: string, data: CreateCheckinDto) {
    const location = await this.locationRepo.findOne({
      where: { id: data.locationId },
      relations: ['capabilities', 'partnerProfile'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const hasCollectionCap = location.capabilities.some(
      (cap) => cap.capability === LocationCapabilityType.COLLECTION,
    );

    if (!hasCollectionCap) {
      throw new BadRequestException('Location does not support waste collection');
    }

    if (location.status !== LocationStatus.APPROVED) {
      throw new BadRequestException('Location is not active or approved for check-in');
    }

    // --- GPS distance validation ---
    let distanceKm: number | null = null;

    if (
      location.latitude != null &&
      location.longitude != null
    ) {
      distanceKm = this.calculateDistanceKm(
        data.userLatitude,
        data.userLongitude,
        location.latitude,
        location.longitude,
      );

      // Round to 3 decimal places for cleaner storage
      distanceKm = Math.round(distanceKm * 1000) / 1000;

      if (distanceKm > MAX_CHECKIN_DISTANCE_KM) {
        // Ghi fraud flag trước khi throw — fire-and-forget
        void this.fraudService.flagCheckinTooFar({
          userId,
          locationId: location.id,
          distanceKm,
          userLatitude: data.userLatitude,
          userLongitude: data.userLongitude,
        });

        throw new BadRequestException(
          `You are too far from this location (${distanceKm.toFixed(2)} km). ` +
          `Please be within ${MAX_CHECKIN_DISTANCE_KM * 1000}m to check in.`,
        );
      }
    }

    // --- QR token validation ---
    if (!data.qrToken) {
      throw new BadRequestException('Mã QR không hợp lệ (thiếu token).');
    }
    if (!location.qrSecret || location.qrSecret !== data.qrToken) {
      throw new BadRequestException('Mã QR không hợp lệ. Vui lòng quét lại mã QR tại điểm thu gom.');
    }

    // --- Rate Limit Validation (10 mins cooldown) ---
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCheckin = await this.dropoffRepo.findOne({
      where: {
        user: { id: userId },
        location: { id: location.id },
        createdAt: MoreThan(tenMinutesAgo),
      },
    });

    if (recentCheckin) {
      throw new BadRequestException('Bạn đã check-in tại địa điểm này gần đây. Vui lòng thử lại sau 10 phút.');
    }

    const dropoff = this.dropoffRepo.create({
      user: { id: userId },
      location: { id: location.id },
      acceptedWasteType: data.acceptedWasteTypeId ? { id: data.acceptedWasteTypeId } : null,
      quantityValue: data.quantityValue,
      quantityUnit: data.quantityUnit,
      userLatitude: data.userLatitude,
      userLongitude: data.userLongitude,
      distanceKm,
      status: DropoffStatus.PENDING,
    });

    if (location.partnerProfile?.autoConfirmCheckin) {
      dropoff.status = DropoffStatus.VERIFIED;
      dropoff.confirmedAt = new Date();
      // Default 10 points per unit
      const pointsAwarded = Math.max(1, Math.round((data.quantityValue || 1) * 10));
      dropoff.pointsAwarded = pointsAwarded;
      
      const result = await this.dropoffRepo.save(dropoff);
      
      await this.pointsService.addPoint(
        userId,
        pointsAwarded,
        PointTransactionType.EARN,
        PointSourceType.DROPOFF_TRANSACTION,
        result.id,
      );

      void this.fraudService.checkDailyCollectionCheckins(userId, data.locationId);
      return result;
    }

    const result = await this.dropoffRepo.save(dropoff);

    // Kiểm tra check-in quá thường xuyên — fire-and-forget, không chặn flow
    void this.fraudService.checkDailyCollectionCheckins(userId, data.locationId);

    return result;
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

  async verifyTransaction(userId: string, transactionId: string, pointsAwarded: number) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(userId);
    if (!partnerProfile || !partnerProfile.roleTypes.includes(PartnerRoleType.COLLECTOR)) {
      throw new ForbiddenException('Only approved collectors can verify transactions');
    }

    const dropoff = await this.dropoffRepo.findOne({
      where: { id: transactionId },
      relations: ['location', 'location.partnerProfile', 'user'],
    });

    if (!dropoff) {
      throw new NotFoundException('Transaction not found');
    }

    if (dropoff.location?.partnerProfile?.id !== partnerProfile.id) {
      throw new ForbiddenException('This transaction belongs to a location managed by another partner');
    }

    if (dropoff.status !== DropoffStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    if (!dropoff.user) {
      throw new BadRequestException('Transaction does not have an associated user');
    }

    // Award points (idempotent — skip if already awarded)
    const hasAwarded = await this.pointsService.hasTransactionForSource(
      dropoff.user.id,
      PointSourceType.DROPOFF_TRANSACTION,
      dropoff.id,
    );

    if (!hasAwarded) {
      await this.pointsService.addPoint(
        dropoff.user.id,
        pointsAwarded,
        PointTransactionType.EARN,
        PointSourceType.DROPOFF_TRANSACTION,
        dropoff.id,
      );
    }

    dropoff.status = DropoffStatus.VERIFIED;
    dropoff.verifiedBy = { id: userId } as any;
    dropoff.pointsAwarded = pointsAwarded;
    dropoff.confirmedAt = new Date();

    return this.dropoffRepo.save(dropoff);
  }

  async rejectTransaction(userId: string, transactionId: string, rejectionReason: string) {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(userId);
    if (!partnerProfile || !partnerProfile.roleTypes.includes(PartnerRoleType.COLLECTOR)) {
      throw new ForbiddenException('Only approved collectors can reject transactions');
    }

    const dropoff = await this.dropoffRepo.findOne({
      where: { id: transactionId },
      relations: ['location', 'location.partnerProfile'],
    });

    if (!dropoff) {
      throw new NotFoundException('Transaction not found');
    }

    if (dropoff.location?.partnerProfile?.id !== partnerProfile.id) {
      throw new ForbiddenException('This transaction belongs to a location managed by another partner');
    }

    if (dropoff.status !== DropoffStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    dropoff.status = DropoffStatus.REJECTED;
    dropoff.rejectionReason = rejectionReason || null;
    dropoff.confirmedAt = new Date();

    return this.dropoffRepo.save(dropoff);
  }

  async generateLocationQr(userId: string, locationId: string, regenerate = false): Promise<string> {
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(userId);
    if (!partnerProfile || !partnerProfile.roleTypes.includes(PartnerRoleType.COLLECTOR)) {
      throw new ForbiddenException('Only approved collectors can generate QR codes');
    }

    const location = await this.locationRepo.findOne({
      where: { id: locationId },
      relations: ['partnerProfile'],
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (location.partnerProfile?.id !== partnerProfile.id) {
      throw new ForbiddenException('You can only generate QR codes for your own locations');
    }

    if (!regenerate && location.qrSecret) {
      return location.qrSecret;
    }

    location.qrSecret = crypto.randomUUID().replace(/-/g, '');
    await this.locationRepo.save(location);

    return location.qrSecret;
  }
}
