import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminUsersService } from './services/admin-users.service';
import { PointTransaction } from '../points/entities/point-transaction.entity';
import { Redemption } from '../rewards/entities/redemption.entity';
import { DropoffTransaction } from '../locations/entities/dropoff-transaction.entity';
import { TrashClassification } from '../ai/entities/trash-classification.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PointTransaction,
      Redemption,
      DropoffTransaction,
      TrashClassification,
    ]),
    AuditModule,
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, AdminUsersService],
  exports: [UsersService],
})
export class UsersModule {}
