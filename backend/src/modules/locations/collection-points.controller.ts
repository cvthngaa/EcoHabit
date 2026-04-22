import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateCollectionPointDto } from './dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from './dto/update-collection-point.dto';

@Controller('collection-points')
export class CollectionPointsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAllCollectionPoints() {
    return this.locationsService.getAllCollectionPoints();
  }

  @Get('address-suggestions')
  async getAddressSuggestions(@Query('q') query: string) {
    return this.locationsService.getAddressSuggestions(query);
  }

  @Get(':id')
  async getCollectionPoint(@Param('id') id: string) {
    return this.locationsService.getCollectionPoint(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @Post()
  async createCollectionPoint(@Request() req, @Body() data: CreateCollectionPointDto) {
    return this.locationsService.createCollectionPoint(req.user.userId, data);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.PARTNER, UserRole.ADMIN)
  @Patch(':id')
  async updateCollectionPoint(
    @Request() req, 
    @Param('id') id: string, 
    @Body() data: UpdateCollectionPointDto
  ) {
    return this.locationsService.updateCollectionPoint(id, req.user.userId, req.user.role, data);
  }
}
