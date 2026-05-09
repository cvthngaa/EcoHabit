import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LocationType } from '../enums/location-type.enum';
import { LocationCapabilityType } from '../enums/location-capability-type.enum';
import { CollectionSiteType } from '../enums/collection-site-type.enum';
import { WasteType } from '../../ai/enums/waste-type.enum';

class AcceptedWasteTypeDto {
  @IsEnum(WasteType)
  @IsNotEmpty()
  wasteType: WasteType;

  @IsString()
  @IsOptional()
  conditionNote?: string;
}

class CollectionProfileDto {
  @IsEnum(CollectionSiteType)
  @IsNotEmpty()
  siteType: CollectionSiteType;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsBoolean()
  @IsOptional()
  requiresStaffConfirmation?: boolean;
}

export class CreateCollectionPointDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  openingHours?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsEnum(LocationCapabilityType, { each: true })
  @IsOptional()
  capabilities?: LocationCapabilityType[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AcceptedWasteTypeDto)
  @IsOptional()
  acceptedWasteTypes?: AcceptedWasteTypeDto[];

  @ValidateNested()
  @Type(() => CollectionProfileDto)
  @IsOptional()
  collectionProfile?: CollectionProfileDto;
}
