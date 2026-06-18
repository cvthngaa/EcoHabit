import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AcceptedWasteType } from './entities/accepted-waste-type.entity';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { LocationCapability } from './entities/location-capability.entity';
import { CollectionLocationProfile } from './entities/collection-location-profile.entity';
import { LocationsService } from './locations.service';
import { CollectionPointsController } from './controllers/collection-points.controller';
import { CollectionTransactionsController } from './controllers/collection-transactions.controller';
import { CollectionTransactionsService } from './collection-transactions.service';
import { PartnersModule } from '../partner/partners.module';
import { PointsModule } from '../points/points.module';
import { FraudModule } from '../fraud/fraud.module';
import { AdminLocationsController } from './controllers/admin-locations.controller';
import { PartnerCollectionPointsController } from './controllers/partner-collection-points.controller';
import { BadgesModule } from '../badges/badges.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Location,
      AcceptedWasteType,
      DropoffTransaction,
      LocationCapability,
      CollectionLocationProfile,
    ]),
    PartnersModule,
    PointsModule,
    FraudModule,
    forwardRef(() => BadgesModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'dev-only-change-this-secret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [
    CollectionPointsController,
    CollectionTransactionsController,
    AdminLocationsController,
    PartnerCollectionPointsController,
  ],
  providers: [LocationsService, CollectionTransactionsService],
  exports: [TypeOrmModule, LocationsService, CollectionTransactionsService],
})
export class LocationsModule { }
