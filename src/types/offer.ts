import { Pharmacy } from './pharmacy';

export type OfferTag = 'lowest_price' | 'fastest_delivery' | 'best_rated' | 'recommended';

export interface OfferItemPrice {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isAvailable: boolean;
  batchNumber?: string;
  expiryDate?: string;
}

export interface PharmacyOffer {
  id: string;
  cartId: string;
  pharmacyId: string;
  pharmacy: Pharmacy;
  createdAt: number;
  expiresAt: number; // Unix timestamp for countdown
  isExpired: boolean;
  tags: OfferTag[];
  primaryTag?: OfferTag;

  // Financial Breakdown
  medicineSubtotal: number;
  mrpTotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxesAndFees: number;
  finalPayableAmount: number;
  totalSavings: number;

  // Delivery & Fulfillment
  estimatedDeliveryMinutes: number;
  estimatedDeliveryTimeText: string;
  fulfillmentScore: number; // e.g. 100% complete
  allMedicinesAvailable: boolean;
  unavailableMedicineIds?: string[];
  itemPrices: OfferItemPrice[];
  notes?: string;
}

export interface OfferComparisonSummary {
  totalOffersReceived: number;
  lowestPriceOfferId?: string;
  fastestDeliveryOfferId?: string;
  bestRatedOfferId?: string;
  recommendedOfferId?: string;
  minPrice: number;
  maxPrice: number;
  fastestTimeMinutes: number;
  expiresInSeconds: number;
}
