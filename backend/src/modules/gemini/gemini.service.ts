import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

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

const GEMINI_MAX_RETRIES = 3;
const GEMINI_RETRY_DELAYS_MS = [1000, 2000, 4000];
const GEMINI_DEFAULT_RETRY_DELAY_MS = 2000;
const DAILY_TIP_FALLBACKS = [
  {
    title: 'Rua nhanh truoc khi tai che',
    content:
      'Trang so chai, lon va hop nhua sau khi dung de vat lieu sach hon, de duoc thu gom va tai che hon.',
    emoji: '♻️',
  },
  {
    title: 'Ep gon chai nhua',
    content:
      'Bop dep chai nhua sau khi lam sach de tiet kiem cho trong thung rac tai che va khi mang di doi.',
    emoji: '🧴',
  },
  {
    title: 'Tach pin ra rieng',
    content:
      'Pin cu khong nen bo chung voi rac sinh hoat. Hay cat rieng trong hop nho va mang den diem thu gom phu hop.',
    emoji: '🔋',
  },
];

@Injectable()
export class GeminiService {
  private dailyTipCache:
    | {
      dateKey: string;
      tip: GeminiDailyTip;
    }
    | null = null;

  private dailyTipQuotaCooldownUntil: number | null = null;

  constructor(private readonly configService: ConfigService) { }

  async getDailyTip(): Promise<GeminiDailyTip> {
    const todayKey = this.getTodayKey();
    if (this.dailyTipCache?.dateKey === todayKey) {
      return this.dailyTipCache.tip;
    }

    const tip = await this.generateDailyTipWithGemini();
    const resolvedTip = tip ?? this.getFallbackDailyTip();

    this.dailyTipCache = {
      dateKey: todayKey,
      tip: resolvedTip,
    };

    return resolvedTip;
  }

  async generateQuizQuestions(params: {
    topic: string;
    difficulty?: GeminiQuizDifficulty;
    count: number;
  }): Promise<GeminiQuizQuestion[]> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash-lite';

    if (!apiKey) {
      console.log('Gemini quiz generation skipped: missing GEMINI_API_KEY');
      return [];
    }

