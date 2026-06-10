import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { LeaderboardEntry, LeaderboardPeriod } from './types';

export const leaderboardQueryKey = (period: LeaderboardPeriod) => ['leaderboard', period] as const;

export function useGetLeaderboard(period: LeaderboardPeriod = 'all_time', limit = 20) {
  return useQuery({
    queryKey: leaderboardQueryKey(period),
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const response = await api.get<LeaderboardEntry[]>('/leaderboard', {
        params: { period, limit },
      });
      return response.data;
    },
  });
}
