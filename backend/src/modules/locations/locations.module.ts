import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { AcceptedWasteType } from './entities/accepted-waste-type.entity';
import { DropoffTransaction } from './entities/dropoff-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Location, AcceptedWasteType, DropoffTransaction])],
  exports: [TypeOrmModule],
})
export class LocationsModule { }
