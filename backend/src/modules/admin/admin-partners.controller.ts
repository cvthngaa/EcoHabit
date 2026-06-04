import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';
import { UpdatePartnerApprovalDto } from '../partner/dto/update-partner-approval.dto';
import { UpdatePartnerRolesDto } from '../partner/dto/update-partner-roles.dto';
import { UpdatePartnerUserStatusDto } from '../partner/dto/update-partner-user-status.dto';
import { ListPartnersQueryDto } from '../partner/dto/list-partners-query.dto';
import { PartnersService } from '../partner/partners.service';
import { UserRole } from '../users/enums/user-role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/partners')
export class AdminPartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('stats')
  getPartnerStats() {
    return this.partnersService.getAdminPartnerStats();
  }

  @Get()
  getAllPartners(@Query() query: ListPartnersQueryDto) {
    return this.partnersService.getAllPartners(query);
  }

  @Get(':id')
  getPartnerDetail(@Param('id') id: string) {
    return this.partnersService.getPartnerDetail(id);
  }

  @Patch(':id/approval')
  updatePartnerApproval(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdatePartnerApprovalDto,
  ) {
    return this.partnersService.updatePartnerApproval(
      id,
      data,
      req.user.userId,
      req.user.email,
    );
  }

  @Patch(':id/roles')
  updatePartnerRoles(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdatePartnerRolesDto,
  ) {
    return this.partnersService.updatePartnerRoles(
      id,
      data,
      req.user.userId,
      req.user.email,
    );
  }

  @Patch(':id/status')
  updatePartnerUserStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePartnerUserStatusDto,
  ) {
    return this.partnersService.updatePartnerUserStatus(
      id,
      dto,
      req.user.userId,
      req.user.email,
    );
  }
}
