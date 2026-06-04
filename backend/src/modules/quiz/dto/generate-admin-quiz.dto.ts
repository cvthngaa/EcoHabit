import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuizDifficulty } from '../enums/quiz-difficulty.enum';

export class GenerateAdminQuizDto {
  @ApiProperty({ example: 'plastic' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiPropertyOptional({ enum: QuizDifficulty, example: QuizDifficulty.MEDIUM })
  @IsOptional()
  @IsEnum(QuizDifficulty)
  difficulty?: QuizDifficulty;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  count?: number = 5;
}
