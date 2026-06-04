import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizOption } from './entities/quiz-option.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptAnswer } from './entities/quiz-attempt-answer.entity';
import { DailyQuizSet } from './entities/daily-quiz-set.entity';
import { DailyQuizSetQuestion } from './entities/daily-quiz-set-question.entity';
import { CreateQuizQuestionDto } from './dto/create-quiz-question.dto';
import { UpdateQuizQuestionDto } from './dto/update-quiz-question.dto';
import { ListQuizQuestionsQueryDto } from './dto/list-quiz-questions-query.dto';
import { GenerateAdminQuizDto } from './dto/generate-admin-quiz.dto';
import { UpdateQuizQuestionStatusDto } from './dto/update-quiz-question-status.dto';
import { ListQuizAttemptsQueryDto } from './dto/list-quiz-attempts-query.dto';
import { ListQuizSnapshotsQueryDto } from './dto/list-quiz-snapshots-query.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { QuizQuestionStatus } from './enums/quiz-question-status.enum';
import { QuizQuestionSource } from './enums/quiz-question-source.enum';
import { QuizDifficulty } from './enums/quiz-difficulty.enum';
import { GeminiService } from '../gemini/gemini.service';
import { AuditService } from '../audit/audit.service';
import { AdminAuditAction } from '../audit/enums/admin-audit-action.enum';
import * as xlsx from 'xlsx';

