import { WasteCategory } from '../mockData';

export type WasteType = 'PLASTIC' | 'PAPER' | 'BATTERY' | 'GLASS' | 'METAL' | 'E_WASTE' | 'TEXTILE' | 'OTHER';

export type SuggestedBin = 'BIN' | 'CENTER' | 'COLLECTION_POINT';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type ImageUploadFile = {
 uri: string;
 name: string;
 type: string;
};

export type AIClassificationResult = {
 success: boolean;
 label: string;
 category: WasteCategory;
 confidence: number;
 disposalTip: string;
 boundingBox?: number[];
 pointsEarned: number;
 classificationId?: string;
 awarded?: boolean;
 nearestLocation?: {
 id: string;
 name: string;
 address: string;
 distance: number;
 latitude?: number;
 longitude?: number;
 } | null;
};

export type BackendClassificationResultItem = {
 classificationId?: string;
 imageUrl?: string;
 label: string;
 displayLabel?: string;
 confidence: number;
 wasteType: WasteType;
 suggestedBin?: SuggestedBin;
 instruction?: string;
 modelName?: string;
 modelVersion?: string;
 boundingBox?: number[];
 pointsEarned?: number;
 awarded?: boolean;
 balanceAfter?: number;
 requiresReview?: boolean;
 dailyLimitReached?: boolean;
 nearestLocation?: {
 id: string;
 name: string;
 address: string;
 distance: number;
 latitude?: number;
 longitude?: number;
 } | null;
};

export type BackendClassificationResponse = {
 isOverloaded?: boolean;
 message?: string;
 results?: BackendClassificationResultItem[];
};

export type ClassificationHistoryParams = {
 limit?: number;
 page?: number;
};

export type ClassificationHistoryResponse = unknown;
