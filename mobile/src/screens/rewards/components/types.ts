export type RewardShopItem = {
 id: string;
 name: string;
 description?: string;
 points: number;
 stock: number;
 thumbnailUrl?: string | null;
 color: string;
 bg: string;
 iconName: string;
 category: string;
 tag?: string | null;
};

export type RewardHistoryItem = {
 id: string;
 name: string;
 pts: number;
 pointsUsed: number;
 date: string;
 time: string;
 category: string;
 status: string;
 color: string;
 bg: string;
 iconName: string;
 thumbnailUrl?: string | null;
};

export type RewardTabKey = 'shop' | 'history';
