import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { AdminAiController, AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TrashClassification } from './entities/trash-classification.entity';
import { AiFeedback } from './entities/ai-feedback.entity';
import { PointsModule } from '../points/points.module';
import { FraudModule } from '../fraud/fraud.module';
import { AuditModule } from '../audit/audit.module';
import { BadgesModule } from '../badges/badges.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrashClassification, AiFeedback]),
    PointsModule,
    FraudModule,
    AuditModule,
    MulterModule.register({ storage: undefined }),
    forwardRef(() => BadgesModule),
    LocationsModule,
  ],
  controllers: [AiController, AdminAiController],
  providers: [AiService],
  exports: [TypeOrmModule, AiService],
})
export class AiModule { }

