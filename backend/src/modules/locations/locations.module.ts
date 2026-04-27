import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AcceptedWasteType } from './entities/accepted-waste-type.entity';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';
import { LocationsService } from './locations.service';
import { CollectionPointsController } from './collection-points.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, AcceptedWasteType, DropoffTransaction]),
  ],
  controllers: [CollectionPointsController],
  providers: [LocationsService],
  exports: [TypeOrmModule, LocationsService],
})
export class LocationsModule {}
