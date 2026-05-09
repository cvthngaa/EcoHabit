import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PARTNER_ROLES_KEY } from '../decorators/partner-roles.decorator';
import { PartnerRoleType } from '../../modules/partner/enum/partner-role-type.enum';
import { PartnerApprovalStatus } from '../../modules/partner/enum/partner-approval-status.enum';
import { UserRole } from '../../modules/users/enums/user-role.enum';
import { PartnersService } from '../../modules/partner/partners.service';

@Injectable()
export class PartnerRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private partnersService: PartnersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<PartnerRoleType[]>(
      PARTNER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.PARTNER) {
      throw new ForbiddenException('Only partners can access this resource.');
    }

    const partnerProfile = await this.partnersService.getPartnerSummaryByUserId(user.userId || user.id);

    if (!partnerProfile) {
      throw new ForbiddenException('Partner profile not found.');
    }

    if (partnerProfile.approvalStatus !== PartnerApprovalStatus.APPROVED) {
      throw new ForbiddenException('Partner account is not approved yet.');
    }

    const hasRole = requiredRoles.some((role) => partnerProfile.roleTypes.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Partner does not have the required role.');
    }

    return true;
  }
}
