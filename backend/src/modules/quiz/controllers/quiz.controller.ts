import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { SubmitDailyQuizDto } from '../dto/submit-daily-quiz.dto';
import { ListQuizHistoryQueryDto } from '../dto/list-quiz-history-query.dto';
import { QuizService } from '../quiz.service';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';

@ApiTags('Quiz')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}


  @Get('daily')
  @ApiOperation({ summary: 'Lấy bộ câu hỏi quiz hôm nay (cố định theo ngày)' })
  getDailyQuiz(@Request() req: AuthenticatedRequest) {
    return this.quizService.getDailyQuiz(req.user.userId ?? req.user.sub);
  }

  @Post(['daily/submit', 'daily/:topicId/submit'])
  @ApiOperation({ summary: 'Nộp bài quiz hôm nay theo chủ đề' })
  @ApiBody({ type: SubmitDailyQuizDto })
  @ApiParam({ name: 'topicId', required: false, description: 'ID của chủ đề' })
  submitDailyQuiz(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SubmitDailyQuizDto,
    @Param('topicId') topicId?: string,
  ) {
    const resolvedTopicId = topicId || dto.topicId;
    return this.quizService.submitDailyQuiz(
      req.user.userId ?? req.user.sub,
      resolvedTopicId,
      dto.answers,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Lấy lịch sử làm quiz của user' })
  getQuizHistory(
    @Request() req: AuthenticatedRequest,
    @Query() query: ListQuizHistoryQueryDto,
  ) {
    return this.quizService.getQuizHistory(
      req.user.userId ?? req.user.sub,
      query,
    );
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'Lấy chi tiết một lượt làm quiz' })
  getAttemptDetail(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.quizService.getAttemptDetail(
      req.user.userId ?? req.user.sub,
      id,
    );
  }
}
