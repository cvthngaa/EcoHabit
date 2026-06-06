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
import { LocationCapability } from './entities/location-capability.entity';
import { CollectionLocationProfile } from './entities/collection-location-profile.entity';
import { AcceptedWasteType } from './entities/accepted-waste-type.entity';
import { CreateCollectionPointDto } from './dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { LocationStatus } from './enums/location-status.enum';
import { DropoffStatus } from './enums/dropoff-status.enum';
import { PartnerRoleType } from '../partner/enum/partner-role-type.enum';
import { PartnersService } from '../partner/partners.service';
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
    @InjectRepository(LocationCapability)
    private readonly locationCapabilityRepo: Repository<LocationCapability>,
    @InjectRepository(CollectionLocationProfile)
    private readonly collectionLocationProfileRepo: Repository<CollectionLocationProfile>,
    @InjectRepository(AcceptedWasteType)
    private readonly acceptedWasteTypeRepo: Repository<AcceptedWasteType>,
    private readonly partnersService: PartnersService,
  ) { }

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
        'location.address',
        'location.latitude',
        'location.longitude',
        'location.status',
      ])
      .leftJoinAndSelect('location.collectionProfile', 'collectionProfile');

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

  async getMyCollectionPoints(userId: string, role: UserRole) {
    const query = this.locationRepo.createQueryBuilder('location');

    if (role === UserRole.ADMIN) {
      // Admin sees all locations
    } else {
      // Partner sees their own locations
      const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(userId);
      if (!partnerProfile) {
        return [];
      }
      query.where('location.partnerProfile = :partnerId', { partnerId: partnerProfile.id });
    }

    query
      .leftJoinAndSelect('location.capabilities', 'capabilities')
      .leftJoinAndSelect('location.acceptedWasteTypes', 'acceptedWasteTypes')
      .leftJoinAndSelect('location.collectionProfile', 'collectionProfile')
      .leftJoinAndSelect('location.partnerProfile', 'partnerProfile')
      .orderBy('location.createdAt', 'DESC');

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
    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(userId);

    if (!partnerProfile || !partnerProfile.roleTypes.includes(PartnerRoleType.COLLECTOR)) {
      throw new ForbiddenException('Only approved partners with COLLECTOR role can create collection points');
    }

    const location = this.locationRepo.create({
      name: data.name,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      contactPhone: data.contactPhone,
      status: LocationStatus.PENDING,
      createdBy: { id: userId },
      partnerProfile: { id: partnerProfile.id },
    });

    const savedLocation = await this.locationRepo.save(location);

    if (data.capabilities && data.capabilities.length > 0) {
      const capabilities = data.capabilities.map(cap => this.locationCapabilityRepo.create({
        location: { id: savedLocation.id },
        capability: cap,
      }));
      await this.locationCapabilityRepo.save(capabilities);
    }

    if (data.acceptedWasteTypes && data.acceptedWasteTypes.length > 0) {
      const wasteTypes = data.acceptedWasteTypes.map(wt => this.acceptedWasteTypeRepo.create({
        location: { id: savedLocation.id },
        wasteType: wt.wasteType,
        conditionNote: wt.conditionNote,
      }));
      await this.acceptedWasteTypeRepo.save(wasteTypes);
    }

    if (data.collectionProfile) {
      const profile = this.collectionLocationProfileRepo.create({
        location: { id: savedLocation.id },
        siteType: data.collectionProfile.siteType,
        instructions: data.collectionProfile.instructions,
        requiresStaffConfirmation: data.collectionProfile.requiresStaffConfirmation,
      });
      await this.collectionLocationProfileRepo.save(profile);
    }

    return this.locationRepo.findOne({
      where: { id: savedLocation.id },
      relations: ['capabilities', 'acceptedWasteTypes', 'collectionProfile', 'partnerProfile'],
    });
  }

  async updateCollectionPoint(
    id: string,
    userId: string,
    role: UserRole,
    data: UpdateCollectionPointDto,
  ) {
    const location = await this.locationRepo.findOne({
      where: { id },
      relations: ['partnerProfile'],
    });

    if (!location)
      throw new NotFoundException(`Collection point ${id} not found`);

    if (role !== UserRole.ADMIN) {
      const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(userId);
      if (!partnerProfile || location.partnerProfile?.id !== partnerProfile.id) {
        throw new ForbiddenException(
          'You can only update your own collection points',
        );
      }
    }

    // Role check for status update
    if (data.status && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Only admins can update the status of a collection point',
      );
    }

    // Extract nested data, update simple fields
    const { capabilities, acceptedWasteTypes, collectionProfile, ...simpleData } = data;
    Object.assign(location, simpleData);
    await this.locationRepo.save(location);

    // Update capabilities (delete old, insert new)
    if (capabilities !== undefined) {
      await this.locationCapabilityRepo.delete({ location: { id } });
      if (capabilities.length > 0) {
        const newCapabilities = capabilities.map(cap =>
          this.locationCapabilityRepo.create({
            location: { id },
            capability: cap,
          }),
        );
        await this.locationCapabilityRepo.save(newCapabilities);
      }
    }

    // Update accepted waste types (delete old, insert new)
    if (acceptedWasteTypes !== undefined) {
      await this.acceptedWasteTypeRepo.delete({ location: { id } });
      if (acceptedWasteTypes.length > 0) {
        const newWasteTypes = acceptedWasteTypes.map(wt =>
          this.acceptedWasteTypeRepo.create({
            location: { id },
            wasteType: wt.wasteType,
            conditionNote: wt.conditionNote,
          }),
        );
        await this.acceptedWasteTypeRepo.save(newWasteTypes);
      }
    }

    // Update collection profile (upsert)
    if (collectionProfile !== undefined) {
      const existing = await this.collectionLocationProfileRepo.findOne({
        where: { location: { id } },
      });

      if (existing) {
        Object.assign(existing, collectionProfile);
        await this.collectionLocationProfileRepo.save(existing);
      } else {
        const newProfile = this.collectionLocationProfileRepo.create({
          location: { id },
          ...collectionProfile,
        });
        await this.collectionLocationProfileRepo.save(newProfile);
      }
    }

    return this.locationRepo.findOne({
      where: { id },
      relations: ['capabilities', 'acceptedWasteTypes', 'collectionProfile', 'partnerProfile'],
    });
  }

}
