import { IsEnum, IsNotEmpty } from 'class-validator';
import { RewardStatus } from '../enums/reward-status.enum';

export class UpdateRewardStatusDto {
  @IsEnum(RewardStatus)
  @IsNotEmpty()
  status: RewardStatus;
}
