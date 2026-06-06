export type LocationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';
export type LocationCapabilityType = 'COLLECTION' | 'REWARD_PICKUP';
export type CollectionSiteType = 'MACHINE' | 'COUNTER' | 'BIN';

export const STATUS_LABEL: Record<LocationStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  INACTIVE: 'Tạm ngưng',
};

export const STATUS_COLOR: Record<LocationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  INACTIVE: 'bg-slate-100 text-slate-600',
};

export const CAPABILITY_LABEL: Record<LocationCapabilityType, string> = {
  COLLECTION: 'Thu gom',
  REWARD_PICKUP: 'Nhận quà',
};

export const SITE_TYPE_LABEL: Record<CollectionSiteType, string> = {
  MACHINE: 'Máy tự động',
  COUNTER: 'Quầy tiếp nhận',
  BIN: 'Thùng rác',
};

export interface CollectionProfile {
  siteType?: CollectionSiteType;
  instructions?: string;
  requiresStaffConfirmation?: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  status: LocationStatus;
  acceptedWasteTypes?: import('./waste').AcceptedWasteType[];
  capabilities?: LocationCapabilityType[];
  collectionProfile?: CollectionProfile;
  createdAt?: string;
  updatedAt?: string;
}
