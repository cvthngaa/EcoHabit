import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './controllers/points.controller';
import { PointsService } from './points.service';
import { PointRule } from './entities/point-rule.entity';
import { PointTransaction } from './entities/point-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointRule, PointTransaction])],
  controllers: [PointsController],
  providers: [PointsService],
  exports: [TypeOrmModule, PointsService],
})
export class PointsModule {}
