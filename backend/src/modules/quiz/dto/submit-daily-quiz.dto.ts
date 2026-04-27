import {
  IsArray,
  ArrayNotEmpty,
  IsInt,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitDailyQuizDto {
  @ApiProperty({
    example: 'plastic',
    description: 'ID của chủ đề quiz đã làm',
  })
  @IsString()
  @IsNotEmpty()
  topicId: string;

  @ApiProperty({
    example: [1, 0, 2, 1, 3],
    description: 'Mảng các index đáp án user đã chọn, theo thứ tự câu hỏi',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  answers: number[];
}
