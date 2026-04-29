export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  emoji: string;
};

export type DailyQuizCompleted = {
  completed: true;
  date: string;
  score: number;
  total: number;
  pointsEarned: number;
  completedAt: string;
};

export type QuizTopic = {
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
};

export type SubmitDailyQuizPayload = {
  topicId: string;
  answers: number[];
};
