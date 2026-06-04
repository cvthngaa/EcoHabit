import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuizDifficulty } from '../enums/quiz-difficulty.enum';
import { QuizQuestionStatus } from '../enums/quiz-question-status.enum';
import { QuizQuestionSource } from '../enums/quiz-question-source.enum';

export class ListQuizQuestionsQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'plastic' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ enum: QuizDifficulty })
  @IsOptional()
  @IsEnum(QuizDifficulty)
  difficulty?: QuizDifficulty;

  @ApiPropertyOptional({ enum: QuizQuestionStatus })
  @IsOptional()
  @IsEnum(QuizQuestionStatus)
  status?: QuizQuestionStatus;

  @ApiPropertyOptional({ enum: QuizQuestionSource })
  @IsOptional()
  @IsEnum(QuizQuestionSource)
  source?: QuizQuestionSource;

  @ApiPropertyOptional({ example: 'search keyword' })
  @IsOptional()
  @IsString()
  search?: string;
}
