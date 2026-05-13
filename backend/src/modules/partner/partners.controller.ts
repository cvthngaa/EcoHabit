import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { UserRole } from '../users/enums/user-role.enum';
import { UpdatePartnerProfileDto } from './dto/update-partner-profile.dto';
import { PartnersService } from './partners.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.PARTNER)
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('me')
  getMyProfile(@Request() req: AuthenticatedRequest) {
    return this.partnersService.getMyProfile(req.user.userId);
  }

  @Patch('me')
  updateMyProfile(
    @Request() req: AuthenticatedRequest,
    @Body() data: UpdatePartnerProfileDto,
  ) {
    return this.partnersService.updateMyProfile(req.user.userId, data);
  }
}
