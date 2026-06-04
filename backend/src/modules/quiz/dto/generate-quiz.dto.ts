import { IsIn, IsInt, IsOptional, IsString, Max, Min, IsEnum } from 'class-validator';

import { QuizDifficulty } from '../enums/quiz-difficulty.enum';

export class GenerateQuizDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsEnum(QuizDifficulty)
  difficulty?: QuizDifficulty;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  count?: number;
}
