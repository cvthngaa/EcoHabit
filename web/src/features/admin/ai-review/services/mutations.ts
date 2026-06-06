import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reviewClassification } from './api';
import type { ReviewClassificationPayload } from './api';
import { ADMIN_CLASSIFICATIONS_QUERY_KEY } from './queries';

export const useReviewClassification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewClassificationPayload }) =>
      reviewClassification(id, payload),
    onSuccess: () => {
      toast.success('Đã duyệt thành công!');
      queryClient.invalidateQueries({ queryKey: [ADMIN_CLASSIFICATIONS_QUERY_KEY] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi duyệt';
      toast.error(message);
    },
  });
};
