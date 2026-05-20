import type {
  LocationType, LocationStatus, LocationCapabilityType,
  WasteType, CollectionSiteType, TransactionStatus,
} from './types';

export const STATUS_LABEL: Record<LocationStatus, string> = {
  PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', INACTIVE: 'Tạm ngưng',
};
export const STATUS_COLOR: Record<LocationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
};
export const TYPE_LABEL: Record<LocationType, string> = {
  BIN: 'Thùng rác', CENTER: 'Trung tâm', COLLECTION_POINT: 'Điểm thu gom',
};
export const CAPABILITY_LABEL: Record<LocationCapabilityType, string> = {
  COLLECTION: 'Thu gom', REWARD_PICKUP: 'Nhận quà',
};
export const WASTE_LABEL: Record<WasteType, string> = {
  PLASTIC: 'Nhựa', PAPER: 'Giấy', BATTERY: 'Pin', GLASS: 'Thuỷ tinh', METAL: 'Kim loại', OTHER: 'Khác',
};
export const SITE_TYPE_LABEL: Record<CollectionSiteType, string> = {
  MACHINE: 'Máy tự động', COUNTER: 'Quầy tiếp nhận', BIN: 'Thùng rác',
};
export const TX_STATUS_LABEL: Record<TransactionStatus, string> = {
  PENDING: 'Chờ xử lý', VERIFIED: 'Đã xác nhận', REJECTED: 'Từ chối', CANCELED: 'Đã huỷ',
};
export const TX_STATUS_COLOR: Record<TransactionStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELED: 'bg-slate-100 text-slate-500',
};

export const inputCls =
  'w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all';
