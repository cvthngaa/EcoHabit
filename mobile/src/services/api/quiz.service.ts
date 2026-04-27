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

// ========== DAILY QUIZ ==========

export interface DailyQuizNotCompleted {
  completed: false;
  date: string;
  count: number;
  questions: QuizQuestion[];
}

export interface DailyQuizCompleted {
  completed: true;
  date: string;
  score: number;
  total: number;
  pointsEarned: number;
  completedAt: string;
}

export interface QuizTopic {
  id: string;
  name: string;
  difficulty: string;
  icon: string;
  description: string;
  completed: boolean;
  date: string;
  count?: number;
  questions?: QuizQuestion[];
  score?: number;
  total?: number;
  pointsEarned?: number;
  completedAt?: string;
}

export const getDailyQuiz = async (): Promise<QuizTopic[]> => {
  const response = await api.get('/quiz/daily');
  return response.data;
};

export const submitDailyQuiz = async (
  topicId: string,
  answers: number[]
): Promise<DailyQuizCompleted> => {
  const response = await api.post('/quiz/daily/submit', { topicId, answers });
  return response.data;
};
