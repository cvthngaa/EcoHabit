import { Module } from '@nestjs/common';
import { PartnersModule } from '../partner/partners.module';
import { AdminPartnersController } from './admin-partners.controller';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [PartnersModule],
  controllers: [AdminPartnersController, AdminSettingsController],
})
export class AdminModule {}
