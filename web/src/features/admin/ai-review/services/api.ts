import { apiClient } from '../../../../shared/services/api-client';

export type ClassificationStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVIEWED';
export type WasteType = 'PLASTIC' | 'PAPER' | 'BATTERY' | 'GLASS' | 'METAL' | 'E_WASTE' | 'TEXTILE' | 'OTHER';
export type BinType = 'BIN' | 'CENTER' | 'COLLECTION_POINT';

export interface AiFeedback {
  id: string;
  isCorrect: boolean;
  correctedLabel?: string;
  correctedWasteType?: WasteType;
  correctedBin?: BinType;
  note?: string;
  createdAt: string;
}

export interface TrashClassification {
  id: string;
  imageUrl: string;
  predictedLabel: string;
  predictedWasteType?: WasteType;
  confidence: number;
  suggestedBin?: BinType;
  status: ClassificationStatus;
  resultJson?: {
    boundingBox?: number[];
    [key: string]: any;
  };
  correctedBoundingBox?: number[];
  feedbacks?: AiFeedback[];
  reviewedAt?: string;
  createdAt: string;
}

export interface PaginatedClassifications {
  data: TrashClassification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetClassificationsParams {
  page?: number;
  limit?: number;
  status?: ClassificationStatus | '';
}

export const getClassifications = async (params: GetClassificationsParams): Promise<PaginatedClassifications> => {
  const cleanParams = { ...params };
  if (cleanParams.status === '') {
    delete cleanParams.status;
  }
  const { data } = await apiClient.get<PaginatedClassifications>('/ai/admin/classifications', { params: cleanParams });
  return data;
};

export type ReviewActionType = 'APPROVE' | 'REJECT' | 'CORRECT';

export interface ReviewClassificationPayload {
  action: ReviewActionType;
  correctedLabel?: string;
  correctedWasteType?: WasteType;
  correctedBin?: BinType;
  correctedBoundingBox?: number[];
  reviewNote?: string;
}

export const reviewClassification = async (id: string, payload: ReviewClassificationPayload): Promise<TrashClassification> => {
  const { data } = await apiClient.patch<TrashClassification>(`/ai/admin/classifications/${id}/review`, payload);
  return data;
};
