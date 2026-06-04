import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './controllers/points.controller';
import { AdminPointsController } from './controllers/admin-points.controller';
import { PointsService } from './points.service';
import { PointRule } from './entities/point-rule.entity';
import { PointTransaction } from './entities/point-transaction.entity';
import { User } from '../users/entities/user.entity';
import { AuditModule } from '../audit/audit.module';
import { FraudModule } from '../fraud/fraud.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointRule, PointTransaction, User]),
    AuditModule,
    FraudModule,
  ],
  controllers: [PointsController, AdminPointsController],
  providers: [PointsService],
  exports: [TypeOrmModule, PointsService],
})
export class PointsModule {}
