import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointSourceType } from '../points/enums/point-source-type.enum';
import { PointTransactionType } from '../points/enums/point-transaction-type.enum';
import { PointsService } from '../points/points.service';
import { GeminiService } from '../gemini/gemini.service';
import { FraudService } from '../fraud/fraud.service';
import { BadgesService } from '../badges/badges.service';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptAnswer } from './entities/quiz-attempt-answer.entity';
import { DailyQuizSet } from './entities/daily-quiz-set.entity';
import { DailyQuizSetQuestion } from './entities/daily-quiz-set-question.entity';
import { QuizQuestionStatus } from './enums/quiz-question-status.enum';
import { QuizDifficulty } from './enums/quiz-difficulty.enum';
import { ListQuizHistoryQueryDto } from './dto/list-quiz-history-query.dto';
import { getTodayInVietnam } from './utils/quiz-date.util';
import { shuffle } from './utils/quiz-random.util';
import {
  DAILY_QUIZ_TOPIC_COUNT,
  DAILY_QUIZ_QUESTION_COUNT,
  POINTS_PER_CORRECT_ANSWER,
} from './constants/quiz.constants';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(QuizAttemptAnswer)
    private readonly attemptAnswerRepo: Repository<QuizAttemptAnswer>,
    @InjectRepository(DailyQuizSet)
    private readonly dailyQuizSetRepo: Repository<DailyQuizSet>,
    @InjectRepository(DailyQuizSetQuestion)
    private readonly dailyQuizSetQuestionRepo: Repository<DailyQuizSetQuestion>,
    private readonly geminiService: GeminiService,
    private readonly pointsService: PointsService,
    private readonly fraudService: FraudService,
    @Optional() private readonly badgesService: BadgesService,
  ) { }

  async getDailyQuiz(userId: string) {
    const today = getTodayInVietnam();
    const topics = await this.getOrGenerateTodaysTopics(today);

    return Promise.all(
      topics.map(async (topic) => {
        const completedAttempt = await this.attemptRepo.findOne({
          where: { userId, topicId: topic.id, quizDate: today, isRewarded: true },
          order: { createdAt: 'DESC' }
        });

        if (completedAttempt) {
          return {
            ...topic,
            completed: true,
            rewarded: true,
            date: today,
            score: completedAttempt.score,
            total: completedAttempt.totalQuestions,
            pointsEarned: completedAttempt.pointsEarned,
            completedAt: completedAttempt.createdAt,
            questions: [],
          };
        }

        const questions = await this.getQuestionsForDailyTopic(today, topic.id);

        return {
          ...topic,
          completed: false,
          rewarded: false,
          date: today,
          count: questions.length,
          questions: questions.map((q) => {
            const sortedOptions = q.options.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
            return {
              id: q.id,
              question: q.content,
              options: sortedOptions.map((o: any) => o.content),
              correctIndex: sortedOptions.findIndex((o: any) => o.isCorrect),
              explanation: q.explanation,
            };
          }),
        };
      }),
    );
  }

  async submitDailyQuiz(userId: string, topicId: string, answers: number[]) {
    const today = getTodayInVietnam();
    const topics = await this.getOrGenerateTodaysTopics(today);
    const topic = topics.find((t) => t.id === topicId);

    if (!topic) {
      throw new BadRequestException('Chủ đề không hợp lệ hoặc không có trong ngày hôm nay.');
    }

    const questions = await this.getQuestionsForDailyTopic(today, topic.id);

    if (answers.length !== questions.length) {
      throw new BadRequestException(`Cần trả lời đúng ${questions.length} câu, nhận được ${answers.length} câu.`);
    }

    let score = 0;
    const details: any[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswerIndex = answers[i];

      const sortedOptions = question.options.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      const correctIndex = sortedOptions.findIndex((o: any) => o.isCorrect);
      const isCorrect = userAnswerIndex === correctIndex;
      const explanation = question.explanation;
      const optionsList = sortedOptions.map((o: any) => o.content);
      const contentStr = question.content;

      if (isCorrect) score++;

      details.push({
        questionId: question.id,
        question: contentStr,
        options: optionsList,
        userAnswer: userAnswerIndex,
        correctAnswer: correctIndex,
        correct: isCorrect,
        explanation,
        dbQuestionId: question.id,
      });
    }

    const alreadyRewarded = await this.attemptRepo.findOne({
      where: { userId, topicId, quizDate: today, isRewarded: true }
    });

    let pointsEarned = 0;
    let isRewarded = false;

    if (!alreadyRewarded) {
      const pointsPerAnswer = await this.pointsService.getRulePoints(
        'QUIZ_CORRECT_ANSWER',
        POINTS_PER_CORRECT_ANSWER,
      );
      pointsEarned = score * pointsPerAnswer;
      if (pointsEarned > 0) {
        await this.pointsService.addPoint(
          userId,
          pointsEarned,
          PointTransactionType.EARN,
          PointSourceType.QUIZ,
          `${topicId}-${today}`,
        );
        isRewarded = true;
      } else {
        isRewarded = true;
      }
    } else {
      void this.fraudService.checkQuizAbuse(userId, topicId);
    }

    const attempt = this.attemptRepo.create({
      userId,
      topicId,
      quizDate: today,
      score,
      totalQuestions: questions.length,
      pointsEarned,
      isRewarded,
      answers: details.map((d) =>
        this.attemptAnswerRepo.create({
          questionId: d.dbQuestionId,
          questionSnapshot: {
            question: d.question,
            options: d.options,
            explanation: d.explanation
          },
          selectedOptionIndex: d.userAnswer,
          correctOptionIndex: d.correctAnswer,
          isCorrect: d.correct,
          explanation: d.explanation,
        })
      ),
    });

    await this.attemptRepo.save(attempt);

    // Evaluate badge conditions asynchronously (fire-and-forget)
    if (this.badgesService) {
      void this.badgesService.evaluateUserBadges(userId);
    }

    return {
      score,
      total: questions.length,
      pointsEarned,
      rewarded: isRewarded,
      details: details.map(d => ({
        questionId: d.questionId,
        question: d.question,
        options: d.options,
        userAnswer: d.userAnswer,
        correctAnswer: d.correctAnswer,
        correct: d.correct,
        explanation: d.explanation,
      })),
    };
  }

  async getQuizHistory(userId: string, query: ListQuizHistoryQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await this.attemptRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

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

  async getAttemptDetail(userId: string, attemptId: string) {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId, userId },
      relations: ['answers'],
    });

    if (!attempt) {
      throw new NotFoundException('Không tìm thấy lượt làm quiz này.');
    }

    return attempt;
  }

  private async getOrGenerateTodaysTopics(today: string): Promise<any[]> {
    let sets = await this.dailyQuizSetRepo.find({
      where: { quizDate: today }
    });

    if (sets.length === 0) {
      const distinctTopicsResult = await this.questionRepo
        .createQueryBuilder('q')
        .select('DISTINCT q.topic', 'topic')
        .where('q.status = :status', { status: QuizQuestionStatus.ACTIVE })
        .getRawMany();

      const availableTopics = distinctTopicsResult.map((t) => t.topic);

      if (availableTopics.length > 0) {
        const topicIds = shuffle(availableTopics).slice(0, DAILY_QUIZ_TOPIC_COUNT);

        for (const tId of topicIds) {
          await this.findOrCreateDailyQuizSet(today, tId);
        }

        sets = await this.dailyQuizSetRepo.find({
          where: { quizDate: today }
        });
      }
    }

    return sets.map((set) => {
      const name = set.topicId.charAt(0).toUpperCase() + set.topicId.slice(1);
      return {
        id: set.topicId,
        name: name,
        icon: 'earth',
        description: `Câu đố về ${name}`,
        difficulty: set.difficulty || 'medium',
      };
    });
  }

  private async getQuestionsForDailyTopic(today: string, topicId: string): Promise<any[]> {
    return this.findOrCreateDailyQuizSet(today, topicId);
  }

  private async findOrCreateDailyQuizSet(today: string, topicId: string): Promise<any[]> {
    let set = await this.dailyQuizSetRepo.findOne({
      where: { quizDate: today, topicId },
      relations: ['questions', 'questions.question', 'questions.question.options'],
    });

    if (set && set.questions && set.questions.length > 0) {
      const sortedQuestions = set.questions.sort((a, b) => a.sortOrder - b.sortOrder);
      return sortedQuestions.map(sq => sq.question);
    }

    const dbQuestions = await this.questionRepo.find({
      where: { status: QuizQuestionStatus.ACTIVE, topic: topicId },
      relations: ['options'],
    });

    const validQuestions = dbQuestions.filter(q => {
      if (!q.options || q.options.length < 4) return false;
      const correctCount = q.options.filter(o => o.isCorrect).length;
      return correctCount === 1;
    });

    const selected = shuffle(validQuestions).slice(0, DAILY_QUIZ_QUESTION_COUNT);

    if (selected.length === 0) return [];

    let totalScore = 0;
    selected.forEach(q => {
      if (q.difficulty === 'easy') totalScore += 1;
      else if (q.difficulty === 'medium') totalScore += 2;
      else if (q.difficulty === 'hard') totalScore += 3;
      else totalScore += 2;
    });
    const avg = totalScore / selected.length;
    const difficulty = avg < 1.6 ? 'easy' : (avg > 2.4 ? 'hard' : 'medium');

    const newSet = this.dailyQuizSetRepo.create({
      quizDate: today,
      topicId: topicId,
      difficulty: difficulty,
    });
    await this.dailyQuizSetRepo.save(newSet);

    const setQuestions = selected.map((q, index) => this.dailyQuizSetQuestionRepo.create({
      dailyQuizSetId: newSet.id,
      questionId: q.id,
      sortOrder: index,
    }));
    await this.dailyQuizSetQuestionRepo.save(setQuestions);

    return selected;
  }
}