@Injectable()
export class AdminQuizService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizOption)
    private readonly optionRepo: Repository<QuizOption>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(QuizAttemptAnswer)
    private readonly attemptAnswerRepo: Repository<QuizAttemptAnswer>,
    @InjectRepository(DailyQuizSet)
    private readonly dailyQuizSetRepo: Repository<DailyQuizSet>,
    @InjectRepository(DailyQuizSetQuestion)
    private readonly dailyQuizSetQuestionRepo: Repository<DailyQuizSetQuestion>,
    private readonly geminiService: GeminiService,
    private readonly auditService: AuditService,
  ) { }

  // ─────────────── QUESTION BANK ───────────────

  async createQuestion(
    adminId: string,
    adminEmail: string,
    dto: CreateQuizQuestionDto,
  ): Promise<QuizQuestion> {
    const correctOptions = dto.options.filter((o) => o.isCorrect);
    if (correctOptions.length !== 1) {
      throw new BadRequestException('Phải có đúng 1 đáp án đúng (isCorrect = true).');
    }

    const question = this.questionRepo.create({
      topic: dto.topic,
      difficulty: dto.difficulty,
      content: dto.content,
      explanation: dto.explanation,
      status: QuizQuestionStatus.ACTIVE,
      source: QuizQuestionSource.MANUAL,
      createdById: adminId,
      options: dto.options.map((opt, index) =>
        this.optionRepo.create({
          content: opt.content,
          isCorrect: opt.isCorrect,
          sortOrder: opt.sortOrder ?? index,
        }),
      ),
    });

    const saved = await this.questionRepo.save(question);

    await this.auditService.log(
      adminId,
      adminEmail,
      AdminAuditAction.QUIZ_QUESTION_CREATE,
      null,
      { questionId: saved.id },
    );

    return saved;
  }

  async listQuestions(query: ListQuizQuestionsQueryDto) {
    const { page = 1, limit = 20, topic, difficulty, status, source, search } = query;
    const skip = (page - 1) * limit;

    const qb = this.questionRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.options', 'o')
      .orderBy('q.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (topic) qb.andWhere('q.topic = :topic', { topic });
    if (difficulty) qb.andWhere('q.difficulty = :difficulty', { difficulty });
    if (status) qb.andWhere('q.status = :status', { status });
    if (source) qb.andWhere('q.source = :source', { source });
    if (search) {
      qb.andWhere('(q.content ILIKE :search OR q.explanation ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuestionById(id: string): Promise<QuizQuestion> {
    const question = await this.questionRepo.findOne({
      where: { id },
      relations: ['options'],
    });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async updateQuestion(
    id: string,
    adminId: string,
    adminEmail: string,
    dto: UpdateQuizQuestionDto,
  ): Promise<QuizQuestion> {
    const question = await this.getQuestionById(id);

    if (dto.options) {
      const correctOptions = dto.options.filter((o) => o.isCorrect);
      if (correctOptions.length !== 1) {
        throw new BadRequestException('Phải có đúng 1 đáp án đúng (isCorrect = true).');
      }

      await this.optionRepo.delete({ questionId: id });
      question.options = dto.options.map((opt, index) =>
        this.optionRepo.create({
          content: opt.content,
          isCorrect: opt.isCorrect,
          sortOrder: opt.sortOrder ?? index,
        }),
      );
    }

    if (dto.topic) question.topic = dto.topic;
    if (dto.difficulty) question.difficulty = dto.difficulty;
    if (dto.content) question.content = dto.content;
    if (dto.explanation) question.explanation = dto.explanation;

    const saved = await this.questionRepo.save(question);

    await this.auditService.log(
      adminId,
      adminEmail,
      AdminAuditAction.QUIZ_QUESTION_UPDATE,
      null,
      { questionId: saved.id },
    );

    return saved;
  }

  async deleteQuestion(id: string, adminId: string, adminEmail: string): Promise<void> {
    const question = await this.getQuestionById(id);

    question.status = QuizQuestionStatus.INACTIVE;
    await this.questionRepo.save(question);

    await this.auditService.log(
      adminId,
      adminEmail,
      AdminAuditAction.QUIZ_QUESTION_DELETE,
      null,
      { questionId: id, softDelete: true },
    );
  }

  async updateStatus(
    id: string,
    adminId: string,
    adminEmail: string,
    dto: UpdateQuizQuestionStatusDto,
  ): Promise<QuizQuestion> {
    const question = await this.getQuestionById(id);

    question.status = dto.status;
    if (dto.status === QuizQuestionStatus.ACTIVE) {
      question.reviewedById = adminId;
      question.reviewedAt = new Date();
    }

    const saved = await this.questionRepo.save(question);

    await this.auditService.log(
      adminId,
      adminEmail,
      AdminAuditAction.QUIZ_QUESTION_STATUS_UPDATE,
      null,
      { questionId: id, status: dto.status },
    );

    return saved;
  }

  async bulkUpdateStatus(
    adminId: string,
    adminEmail: string,
    dto: BulkUpdateStatusDto,
  ) {
    const questions = await this.questionRepo.find({ where: { id: In(dto.ids) } });
    if (questions.length === 0) {
      throw new NotFoundException('Không tìm thấy câu hỏi nào.');
    }

    const now = new Date();
    for (const q of questions) {
      q.status = dto.status;
      if (dto.status === QuizQuestionStatus.ACTIVE) {
        q.reviewedById = adminId;
        q.reviewedAt = now;
      }
    }

    await this.questionRepo.save(questions);

    await this.auditService.log(
      adminId,
      adminEmail,
      AdminAuditAction.QUIZ_QUESTION_STATUS_UPDATE,
      null,
      { ids: dto.ids, status: dto.status, count: questions.length },
    );

    return { updated: questions.length };
  }

  // ─────────────── AI GENERATION ───────────────

  async generateQuestions(
    adminId: string,
    adminEmail: string,
    dto: GenerateAdminQuizDto,
  ): Promise<QuizQuestion[]> {
    const aiQuestions = await this.geminiService.generateQuizQuestions({
      topic: dto.topic,
      difficulty: dto.difficulty === QuizDifficulty.MIXED ? undefined : (dto.difficulty as any),
      count: dto.count ?? 5,
    });

    if (aiQuestions.length === 0) {
      throw new BadRequestException('Không thể sinh câu hỏi từ AI lúc này.');
    }

    const questionsToSave = aiQuestions.map((aiq) => {
      return this.questionRepo.create({
        topic: dto.topic,
        difficulty: dto.difficulty ?? QuizDifficulty.MEDIUM,
        content: aiq.question,
        explanation: aiq.explanation,
        status: QuizQuestionStatus.PENDING_REVIEW,
        source: QuizQuestionSource.AI,
        createdById: adminId,
        options: aiq.options.map((optContent, index) =>
          this.optionRepo.create({
            content: optContent,
            isCorrect: index === aiq.correctIndex,
            sortOrder: index,
          }),
        ),
      });
    });

    const savedQuestions = await this.questionRepo.save(questionsToSave);

    await this.auditService.log(
      adminId,
      adminEmail,
      AdminAuditAction.QUIZ_QUESTION_GENERATE,
      null,
      { topic: dto.topic, count: savedQuestions.length },
    );

    return savedQuestions;
  }

  // ─────────────── IMPORT ───────────────

  async importQuestions(adminId: string, adminEmail: string, file: Express.Multer.File) {
    try {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);

      let created = 0;
      let skipped = 0;
      const errors: any[] = [];
      const questionsToSave: QuizQuestion[] = [];

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i];
        try {
          const topic = row.topic || row.Topic;
          const difficulty = row.difficulty || row.Difficulty || QuizDifficulty.MEDIUM;
          const content = row.content || row.Content;
          const optionA = row.optionA || row.OptionA;
          const optionB = row.optionB || row.OptionB;
          const optionC = row.optionC || row.OptionC;
          const optionD = row.optionD || row.OptionD;
          let correctAnswer = row.correctAnswer || row.CorrectAnswer;
          const explanation = row.explanation || row.Explanation || '';

          if (!content || !optionA || !optionB || !optionC || !optionD || correctAnswer === undefined) {
            errors.push({ row: i + 2, field: 'all', message: 'Thiếu cột bắt buộc' });
            skipped++;
            continue;
          }

          const optionsList = [optionA, optionB, optionC, optionD];

          let correctIndex = -1;
          if (typeof correctAnswer === 'string' && /^[A-D]$/i.test(correctAnswer)) {
            correctIndex = correctAnswer.toUpperCase().charCodeAt(0) - 65;
          } else {
            correctIndex = parseInt(correctAnswer, 10);
          }

          if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
            errors.push({ row: i + 2, field: 'correctAnswer', message: 'CorrectAnswer không hợp lệ' });
            skipped++;
            continue;
          }

          const existing = await this.questionRepo.findOne({ where: { content } });
          if (existing) {
            errors.push({ row: i + 2, field: 'content', message: 'Trùng câu hỏi' });
            skipped++;
            continue;
          }

          const question = this.questionRepo.create({
            topic,
            difficulty,
            content,
            explanation,
            status: QuizQuestionStatus.PENDING_REVIEW,
            source: QuizQuestionSource.IMPORT,
            createdById: adminId,
            options: optionsList.map((optContent, index) =>
              this.optionRepo.create({
                content: optContent.toString(),
                isCorrect: index === correctIndex,
                sortOrder: index,
              }),
            ),
          });

          questionsToSave.push(question);
          created++;

        } catch (e) {
          errors.push({ row: i + 2, field: 'unknown', message: e.message });
          skipped++;
        }
      }

      if (questionsToSave.length > 0) {
        await this.questionRepo.save(questionsToSave);
      }

      await this.auditService.log(
        adminId,
        adminEmail,
        AdminAuditAction.QUIZ_QUESTION_IMPORT,
        null,
        { totalRows: data.length, created, skipped }
      );

      return { totalRows: data.length, created, skipped, errors };

    } catch (e) {
      throw new BadRequestException('Lỗi parse file Excel/CSV: ' + e.message);
    }
  }

  // ─────────────── ATTEMPTS ───────────────

  async listAttempts(query: ListQuizAttemptsQueryDto) {
    const { page = 1, limit = 20, topicId, userSearch, dateFrom, dateTo, rewarded } = query;
    const skip = (page - 1) * limit;

    const qb = this.attemptRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'u')
      .orderBy('a.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (topicId) qb.andWhere('a.topicId = :topicId', { topicId });
    if (dateFrom) qb.andWhere('a.quizDate >= :dateFrom', { dateFrom });
    if (dateTo) qb.andWhere('a.quizDate <= :dateTo', { dateTo });
    if (rewarded !== undefined) qb.andWhere('a.isRewarded = :rewarded', { rewarded });

    if (userSearch) {
      qb.andWhere('(u.email ILIKE :userSearch OR u.fullName ILIKE :userSearch)', {
        userSearch: `%${userSearch}%`,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map(attempt => ({
        id: attempt.id,
        userId: attempt.userId,
        userEmail: attempt.user?.email ?? null,
        userName: attempt.user?.fullName ?? null,
        topic: attempt.topicId,
        quizDate: attempt.quizDate,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        pointsEarned: attempt.pointsEarned,
        isRewarded: attempt.isRewarded,
        createdAt: attempt.createdAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAttemptDetail(id: string) {
    const attempt = await this.attemptRepo.findOne({
      where: { id },
      relations: ['user', 'answers'],
    });
    if (!attempt) throw new NotFoundException('Không tìm thấy lượt làm quiz.');

    return {
      id: attempt.id,
      userId: attempt.userId,
      userEmail: attempt.user?.email ?? null,
      userName: attempt.user?.fullName ?? null,
      topic: attempt.topicId,
      quizDate: attempt.quizDate,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      pointsEarned: attempt.pointsEarned,
      isRewarded: attempt.isRewarded,
      createdAt: attempt.createdAt,
      answers: attempt.answers?.map(a => ({
        id: a.id,
        questionId: a.questionId,
        questionSnapshot: a.questionSnapshot,
        selectedOptionIndex: a.selectedOptionIndex,
        correctOptionIndex: a.correctOptionIndex,
        isCorrect: a.isCorrect,
        explanation: a.explanation,
      })) ?? [],
    };
  }

  // ─────────────── SNAPSHOTS ───────────────

  async listSnapshots(query: ListQuizSnapshotsQueryDto) {
    const { page = 1, limit = 20, date, topicId } = query;
    const skip = (page - 1) * limit;

    const qb = this.dailyQuizSetRepo.createQueryBuilder('s')
      .loadRelationCountAndMap('s.questionCount', 's.questions')
      .orderBy('s.quizDate', 'DESC')
      .addOrderBy('s.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (date) qb.andWhere('s.quizDate = :date', { date });
    if (topicId) qb.andWhere('s.topicId = :topicId', { topicId });

    const [data, total] = await qb.getManyAndCount();

    // Get attempt counts per set
    const setIds = data.map(s => s.id);
    const attemptCounts: Record<string, number> = {};
    if (setIds.length > 0) {
      const raw = await this.attemptRepo.createQueryBuilder('a')
        .select('a.topicId', 'topicId')
        .addSelect('a.quizDate', 'quizDate')
        .addSelect('COUNT(*)', 'cnt')
        .groupBy('a.topicId')
        .addGroupBy('a.quizDate')
        .getRawMany();

      for (const r of raw) {
        const key = `${r.quizDate}__${r.topicId}`;
        attemptCounts[key] = parseInt(r.cnt, 10);
      }
    }

    return {
      data: data.map((s: any) => ({
        id: s.id,
        quizDate: s.quizDate,
        topicId: s.topicId,
        difficulty: s.difficulty,
        questionCount: s.questionCount ?? 0,
        attemptsCount: attemptCounts[`${s.quizDate}__${s.topicId}`] ?? 0,
        createdAt: s.createdAt,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSnapshotDetail(id: string) {
    const set = await this.dailyQuizSetRepo.findOne({
      where: { id },
      relations: ['questions', 'questions.question', 'questions.question.options'],
    });
    if (!set) throw new NotFoundException('Không tìm thấy snapshot.');

    const attemptsCount = await this.attemptRepo.count({
      where: { topicId: set.topicId, quizDate: set.quizDate },
    });

    return {
      id: set.id,
      quizDate: set.quizDate,
      topicId: set.topicId,
      difficulty: set.difficulty,
      attemptsCount,
      createdAt: set.createdAt,
      questions: set.questions
        ?.sort((a, b) => a.sortOrder - b.sortOrder)
        .map(sq => ({
          sortOrder: sq.sortOrder,
          question: sq.question ? {
            id: sq.question.id,
            content: sq.question.content,
            explanation: sq.question.explanation,
            difficulty: sq.question.difficulty,
            options: sq.question.options
              ?.sort((a, b) => a.sortOrder - b.sortOrder)
              .map(o => ({ content: o.content, isCorrect: o.isCorrect })),
          } : null,
        })),
    };
  }

  // ─────────────── COVERAGE ───────────────

  async getCoverage() {
    const raw = await this.questionRepo.createQueryBuilder('q')
      .select('q.topic', 'topic')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        `COUNT(*) FILTER (WHERE q.status = 'ACTIVE')`,
        'active',
      )
      .addSelect(
        `COUNT(*) FILTER (WHERE q.status = 'PENDING_REVIEW')`,
        'pending',
      )
      .groupBy('q.topic')
      .orderBy('active', 'DESC')
      .getRawMany();

    return raw.map(r => ({
      topic: r.topic,
      total: parseInt(r.total, 10),
      active: parseInt(r.active, 10),
      pending: parseInt(r.pending, 10),
      status:
        parseInt(r.active, 10) >= 20
          ? 'good'
          : parseInt(r.active, 10) >= 5
            ? 'low'
            : 'critical',
    }));
  }

  // ─────────────── STATS ───────────────

  async getStats() {
    const totalQuestions = await this.questionRepo.count();
    const activeQuestions = await this.questionRepo.count({ where: { status: QuizQuestionStatus.ACTIVE } });
    const pendingReviewQuestions = await this.questionRepo.count({ where: { status: QuizQuestionStatus.PENDING_REVIEW } });

    const totalAttempts = await this.attemptRepo.count();
    const attemptsToday = await this.attemptRepo.count({
      where: { quizDate: new Date().toISOString().slice(0, 10) },
    });

    const totalPointsAwardedQuery = await this.attemptRepo
      .createQueryBuilder('a')
      .select('SUM(a.pointsEarned)', 'total')
      .getRawOne();

    const avgScoreQuery = await this.attemptRepo
      .createQueryBuilder('a')
      .select('AVG(a.score)', 'avg')
      .getRawOne();

    return {
      totalQuestions,
      activeQuestions,
      pendingReviewQuestions,
      totalAttempts,
      attemptsToday,
      totalPointsAwarded: Number(totalPointsAwardedQuery?.total || 0),
      averageScore: Number(avgScoreQuery?.avg || 0),
    };
  }
}
