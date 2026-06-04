import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';
import { AdminQuizService } from '../admin-quiz.service';
import { CreateQuizQuestionDto } from '../dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from '../dto/update-quiz-question.dto';
import { ListQuizQuestionsQueryDto } from '../dto/list-quiz-questions-query.dto';
import { GenerateAdminQuizDto } from '../dto/generate-admin-quiz.dto';
import { UpdateQuizQuestionStatusDto } from '../dto/update-quiz-question-status.dto';
import { ListQuizAttemptsQueryDto } from '../dto/list-quiz-attempts-query.dto';
import { ListQuizSnapshotsQueryDto } from '../dto/list-quiz-snapshots-query.dto';
import { BulkUpdateStatusDto } from '../dto/bulk-update-status.dto';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';

@ApiTags('Admin Quiz')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/quiz')
export class AdminQuizController {
  constructor(private readonly adminQuizService: AdminQuizService) { }

  // ─── QUESTION BANK ───

  @Post('questions')
  @ApiOperation({ summary: 'Tạo câu hỏi thủ công' })
  createQuestion(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateQuizQuestionDto,
  ) {
    return this.adminQuizService.createQuestion(
      req.user.userId ?? req.user.sub,
      req.user.email,
      dto,
    );
  }

  @Get('questions')
  @ApiOperation({ summary: 'Lấy danh sách câu hỏi' })
  listQuestions(@Query() query: ListQuizQuestionsQueryDto) {
    return this.adminQuizService.listQuestions(query);
  }

  @Patch('questions/status/bulk')
  @ApiOperation({ summary: 'Bulk cập nhật trạng thái câu hỏi' })
  bulkUpdateStatus(
    @Request() req: AuthenticatedRequest,
    @Body() dto: BulkUpdateStatusDto,
  ) {
    return this.adminQuizService.bulkUpdateStatus(
      req.user.userId ?? req.user.sub,
      req.user.email,
      dto,
    );
  }

  @Patch('questions/:id')
  @ApiOperation({ summary: 'Cập nhật câu hỏi' })
  updateQuestion(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateQuizQuestionDto,
  ) {
    return this.adminQuizService.updateQuestion(
      id,
      req.user.userId ?? req.user.sub,
      req.user.email,
      dto,
    );
  }

  @Delete('questions/:id')
  @ApiOperation({ summary: 'Xóa câu hỏi (soft delete)' })
  deleteQuestion(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminQuizService.deleteQuestion(
      id,
      req.user.userId ?? req.user.sub,
      req.user.email,
    );
  }

  @Patch('questions/:id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái câu hỏi' })
  updateStatus(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateQuizQuestionStatusDto,
  ) {
    return this.adminQuizService.updateStatus(
      id,
      req.user.userId ?? req.user.sub,
      req.user.email,
      dto,
    );
  }

  // ─── AI & IMPORT ───

  @Post('generate')
  @ApiOperation({ summary: 'Sinh câu hỏi bằng AI' })
  generateQuestions(
    @Request() req: AuthenticatedRequest,
    @Body() dto: GenerateAdminQuizDto,
  ) {
    return this.adminQuizService.generateQuestions(
      req.user.userId ?? req.user.sub,
      req.user.email,
      dto,
    );
  }

  @Post('questions/import')
  @ApiOperation({ summary: 'Import câu hỏi từ file Excel/CSV' })
  @UseInterceptors(FileInterceptor('file'))
  async importQuestions(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload file');
    }
    return this.adminQuizService.importQuestions(
      req.user.userId ?? req.user.sub,
      req.user.email,
      file,
    );
  }

  // ─── ATTEMPTS ───

  @Get('attempts')
  @ApiOperation({ summary: 'Admin lấy danh sách lượt làm quiz' })
  listAttempts(@Query() query: ListQuizAttemptsQueryDto) {
    return this.adminQuizService.listAttempts(query);
  }

  @Get('attempts/:id')
  @ApiOperation({ summary: 'Admin lấy chi tiết một lượt làm quiz' })
  getAttemptDetail(@Param('id') id: string) {
    return this.adminQuizService.getAttemptDetail(id);
  }

  // ─── SNAPSHOTS ───

  @Get('snapshots')
  @ApiOperation({ summary: 'Admin xem daily quiz snapshots' })
  listSnapshots(@Query() query: ListQuizSnapshotsQueryDto) {
    return this.adminQuizService.listSnapshots(query);
  }

  @Get('snapshots/:id')
  @ApiOperation({ summary: 'Admin xem chi tiết snapshot' })
  getSnapshotDetail(@Param('id') id: string) {
    return this.adminQuizService.getSnapshotDetail(id);
  }

  // ─── COVERAGE ───

  @Get('coverage')
  @ApiOperation({ summary: 'Độ phủ câu hỏi theo chủ đề' })
  getCoverage() {
    return this.adminQuizService.getCoverage();
  }

  // ─── STATS ───

  @Get('stats')
  @ApiOperation({ summary: 'Lấy thống kê quiz' })
  getStats() {
    return this.adminQuizService.getStats();
  }
}
