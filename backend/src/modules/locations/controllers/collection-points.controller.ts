import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { LocationsService } from '../locations.service';

@Controller('collection-points')
export class CollectionPointsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAllCollectionPoints(
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lng ? parseFloat(lng) : undefined;
    const radiusKm = radius ? parseFloat(radius) : 10;

    return this.locationsService.getAllCollectionPoints(
      latitude,
      longitude,
      radiusKm,
    );
  }

  @Get('address-suggestions')
  async getAddressSuggestions(@Query('q') query: string) {
    return this.locationsService.getAddressSuggestions(query);
  }

  @Get(':id')
  async getCollectionPoint(@Param('id') id: string) {
    return this.locationsService.getCollectionPoint(id);
  }
}
