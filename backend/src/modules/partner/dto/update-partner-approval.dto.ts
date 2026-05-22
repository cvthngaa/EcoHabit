import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartnerApprovalStatus } from '../enum/partner-approval-status.enum';

export class UpdatePartnerApprovalDto {
  @IsNotEmpty()
  @IsEnum(PartnerApprovalStatus)
  status: PartnerApprovalStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
