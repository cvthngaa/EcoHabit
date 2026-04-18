import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TrashClassification } from './entities/trash-classification.entity';
import { AiFeedback } from './entities/ai-feedback.entity';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrashClassification, AiFeedback]),
    PointsModule,
    MulterModule.register({ storage: undefined }),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [TypeOrmModule, AiService],
})
export class AiModule {}
