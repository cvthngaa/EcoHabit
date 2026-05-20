import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../enums/user-status.enum';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  /** Bắt buộc khi status = LOCKED hoặc BANNED */
  @IsOptional()
  @IsString()
  reason?: string;
}
