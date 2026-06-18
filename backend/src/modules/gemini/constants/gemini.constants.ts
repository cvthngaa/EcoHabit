import { GeminiDailyTip } from '../types/gemini.types';

export const GEMINI_MAX_RETRIES = 3;
export const GEMINI_RETRY_DELAYS_MS = [1000, 2000, 4000];
export const GEMINI_DEFAULT_RETRY_DELAY_MS = 2000;
export const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash-lite';

export const DAILY_TIP_FALLBACKS: Omit<GeminiDailyTip, 'source'>[] = [
  {
    title: 'Rửa nhanh trước khi tái chế',
    content:
      'Tráng sơ chai, lon và hộp nhựa sau khi dùng để vật liệu sạch hơn, dễ được thu gom và tái chế hơn.',
    emoji: '♻️',
  },
  {
    title: 'Ép gọn chai nhựa',
    content:
      'Bóp dẹp chai nhựa sau khi làm sạch để tiết kiệm chỗ trong thùng rác tái chế và khi mang đi đổi.',
    emoji: '🧴',
  },
  {
    title: 'Tách pin ra riêng',
    content:
      'Pin cũ không nên bỏ chung với rác sinh hoạt. Hãy cất riêng trong hộp nhỏ và mang đến điểm thu gom phù hợp.',
    emoji: '🔋',
  },
];
