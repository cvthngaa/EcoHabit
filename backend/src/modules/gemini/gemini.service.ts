import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  DAILY_TIP_FALLBACKS,
  GEMINI_DEFAULT_MODEL,
  GEMINI_DEFAULT_RETRY_DELAY_MS,
  GEMINI_MAX_RETRIES,
  GEMINI_RETRY_DELAYS_MS,
} from './constants/gemini.constants';
import {
  GeminiDailyTip,
  GeminiQuizDifficulty,
  GeminiQuizQuestion,
  GenerateJsonWithRetryParams,
} from './types/gemini.types';

@Injectable()
export class GeminiService {
  private dailyTipCache: { dateKey: string; tip: GeminiDailyTip } | null = null;
  private dailyTipQuotaCooldownUntil: number | null = null;

  constructor(private readonly configService: ConfigService) {}

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
    const model = this.getGeminiModel();

    if (!apiKey) {
      console.log('Gemini quiz generation skipped: missing GEMINI_API_KEY');
      return [];
    }

    const raw = await this.generateJsonWithRetry<{
      questions?: GeminiQuizQuestion[];
    }>({
      apiKey,
      model,
      prompt: this.buildQuizPrompt(params),
      responseSchema: this.quizResponseSchema(params.count),
      failureLabel: 'Gemini quiz generation failed, using fallback bank:',
      retryLabel: 'Gemini quiz generation failed',
    });

