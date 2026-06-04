import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { PointEventType } from '../enums/point-event-type.enum';

export class CreatePointRuleDto {
  /** Mã duy nhất của rule (unique, max 50 ký tự). */
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  code: string;

  /** Tên hiển thị (max 100 ký tự). */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  /** Mô tả tuỳ chọn. */
  @IsOptional()
  @IsString()
  description?: string;

  /** Loại sự kiện kích hoạt rule. */
  @IsEnum(PointEventType)
  eventType: PointEventType;

  /** Số điểm được cộng/trừ khi rule kích hoạt. */
  @IsInt()
  points: number;

  /** Trạng thái kích hoạt (mặc định true). */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
