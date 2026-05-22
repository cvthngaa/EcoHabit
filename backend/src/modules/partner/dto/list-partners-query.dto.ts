import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PartnerApprovalStatus } from '../enum/partner-approval-status.enum';
import { PartnerRoleType } from '../enum/partner-role-type.enum';

export class ListPartnersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PartnerApprovalStatus)
  approvalStatus?: PartnerApprovalStatus;

  @IsOptional()
  @IsEnum(PartnerRoleType)
  roleType?: PartnerRoleType;

  @IsOptional()
  @IsEnum(['createdAt', 'organizationName', 'approvalStatus'])
  sortBy?: 'createdAt' | 'organizationName' | 'approvalStatus' = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
