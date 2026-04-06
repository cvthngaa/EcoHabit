import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RewardStatus } from '../enums/reward-status.enum';

export class CreateRewardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  pointsCost?: number;

  @IsInt()
  @IsOptional()
  stock?: number;

  @IsEnum(RewardStatus)
  @IsOptional()
  status?: RewardStatus;
}
