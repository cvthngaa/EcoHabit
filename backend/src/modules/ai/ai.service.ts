import { Injectable, InternalServerErrorException, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
import { FraudService } from '../fraud/fraud.service';
import { AuditService } from '../audit/audit.service';
import { AdminAuditAction } from '../audit/enums/admin-audit-action.enum';
import { ReviewClassificationDto, ReviewAction } from './dto/review-classification.dto';
import { ListClassificationsQueryDto } from './dto/list-classifications-query.dto';
import { BadgesService } from '../badges/badges.service';
@Injectable()
export class AiService {
  private readonly aiServiceUrl: string;
  private readonly classificationAwardThreshold = 0.7;

  constructor(
    @InjectRepository(TrashClassification)
    private readonly classificationRepo: Repository<TrashClassification>,
    @InjectRepository(AiFeedback)
    private readonly feedbackRepo: Repository<AiFeedback>,
    private readonly configService: ConfigService,
    private readonly pointsService: PointsService,
    private readonly fraudService: FraudService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
    @Optional() private readonly badgesService: BadgesService,
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
          const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'ecohabit/trash' },
            (error, result) => {
              clearTimeout(timeout);
              if (error || !result) return reject(error);
              resolve(result);
            },
          );
          stream.end(file.buffer);
        },
      );
      imageUrl = uploadResult.secure_url;
    } catch {
      return {
        classificationId: null,
        isOverloaded: true,
        message: 'Hệ thống AI đang quá tải, nhưng tinh thần bảo vệ môi trường của bạn rất tuyệt! Hãy thử lại sau nhé.',
      };
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

    let aiResponse: any;

    try {
      const response = await axios.post(
        `${this.aiServiceUrl}/predict-url`,
        { imageUrl },
        { timeout: 10000 },
      );
      aiResponse = response.data;
    } catch {
      try {
        const form = new FormData();
        form.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        const response = await axios.post(
          `${this.aiServiceUrl}/predict`,
          form,
          {
            headers: form.getHeaders(),
            timeout: 10000,
          },
        );
        aiResponse = response.data;
      } catch {
        return {
          classificationId: null,
          isOverloaded: true,
          message: 'Hệ thống AI đang quá tải, nhưng tinh thần bảo vệ môi trường của bạn rất tuyệt! Hãy thử lại sau nhé.',
        };
      }
    }

    if (!aiResponse || !aiResponse.success || !aiResponse.detections || aiResponse.detections.length === 0) {
      return {
        classificationId: null,
        isOverloaded: false,
        message: 'Không nhận diện được rác thải rõ ràng nào trong ảnh. Vui lòng thử lại.',
      };
    }

    // Tạm thời lấy vật thể đầu tiên (có độ tự tin cao nhất) để lưu DB
    aiResult = aiResponse.detections[0];

    const confidence = Number(aiResult.confidence);
    const isHighConfidence = confidence >= this.classificationAwardThreshold;
    const initialStatus = isHighConfidence
      ? ClassificationStatus.SUCCESS
      : ClassificationStatus.PENDING;

    const classification = this.classificationRepo.create({
      user: { id: userId } as any,
      imageUrl,
      predictedLabel: aiResult.label,
      predictedWasteType: aiResult.wasteType as WasteType,
      confidence: aiResult.confidence,
      suggestedBin: aiResult.suggestedBin as BinType,
      status: initialStatus,
      modelName: aiResult.modelName ?? null,
      modelVersion: aiResult.modelVersion ?? null,
      resultJson: aiResult as any,
    });

    const saved = await this.classificationRepo.save(classification);
    
    let pointsEarned = 0;
    let awarded = false;
    let dailyLimitReached = false;
    let balanceAfter = await this.pointsService.getBalanceByUserId(userId);

    if (isHighConfidence) {
      await this.dataSource.transaction(async (manager) => {
        // Lock user first
        await manager.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId]);

        // Kiểm tra Daily Quota (Tối đa 3 lần cộng điểm / ngày từ AI)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const result = await manager.query(
          `SELECT COUNT(*) AS count
           FROM point_transactions
           WHERE user_id = $1
             AND type = 'EARN'
             AND source_type = $2
             AND created_at >= $3`,
          [userId, PointSourceType.TRASH_CLASSIFICATION, startOfDay],
        );

        const countToday = parseInt(result[0]?.count ?? '0', 10);

        if (countToday >= 3) {
          dailyLimitReached = true;
        } else {
          pointsEarned = await this.calculateClassificationPoints(
            saved.predictedWasteType ?? null,
            confidence,
          );
          if (pointsEarned > 0) {
            const alreadyAwardedResult = await manager.query(
              `SELECT 1 FROM point_transactions WHERE user_id = $1 AND source_type = $2 AND source_id = $3 AND type = $4 LIMIT 1`,
              [userId, PointSourceType.TRASH_CLASSIFICATION, saved.id, PointTransactionType.EARN]
            );

            if (alreadyAwardedResult.length === 0) {
              const transaction = await this.pointsService.addPoint(
                userId,
                pointsEarned,
                PointTransactionType.EARN,
                PointSourceType.TRASH_CLASSIFICATION,
                saved.id,
                'CLASSIFICATION_CORRECT',
                `Awarded for trash classification ${saved.id}`,
                manager
              );
              balanceAfter = transaction.balanceAfter;
              awarded = true;
            }
          }
        }
      });
    }

    // Kiểm tra AI classification abuse — fire-and-forget
    void this.fraudService.checkAiClassificationAbuse(userId);

    // Evaluate badge conditions asynchronously (fire-and-forget)
    if (this.badgesService) {
      void this.badgesService.evaluateUserBadges(userId);
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
      requiresReview: !isHighConfidence,
      dailyLimitReached,
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
      status: dto.isCorrect ? ClassificationStatus.REVIEWED : ClassificationStatus.PENDING,
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

  async getAdminFeedbacks() {
    return this.feedbackRepo.find({
      relations: ['user', 'classification'],
      order: { createdAt: 'DESC' },
      take: 100
    });
  }

  async getAdminClassifications(query: ListClassificationsQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const whereCondition = status ? { status } : {};

    const [data, total] = await this.classificationRepo.findAndCount({
      where: whereCondition,
      relations: ['user', 'feedbacks'],
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

  async reviewClassification(
    classificationId: string,
    adminId: string,
    adminEmail: string,
    dto: ReviewClassificationDto,
  ) {
    const classification = await this.classificationRepo.findOne({
      where: { id: classificationId },
      relations: ['user'],
    });

    if (!classification) {
      throw new NotFoundException('Classification not found');
    }

    let newStatus: ClassificationStatus = classification.status;
    let pointsToAward = 0;
    const userId = classification.user.id;

    if (dto.action === ReviewAction.APPROVE) {
      newStatus = ClassificationStatus.SUCCESS;
      pointsToAward = await this.calculateClassificationPoints(
        classification.predictedWasteType,
        1, // Bypass confidence check
      );
    } else if (dto.action === ReviewAction.REJECT) {
      newStatus = ClassificationStatus.FAILED;
    } else if (dto.action === ReviewAction.CORRECT) {
      newStatus = ClassificationStatus.REVIEWED;
      if (dto.correctedLabel) classification.correctedLabel = dto.correctedLabel;
      if (dto.correctedWasteType) classification.correctedWasteType = dto.correctedWasteType;
      if (dto.correctedBin) classification.correctedBin = dto.correctedBin;
      if (dto.correctedBoundingBox) classification.correctedBoundingBox = dto.correctedBoundingBox;
      
      pointsToAward = await this.calculateClassificationPoints(
        dto.correctedWasteType ?? classification.predictedWasteType,
        1,
      );
    }

    classification.status = newStatus;
    classification.reviewedBy = { id: adminId } as any;
    classification.reviewedAt = new Date();
    classification.reviewNote = dto.reviewNote ?? null;

    await this.classificationRepo.save(classification);

    const existingTxs = await this.pointsService.listTransactions({
      sourceType: PointSourceType.TRASH_CLASSIFICATION,
      sourceId: classificationId,
      limit: 100,
    });

    let alreadyAwarded = 0;
    for (const tx of existingTxs.data) {
      if (tx.type === PointTransactionType.EARN) alreadyAwarded += tx.points;
      if (tx.type === PointTransactionType.SPEND) alreadyAwarded -= tx.points;
    }

    const diff = pointsToAward - alreadyAwarded;

    if (diff > 0) {
      await this.pointsService.addPoint(
        userId,
        diff,
        PointTransactionType.EARN,
        PointSourceType.TRASH_CLASSIFICATION,
        classificationId,
        'CLASSIFICATION_ADMIN_APPROVED',
        `Admin approved classification ${classificationId}`,
      );
    } else if (diff < 0) {
      const balance = await this.pointsService.getBalanceByUserId(userId);
      const deductAmount = Math.min(Math.abs(diff), balance);
      if (deductAmount > 0) {
        await this.pointsService.deductPoints(
          userId,
          deductAmount,
          PointSourceType.TRASH_CLASSIFICATION,
          classificationId,
          'CLASSIFICATION_ADMIN_REJECTED',
          `Admin corrected classification ${classificationId}`,
        );
      }
    }

    await this.auditService.log(
      adminId,
      adminEmail,
      AdminAuditAction.AI_CLASSIFICATION_REVIEW,
      userId,
      {
        classificationId,
        action: dto.action,
        status: newStatus,
        pointsAwarded: pointsToAward > 0,
        note: dto.reviewNote,
      }
    );

    return classification;
  }

  private async calculateClassificationPoints(
    wasteType?: WasteType | null,
    confidence?: number,
  ): Promise<number> {
    if (!wasteType) {
      return 0;
    }

    if ((confidence ?? 0) < this.classificationAwardThreshold) {
      return 0;
    }

    const defaultValues: Record<WasteType, number> = {
      [WasteType.PLASTIC]: 20,
      [WasteType.PAPER]: 15,
      [WasteType.BATTERY]: 30,
      [WasteType.GLASS]: 18,
      [WasteType.METAL]: 25,
      [WasteType.E_WASTE]: 35,
      [WasteType.TEXTILE]: 15,
      [WasteType.OTHER]: 12,
    };
    const defaultPoints = defaultValues[wasteType] ?? 0;
    const code = `AI_${wasteType.toUpperCase()}`;

    return await this.pointsService.getRulePoints(code, defaultPoints);
  }
}
