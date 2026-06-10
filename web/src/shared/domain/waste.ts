export type WasteType = 'PLASTIC' | 'PAPER' | 'BATTERY' | 'GLASS' | 'METAL' | 'E_WASTE' | 'TEXTILE' | 'OTHER';

export interface AcceptedWasteType {
  wasteType: WasteType;
  conditionNote?: string;
}

export const WASTE_LABEL: Record<WasteType, string> = {
  PLASTIC: 'Nhựa',
  PAPER: 'Giấy',
  BATTERY: 'Pin',
  GLASS: 'Thuỷ tinh',
  METAL: 'Kim loại',
  E_WASTE: 'Rác điện tử',
  TEXTILE: 'Vải/Quần áo',
  OTHER: 'Khác',
};

/** Safe lookup — returns the label or falls back to the raw key */
export const getWasteLabel = (key: string | null | undefined): string =>
  key ? (WASTE_LABEL as Record<string, string>)[key] ?? key : '';
