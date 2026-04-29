import { wasteCategories, WasteCategory } from '../mockData';
import { AIClassificationResult, BackendClassificationResponse, WasteType } from './types';
import { isKnownClassificationLabel, normalizeConfidence } from './ai.utils';

const DEFAULT_CATEGORY = wasteCategories[6];

const WASTE_TYPE_TO_CATEGORY: Record<WasteType, WasteCategory> = {
  PLASTIC: wasteCategories[0],
  PAPER: wasteCategories[1],
  METAL: wasteCategories[2],
  GLASS: wasteCategories[4],
  BATTERY: wasteCategories[5],
  OTHER: DEFAULT_CATEGORY,
};

function getCategoryForWasteType(wasteType: WasteType): WasteCategory {
  return WASTE_TYPE_TO_CATEGORY[wasteType] ?? DEFAULT_CATEGORY;
}

export function mapClassificationResponse(
  data: BackendClassificationResponse,
): AIClassificationResult {
  const category = getCategoryForWasteType(data.wasteType);

  return {
    success: isKnownClassificationLabel(data.label),
    label: data.displayLabel || data.label,
    category,
    confidence: normalizeConfidence(data.confidence),
    disposalTip: data.instruction || category.disposalTip,
    pointsEarned: data.pointsEarned ?? 0,
    classificationId: data.classificationId,
    awarded: data.awarded ?? false,
  };
}
