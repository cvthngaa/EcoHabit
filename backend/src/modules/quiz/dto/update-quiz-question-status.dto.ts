import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuizQuestionStatus } from '../enums/quiz-question-status.enum';

export class UpdateQuizQuestionStatusDto {
  @ApiProperty({ enum: QuizQuestionStatus, example: QuizQuestionStatus.ACTIVE })
  @IsEnum(QuizQuestionStatus)
  status: QuizQuestionStatus;
}
