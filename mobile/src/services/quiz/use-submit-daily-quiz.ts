import { useMutation } from '@tanstack/react-query';
import api from '../api-client';
import { DailyQuizCompleted, SubmitDailyQuizPayload } from './types';

export function useSubmitDailyQuiz() {
  return useMutation({
    mutationFn: async ({
      topicId,
      answers,
    }: SubmitDailyQuizPayload): Promise<DailyQuizCompleted> => {
      const response = await api.post<DailyQuizCompleted>('/quiz/daily/submit', {
        topicId,
        answers,
      });

      return response.data;
    },
  });
}
