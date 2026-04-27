import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@Controller('checkins')
export class CheckinsController {
  constructor(private readonly locationsService: LocationsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createCheckin(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateCheckinDto,
  ) {
    return this.locationsService.createCheckin(req.user.userId, data);
  }
}
