import { ArrayMinSize, IsArray, IsEnum } from 'class-validator';
import { PartnerRoleType } from '../enum/partner-role-type.enum';

export class UpdatePartnerRolesDto {
  @IsArray()
  @IsEnum(PartnerRoleType, { each: true })
  @ArrayMinSize(1)
  roles: PartnerRoleType[];
}
