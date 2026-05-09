import { SetMetadata } from '@nestjs/common';
import { PartnerRoleType } from '../../modules/partner/enum/partner-role-type.enum';

export const PARTNER_ROLES_KEY = 'partner_roles';
export const PartnerRoles = (...roles: PartnerRoleType[]) =>
  SetMetadata(PARTNER_ROLES_KEY, roles);
