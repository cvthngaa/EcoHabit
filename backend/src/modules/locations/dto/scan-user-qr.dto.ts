import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class ScanUserQrDto {
  @ApiProperty({ description: 'Mã JWT QR từ người dùng' })
  @IsString()
  @IsNotEmpty()
  qrToken: string;

  @ApiProperty({ description: 'ID của Trạm thu gom' })
  @IsString()
  @IsNotEmpty()
  locationId: string;

  @ApiPropertyOptional({ description: 'ID loại rác được xác nhận (nếu có)' })
  @IsOptional()
  @IsString()
  acceptedWasteTypeId?: string;

  @ApiPropertyOptional({ description: 'Giá trị khối lượng/số lượng' })
  @IsOptional()
  @IsNumber()
  quantityValue?: number;

  @ApiPropertyOptional({ description: 'Đơn vị tính' })
  @IsOptional()
  @IsString()
  quantityUnit?: string;

  @ApiProperty({ description: 'Số điểm thưởng ngay lập tức' })
  @IsNumber()
  @Min(0)
  @Max(10000)
  pointsAwarded: number;
}
