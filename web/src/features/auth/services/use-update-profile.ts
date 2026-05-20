import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/services/api-client';
import type { PartnerProfile } from './use-get-profile';

export interface UpdatePartnerProfileDto {
  organizationName?: string;
  organizationType?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  address?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdatePartnerProfileDto): Promise<PartnerProfile> => {
      const res = await apiClient.patch<PartnerProfile>('/partners/me', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
