import { wasteCategories, WasteCategory } from '../mockData';
import { AIClassificationResult, BackendClassificationResponse, BackendClassificationResultItem, WasteType } from './types';
import { isKnownClassificationLabel, normalizeConfidence } from './ai.utils';

const DEFAULT_CATEGORY = wasteCategories[6];

const WASTE_TYPE_TO_CATEGORY: Record<WasteType, WasteCategory> = {
 PLASTIC: wasteCategories[0],
 PAPER: wasteCategories[1],
 METAL: wasteCategories[2],
 GLASS: wasteCategories[4],
 BATTERY: wasteCategories[5],
 E_WASTE: wasteCategories[5],
 TEXTILE: wasteCategories[0],
 OTHER: DEFAULT_CATEGORY,
};

function getCategoryForWasteType(wasteType: WasteType): WasteCategory {
 return WASTE_TYPE_TO_CATEGORY[wasteType] ?? DEFAULT_CATEGORY;
}

export function mapClassificationItem(
 item: BackendClassificationResultItem,
): AIClassificationResult {
 const category = getCategoryForWasteType(item.wasteType);

 return {
 success: isKnownClassificationLabel(item.label),
 label: item.displayLabel || item.label,
 category,
 confidence: normalizeConfidence(item.confidence),
 disposalTip: item.instruction || category.disposalTip,
 boundingBox: item.boundingBox,
 pointsEarned: item.pointsEarned ?? 0,
 classificationId: item.classificationId,
 awarded: item.awarded ?? false,
 nearestLocation: item.nearestLocation,
 };
}

export function mapClassificationResponse(
 data: BackendClassificationResponse,
): AIClassificationResult[] {
 if (!data.results || data.results.length === 0) {
 return [];
 }
 return data.results.map(mapClassificationItem);
}
