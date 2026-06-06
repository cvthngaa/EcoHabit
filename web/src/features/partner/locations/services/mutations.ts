import { useMutation, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from './api';
import { locationsKeys } from './queries';
import type { CreateCollectionPointDto, UpdateCollectionPointDto } from './types';

export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCollectionPointDto) => locationsApi.createLocation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      // Invalidate the old key pattern for backward compatibility during transition if needed
      queryClient.invalidateQueries({ queryKey: ['locations'] }); 
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCollectionPointDto }) => 
      locationsApi.updateLocation(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: locationsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationsKeys.detail(variables.id) });
      
      // Legacy keys
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['location', variables.id] });
    },
  });
}

export function useGenerateQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) => locationsApi.generateQr(locationId),
    onSuccess: (_, locationId) => {
      queryClient.invalidateQueries({ queryKey: locationsKeys.qr(locationId) });
      // Legacy key
      queryClient.invalidateQueries({ queryKey: ['location-qr', locationId] });
    },
  });
}
