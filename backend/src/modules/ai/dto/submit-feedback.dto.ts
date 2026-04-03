import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WasteType } from '../enums/waste-type.enum';
import { BinType } from '../enums/bin-type.enum';

export class SubmitFeedbackDto {
  @ApiProperty({ description: 'AI đoán đúng không?' })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({ description: 'Nhãn đúng nếu AI sai' })
  @IsOptional()
  @IsString()
  correctedLabel?: string;

  @ApiPropertyOptional({ enum: WasteType, description: 'Loại rác đúng nếu AI sai' })
  @IsOptional()
  @IsEnum(WasteType)
  correctedWasteType?: WasteType;

  @ApiPropertyOptional({ enum: BinType, description: 'Thùng đúng nếu AI sai' })
  @IsOptional()
  @IsEnum(BinType)
  correctedBin?: BinType;

  @ApiPropertyOptional({ description: 'Ghi chú thêm' })
  @IsOptional()
  @IsString()
  note?: string;
}
