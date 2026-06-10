import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';
import { QuizAttempt } from '../quiz/entities/quiz-attempt.entity';
import { TrashClassification } from '../ai/entities/trash-classification.entity';
import { DropoffTransaction } from '../locations/entities/dropoff-transaction.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Badge,
      UserBadge,
      QuizAttempt,
      TrashClassification,
      DropoffTransaction,
      User,
    ]),
  ],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
