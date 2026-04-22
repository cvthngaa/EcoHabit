import api from './interceptor';

export interface DailyTipResponse {
  title: string;
  content: string;
  emoji: string;
  source: 'gemini' | 'fallback';
}

export const getDailyTip = async () => {
  const res = await api.get<DailyTipResponse>('/gemini/daily-tip');
  return res.data;
};
