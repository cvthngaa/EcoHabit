export type GeminiQuizDifficulty = 'easy' | 'medium' | 'hard';

export interface GeminiQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  emoji: string;
}

export interface GeminiDailyTip {
  title: string;
  content: string;
  emoji: string;
  source: 'gemini' | 'fallback';
}

export interface GenerateJsonWithRetryParams {
  apiKey: string;
  model: string;
  prompt: string;
  responseSchema: Record<string, unknown>;
  failureLabel: string;
  retryLabel: string;
  retryOnQuotaExceeded?: boolean;
  onQuotaExceeded?: (retryAfterMs: number | null) => void;
}
