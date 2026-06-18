import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/services/api-client';
import type { Location, CreateCollectionPointDto } from './types';

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateCollectionPointDto): Promise<Location> => {
      const res = await apiClient.post<Location>('/partner/collection-points', dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
