import { PartialType } from '@nestjs/swagger';
import { CreateCollectionPointDto } from './create-collection-point.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { LocationStatus } from '../enums/location-status.enum';

export class UpdateCollectionPointDto extends PartialType(
  CreateCollectionPointDto,
) {
  @IsEnum(LocationStatus)
  @IsOptional()
  status?: LocationStatus;
}
