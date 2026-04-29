import { useQuery } from '@tanstack/react-query';
import api from '../api-client';
import { QuizTopic } from './types';

export const dailyQuizQueryKey = ['quiz', 'daily'] as const;

type UseGetDailyQuizOptions = {
  enabled?: boolean;
};

export function useGetDailyQuiz({ enabled = true }: UseGetDailyQuizOptions = {}) {
  return useQuery({
    queryKey: dailyQuizQueryKey,
    queryFn: async (): Promise<QuizTopic[]> => {
      const response = await api.get<QuizTopic[]>('/quiz/daily');

      return response.data;
    },
    enabled,
  });
}
