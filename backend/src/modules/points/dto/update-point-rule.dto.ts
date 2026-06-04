import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PointEventType } from '../enums/point-event-type.enum';

export class UpdatePointRuleDto {
  /** Tên hiển thị (max 100 ký tự). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  /** Mô tả. */
  @IsOptional()
  @IsString()
  description?: string;

  /** Loại sự kiện. */
  @IsOptional()
  @IsEnum(PointEventType)
  eventType?: PointEventType;

  /** Số điểm. */
  @IsOptional()
  @IsInt()
  points?: number;

  /** Trạng thái kích hoạt. */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
