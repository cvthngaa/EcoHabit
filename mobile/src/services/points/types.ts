export type PointTransaction = {
  id?: string | number;
  points?: number;
  sourceType?: string;
  title?: string;
  type?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type PointHistoryResponse = PointTransaction[];
