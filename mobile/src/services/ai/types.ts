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

export type BackendClassificationResponse = {
 classificationId?: string;
 isOverloaded?: boolean;
 message?: string;
 imageUrl?: string;
 label: string;
 displayLabel?: string;
 confidence: number;
 wasteType: WasteType;
 suggestedBin?: SuggestedBin;
 instruction?: string;
 modelName?: string;
 modelVersion?: string;
 pointsEarned?: number;
 awarded?: boolean;
 balanceAfter?: number;
 nearestLocation?: {
 id: string;
 name: string;
 address: string;
 distance: number;
 latitude?: number;
 longitude?: number;
 } | null;
};

export type ClassificationHistoryParams = {
 limit?: number;
 page?: number;
};

export type ClassificationHistoryResponse = unknown;
