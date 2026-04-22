import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { QuizService } from './quiz.service';

@ApiTags('Quiz')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Tạo bộ câu hỏi quiz cho app mobile' })
  @ApiBody({ type: GenerateQuizDto })
  generateQuiz(@Body() dto: GenerateQuizDto) {
    return this.quizService.generateQuiz(dto);
  }
}
