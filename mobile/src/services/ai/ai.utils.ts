import { ConfidenceLevel, ImageUploadFile } from './types';

const UNKNOWN_LABEL = 'unknown';

const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.5,
} as const;

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  high: 'Tin cậy cao',
  medium: 'Tin cậy trung bình',
  low: 'Tin cậy thấp',
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

function createImageUploadFile(imageUri: string): ImageUploadFile {
  return {
    uri: imageUri,
    name: getFileNameFromUri(imageUri),
    type: getMimeTypeFromUri(imageUri),
  };
}

export function createClassificationFormData(imageUri: string): FormData {
  const formData = new FormData();

  formData.append('file', createImageUploadFile(imageUri) as unknown as Blob);

  return formData;
}

export function normalizeConfidence(confidence: number): number {
  const value = Number(confidence);

  return Number.isFinite(value) ? value : 0;
}

export function isKnownClassificationLabel(label: string): boolean {
  return label.trim().toLowerCase() !== UNKNOWN_LABEL;
}

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return 'medium';

  return 'low';
}

export function getConfidenceLabel(confidence: number): string {
  return CONFIDENCE_LABELS[getConfidenceLevel(confidence)];
}
