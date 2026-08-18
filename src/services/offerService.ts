import { CartItem } from '../types/cart';
import { PharmacyOffer, OfferTag } from '../types/offer';
import { Address } from '../types/user';
import { MOCK_PHARMACIES } from './mockData';

export class OfferService {
  private static activeOffers: Map<string, PharmacyOffer[]> = new Map();

  static async generateOffersForCart(cartId: string, items: CartItem[], address: Address): Promise<PharmacyOffer[]> {
    await this.delay(1200); // Simulate matching with network

    if (!items || items.length === 0) {
      return [];
    }

    let baseMrpTotal = 0;
    let baseItemTotal = 0;

    for (const item of items) {
      const qty = item.quantity;
      const mrp = item.selectedVariant?.mrp ?? item.medicine.mrp;
      const price = item.selectedVariant?.discountPrice ?? item.medicine.discountPrice;
      baseMrpTotal += mrp * qty;
      baseItemTotal += price * qty;
    }

    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

    // Generate 4 distinct competing offers
    const offers: PharmacyOffer[] = [
      // 1. RECOMMENDED (Optimal balance)
      {
        id: `off-rec-${cartId}`,
        cartId,
        pharmacyId: MOCK_PHARMACIES[0].id,
        pharmacy: MOCK_PHARMACIES[0],
        createdAt: now,
        expiresAt,
        isExpired: false,
        tags: ['recommended'],
        primaryTag: 'recommended',
        mrpTotal: baseMrpTotal,
        medicineSubtotal: Math.round(baseItemTotal * 0.94), // Extra 6% discount
        discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.94),
        deliveryFee: 0, // Free delivery promo
        taxesAndFees: 4,
        finalPayableAmount: Math.round(baseItemTotal * 0.94) + 4,
        totalSavings: Math.round(baseMrpTotal - (baseItemTotal * 0.94 + 4)),
        estimatedDeliveryMinutes: 20,
        estimatedDeliveryTimeText: '20 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: items.map((it) => ({
          medicineId: it.medicineId,
          medicineName: it.medicine.name,
          quantity: it.quantity,
          unitPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.94),
          totalPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.94 * it.quantity),
          isAvailable: true,
        })),
        notes: 'Best combination of fast 20 min delivery, highest 4.9★ rating, and free delivery.',
      },

      // 2. LOWEST PRICE (Max savings)
      {
        id: `off-low-${cartId}`,
        cartId,
        pharmacyId: MOCK_PHARMACIES[2].id,
        pharmacy: MOCK_PHARMACIES[2],
        createdAt: now,
        expiresAt,
        isExpired: false,
        tags: ['lowest_price'],
        primaryTag: 'lowest_price',
        mrpTotal: baseMrpTotal,
        medicineSubtotal: Math.round(baseItemTotal * 0.88), // Extra 12% discount
        discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.88),
        deliveryFee: 15,
        taxesAndFees: 4,
        finalPayableAmount: Math.round(baseItemTotal * 0.88) + 15 + 4,
        totalSavings: Math.round(baseMrpTotal - (baseItemTotal * 0.88 + 19)),
        estimatedDeliveryMinutes: 35,
        estimatedDeliveryTimeText: '35 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: items.map((it) => ({
          medicineId: it.medicineId,
          medicineName: it.medicine.name,
          quantity: it.quantity,
          unitPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.88),
          totalPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.88 * it.quantity),
          isAvailable: true,
        })),
        notes: 'Maximum medicine discount available. Standard 35 min delivery.',
      },

      // 3. FASTEST DELIVERY (Express ETA)
      {
        id: `off-fast-${cartId}`,
        cartId,
        pharmacyId: MOCK_PHARMACIES[1].id,
        pharmacy: MOCK_PHARMACIES[1],
        createdAt: now,
        expiresAt,
        isExpired: false,
        tags: ['fastest_delivery'],
        primaryTag: 'fastest_delivery',
        mrpTotal: baseMrpTotal,
        medicineSubtotal: Math.round(baseItemTotal * 0.98),
        discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.98),
        deliveryFee: 25,
        taxesAndFees: 4,
        finalPayableAmount: Math.round(baseItemTotal * 0.98) + 25 + 4,
        totalSavings: Math.round(baseMrpTotal - (baseItemTotal * 0.98 + 29)),
        estimatedDeliveryMinutes: 15,
        estimatedDeliveryTimeText: '15 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: items.map((it) => ({
          medicineId: it.medicineId,
          medicineName: it.medicine.name,
          quantity: it.quantity,
          unitPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.98),
          totalPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.98 * it.quantity),
          isAvailable: true,
        })),
        notes: 'Closest store (1.4 km). Priority rider dispatched immediately.',
      },

      // 4. BEST RATED (Super store)
      {
        id: `off-rated-${cartId}`,
        cartId,
        pharmacyId: MOCK_PHARMACIES[3].id,
        pharmacy: MOCK_PHARMACIES[3],
        createdAt: now,
        expiresAt,
        isExpired: false,
        tags: ['best_rated'],
        primaryTag: 'best_rated',
        mrpTotal: baseMrpTotal,
        medicineSubtotal: Math.round(baseItemTotal * 0.92),
        discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.92),
        deliveryFee: 20,
        taxesAndFees: 4,
        finalPayableAmount: Math.round(baseItemTotal * 0.92) + 20 + 4,
        totalSavings: Math.round(baseMrpTotal - (baseItemTotal * 0.92 + 24)),
        estimatedDeliveryMinutes: 40,
        estimatedDeliveryTimeText: '40 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: items.map((it) => ({
          medicineId: it.medicineId,
          medicineName: it.medicine.name,
          quantity: it.quantity,
          unitPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.92),
          totalPrice: Math.round((it.medicine.discountPrice || it.medicine.mrp) * 0.92 * it.quantity),
          isAvailable: true,
        })),
        notes: 'NABH-accredited pharmacy with tamper-proof seal and temperature-controlled delivery.',
      },
    ];

    this.activeOffers.set(cartId, offers);
    return offers;
  }

  static getActiveOffers(cartId: string): PharmacyOffer[] {
    const list = this.activeOffers.get(cartId) || [];
    const now = Date.now();
    return list.map((o) => ({
      ...o,
      isExpired: now >= o.expiresAt,
    }));
  }

  static invalidateOffers(cartId?: string): void {
    if (cartId) {
      this.activeOffers.delete(cartId);
    } else {
      this.activeOffers.clear();
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
