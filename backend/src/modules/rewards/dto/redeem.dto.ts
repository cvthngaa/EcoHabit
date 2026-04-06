import { IsNotEmpty, IsUUID } from 'class-validator';

export class RedeemDto {
  @IsUUID()
  @IsNotEmpty()
  rewardId: string;
}
