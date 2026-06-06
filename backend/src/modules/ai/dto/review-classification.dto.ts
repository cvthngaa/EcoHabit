import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { WasteType } from '../enums/waste-type.enum';
import { BinType } from '../enums/bin-type.enum';

export enum ReviewAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CORRECT = 'CORRECT',
}

export class ReviewClassificationDto {
  @ApiProperty({ enum: ReviewAction, description: 'Action to take' })
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @ApiPropertyOptional({ description: 'Corrected label for the image' })
  @IsOptional()
  @IsString()
  correctedLabel?: string;

  @ApiPropertyOptional({ enum: WasteType, description: 'Corrected waste type' })
  @IsOptional()
  @IsEnum(WasteType)
  correctedWasteType?: WasteType;

  @ApiPropertyOptional({ enum: BinType, description: 'Corrected bin type' })
  @IsOptional()
  @IsEnum(BinType)
  correctedBin?: BinType;

  @ApiPropertyOptional({ description: 'Note from the reviewer' })
  @IsOptional()
  @IsString()
  reviewNote?: string;

  @ApiPropertyOptional({ description: 'Corrected bounding box [xmin, ymin, xmax, ymax]' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  correctedBoundingBox?: number[];
}
