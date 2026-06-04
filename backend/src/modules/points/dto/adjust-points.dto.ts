import { IsInt, IsNotEmpty, IsOptional, IsString, NotEquals } from 'class-validator';

export class AdjustPointsDto {
  /** Số điểm cần điều chỉnh (dương = cộng, âm = trừ). Không được bằng 0. */
  @IsInt()
  @NotEquals(0)
  points: number;

  /** Lý do điều chỉnh điểm — bắt buộc. */
  @IsString()
  @IsNotEmpty()
  reason: string;

  /** Ghi chú thêm — tuỳ chọn. */
  @IsOptional()
  @IsString()
  note?: string;
}
