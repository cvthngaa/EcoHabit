import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QuizDifficulty } from '../enums/quiz-difficulty.enum';
import { QuizOptionDto } from './quiz-option.dto';

export class CreateQuizQuestionDto {
  @ApiProperty({ example: 'plastic' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ enum: QuizDifficulty, example: QuizDifficulty.MEDIUM })
  @IsEnum(QuizDifficulty)
  difficulty: QuizDifficulty;

  @ApiProperty({ example: 'Which of the following is non-recyclable?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'Plastic bags clog recycling machines.' })
  @IsString()
  @IsNotEmpty()
  explanation: string;

  @ApiProperty({ type: [QuizOptionDto] })
  @ValidateNested({ each: true })
  @Type(() => QuizOptionDto)
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  options: QuizOptionDto[];
}
