import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data') as typeof import('form-data');
import { v2 as cloudinary } from 'cloudinary';
import { TrashClassification } from './entities/trash-classification.entity';
import { AiFeedback } from './entities/ai-feedback.entity';
import { SubmitFeedbackDto } from './dto/submit-feedback.dto';
import { ClassificationStatus } from './enums/classification-status.enum';
import { WasteType } from './enums/waste-type.enum';
import { BinType } from './enums/bin-type.enum';

@Injectable()
export class AiService {
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(TrashClassification)
    private readonly classificationRepo: Repository<TrashClassification>,
    @InjectRepository(AiFeedback)
    private readonly feedbackRepo: Repository<AiFeedback>,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8000';

    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // -------------------------------------------------------------------------
  // Upload ảnh lên Cloudinary → gọi AI → lưu DB
  // -------------------------------------------------------------------------
  async classifyImage(file: Express.Multer.File, userId: string) {
    // 1. Upload ảnh lên Cloudinary
    let imageUrl: string;
    try {
      const uploadResult = await new Promise<{ secure_url: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'ecohabit/trash' },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            },
          );
          stream.end(file.buffer);
        },
      );
      imageUrl = uploadResult.secure_url;
    } catch (err) {
      throw new InternalServerErrorException(
        'Không thể upload ảnh lên Cloudinary',
      );
    }

    // 2. Gọi AI Service
    let aiResult: {
      label: string;
      displayLabel: string;
      confidence: number;
      wasteType: string;
      suggestedBin: string;
      instruction: string;
      modelName?: string;
      modelVersion?: string;
    };

    try {
      // Ưu tiên gửi URL để AI service download & classify
      const response = await axios.post(
        `${this.aiServiceUrl}/predict-url`,
        { imageUrl },
        { timeout: 15000 },
      );
      aiResult = response.data;
    } catch (err) {
      // Fallback: gửi file buffer dưới dạng multipart
      try {
        const form = new FormData();
        form.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        const response = await axios.post(
          `${this.aiServiceUrl}/predict`,
          form,
          { headers: form.getHeaders(), timeout: 15000 },
        );
        aiResult = response.data;
      } catch (fallbackErr) {
        throw new InternalServerErrorException(
          'Không thể kết nối đến AI Service',
        );
      }
    }

    // 3. Lưu kết quả vào DB
    const classification = this.classificationRepo.create({
      user: { id: userId } as any,
      imageUrl,
      predictedLabel: aiResult.label,
      predictedWasteType: aiResult.wasteType as WasteType,
      confidence: aiResult.confidence,
      suggestedBin: aiResult.suggestedBin as BinType,
      status: ClassificationStatus.SUCCESS,
      modelName: aiResult.modelName ?? null,
      modelVersion: aiResult.modelVersion ?? null,
      resultJson: aiResult as any,
    });

    const saved = await this.classificationRepo.save(classification);

    return {
      classificationId: saved.id,
      imageUrl,
      label: aiResult.label,
      displayLabel: aiResult.displayLabel,
      confidence: aiResult.confidence,
      wasteType: aiResult.wasteType,
      suggestedBin: aiResult.suggestedBin,
      instruction: aiResult.instruction,
      modelName: aiResult.modelName,
      modelVersion: aiResult.modelVersion,
    };
  }

  // -------------------------------------------------------------------------
  // Lưu feedback của user
  // -------------------------------------------------------------------------
  async submitFeedback(
    classificationId: string,
    userId: string,
    dto: SubmitFeedbackDto,
  ) {
    const classification = await this.classificationRepo.findOne({
      where: { id: classificationId },
    });
    if (!classification) {
      throw new NotFoundException('Không tìm thấy kết quả phân loại');
    }

    const feedback = this.feedbackRepo.create({
      classification: { id: classificationId } as any,
      user: { id: userId } as any,
      isCorrect: dto.isCorrect,
      correctedLabel: dto.correctedLabel ?? null,
      correctedWasteType: dto.correctedWasteType ?? null,
      correctedBin: dto.correctedBin ?? null,
      note: dto.note ?? null,
    });

    await this.feedbackRepo.save(feedback);

    // Cập nhật trạng thái thành REVIEWED
    await this.classificationRepo.update(classificationId, {
      status: ClassificationStatus.REVIEWED,
    });

    return { message: 'Cảm ơn bạn đã phản hồi!' };
  }

  // -------------------------------------------------------------------------
  // Lịch sử phân loại của user
  // -------------------------------------------------------------------------
  async getHistory(userId: string, limit = 20, page = 1) {
    const [data, total] = await this.classificationRepo.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}