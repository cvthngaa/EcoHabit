import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizController } from './controllers/quiz.controller';
import { AdminQuizController } from './controllers/admin-quiz.controller';
import { QuizService } from './quiz.service';
import { AdminQuizService } from './admin-quiz.service';
import { GeminiModule } from '../gemini/gemini.module';
import { PointsModule } from '../points/points.module';
import { FraudModule } from '../fraud/fraud.module';
import { AuditModule } from '../audit/audit.module';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizOption } from './entities/quiz-option.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizAttemptAnswer } from './entities/quiz-attempt-answer.entity';
import { DailyQuizSet } from './entities/daily-quiz-set.entity';
import { DailyQuizSetQuestion } from './entities/daily-quiz-set-question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuizQuestion,
      QuizOption,
      QuizAttempt,
      QuizAttemptAnswer,
      DailyQuizSet,
      DailyQuizSetQuestion,
    ]),
    GeminiModule,
    PointsModule,
    FraudModule,
    AuditModule,
  ],
  controllers: [QuizController, AdminQuizController],
  providers: [QuizService, AdminQuizService],
  exports: [QuizService, AdminQuizService],
})
export class QuizModule { }
