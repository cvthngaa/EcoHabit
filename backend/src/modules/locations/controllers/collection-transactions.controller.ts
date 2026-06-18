import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { PartnerRoles } from '../../../common/decorators/partner-roles.decorator';
import { PartnerRoleGuard } from '../../../common/guards/partner-role.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { PartnerRoleType } from '../../partner/enum/partner-role-type.enum';
import { CollectionTransactionsService } from '../collection-transactions.service';
import { ScanUserQrDto } from '../dto/scan-user-qr.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class CollectionTransactionsController {
  constructor(private readonly transactionsService: CollectionTransactionsService) {}

  @Get('admin/collection-transactions')
  @Roles(UserRole.ADMIN)
  getAdminTransactions() {
    return this.transactionsService.getAdminTransactions();
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
  @Post('partner/collection-transactions/scan-user-qr')
  scanUserQr(
    @Request() req: any,
    @Body() data: ScanUserQrDto,
  ) {
    return this.transactionsService.scanUserQr(req.user.userId, data);
  }
}
