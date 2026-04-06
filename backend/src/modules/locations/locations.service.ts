import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { CreateCollectionPointDto } from './dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { LocationStatus } from './enums/location-status.enum';
import { DropoffStatus } from './enums/dropoff-status.enum';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(DropoffTransaction)
    private readonly dropoffRepo: Repository<DropoffTransaction>,
  ) {}

  async getAllCollectionPoints() {
    return this.locationRepo.find({
      where: { status: LocationStatus.APPROVED },
      relations: ['createdBy'],
    });
  }

  async getCollectionPoint(id: string) {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['createdBy', 'acceptedWasteTypes'],
    });
    if (!location) throw new NotFoundException(`Collection point ${id} not found`);
    return location;
  }

  async createCollectionPoint(userId: string, data: CreateCollectionPointDto) {
    const location = this.locationRepo.create({
      ...data,
      status: LocationStatus.PENDING,
      createdBy: { id: userId },
    });
    return this.locationRepo.save(location);
  }

  async updateCollectionPoint(id: string, userId: string, role: UserRole, data: UpdateCollectionPointDto) {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    
    if (!location) throw new NotFoundException(`Collection point ${id} not found`);
    
    if (role !== UserRole.ADMIN && location.createdBy?.id !== userId) {
      throw new ForbiddenException('You can only update your own collection points');
    }

    // Role check for status update
    if (data.status && role !== UserRole.ADMIN) {
        throw new ForbiddenException('Only admins can update the status of a collection point');
    }

    Object.assign(location, data);
    return this.locationRepo.save(location);
  }

  async createCheckin(userId: string, data: CreateCheckinDto) {
    const location = await this.locationRepo.findOne({ where: { id: data.locationId } });
    if (!location) throw new NotFoundException(`Collection point ${data.locationId} not found`);

    const dropoff = this.dropoffRepo.create({
      user: { id: userId },
      location: { id: data.locationId },
      acceptedWasteType: data.acceptedWasteTypeId ? { id: data.acceptedWasteTypeId } : null,
      quantityValue: data.quantityValue,
      quantityUnit: data.quantityUnit,
      status: DropoffStatus.PENDING,
    });

    return this.dropoffRepo.save(dropoff);
  }
}
