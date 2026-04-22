import api from './interceptor';

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  emoji: string;
}

export interface GenerateQuizPayload {
  topic?: string;
  difficulty?: QuizDifficulty;
  count?: number;
}

export interface GenerateQuizResponse {
  topic: string;
  difficulty: QuizDifficulty | 'mixed';
  count: number;
  questions: QuizQuestion[];
  source: 'gemini' | 'fallback';
}

export const generateQuiz = async (
  payload: GenerateQuizPayload = {},
): Promise<GenerateQuizResponse> => {
  const res = await api.post('/quiz/generate', payload);
  return res.data;
};
