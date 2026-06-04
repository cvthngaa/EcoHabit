import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FraudStatus } from '../enums/fraud-status.enum';
import { FraudSeverity } from '../enums/fraud-severity.enum';
import { FraudSourceType } from '../enums/fraud-source-type.enum';

export class ListFraudFlagsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(FraudStatus)
  status?: FraudStatus;

  @IsOptional()
  @IsEnum(FraudSeverity)
  severity?: FraudSeverity;

  @IsOptional()
  @IsEnum(FraudSourceType)
  sourceType?: FraudSourceType;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  flagCode?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
