import { Medicine, MedicineVariant } from './medicine';

export interface CartItem {
  id: string; // Unique cart item ID (medicineId + variantId)
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  selectedVariant?: MedicineVariant;
  rxRequired: boolean;
  sourcePharmacyId?: string; // Optional: where it was browsed from
  sourcePharmacyName?: string;
  addedAt: number;
}

export interface CartSummary {
  itemCount: number;
  totalQuantity: number;
  mrpTotal: number;
  itemTotal: number;
  savingsTotal: number;
  estimatedDeliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  isEligibleForFreeDelivery: boolean;
  taxesAndHandling: number;
  estimatedFinalTotal: number;
  hasRxItems: boolean;
  rxItemsCount: number;
}

export interface Cart {
  items: CartItem[];
  summary: CartSummary;
  updatedAt: number;
}
