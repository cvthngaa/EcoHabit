import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import { SubmitDailyQuizDto } from './dto/submit-daily-quiz.dto';
import { QuizService } from './quiz.service';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@ApiTags('Quiz')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Tạo bộ câu hỏi quiz ngẫu nhiên' })
  @ApiBody({ type: GenerateQuizDto })
  generateQuiz(@Body() dto: GenerateQuizDto) {
    return this.quizService.generateQuiz(dto);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Lấy bộ câu hỏi quiz hôm nay (cố định theo ngày)' })
  getDailyQuiz(@Request() req: AuthenticatedRequest) {
    return this.quizService.getDailyQuiz(req.user.userId ?? req.user.sub);
  }

  @Post('daily/submit')
  @ApiOperation({ summary: 'Nộp bài quiz hôm nay theo chủ đề' })
  @ApiBody({ type: SubmitDailyQuizDto })
  submitDailyQuiz(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SubmitDailyQuizDto,
  ) {
    return this.quizService.submitDailyQuiz(
      req.user.userId ?? req.user.sub,
      dto.topicId,
      dto.answers,
    );
  }
}
