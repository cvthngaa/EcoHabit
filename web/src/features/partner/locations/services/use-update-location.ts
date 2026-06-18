import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../../shared/services/api-client';
import type { Location, UpdateCollectionPointDto } from './types';

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCollectionPointDto }): Promise<Location> => {
      const res = await apiClient.patch<Location>(`/partner/collection-points/${id}`, dto);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', variables.id] });
    },
  });
}
