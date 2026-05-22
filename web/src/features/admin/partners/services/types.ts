export type PartnerApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PartnerRoleType = 'COLLECTOR' | 'REWARD_PROVIDER';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'BANNED';

export interface PartnerUser {
  id: string;
  email: string;
  fullName: string;
  status: UserStatus;
  role: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Partner {
  id: string;
  organizationName: string;
  organizationType?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  taxCode?: string | null;
  businessLicenseUrl?: string | null;
  address?: string | null;
  approvalStatus: PartnerApprovalStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  user: PartnerUser | null;
  roleTypes: PartnerRoleType[];
}

export interface PartnerStats {
  totalPartners: number;
  pendingPartners: number;
  approvedPartners: number;
  rejectedPartners: number;
  collectorPartners: number;
  rewardProviderPartners: number;
  newPartnersThisMonth: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListPartnersQuery {
  search?: string;
  approvalStatus?: PartnerApprovalStatus;
  roleType?: PartnerRoleType;
  sortBy?: 'createdAt' | 'organizationName' | 'approvalStatus';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface UpdateApprovalDto {
  status: PartnerApprovalStatus;
  rejectionReason?: string;
}

export interface UpdateRolesDto {
  roles: PartnerRoleType[];
}

export interface UpdatePartnerUserStatusDto {
  status: UserStatus;
  reason?: string;
}
