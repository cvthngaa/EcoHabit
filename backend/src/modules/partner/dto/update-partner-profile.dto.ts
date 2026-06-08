import { IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdatePartnerProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  organizationType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxCode?: string;

  @IsOptional()
  @IsString()
  businessLicenseUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  autoConfirmCheckin?: boolean;
}
