import { GeminiDailyTip } from '../types/gemini.types';

export const GEMINI_MAX_RETRIES = 3;
export const GEMINI_RETRY_DELAYS_MS = [1000, 2000, 4000];
export const GEMINI_DEFAULT_RETRY_DELAY_MS = 2000;
export const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash-lite';

export const DAILY_TIP_FALLBACKS: Omit<GeminiDailyTip, 'source'>[] = [
  {
    title: 'Rua nhanh truoc khi tai che',
    content:
      'Trang so chai, lon va hop nhua sau khi dung de vat lieu sach hon, de duoc thu gom va tai che hon.',
    emoji: 'recycle',
  },
  {
    title: 'Ep gon chai nhua',
    content:
      'Bop dep chai nhua sau khi lam sach de tiet kiem cho trong thung rac tai che va khi mang di doi.',
    emoji: 'bottle',
  },
  {
    title: 'Tach pin ra rieng',
    content:
      'Pin cu khong nen bo chung voi rac sinh hoat. Hay cat rieng trong hop nho va mang den diem thu gom phu hop.',
    emoji: 'battery',
  },
];
