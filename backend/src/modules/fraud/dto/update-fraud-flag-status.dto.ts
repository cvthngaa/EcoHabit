import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FraudStatus } from '../enums/fraud-status.enum';

export class UpdateFraudFlagStatusDto {
  /** Admin chỉ được cập nhật sang REVIEWING, RESOLVED hoặc REJECTED */
  @IsEnum([FraudStatus.REVIEWING, FraudStatus.RESOLVED, FraudStatus.REJECTED], {
    message: 'status must be one of: REVIEWING, RESOLVED, REJECTED',
  })
  status: FraudStatus.REVIEWING | FraudStatus.RESOLVED | FraudStatus.REJECTED;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
