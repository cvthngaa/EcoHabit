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

  @IsUUID()
  @IsOptional()
  acceptedWasteTypeId?: string;

  @IsNumber()
  @IsOptional()
  quantityValue?: number;

  @IsString()
  @IsOptional()
  quantityUnit?: string;
}
