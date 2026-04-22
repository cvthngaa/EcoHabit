import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateQuizDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsIn(['easy', 'medium', 'hard'])
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  count?: number;
}
