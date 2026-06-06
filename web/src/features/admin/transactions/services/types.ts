// Types khớp với DropoffTransaction entity của backend
// Relations: user, location, acceptedWasteType được load sẵn

export type DropoffStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface CollectionTransactionUser {
  id: string;
  fullName: string;
  email: string;
}

export interface CollectionTransactionLocation {
  id: string;
  name: string;
  address?: string;
}

export interface CollectionTransactionWasteType {
  id: string;
  wasteType: string;
  unit?: string;
}

export interface AdminCollectionTransaction {
  id: string;
  user?: CollectionTransactionUser | null;
  location?: CollectionTransactionLocation | null;
  acceptedWasteType?: CollectionTransactionWasteType | null;
  quantityValue?: number | null;
  quantityUnit?: string | null;
  distanceKm?: number | null;
  pointsAwarded?: number | null;
  rejectionReason?: string | null;
  confirmedAt?: string | null;
  status?: DropoffStatus | null;
  createdAt: string;
}
