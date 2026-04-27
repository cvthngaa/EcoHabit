import {
  BadRequestException,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { GeminiQuizQuestion } from '../gemini/types/gemini.types';
import { PointSourceType } from '../points/enums/point-source-type.enum';
import { PointTransactionType } from '../points/enums/point-transaction-type.enum';
import { PointsService } from '../points/points.service';
import { GeminiService } from '../gemini/gemini.service';
import {
  DAILY_QUIZ_CACHE_TTL_SECONDS,
  DAILY_QUIZ_DIFFICULTIES,
  DAILY_QUIZ_QUESTION_COUNT,
  DAILY_QUIZ_TOPIC_COUNT,
  DAILY_QUIZ_TOPICS,
  POINTS_PER_CORRECT_ANSWER,
} from './constants/daily-quiz-topics.constant';
import { QUIZ_BANK } from './constants/quiz-bank.constant';
import { GenerateQuizDto } from './dto/generate-quiz.dto';
import {
  DailyQuizAnswerDetail,
  DailyQuizResult,
  QuizQuestion,
  QuizTopic,
  SelectedDailyQuizTopic,
} from './types/quiz.types';
import { getTodayInVietnam } from './utils/quiz-date.util';
import { seededShuffle, shuffle } from './utils/quiz-random.util';

type QuizServiceQuestion = QuizQuestion | GeminiQuizQuestion;

@Injectable()
export class QuizService implements OnModuleDestroy {
  private readonly redisClient: Redis;

  constructor(
    private readonly geminiService: GeminiService,
    private readonly pointsService: PointsService,
  ) {
    this.redisClient = this.createRedisClient();
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  async generateQuiz(dto: GenerateQuizDto) {
    const count = dto.count ?? DAILY_QUIZ_QUESTION_COUNT;
    const difficulty = dto.difficulty;
    const topic = dto.topic ?? 'moi truong';

    const aiQuestions = await this.geminiService.generateQuizQuestions({
      topic,
      difficulty,
      count,
    });

    if (aiQuestions.length > 0) {
      return {
        topic,
        difficulty: difficulty ?? 'mixed',
        count: aiQuestions.length,
        questions: aiQuestions,
        source: 'gemini',
      };
    }

    const fallbackQuestions = this.pickFallbackQuestions(dto, count);

    return {
      topic,
      difficulty: difficulty ?? 'mixed',
      count: fallbackQuestions.length,
      questions: fallbackQuestions.map((question) =>
        this.toPublicQuestion(question),
      ),
      source: 'fallback',
    };
  }

  async getDailyQuiz(userId: string) {
    const today = getTodayInVietnam();
    const topics = this.getTodaysTopics(today);

    return Promise.all(
      topics.map(async (topic) => {
        const completedResult = await this.getCompletedDailyQuiz(
          userId,
          today,
          topic.id,
        );

        if (completedResult) {
          return {
            ...topic,
            completed: true,
            date: today,
            score: completedResult.score,
            total: completedResult.total,
            pointsEarned: completedResult.pointsEarned,
            completedAt: completedResult.completedAt,
            questions: [],
          };
        }

        const questions = await this.getQuestionsForDailyTopic(today, topic);

        return {
          ...topic,
          completed: false,
          date: today,
          count: questions.length,
          questions: questions.map((question) =>
            this.toPublicQuestion(question),
          ),
        };
      }),
    );
  }

  async submitDailyQuiz(userId: string, topicId: string, answers: number[]) {
    const today = getTodayInVietnam();
    const topic = this.findTodaysTopic(today, topicId);

    if (!topic) {
      throw new BadRequestException(
        'Chu de khong hop le hoac khong co trong ngay hom nay.',
      );
    }

    const completedKey = this.completedQuizKey(userId, today, topicId);
    const alreadyCompleted = await this.redisClient.get(completedKey);

    if (alreadyCompleted) {
      throw new BadRequestException(
        'Ban da hoan thanh chu de nay hom nay roi.',
      );
    }

    const questions = await this.getQuestionsForDailyTopic(today, topic);

    if (answers.length !== questions.length) {
      throw new BadRequestException(
        `Can tra loi dung ${questions.length} cau, nhan duoc ${answers.length} cau.`,
      );
    }

    const { score, details } = this.gradeAnswers(questions, answers);
    const pointsEarned = score * POINTS_PER_CORRECT_ANSWER;

    await this.rewardQuizPoints(userId, topicId, pointsEarned);

    const result: DailyQuizResult = {
      score,
      total: questions.length,
      pointsEarned,
      details,
      completedAt: new Date().toISOString(),
    };

    await this.cacheDailyQuizResult(completedKey, result);

    return {
      score,
      total: questions.length,
      pointsEarned,
      details,
    };
  }

  private createRedisClient(): Redis {
    const redisUrl = process.env.REDIS_URL?.trim();

    if (redisUrl?.startsWith('redis')) {
      return new Redis(redisUrl);
    }

    return new Redis();
  }

  private pickFallbackQuestions(
    dto: GenerateQuizDto,
    count: number,
  ): QuizQuestion[] {
    const topic = this.resolveTopic((dto.topic ?? '').trim().toLowerCase());
    const filteredQuestions = QUIZ_BANK.filter((question) => {
      const matchesTopic = topic
        ? question.topic === topic || question.topic === 'general'
        : true;
      const matchesDifficulty = dto.difficulty
        ? question.difficulty === dto.difficulty
        : true;

      return matchesTopic && matchesDifficulty;
    });

    const fallback =
      filteredQuestions.length > 0 ? filteredQuestions : QUIZ_BANK;

    return shuffle(fallback).slice(0, Math.min(count, fallback.length));
  }

  private resolveTopic(topic: string): QuizTopic | null {
    if (!topic) return null;
    if (topic.includes('nhua') || topic.includes('plastic')) return 'plastic';
    if (topic.includes('pin') || topic.includes('battery')) return 'battery';

    if (
      topic.includes('tai che') ||
      topic.includes('phan loai') ||
      topic.includes('recycling')
    ) {
      return 'recycling';
    }

    return 'general';
  }

  private getTodaysTopics(today: string): SelectedDailyQuizTopic[] {
    return seededShuffle(DAILY_QUIZ_TOPICS, today)
      .slice(0, DAILY_QUIZ_TOPIC_COUNT)
      .map((topic) => ({
        ...topic,
        difficulty: seededShuffle(
          DAILY_QUIZ_DIFFICULTIES,
          `${today}-${topic.id}-difficulty`,
        )[0],
      }));
  }

  private findTodaysTopic(
    today: string,
    topicId: string,
  ): SelectedDailyQuizTopic | undefined {
    return this.getTodaysTopics(today).find((topic) => topic.id === topicId);
  }

  private async getQuestionsForDailyTopic(
    today: string,
    topic: SelectedDailyQuizTopic,
  ): Promise<QuizServiceQuestion[]> {
    const cacheKey = this.dailyQuestionsKey(today, topic.id);
    const cachedQuestions =
      await this.readJson<QuizServiceQuestion[]>(cacheKey);

    if (cachedQuestions) {
      return cachedQuestions;
    }

    const questions =
      (await this.generateDailyQuestions(topic)) ??
      this.pickFallbackDailyQuestions(today, topic);

    await this.writeJson(cacheKey, questions, DAILY_QUIZ_CACHE_TTL_SECONDS);

    return questions;
  }

  private async generateDailyQuestions(
    topic: SelectedDailyQuizTopic,
  ): Promise<GeminiQuizQuestion[] | null> {
    const questions = await this.geminiService.generateQuizQuestions({
      topic: topic.name,
      difficulty: topic.difficulty === 'mixed' ? undefined : topic.difficulty,
      count: DAILY_QUIZ_QUESTION_COUNT,
    });

    return questions.length > 0 ? questions : null;
  }

  private pickFallbackDailyQuestions(
    today: string,
    topic: SelectedDailyQuizTopic,
  ): QuizQuestion[] {
    const topicQuestions = this.getFallbackBankForDailyTopic(topic.id);

    return seededShuffle(topicQuestions, `${today}-${topic.id}`).slice(
      0,
      Math.min(DAILY_QUIZ_QUESTION_COUNT, topicQuestions.length),
    );
  }

  private getFallbackBankForDailyTopic(topicId: string): QuizQuestion[] {
    if (topicId === 'general') {
      return QUIZ_BANK;
    }

    const topicQuestions = QUIZ_BANK.filter(
      (question) => question.topic === topicId,
    );

    return topicQuestions.length >= 3 ? topicQuestions : QUIZ_BANK;
  }

  private async getCompletedDailyQuiz(
    userId: string,
    today: string,
    topicId: string,
  ): Promise<DailyQuizResult | null> {
    return this.readJson<DailyQuizResult>(
      this.completedQuizKey(userId, today, topicId),
    );
  }

  private gradeAnswers(
    questions: QuizServiceQuestion[],
    answers: number[],
  ): { score: number; details: DailyQuizAnswerDetail[] } {
    let score = 0;

    const details = questions.map((question, index) => {
      const correct = question.correctIndex === answers[index];

      if (correct) {
        score += 1;
      }

      return {
        questionId: question.id,
        userAnswer: answers[index],
        correctAnswer: question.correctIndex,
        correct,
      };
    });

    return { score, details };
  }

  private async rewardQuizPoints(
    userId: string,
    topicId: string,
    pointsEarned: number,
  ): Promise<void> {
    if (pointsEarned <= 0) return;

    await this.pointsService.addPoint(
      userId,
      pointsEarned,
      PointTransactionType.EARN,
      PointSourceType.QUIZ,
      topicId,
    );
  }

  private async cacheDailyQuizResult(
    cacheKey: string,
    result: DailyQuizResult,
  ): Promise<void> {
    await this.writeJson(cacheKey, result, DAILY_QUIZ_CACHE_TTL_SECONDS);
  }

  private toPublicQuestion(question: QuizServiceQuestion) {
    const {
      topic: _topic,
      difficulty: _difficulty,
      ...publicQuestion
    } = question as QuizServiceQuestion & Partial<QuizQuestion>;
    return publicQuestion;
  }

  private dailyQuestionsKey(today: string, topicId: string): string {
    return `quiz:daily_questions:${today}:${topicId}`;
  }

  private completedQuizKey(
    userId: string,
    today: string,
    topicId: string,
  ): string {
    return `quiz:completed:${userId}:${today}:${topicId}`;
  }

  private async readJson<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  private async writeJson<T>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }
}
