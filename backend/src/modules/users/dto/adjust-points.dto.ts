import { IsInt, IsNotEmpty, IsString, NotEquals } from 'class-validator';

export class AdjustPointsDto {
  /** Số điểm cần điều chỉnh – âm để trừ, dương để cộng, không được bằng 0 */
  @IsInt()
  @NotEquals(0)
  amount: number;

  /** Lý do điều chỉnh, bắt buộc */
  @IsString()
  @IsNotEmpty()
  reason: string;
}
