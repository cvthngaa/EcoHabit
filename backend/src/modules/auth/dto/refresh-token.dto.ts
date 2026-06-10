import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Refresh token để cấp lại access token',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
