import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { UserRole } from '../users/enums/user-role.enum';
import { PartnersService } from './partners.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/partners')
export class AdminPartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  getAllPartners() {
    return this.partnersService.getAllPartners();
  }

  @Get(':id')
  getPartnerDetail(@Param('id') id: string) {
    return this.partnersService.getPartnerDetail(id);
  }

  @Patch(':id/approval')
  updatePartnerApproval(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.partnersService.updatePartnerApproval(id, data, req.user.userId);
  }

  @Patch(':id/roles')
  updatePartnerRoles(@Param('id') id: string, @Body() data: any) {
    return this.partnersService.updatePartnerRoles(id, data);
  }
}
