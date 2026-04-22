import { IsEnum } from 'class-validator';
import { RedemptionStatus } from '../enums/redemption-status.enum';

export class UpdateRedemptionStatusDto {
  @IsEnum(RedemptionStatus)
  status: RedemptionStatus;
}
