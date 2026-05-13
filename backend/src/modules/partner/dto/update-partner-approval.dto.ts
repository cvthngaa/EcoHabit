import { IsEnum, IsNotEmpty } from 'class-validator';
import { PartnerApprovalStatus } from '../enum/partner-approval-status.enum';

export class UpdatePartnerApprovalDto {
  @IsNotEmpty()
  @IsEnum(PartnerApprovalStatus)
  status: PartnerApprovalStatus;
}
