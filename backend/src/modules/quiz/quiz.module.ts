import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { GeminiModule } from '../gemini/gemini.module';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [GeminiModule, PointsModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
