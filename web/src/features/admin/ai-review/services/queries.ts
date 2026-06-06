import { useQuery } from '@tanstack/react-query';
import { getClassifications } from './api';
import type { GetClassificationsParams } from './api';

export const ADMIN_CLASSIFICATIONS_QUERY_KEY = 'admin-classifications';

export const useClassifications = (params: GetClassificationsParams) => {
  return useQuery({
    queryKey: [ADMIN_CLASSIFICATIONS_QUERY_KEY, params],
    queryFn: () => getClassifications(params),
  });
};
