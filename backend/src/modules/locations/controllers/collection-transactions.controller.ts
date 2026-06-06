import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PartnerRoles } from '../../../common/decorators/partner-roles.decorator';
import { PartnerRoleGuard } from '../../../common/guards/partner-role.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { PartnerRoleType } from '../../partner/enum/partner-role-type.enum';
import { CollectionTransactionsService } from '../collection-transactions.service';
import { CreateCheckinDto } from '../dto/create-checkin.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class CollectionTransactionsController {
  constructor(private readonly transactionsService: CollectionTransactionsService) {}

  @Get('admin/collection-transactions')
  @Roles(UserRole.ADMIN)
  getAdminTransactions() {
    return this.transactionsService.getAdminTransactions();
  }

  @Post('collection-transactions/check-in')
  checkIn(@Request() req: any, @Body() data: CreateCheckinDto) {
    return this.transactionsService.checkIn(req.user.userId, data);
  }

  @Get('collection-transactions/me')
  getMyCheckins(@Request() req: any) {
    return this.transactionsService.getMyCheckins(req.user.userId);
  }

  @UseGuards(PartnerRoleGuard)
  @Roles(UserRole.PARTNER)
  @PartnerRoles(PartnerRoleType.COLLECTOR)
  @Get('partner/collection-transactions')
  getPartnerTransactions(@Request() req: any) {
    return this.transactionsService.getPartnerTransactions(req.user.userId);
  }

  @UseGuards(PartnerRoleGuard)
  @Roles(UserRole.PARTNER)
  @PartnerRoles(PartnerRoleType.COLLECTOR)
  @Patch('partner/collection-transactions/:id/verify')
  verifyTransaction(
    @Request() req: any,
    @Param('id') id: string,
    @Body('pointsAwarded') pointsAwarded: number,
  ) {
    return this.transactionsService.verifyTransaction(req.user.userId, id, pointsAwarded);
  }

  @UseGuards(PartnerRoleGuard)
  @Roles(UserRole.PARTNER)
  @PartnerRoles(PartnerRoleType.COLLECTOR)
  @Patch('partner/collection-transactions/:id/reject')
  rejectTransaction(
    @Request() req: any,
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
  ) {
    return this.transactionsService.rejectTransaction(req.user.userId, id, rejectionReason);
  }

  @UseGuards(PartnerRoleGuard)
  @Roles(UserRole.PARTNER)
  @PartnerRoles(PartnerRoleType.COLLECTOR)
  @Get('partner/locations/:locationId/qr')
  async getQr(
    @Request() req: any,
    @Param('locationId') locationId: string,
  ) {
    const qrToken = await this.transactionsService.generateLocationQr(
      req.user.userId,
      locationId,
      false, // Do not regenerate, just get existing or create if null
    );
    return { qrToken };
  }

  @UseGuards(PartnerRoleGuard)
  @Roles(UserRole.PARTNER)
  @PartnerRoles(PartnerRoleType.COLLECTOR)
  @Post('partner/locations/:locationId/qr/regenerate')
  async regenerateQr(
    @Request() req: any,
    @Param('locationId') locationId: string,
  ) {
    const qrToken = await this.transactionsService.generateLocationQr(
      req.user.userId,
      locationId,
      true, // Force regenerate
    );
    return { qrToken };
  }
}
