export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  conditionType: string;
  threshold: number;
  isEarned: boolean;
  earnedAt?: string;
  progress?: number;
};
