export type DailyTipResponse = {
  title: string;
  content: string;
  emoji: string;
  source: 'gemini' | 'fallback';
};
