export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type DailyQuizDifficulty = QuizDifficulty;
export type QuizTopic = 'recycling' | 'plastic' | 'battery' | 'general';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  emoji: string;
  topic: QuizTopic;
  difficulty: QuizDifficulty;
}

export interface DailyQuizTopic {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface SelectedDailyQuizTopic extends DailyQuizTopic {
  difficulty: DailyQuizDifficulty;
}

export interface DailyQuizResult {
  score: number;
  total: number;
  pointsEarned: number;
  details: DailyQuizAnswerDetail[];
  completedAt: string;
}

export interface DailyQuizAnswerDetail {
  questionId: number;
  userAnswer: number;
  correctAnswer: number;
  correct: boolean;
}
