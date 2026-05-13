import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCheckinDto {
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @IsNumber()
  @IsNotEmpty()
  userLatitude: number;

  @IsNumber()
  @IsNotEmpty()
  userLongitude: number;

  @IsUUID()
  @IsOptional()
  acceptedWasteTypeId?: string;

  @IsNumber()
  @IsOptional()
  quantityValue?: number;

  @IsString()
  @IsOptional()
  quantityUnit?: string;

  @IsString()
  @IsOptional()
  qrToken?: string;
}
