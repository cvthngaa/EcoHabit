export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  avatarUrl?: string;
  pointsBalance?: number;
}

export interface PartnerProfileSummary {
  id: string;
  organizationName: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  roleTypes: string[];
}

export interface LoginResponse {
  access_token: string;
  user: User;
  partnerProfile?: PartnerProfileSummary;
}

export interface RegisterPartnerData {
  email: string;
  password: string;
  organizationName: string;
  contactPerson: string;
  contactPhone: string;
}
