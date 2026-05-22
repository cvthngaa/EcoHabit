import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../../users/enums/user-status.enum';

export class UpdatePartnerUserStatusDto {
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
