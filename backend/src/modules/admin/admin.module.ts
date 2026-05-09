import { Module } from '@nestjs/common';
import { PartnersModule } from '../partner/partners.module';
import { AdminPartnersController } from './admin-partners.controller';

@Module({
  imports: [PartnersModule],
  controllers: [AdminPartnersController],
})
export class AdminModule {}
