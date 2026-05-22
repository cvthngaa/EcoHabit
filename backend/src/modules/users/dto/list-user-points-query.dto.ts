import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { PointTransactionType } from '../../points/enums/point-transaction-type.enum';
import { PointSourceType } from '../../points/enums/point-source-type.enum';

export class ListUserPointsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PointTransactionType)
  type?: PointTransactionType;

  @IsOptional()
  @IsEnum(PointSourceType)
  sourceType?: PointSourceType;

  /** ISO 8601 date string – lọc từ ngày */
  @IsOptional()
  @IsDateString()
  from?: string;

  /** ISO 8601 date string – lọc đến ngày */
  @IsOptional()
  @IsDateString()
  to?: string;
}
