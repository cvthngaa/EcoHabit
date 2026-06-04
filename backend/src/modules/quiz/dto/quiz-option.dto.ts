import { IsString, IsNotEmpty, IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuizOptionDto {
  @ApiProperty({ example: 'Plastic bag' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isCorrect: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
