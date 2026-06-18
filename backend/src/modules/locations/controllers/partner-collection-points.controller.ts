import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PartnerRoles } from '../../../common/decorators/partner-roles.decorator';
import { PartnerRoleGuard } from '../../../common/guards/partner-role.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';
import { PartnerRoleType } from '../../partner/enum/partner-role-type.enum';
import { UserRole } from '../../users/enums/user-role.enum';
import { CreateCollectionPointDto } from '../dto/create-collection-point.dto';
import { UpdateCollectionPointDto } from '../dto/update-collection-point.dto';
import { LocationsService } from '../locations.service';

@UseGuards(AuthGuard('jwt'), RolesGuard, PartnerRoleGuard)
@Roles(UserRole.PARTNER)
@PartnerRoles(PartnerRoleType.COLLECTOR)
@Controller('partner/collection-points')
export class PartnerCollectionPointsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getMyCollectionPoints(@Request() req: AuthenticatedRequest) {
    return this.locationsService.getMyCollectionPoints(
      req.user.userId,
      req.user.role,
    );
  }

  @Get(':id')
  async getMyCollectionPoint(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.locationsService.getPartnerCollectionPoint(
      id,
      req.user.userId,
    );
  }

  @Post()
  async createCollectionPoint(
    @Request() req: AuthenticatedRequest,
    @Body() data: CreateCollectionPointDto,
  ) {
    return this.locationsService.createCollectionPoint(req.user.userId, data);
  }

  @Patch(':id')
  async updateCollectionPoint(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateCollectionPointDto,
  ) {
    return this.locationsService.updateCollectionPoint(
      id,
      req.user.userId,
      req.user.role,
      data,
    );
  }
}
