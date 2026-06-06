/**
 * Re-export shared types from the canonical source.
 * All transaction-specific types live here so the page
 * only needs to import from this module.
 */
export type {
  CollectionTransaction,
  DropoffTransactionUser,
  DropoffTransactionLocation,
  DropoffAcceptedWasteType,
  TransactionStatus,
  WasteType,
  QuantityUnit,
} from '../../../../shared/domain';

// ── DTOs ─────────────────────────────────────────────────────────────────────

export interface VerifyTransactionDto {
  pointsAwarded: number;
}

export interface RejectTransactionDto {
  rejectionReason: string;
}
