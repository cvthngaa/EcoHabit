import { WasteCategory } from '../mockData';

export type WasteType = 'PLASTIC' | 'PAPER' | 'BATTERY' | 'GLASS' | 'METAL' | 'OTHER';

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
};

export type BackendClassificationResponse = {
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
  pointsEarned?: number;
  awarded?: boolean;
  balanceAfter?: number;
};

export type ClassificationHistoryParams = {
  limit?: number;
  page?: number;
};

export type ClassificationHistoryResponse = unknown;
