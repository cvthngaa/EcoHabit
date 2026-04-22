import api from './api/interceptor';
import { wasteCategories, WasteCategory } from './mockData';

// ── AI Classification Result ──────────────────────────────────────────────────

export interface AIClassificationResult {
  success: boolean;
  label: string;
  category: WasteCategory;
  confidence: number; // 0.0 – 1.0
  disposalTip: string;
  pointsEarned: number;
  classificationId?: string;
  awarded?: boolean;
}

interface BackendClassificationResponse {
  classificationId: string;
  imageUrl: string;
  label: string;
  displayLabel: string;
  confidence: number;
  wasteType: 'PLASTIC' | 'PAPER' | 'BATTERY' | 'GLASS' | 'METAL' | 'OTHER';
  suggestedBin: 'BIN' | 'CENTER' | 'COLLECTION_POINT';
  instruction: string;
  modelName?: string;
  modelVersion?: string;
  pointsEarned?: number;
  awarded?: boolean;
  balanceAfter?: number;
}

const wasteTypeToCategory: Record<BackendClassificationResponse['wasteType'], WasteCategory> = {
  PLASTIC: wasteCategories[0],
  PAPER: wasteCategories[1],
  METAL: wasteCategories[2],
  GLASS: wasteCategories[4],
  BATTERY: wasteCategories[5],
  OTHER: wasteCategories[6],
};

function getFileNameFromUri(uri: string): string {
  const parts = uri.split('/');
  const lastPart = parts[parts.length - 1];
  return lastPart || `scan-${Date.now()}.jpg`;
}

function getMimeTypeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export async function classifyWaste(imageUri: string): Promise<AIClassificationResult> {
  const formData = new FormData();
  const fileName = getFileNameFromUri(imageUri);
  const fileType = getMimeTypeFromUri(imageUri);

  formData.append('file', {
    uri: imageUri,
    name: fileName,
    type: fileType,
  } as unknown as Blob);

  const response = await api.post<BackendClassificationResponse>('/ai/classify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 20000,
  });

  console.log('classify response:', response.data);
  const data = response.data;
  console.log(`[AI Service] Points Earned: ${data.pointsEarned}, Awarded: ${data.awarded}, Balance After: ${data.balanceAfter}`);

  const category = wasteTypeToCategory[data.wasteType] ?? wasteCategories[6];
  const confidence = Number.isFinite(data.confidence) ? Number(data.confidence) : 0;

  return {
    success: data.label !== 'unknown',
    label: data.displayLabel || data.label,
    category,
    confidence,
    disposalTip: data.instruction || category.disposalTip,
    pointsEarned: data.pointsEarned || 0,
    classificationId: data.classificationId,
    awarded: data.awarded || false,
  };
}

// ── Confidence level helpers ──────────────────────────────────────────────────

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.80) return 'high';
  if (confidence >= 0.50) return 'medium';
  return 'low';
}

export function getConfidenceLabel(confidence: number): string {
  const level = getConfidenceLevel(confidence);
  switch (level) {
    case 'high':   return 'Tin cậy cao';
    case 'medium': return 'Tin cậy trung bình';
    case 'low':    return 'Tin cậy thấp';
  }
}