    const raw = await this.generateJsonWithRetry<{
      questions?: GeminiQuizQuestion[];
    }>({
      apiKey,
      model,
      prompt: `Ban la tro ly tao cau hoi quiz tieng Viet ve moi truong.
Hay tao ${params.count} cau hoi trac nghiem ve chu de "${params.topic}" voi do kho "${params.difficulty ?? 'mixed'}".

Yeu cau:
- Moi cau co dung 4 dap an
- correctIndex la so tu 0 den 3
- explanation ngan gon, de hieu
- emoji phu hop voi cau hoi
- Khong lap cau hoi
- Chi tra ve JSON hop le theo schema da yeu cau`,
      responseSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          questions: {
            type: 'array',
            minItems: 1,
            maxItems: Math.min(params.count, 10),
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'integer' },
                question: { type: 'string' },
                options: {
                  type: 'array',
                  minItems: 4,
                  maxItems: 4,
                  items: { type: 'string' },
                },
                correctIndex: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 3,
                },
                explanation: { type: 'string' },
                emoji: { type: 'string' },
              },
              required: [
                'id',
                'question',
                'options',
                'correctIndex',
                'explanation',
                'emoji',
              ],
            },
          },
        },
        required: ['questions'],
      },
      failureLabel: 'Gemini quiz generation failed, using fallback bank:',
      retryLabel: 'Gemini quiz generation failed',
    });

    return (raw?.questions || []).filter((question) =>
      this.isValidQuestion(question),
    );
  }

  private async generateDailyTipWithGemini(): Promise<GeminiDailyTip | null> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model =
      this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash-lite';

    if (!apiKey) {
      console.log('Gemini daily tip skipped: missing GEMINI_API_KEY');
      return null;
    }

    if (
      this.dailyTipQuotaCooldownUntil &&
      Date.now() < this.dailyTipQuotaCooldownUntil
    ) {
      return null;
    }

    const today = new Date().toISOString().slice(0, 10);
    const raw = await this.generateJsonWithRetry<{
      title?: string;
      content?: string;
      emoji?: string;
    }>({
      apiKey,
      model,
      prompt: `Bạn là trợ lý EcoHabit.
          Hãy tạo 1 mẹo vặt ngắn gọn bằng tiếng Việt cho mục "Mẹo vặt hôm nay" trong app sống xanh vào ngày ${today}.
          Yêu cầu:
          Nội dung hữu ích, thực tế, dễ làm trong đời sống.
          Chủ đề liên quan đến giảm rác, tái chế, phân loại rác hoặc sống xanh.
          Tiêu đề tối đa 8 từ.
          Nội dung tối đa 2 câu, ngắn gọn, thân thiện.
          Chọn 1 emoji phù hợp.
          Không dùng markdown.
          Chỉ trả về JSON hợp lệ theo schema đã yêu cầu.`,
      responseSchema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          emoji: { type: 'string' },
        },
        required: ['title', 'content', 'emoji'],
      },
      failureLabel: 'Gemini daily tip failed, using fallback:',
      retryLabel: 'Gemini daily tip failed',
      retryOnQuotaExceeded: false,
      onQuotaExceeded: (retryAfterMs) => {
        if (!retryAfterMs) {
          this.dailyTipQuotaCooldownUntil = null;
          return;
        }

        this.dailyTipQuotaCooldownUntil = Date.now() + retryAfterMs;
      },
    });

    if (!this.isValidDailyTip(raw || {})) {
      return null;
    }

    return {
      title: raw!.title!.trim(),
      content: raw!.content!.trim(),
      emoji: raw!.emoji!.trim(),
      source: 'gemini',
    };
  }

  private getFallbackDailyTip(): GeminiDailyTip {
    const dayIndex = new Date().getDate() % DAILY_TIP_FALLBACKS.length;
    const fallback = DAILY_TIP_FALLBACKS[dayIndex];

    return {
      ...fallback,
      source: 'fallback',
    };
  }

  private async generateJsonWithRetry<T>(params: {
    apiKey: string;
    model: string;
    prompt: string;
    responseSchema: Record<string, unknown>;
    failureLabel: string;
    retryLabel: string;
    retryOnQuotaExceeded?: boolean;
    onQuotaExceeded?: (retryAfterMs: number | null) => void;
  }): Promise<T | null> {
    for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent`,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: params.prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              responseJsonSchema: params.responseSchema,
            },
          },
          {
            headers: {
              'x-goog-api-key': params.apiKey,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        );

        const rawText =
          response.data?.text ||
          response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          '';

        if (!rawText) {
          return null;
        }

        return JSON.parse(rawText) as T;
      } catch (error: any) {
        const isQuotaExceeded = this.isQuotaExceededGeminiError(error);
        const retryAfterMs = this.getRetryAfterMsFromGeminiError(error);

        if (isQuotaExceeded) {
          params.onQuotaExceeded?.(retryAfterMs);
        }

        const canRetry =
          this.isRetryableGeminiError(error) &&
          (!isQuotaExceeded || params.retryOnQuotaExceeded !== false);

        if (canRetry && attempt < GEMINI_MAX_RETRIES) {
          const delayMs = this.resolveRetryDelayMs(error, attempt);
          console.log(
            `${params.retryLabel} on attempt ${attempt}/${GEMINI_MAX_RETRIES}, retrying in ${delayMs}ms:`,
            error?.response?.data || error?.message || error,
          );
          await this.sleep(delayMs);
          continue;
        }

        console.log(
          params.failureLabel,
          error?.response?.data || error?.message || error,
        );
        return null;
      }
    }

    return null;
  }

  private isValidQuestion(question: GeminiQuizQuestion) {
    return (
      Number.isInteger(question.id) &&
      typeof question.question === 'string' &&
      question.question.trim().length > 0 &&
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      question.options.every(
        (option) => typeof option === 'string' && option.trim().length > 0,
      ) &&
      Number.isInteger(question.correctIndex) &&
      question.correctIndex >= 0 &&
      question.correctIndex <= 3 &&
      typeof question.explanation === 'string' &&
      question.explanation.trim().length > 0 &&
      typeof question.emoji === 'string' &&
      question.emoji.trim().length > 0
    );
  }

  private isValidDailyTip(tip: {
    title?: string;
    content?: string;
    emoji?: string;
  }) {
    return (
      typeof tip.title === 'string' &&
      tip.title.trim().length > 0 &&
      typeof tip.content === 'string' &&
      tip.content.trim().length > 0 &&
      typeof tip.emoji === 'string' &&
      tip.emoji.trim().length > 0
    );
  }

  private isRetryableGeminiError(error: any) {
    const status = error?.response?.status;
    const code = error?.code;

    return (
      status === 429 ||
      status === 500 ||
      status === 503 ||
      code === 'ECONNABORTED' ||
      code === 'ETIMEDOUT' ||
      code === 'ENOTFOUND' ||
      code === 'ECONNRESET'
    );
  }

  private isQuotaExceededGeminiError(error: any) {
    const status = error?.response?.status;
    const apiStatus = error?.response?.data?.error?.status;

    return status === 429 && apiStatus === 'RESOURCE_EXHAUSTED';
  }

  private getRetryAfterMsFromGeminiError(error: any) {
    const message = error?.response?.data?.error?.message;
    if (typeof message !== 'string') {
      return null;
    }

    const retryAfterMatch = message.match(/Please retry in\s+([\d.]+)s/i);
    if (!retryAfterMatch?.[1]) {
      return null;
    }

    const seconds = Number.parseFloat(retryAfterMatch[1]);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return null;
    }

    return Math.ceil(seconds * 1000);
  }

  private resolveRetryDelayMs(error: any, attempt: number) {
    return (
      this.getRetryAfterMsFromGeminiError(error) ??
      GEMINI_RETRY_DELAYS_MS[attempt - 1] ??
      GEMINI_DEFAULT_RETRY_DELAY_MS
    );
  }

  private getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
