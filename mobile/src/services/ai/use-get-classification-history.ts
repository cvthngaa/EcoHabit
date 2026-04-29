import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { ClassificationHistoryParams, ClassificationHistoryResponse } from './types';

export const classificationHistoryQueryKey = ({
  limit = 3,
  page = 1,
}: ClassificationHistoryParams = {}) => ['ai', 'classification-history', { limit, page }] as const;

export function useGetClassificationHistory(params: ClassificationHistoryParams = {}) {
  const { limit = 3, page = 1 } = params;

  return useQuery({
    queryKey: classificationHistoryQueryKey({ limit, page }),
    queryFn: async () => {
      const response = await api.get<ClassificationHistoryResponse>('/ai/history', {
        params: { limit, page },
      });

      return response.data;
    },
  });
}
