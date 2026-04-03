import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@ApiTags('AI Classification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ---------------------------------------------------------------------------
  // POST /ai/classify — upload ảnh rác để AI nhận diện
  // ---------------------------------------------------------------------------
  @Post('classify')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Ảnh rác cần phân loại' },
      },
    },
  })
  @ApiOperation({ summary: 'Phân loại rác từ ảnh' })
  async classify(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload một file ảnh');
    }
    return this.aiService.classifyImage(file, req.user.userId);
  }

  // ---------------------------------------------------------------------------
  // POST /ai/feedback/:classificationId — gửi feedback về kết quả AI
  // ---------------------------------------------------------------------------
  @Post('feedback/:classificationId')
  @ApiOperation({ summary: 'Gửi phản hồi về kết quả phân loại' })
  async submitFeedback(
    @Param('classificationId') classificationId: string,
    @Body() dto: SubmitFeedbackDto,
    @Request() req: any,
  ) {
    return this.aiService.submitFeedback(classificationId, req.user.userId, dto);
  }

  // ---------------------------------------------------------------------------
  // GET /ai/history — lịch sử phân loại của user
  // ---------------------------------------------------------------------------
  @Get('history')
  @ApiOperation({ summary: 'Lịch sử phân loại rác của user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.aiService.getHistory(req.user.userId, limit, page);
  }
}
