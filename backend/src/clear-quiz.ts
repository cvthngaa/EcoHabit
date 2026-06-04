import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DailyQuizSet } from './modules/quiz/entities/daily-quiz-set.entity';
import { QuizAttempt } from './modules/quiz/entities/quiz-attempt.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const dailyQuizSetRepo = app.get(getRepositoryToken(DailyQuizSet));
  const attemptRepo = app.get(getRepositoryToken(QuizAttempt));
  
  console.log('Clearing ALL daily quiz sets...');
  await dailyQuizSetRepo.query('TRUNCATE TABLE daily_quiz_sets CASCADE');
  await attemptRepo.query('TRUNCATE TABLE quiz_attempts CASCADE');
  
  console.log('Done!');
  await app.close();
  process.exit(0);
}
bootstrap();
