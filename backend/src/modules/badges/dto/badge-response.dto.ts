export class BadgeResponseDto {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  conditionType: string;
  threshold: number;
  isEarned: boolean;
  earnedAt?: string | null;
  /** Current progress value towards threshold (e.g. 3 out of 5 quizzes) */
  progress: number;
}
