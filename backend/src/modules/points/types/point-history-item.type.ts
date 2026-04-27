import { PointTransaction } from '../entities/point-transaction.entity';

export type PointHistoryItem = PointTransaction & {
  title: string;
};
