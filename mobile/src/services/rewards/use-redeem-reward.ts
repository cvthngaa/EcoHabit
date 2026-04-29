import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { RedeemRewardPayload, RedeemRewardResponse } from './types';

export function useRedeemReward() {
  return useMutation({
    mutationFn: async ({ rewardId }: RedeemRewardPayload): Promise<RedeemRewardResponse> => {
      const response = await api.post<RedeemRewardResponse>('/rewards/redeem', {
        rewardId,
      });

      return response.data;
    },
  });
}
