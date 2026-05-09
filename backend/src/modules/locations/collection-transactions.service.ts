import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { Location } from './entities/location.entity';
import { DropoffStatus } from './enums/dropoff-status.enum';
import { LocationCapabilityType } from './enums/location-capability-type.enum';
import { PartnersService } from '../partner/partners.service';
import { PointsService } from '../points/points.service';
import { PointTransactionType } from '../points/enums/point-transaction-type.enum';
import { PointSourceType } from '../points/enums/point-source-type.enum';
import { QrService } from './qr.service';
import { PartnerRoleType } from '../partner/enum/partner-role-type.enum';

@Injectable()
export class CollectionTransactionsService {
  constructor(
    @InjectRepository(DropoffTransaction)
    private readonly dropoffRepo: Repository<DropoffTransaction>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly partnersService: PartnersService,
    private readonly pointsService: PointsService,
    private readonly qrService: QrService,
  ) {}

  async checkIn(userId: string, data: any) {
    const location = await this.locationRepo.findOne({
      where: { id: data.locationId },
      relations: ['capabilities'],
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

    if (data.qrToken) {
      await this.qrService.validateAndUseQr(location.id, data.qrToken);
    }

    const dropoff = this.dropoffRepo.create({
      user: { id: userId },
      location: { id: location.id },
      acceptedWasteType: data.acceptedWasteTypeId ? { id: data.acceptedWasteTypeId } : null,
      quantityValue: data.quantityValue,
      quantityUnit: data.quantityUnit,
      status: DropoffStatus.PENDING,
    });

    return this.dropoffRepo.save(dropoff);
  }

  async getMyCheckins(userId: string) {
    return this.dropoffRepo.find({
      where: { user: { id: userId } },
      relations: ['location', 'acceptedWasteType'],
      order: { createdAt: 'DESC' },
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
    // Assuming there is a rejectionReason field or similar. 
    // If not, we might need to add it, but for now we just change status
    
    return this.dropoffRepo.save(dropoff);
  }
}
