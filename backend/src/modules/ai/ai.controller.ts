import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Patch,
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
import { ReviewClassificationDto } from './dto/review-classification.dto';
import { ListClassificationsQueryDto } from './dto/list-classifications-query.dto';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

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
        latitude: {
          type: 'number',
          description: 'Vi do hien tai cua nguoi dung',
        },
        longitude: {
          type: 'number',
          description: 'Kinh do hien tai cua nguoi dung',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Phan loai rac tu anh' })
  async classify(
    @UploadedFile() file: Express.Multer.File,
    @Body('latitude') latitudeStr: string,
    @Body('longitude') longitudeStr: string,
    @Request() req: AuthenticatedRequest,
  ) {
    if (!file) {
      throw new BadRequestException('Vui long upload mot file anh');
    }
    
    const latitude = latitudeStr ? parseFloat(latitudeStr) : undefined;
    const longitude = longitudeStr ? parseFloat(longitudeStr) : undefined;

    return this.aiService.classifyImage(file, req.user.userId, latitude, longitude);
  }

  @Post('feedback/:classificationId')
  @ApiOperation({ summary: 'Gui phan hoi ve ket qua phan loai' })
  async submitFeedback(
    @Param('classificationId') classificationId: string,
    @Body() dto: SubmitFeedbackDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.aiService.submitFeedback(
      classificationId,
      req.user.userId,
      dto,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Lich su phan loai rac cua user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Request() req: AuthenticatedRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.aiService.getHistory(req.user.userId, limit, page);
  }
}

@ApiTags('Admin AI Classification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/ai')
export class AdminAiController {
  constructor(private readonly aiService: AiService) {}

  @Get('feedback')
  @ApiOperation({ summary: 'Admin xem lich su phan hoi' })
  async getAdminFeedbacks() {
    return this.aiService.getAdminFeedbacks();
  }

  @Get('classifications')
  @ApiOperation({ summary: 'Admin xem danh sach phan loai AI' })
  async getAdminClassifications(@Query() query: ListClassificationsQueryDto) {
    return this.aiService.getAdminClassifications(query);
  }

  @Patch('classifications/:id/review')
  @ApiOperation({ summary: 'Admin duyet phan loai AI' })
  async reviewClassification(
    @Param('id') id: string,
    @Body() dto: ReviewClassificationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.aiService.reviewClassification(
      id,
      req.user.userId,
      req.user.email,
      dto,
    );
  }
}
