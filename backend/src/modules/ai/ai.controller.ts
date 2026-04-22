import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';

@ApiTags('AI Classification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('classify')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Chi chap nhan file anh'), false);
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
        file: {
          type: 'string',
          format: 'binary',
          description: 'Anh rac can phan loai',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Phan loai rac tu anh' })
  async classify(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Vui long upload mot file anh');
    }
    return this.aiService.classifyImage(file, req.user.userId);
  }

  @Post('feedback/:classificationId')
  @ApiOperation({ summary: 'Gui phan hoi ve ket qua phan loai' })
  async submitFeedback(
    @Param('classificationId') classificationId: string,
    @Body() dto: SubmitFeedbackDto,
    @Request() req: any,
  ) {
    return this.aiService.submitFeedback(classificationId, req.user.userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Lich su phan loai rac cua user' })
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
