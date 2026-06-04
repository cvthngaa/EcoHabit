import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { FraudSourceType } from '../enums/fraud-source-type.enum';
import { FraudSeverity } from '../enums/fraud-severity.enum';

export class CreateFraudFlagDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEnum(FraudSourceType)
  sourceType: FraudSourceType;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsNotEmpty()
  @IsString()
  flagCode: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(FraudSeverity)
  severity: FraudSeverity;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
