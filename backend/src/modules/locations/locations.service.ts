import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

type NominatimSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
};

type NominatimItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    country?: string;
  };
};

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(DropoffTransaction)
    private readonly dropoffRepo: Repository<DropoffTransaction>,
  ) {}

  private toSuggestionSubtitle(address?: NominatimItem['address']) {
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

  async getAllCollectionPoints() {
    return this.locationRepo.find({
      where: { status: LocationStatus.APPROVED },
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        latitude: true,
        longitude: true,
        status: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
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
        const latitude = Number(item.lat);
        const longitude = Number(item.lon);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return {
          id: String(item.place_id),
          title: item.name?.trim() || item.display_name.split(',')[0]?.trim() || 'Dia diem',
          subtitle: this.toSuggestionSubtitle(item.address) || item.display_name,
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
