import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FraudFlag } from './entities/fraud-flag.entity';
import { FraudService } from './fraud.service';
import { AdminFraudController } from './controllers/admin-fraud.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FraudFlag]),
    AuditModule,
  ],
  controllers: [AdminFraudController],
  providers: [FraudService],
  exports: [FraudService],
})
export class FraudModule {}
