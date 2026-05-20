import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export interface PartnerProfile {
  id: string;
  organizationName: string;
  organizationType?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  address?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
}

export function useGetProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<PartnerProfile> => {
      const res = await apiClient.get<PartnerProfile>('/partners/me');
      return res.data;
    },
  });
}
