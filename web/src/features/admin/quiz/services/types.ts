export type QuizDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type QuizQuestionStatus = 'PENDING_REVIEW' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
export type QuizQuestionSource = 'MANUAL' | 'AI' | 'IMPORT' | 'FALLBACK' | 'SEED';

export interface QuizOption {
  id: string;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  difficulty: QuizDifficulty;
  content: string;
  explanation: string;
  status: QuizQuestionStatus;
  source: QuizQuestionSource;
  createdAt: string;
  options: QuizOption[];
}

export interface QuizStats {
  totalQuestions: number;
  activeQuestions: number;
  pendingReviewQuestions: number;
  totalAttempts: number;
  attemptsToday: number;
  totalPointsAwarded: number;
  averageScore: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListQuizQuestionsQuery {
  page?: number;
  limit?: number;
  topic?: string;
  difficulty?: QuizDifficulty;
  status?: QuizQuestionStatus;
  source?: QuizQuestionSource;
  search?: string;
}

export interface CreateQuizQuestionDto {
  topic: string;
  difficulty: QuizDifficulty;
  content: string;
  explanation: string;
  options: { content: string; isCorrect: boolean; sortOrder: number }[];
}

export interface UpdateQuizQuestionDto extends Partial<CreateQuizQuestionDto> {}

export interface GenerateAdminQuizDto {
  topic: string;
  difficulty?: QuizDifficulty;
  count?: number;
}

export interface UpdateQuizQuestionStatusDto {
  status: QuizQuestionStatus;
}

export interface BulkUpdateStatusDto {
  ids: string[];
  status: QuizQuestionStatus;
}

// ─── ATTEMPTS ───

export interface QuizAttempt {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  topic: string;
  quizDate: string;
  score: number;
  totalQuestions: number;
  pointsEarned: number;
  isRewarded: boolean;
  createdAt: string;
}

export interface QuizAttemptAnswer {
  id: string;
  questionId: string | null;
  questionSnapshot: {
    question: string;
    options: string[];
    explanation: string;
  } | null;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizAttemptDetail extends QuizAttempt {
  answers: QuizAttemptAnswer[];
}

export interface ListQuizAttemptsQuery {
  page?: number;
  limit?: number;
  topicId?: string;
  userSearch?: string;
  dateFrom?: string;
  dateTo?: string;
  rewarded?: boolean;
}

// ─── SNAPSHOTS ───

export interface QuizSnapshot {
  id: string;
  quizDate: string;
  topicId: string;
  difficulty: string;
  questionCount: number;
  attemptsCount: number;
  createdAt: string;
}

export interface QuizSnapshotQuestion {
  sortOrder: number;
  question: {
    id: string;
    content: string;
    explanation: string;
    difficulty: string;
    options: { content: string; isCorrect: boolean }[];
  } | null;
}

export interface QuizSnapshotDetail extends QuizSnapshot {
  questions: QuizSnapshotQuestion[];
}

export interface ListQuizSnapshotsQuery {
  page?: number;
  limit?: number;
  date?: string;
  topicId?: string;
}

// ─── COVERAGE ───

export interface QuizCoverageItem {
  topic: string;
  total: number;
  active: number;
  pending: number;
  status: 'good' | 'low' | 'critical';
}

export const DIFFICULTY_BADGE: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
  mixed: 'bg-blue-100 text-blue-700',
};
