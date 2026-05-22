import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';
import { DropoffStatus } from '../../locations/enums/dropoff-status.enum';

export class ListUserDropoffsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(DropoffStatus)
  status?: DropoffStatus;
}
