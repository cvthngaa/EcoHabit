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
import { PointsService } from '../points/points.service';
import { PointSourceType } from '../points/enums/point-source-type.enum';
import { PointTransactionType } from '../points/enums/point-transaction-type.enum';

@Injectable()
export class AiService {
  private readonly aiServiceUrl: string;
  private readonly classificationAwardThreshold = 0.5;
  private readonly classificationPointsByWasteType: Record<WasteType, number> = {
    [WasteType.PLASTIC]: 20,
    [WasteType.PAPER]: 15,
    [WasteType.BATTERY]: 30,
    [WasteType.GLASS]: 18,
    [WasteType.METAL]: 25,
    [WasteType.OTHER]: 12,
  };

  constructor(
    @InjectRepository(TrashClassification)
    private readonly classificationRepo: Repository<TrashClassification>,
    @InjectRepository(AiFeedback)
    private readonly feedbackRepo: Repository<AiFeedback>,
    private readonly configService: ConfigService,
    private readonly pointsService: PointsService,
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

  async classifyImage(file: Express.Multer.File, userId: string) {
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
    } catch {
      throw new InternalServerErrorException(
        'Khong the upload anh len Cloudinary',
      );
    }

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
      const response = await axios.post(
        `${this.aiServiceUrl}/predict-url`,
        { imageUrl },
        { timeout: 15000 },
      );
      aiResult = response.data;
    } catch {
      try {
        const form = new FormData();
        form.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        const response = await axios.post(`${this.aiServiceUrl}/predict`, form, {
          headers: form.getHeaders(),
          timeout: 15000,
        });
        aiResult = response.data;
      } catch {
        throw new InternalServerErrorException(
          'Khong the ket noi den AI Service',
        );
      }
    }

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
    const pointsEarned = this.calculateClassificationPoints(
      saved.predictedWasteType ?? null,
      Number(saved.confidence),
    );
    let balanceAfter = await this.pointsService.getBalanceByUserId(userId);
    let awarded = false;

    if (pointsEarned > 0) {
      const alreadyAwarded = await this.pointsService.hasTransactionForSource(
        userId,
        PointSourceType.TRASH_CLASSIFICATION,
        saved.id,
        PointTransactionType.EARN,
      );

      if (!alreadyAwarded) {
        const transaction = await this.pointsService.addPoint(
          userId,
          pointsEarned,
          PointTransactionType.EARN,
          PointSourceType.TRASH_CLASSIFICATION,
          saved.id,
          'CLASSIFICATION_CORRECT',
          `Awarded for trash classification ${saved.id}`,
        );
        balanceAfter = transaction.balanceAfter;
        awarded = true;
      }
    }

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
      pointsEarned,
      awarded,
      balanceAfter,
    };
  }

  async submitFeedback(
    classificationId: string,
    userId: string,
    dto: SubmitFeedbackDto,
  ) {
    const classification = await this.classificationRepo.findOne({
      where: { id: classificationId },
    });
    if (!classification) {
      throw new NotFoundException('Khong tim thay ket qua phan loai');
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

    await this.classificationRepo.update(classificationId, {
      status: ClassificationStatus.REVIEWED,
    });

    return { message: 'Cam on ban da phan hoi!' };
  }

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

  private calculateClassificationPoints(
    wasteType?: WasteType | null,
    confidence?: number,
  ): number {
    if (!wasteType) {
      return 0;
    }

    if ((confidence ?? 0) < this.classificationAwardThreshold) {
      return 0;
    }

    return this.classificationPointsByWasteType[wasteType] ?? 0;
  }
}
