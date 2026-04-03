import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TrashClassification } from './entities/trash-classification.entity';
import { AiFeedback } from './entities/ai-feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrashClassification, AiFeedback]),
    // Dùng memoryStorage để giữ buffer (không lưu file tạm ra disk)
    MulterModule.register({ storage: undefined }),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [TypeOrmModule, AiService],
})
export class AiModule {}
