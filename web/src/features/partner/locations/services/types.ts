export type LocationType = 'BIN' | 'CENTER' | 'COLLECTION_POINT';
export type LocationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';
export type LocationCapabilityType = 'COLLECTION' | 'REWARD_PICKUP';
export type CollectionSiteType = 'MACHINE' | 'COUNTER' | 'BIN';
export type WasteType = 'PLASTIC' | 'PAPER' | 'BATTERY' | 'GLASS' | 'METAL' | 'E_WASTE' | 'TEXTILE' | 'OTHER';
export type TransactionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CANCELED';
export type QuantityUnit = 'KG' | 'GRAM' | 'PIECE' | 'LITER';

export interface AcceptedWasteType {
  wasteType: WasteType;
  conditionNote?: string;
}

export interface CollectionProfile {
  siteType?: CollectionSiteType;
  instructions?: string;
  requiresStaffConfirmation?: boolean;
}

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  status: LocationStatus;
  acceptedWasteTypes?: AcceptedWasteType[];
  capabilities?: LocationCapabilityType[];
  collectionProfile?: CollectionProfile;
  createdAt?: string;
  updatedAt?: string;
}

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
  wasteType: WasteType;
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
  wasteType?: WasteType;
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

export interface CreateCollectionPointDto {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type: LocationType;
  contactPhone?: string;
  capabilities?: LocationCapabilityType[];
  acceptedWasteTypes?: AcceptedWasteType[];
  collectionProfile?: CollectionProfile;
}

export type UpdateCollectionPointDto = Partial<CreateCollectionPointDto>;

export interface QrResponse {
  qrToken: string;
  expiresAt?: string;
}
