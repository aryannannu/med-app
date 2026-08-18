import { CartItem } from '../types/cart';
import { PharmacyOffer, OfferTag } from '../types/offer';
import { Address } from '../types/user';
import { MOCK_PHARMACIES } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

export class OfferService {
  private static activeOffers: Map<string, PharmacyOffer[]> = new Map();

  static async generateOffersForCart(cartId: string, items: CartItem[], address: Address): Promise<PharmacyOffer[]> {
    if (!items || items.length === 0) {
      return [];
    }

    try {
      const response = await apiClient.post<PharmacyOffer[]>('/offers/generate', {
        cartId,
        items,
        addressId: address.id,
      });
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.activeOffers.set(cartId, response.data);
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(900);

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
      const expiresAt = now + 10 * 60 * 1000;

      const offers: PharmacyOffer[] = [
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
          medicineSubtotal: Math.round(baseItemTotal * 0.94),
          discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.94),
          deliveryFee: 0,
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
          medicineSubtotal: Math.round(baseItemTotal * 0.88),
          discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.88),
          deliveryFee: 15,
          taxesAndFees: 4,
          finalPayableAmount: Math.round(baseItemTotal * 0.88) + 15 + 4,
          totalSavings: Math.round(baseMrpTotal - (baseItemTotal * 0.88 + 19)),
          estimatedDeliveryMinutes: 45,
          estimatedDeliveryTimeText: '45 mins',
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
          notes: 'Lowest total price in your area. Maximum savings on bulk prescription orders.',
        },
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
          estimatedDeliveryMinutes: 12,
          estimatedDeliveryTimeText: '12 mins',
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
          notes: 'Lightning fast 12 min emergency delivery from nearest local pharmacy (0.8 km).',
        },
        {
          id: `off-rate-${cartId}`,
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

    return [];
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
