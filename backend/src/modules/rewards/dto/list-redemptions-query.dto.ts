import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { RedemptionStatus } from '../enums/redemption-status.enum';

export class ListRedemptionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RedemptionStatus)
  status?: RedemptionStatus;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  rewardId?: string;

  @IsOptional()
  @IsString()
  partnerId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'pointsSpent', 'status'])
  sortBy?: 'createdAt' | 'pointsSpent' | 'status' = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
