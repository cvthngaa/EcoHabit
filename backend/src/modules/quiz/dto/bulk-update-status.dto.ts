import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuizQuestionStatus } from '../enums/quiz-question-status.enum';

export class BulkUpdateStatusDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @ApiProperty({ enum: QuizQuestionStatus })
  @IsEnum(QuizQuestionStatus)
  status: QuizQuestionStatus;
}
