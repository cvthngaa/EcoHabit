import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Location } from './entities/location.entity';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { CreateCollectionPointDto } from './dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { LocationStatus } from './enums/location-status.enum';
import { DropoffStatus } from './enums/dropoff-status.enum';
import {
  NominatimAddress,
  NominatimItem,
  NominatimSuggestion,
} from './types/nominatim.types';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(DropoffTransaction)
    private readonly dropoffRepo: Repository<DropoffTransaction>,
  ) {}

  private toCoordinateNumber(value?: string | number | null) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private toSuggestionSubtitle(address?: NominatimAddress) {
    if (!address) {
      return '';
    }

    return [
      address.road,
      address.suburb,
      address.city || address.town,
      address.state,
      address.country,
    ]
      .filter(Boolean)
      .join(', ');
  }

  async getAllCollectionPoints(
    latitude?: number,
    longitude?: number,
    radiusKm: number = 10,
  ) {
    const query = this.locationRepo
      .createQueryBuilder('location')
      .where('location.status = :status', { status: LocationStatus.APPROVED })
      .select([
        'location.id',
        'location.name',
        'location.type',
        'location.address',
        'location.latitude',
        'location.longitude',
        'location.status',
      ]);

    if (
      latitude !== undefined &&
      longitude !== undefined &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    ) {
      query
        .andWhere(
          'location.latitude IS NOT NULL AND location.longitude IS NOT NULL',
        )
        .addSelect(
          `(6371 * acos(least(greatest(cos(radians(:latitude)) * cos(radians(location.latitude)) * cos(radians(location.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(location.latitude)), -1.0), 1.0)))`,
          'distance',
        )
        .setParameters({ latitude, longitude, radiusKm })
        .andWhere(
          `(6371 * acos(least(greatest(cos(radians(:latitude)) * cos(radians(location.latitude)) * cos(radians(location.longitude) - radians(:longitude)) + sin(radians(:latitude)) * sin(radians(location.latitude)), -1.0), 1.0))) <= :radiusKm`,
        )
        .orderBy('distance', 'ASC');
    } else {
      query.orderBy('location.createdAt', 'DESC');
    }

    return query.getMany();
  }

  async getAddressSuggestions(query: string): Promise<NominatimSuggestion[]> {
    const trimmed = query?.trim();

    if (!trimmed || trimmed.length < 3) {
      return [];
    }

    const response = await axios.get<NominatimItem[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: trimmed,
          format: 'jsonv2',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'vn',
        },
        headers: {
          Accept: 'application/json',
          'User-Agent': 'EcoHabit/1.0 (address autocomplete)',
        },
        timeout: 10000,
      },
    );

    if (!Array.isArray(response.data)) {
      throw new BadRequestException('Invalid address suggestion response');
    }

    return response.data
      .map((item) => {
        const latitude = this.toCoordinateNumber(item.lat);
        const longitude = this.toCoordinateNumber(item.lon);

        if (latitude === null || longitude === null) {
          return null;
        }

        return {
          id: String(item.place_id),
          title:
            item.name?.trim() ||
            item.display_name.split(',')[0]?.trim() ||
            'Dia diem',
          subtitle:
            this.toSuggestionSubtitle(item.address) || item.display_name,
          latitude,
          longitude,
        };
      })
      .filter((item): item is NominatimSuggestion => item !== null);
  }

  async getCollectionPoint(id: string) {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['createdBy', 'acceptedWasteTypes'],
    });
    if (!location)
      throw new NotFoundException(`Collection point ${id} not found`);
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

  async updateCollectionPoint(
    id: string,
    userId: string,
    role: UserRole,
    data: UpdateCollectionPointDto,
  ) {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!location)
      throw new NotFoundException(`Collection point ${id} not found`);

    if (role !== UserRole.ADMIN && location.createdBy?.id !== userId) {
      throw new ForbiddenException(
        'You can only update your own collection points',
      );
    }

    // Role check for status update
    if (data.status && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only admins can update the status of a collection point',
      );
    }

    Object.assign(location, data);
    return this.locationRepo.save(location);
  }

  async createCheckin(userId: string, data: CreateCheckinDto) {
    const location = await this.locationRepo.findOne({
      where: { id: data.locationId },
    });
    if (!location)
      throw new NotFoundException(
        `Collection point ${data.locationId} not found`,
      );

    const dropoff = this.dropoffRepo.create({
      user: { id: userId },
      location: { id: data.locationId },
      acceptedWasteType: data.acceptedWasteTypeId
        ? { id: data.acceptedWasteTypeId }
        : null,
      quantityValue: data.quantityValue,
      quantityUnit: data.quantityUnit,
      status: DropoffStatus.PENDING,
    });

    return this.dropoffRepo.save(dropoff);
  }
}
