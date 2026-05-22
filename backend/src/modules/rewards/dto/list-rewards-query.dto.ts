import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { RewardStatus } from '../enums/reward-status.enum';

export class ListRewardsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RewardStatus)
  status?: RewardStatus;

  @IsOptional()
  @IsString()
  partnerId?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'name', 'pointsCost', 'stock', 'status'])
  sortBy?: 'createdAt' | 'name' | 'pointsCost' | 'stock' | 'status' = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
