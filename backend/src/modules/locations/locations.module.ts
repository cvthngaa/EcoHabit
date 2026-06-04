import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AcceptedWasteType } from './entities/accepted-waste-type.entity';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { LocationCapability } from './entities/location-capability.entity';
import { CollectionLocationProfile } from './entities/collection-location-profile.entity';
import { CollectionQrSession } from './entities/collection-qr-session.entity';
import { LocationsService } from './locations.service';
import { CollectionPointsController } from './controllers/collection-points.controller';
import { CollectionTransactionsController } from './controllers/collection-transactions.controller';
import { CollectionTransactionsService } from './collection-transactions.service';
import { QrService } from './qr.service';
import { PartnersModule } from '../partner/partners.module';
import { PointsModule } from '../points/points.module';
import { FraudModule } from '../fraud/fraud.module';
import { AdminLocationsController } from './controllers/admin-locations.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Location,
      AcceptedWasteType,
      DropoffTransaction,
      LocationCapability,
      CollectionLocationProfile,
      CollectionQrSession,
    ]),
    PartnersModule,
    PointsModule,
    FraudModule,
  ],
  controllers: [CollectionPointsController, CollectionTransactionsController, AdminLocationsController],
  providers: [LocationsService, CollectionTransactionsService, QrService],
  exports: [TypeOrmModule, LocationsService],
})
export class LocationsModule { }
