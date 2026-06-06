export type TransactionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELED';
export type QuantityUnit = 'KG' | 'GRAM' | 'PIECE' | 'LITER';

export const TX_STATUS_LABEL: Record<TransactionStatus, string> = {
  PENDING: 'Chờ xử lý',
  VERIFIED: 'Đã xác nhận',
  REJECTED: 'Từ chối',
  CANCELED: 'Đã huỷ',
};

export const TX_STATUS_COLOR: Record<TransactionStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-rose-100 text-rose-700',
  CANCELED: 'bg-slate-100 text-slate-500',
};

export interface DropoffTransactionUser {
  id: string;
  displayName?: string;
  email?: string;
}

export interface DropoffTransactionLocation {
  id: string;
  name: string;
  address: string;
}

export interface DropoffAcceptedWasteType {
  id: string;
  wasteType: import('./waste').WasteType;
  conditionNote?: string;
}

export interface CollectionTransaction {
  id: string;
  locationId?: string;
  location?: DropoffTransactionLocation;
  userId?: string;
  user?: DropoffTransactionUser;
  /** Backend entity field name */
  acceptedWasteType?: DropoffAcceptedWasteType;
  /** Legacy alias used in mock data – maps to acceptedWasteType.wasteType */
  wasteType?: import('./waste').WasteType;
  quantityValue?: number;
  quantityUnit?: QuantityUnit;
  userLatitude?: number;
  userLongitude?: number;
  distanceKm?: number;
  status: TransactionStatus;
  pointsAwarded?: number;
  rejectionReason?: string;
  confirmedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
