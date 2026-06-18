export interface LocationCapability {
  id: string;
  capability: string;
}

export interface CollectionLocationProfile {
  id: string;
  siteType: string;
  instructions?: string;
  requiresStaffConfirmation?: boolean;
}

export interface AcceptedWasteType {
  id: string;
  wasteType: string;
  conditionNote?: string;
}

export interface Location {
  id: string;
  name?: string;
  type?: string;
  address?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  partnerProfile?: {
    id: string;
    organizationName?: string;
  };
  capabilities?: LocationCapability[];
  acceptedWasteTypes?: AcceptedWasteType[];
  collectionProfile?: CollectionLocationProfile;
  createdAt?: string;
  updatedAt?: string;
}

export interface DropoffTransactionUser {
  id: string;
  fullName?: string;
  email?: string;
}

export interface DropoffTransaction {
  id: string;
  status?: string;
  quantityValue?: number | null;
  quantityUnit?: string | null;
  pointsAwarded?: number | null;
  confirmedAt?: string | null;
  createdAt?: string;
  user?: DropoffTransactionUser | null;
  verifiedBy?: DropoffTransactionUser | null;
  acceptedWasteType?: AcceptedWasteType | null;
}

export interface AdminLocationDetailResponse {
  location: Location;
  transactions: DropoffTransaction[];
}

export interface LocationStats {
  totalLocations: number;
  activeLocations: number;
  pendingLocations: number;
  locationsByType: Record<string, number>;
  locationsBySiteType?: Record<string, number>;
}

export interface AdminLocationsResponse {
  locations: Location[];
  stats: LocationStats;
}
