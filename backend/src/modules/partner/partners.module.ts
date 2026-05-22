import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerProfile } from './entity/partner-profile.entity';
import { PartnerRoleTypeEntity } from './entity/partner-role-type.entity';
import { PartnersController } from './controllers/partners.controller';
import { PartnersService } from './partners.service';
import { AuditModule } from '../audit/audit.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PartnerProfile, PartnerRoleTypeEntity, User]),
    AuditModule,
  ],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}
