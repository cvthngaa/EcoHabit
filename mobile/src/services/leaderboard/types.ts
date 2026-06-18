export type LeaderboardPeriod = 'all_time' | 'weekly' | 'monthly';

export type LeaderboardEntry = {
 rank: number;
 userId: string;
 fullName: string;
 avatarUrl: string | null;
 points: number;
 isMe: boolean;
};

export type MyRankResult = {
 rank: number | null;
 points: number;
 period: LeaderboardPeriod;
};
