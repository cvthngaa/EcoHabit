import { IsNotEmpty, IsString } from 'class-validator';

export class RedeemDto {
  @IsString()
  @IsNotEmpty()
  rewardId: string;
}