    return (raw?.questions ?? []).filter((question) =>
      this.isValidQuestion(question),
    );
  }

  private async generateDailyTipWithGemini(): Promise<GeminiDailyTip | null> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const model = this.getGeminiModel();

    if (!apiKey) {
      console.log('Gemini daily tip skipped: missing GEMINI_API_KEY');
      return null;
    }

    if (this.isDailyTipInQuotaCooldown()) {
      return null;
    }

    const raw = await this.generateJsonWithRetry<{
      title?: string;
      content?: string;
      emoji?: string;
    }>({
      apiKey,
      model,
      prompt: this.buildDailyTipPrompt(),
      responseSchema: this.dailyTipResponseSchema(),
      failureLabel: 'Gemini daily tip failed, using fallback:',
      retryLabel: 'Gemini daily tip failed',
      retryOnQuotaExceeded: false,
      onQuotaExceeded: (retryAfterMs) => {
        this.dailyTipQuotaCooldownUntil = retryAfterMs
          ? Date.now() + retryAfterMs
          : null;
      },
    });

    if (!this.isValidDailyTip(raw ?? {})) {
      return null;
    }

    return {
      title: raw!.title!.trim(),
      content: raw!.content!.trim(),
      emoji: raw!.emoji!.trim(),
      source: 'gemini',
    };
  }

  private getGeminiModel(): string {
    return (
      this.configService.get<string>('GEMINI_MODEL') || GEMINI_DEFAULT_MODEL
    );
  }

  private getFallbackDailyTip(): GeminiDailyTip {
    const dayIndex = new Date().getDate() % DAILY_TIP_FALLBACKS.length;

    return {
      ...DAILY_TIP_FALLBACKS[dayIndex],
      source: 'fallback',
    };
  }

  private async generateJsonWithRetry<T>(
    params: GenerateJsonWithRetryParams,
  ): Promise<T | null> {
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

        return rawText ? (JSON.parse(rawText) as T) : null;
      } catch (error: unknown) {
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
            this.toLoggableGeminiError(error),
          );
          await this.sleep(delayMs);
          continue;
        }

        console.log(params.failureLabel, this.toLoggableGeminiError(error));
        return null;
      }
    }

    return null;
  }

  private buildQuizPrompt(params: {
    topic: string;
    difficulty?: GeminiQuizDifficulty;
    count: number;
  }): string {
    return `Ban la tro ly tao cau hoi quiz tieng Viet ve moi truong.
Hay tao ${params.count} cau hoi trac nghiem ve chu de "${params.topic}" voi do kho "${params.difficulty ?? 'mixed'}".

Yeu cau:
- Moi cau co dung 4 dap an
- correctIndex la so tu 0 den 3
- explanation ngan gon, de hieu
- emoji phu hop voi cau hoi
- Khong lap cau hoi
- Chi tra ve JSON hop le theo schema da yeu cau`;
  }

  private buildDailyTipPrompt(): string {
    const today = new Date().toISOString().slice(0, 10);

    return `Ban la tro ly EcoHabit.
Hay tao 1 meo vat ngan gon bang tieng Viet cho muc "Meo vat hom nay" trong app song xanh vao ngay ${today}.
Yeu cau:
- Noi dung huu ich, thuc te, de lam trong doi song
- Chu de lien quan den giam rac, tai che, phan loai rac hoac song xanh
- Tieu de toi da 8 tu
- Noi dung toi da 2 cau, ngan gon, than thien
- Chon 1 emoji phu hop
- Khong dung markdown
- Chi tra ve JSON hop le theo schema da yeu cau`;
  }

  private quizResponseSchema(count: number): Record<string, unknown> {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        questions: {
          type: 'array',
          minItems: 1,
          maxItems: Math.min(count, 10),
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
    };
  }

  private dailyTipResponseSchema(): Record<string, unknown> {
    return {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        emoji: { type: 'string' },
      },
      required: ['title', 'content', 'emoji'],
    };
  }

  private isValidQuestion(question: GeminiQuizQuestion): boolean {
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
  }): boolean {
    return (
      typeof tip.title === 'string' &&
      tip.title.trim().length > 0 &&
      typeof tip.content === 'string' &&
      tip.content.trim().length > 0 &&
      typeof tip.emoji === 'string' &&
      tip.emoji.trim().length > 0
    );
  }

  private isDailyTipInQuotaCooldown(): boolean {
    return Boolean(
      this.dailyTipQuotaCooldownUntil &&
      Date.now() < this.dailyTipQuotaCooldownUntil,
    );
  }

  private isRetryableGeminiError(error: unknown): boolean {
    const status = this.getGeminiErrorStatus(error);
    const code = this.getGeminiErrorCode(error);

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

  private isQuotaExceededGeminiError(error: unknown): boolean {
    return (
      this.getGeminiErrorStatus(error) === 429 &&
      this.getGeminiApiStatus(error) === 'RESOURCE_EXHAUSTED'
    );
  }

  private getRetryAfterMsFromGeminiError(error: unknown): number | null {
    const message = this.getGeminiErrorMessage(error);

    if (!message) {
      return null;
    }

    const retryAfterMatch = message.match(/Please retry in\s+([\d.]+)s/i);
    const seconds = Number.parseFloat(retryAfterMatch?.[1] ?? '');

    return Number.isFinite(seconds) && seconds > 0
      ? Math.ceil(seconds * 1000)
      : null;
  }

  private resolveRetryDelayMs(error: unknown, attempt: number): number {
    return (
      this.getRetryAfterMsFromGeminiError(error) ??
      GEMINI_RETRY_DELAYS_MS[attempt - 1] ??
      GEMINI_DEFAULT_RETRY_DELAY_MS
    );
  }

  private getGeminiErrorStatus(error: unknown): number | undefined {
    return this.asAxiosLikeError(error)?.response?.status;
  }

  private getGeminiApiStatus(error: unknown): string | undefined {
    return this.asAxiosLikeError(error)?.response?.data?.error?.status;
  }

  private getGeminiErrorCode(error: unknown): string | undefined {
    return this.asAxiosLikeError(error)?.code;
  }

  private getGeminiErrorMessage(error: unknown): string | undefined {
    return this.asAxiosLikeError(error)?.response?.data?.error?.message;
  }

  private toLoggableGeminiError(error: unknown) {
    const axiosError = this.asAxiosLikeError(error);
    return axiosError?.response?.data || axiosError?.message || error;
  }

  private asAxiosLikeError(error: unknown) {
    return error as {
      code?: string;
      message?: string;
      response?: {
        status?: number;
        data?: {
          error?: {
            status?: string;
            message?: string;
          };
        };
      };
    };
  }

  private getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
