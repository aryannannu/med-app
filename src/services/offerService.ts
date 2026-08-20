import { CartItem } from '../types/cart';
import { PharmacyOffer } from '../types/offer';
import { Pharmacy } from '../types/pharmacy';
import { Address } from '../types/user';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

const SELF_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-apollo',
    name: 'Apollo Pharmacy 24x7',
    logo: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=200&auto=format&fit=crop&q=80',
    licenseNumber: 'DL-PB-2022-874512',
    rating: 4.9,
    reviewCount: 2890,
    distanceKm: 0.8,
    estimatedDeliveryTimeMinutes: 10,
    isOpenNow: true,
    openingTime: '12:00 AM',
    closingTime: '11:59 PM',
    isVerified: true,
    phone: '+91 98765 22334',
    deliveryFee: 0,
    freeDeliveryAbove: 199,
    address: {
      line1: 'SCO 21-22, Phase 5 Commercial Complex',
      city: 'Karimpur',
      pincode: '144522',
      latitude: 31.1512,
      longitude: 75.3489,
    },
  },
  {
    id: 'pharm-medplus',
    name: 'MedPlus Chemists & Druggists',
    logo: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=200&auto=format&fit=crop&q=80',
    licenseNumber: 'DL-PB-2021-654321',
    rating: 4.8,
    reviewCount: 1980,
    distanceKm: 1.2,
    estimatedDeliveryTimeMinutes: 12,
    isOpenNow: true,
    openingTime: '08:00 AM',
    closingTime: '11:00 PM',
    isVerified: true,
    phone: '+91 98765 33445',
    deliveryFee: 0,
    freeDeliveryAbove: 249,
    address: {
      line1: 'SCF 8-9, Sector 2 Market',
      city: 'Karimpur',
      pincode: '144522',
      latitude: 31.1445,
      longitude: 75.3398,
    },
  },
  {
    id: 'pharm-sharma',
    name: 'Sharma Medical & Surgical Store',
    logo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&auto=format&fit=crop&q=80',
    licenseNumber: 'DL-PB-2023-984210',
    rating: 4.6,
    reviewCount: 1420,
    distanceKm: 2.1,
    estimatedDeliveryTimeMinutes: 25,
    isOpenNow: true,
    openingTime: '07:30 AM',
    closingTime: '11:00 PM',
    isVerified: true,
    phone: '+91 98765 11223',
    deliveryFee: 15,
    freeDeliveryAbove: 299,
    address: {
      line1: 'Shop No. 14, Main Market, Homeland City',
      city: 'Karimpur',
      pincode: '144522',
      latitude: 31.1471,
      longitude: 75.3412,
    },
  },
  {
    id: 'pharm-healthcare',
    name: 'HealthCare Express Chemist',
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80',
    licenseNumber: 'DL-PB-2023-443219',
    rating: 4.7,
    reviewCount: 890,
    distanceKm: 1.5,
    estimatedDeliveryTimeMinutes: 14,
    isOpenNow: true,
    openingTime: '08:30 AM',
    closingTime: '10:30 PM',
    isVerified: true,
    phone: '+91 98765 44556',
    deliveryFee: 0,
    freeDeliveryAbove: 199,
    address: {
      line1: 'Booth 55, Near Civil Hospital Road',
      city: 'Karimpur',
      pincode: '144522',
      latitude: 31.1498,
      longitude: 75.3456,
    },
  },
];

export class OfferService {
  private static activeOffers: Map<string, PharmacyOffer[]> = new Map();

  static getMockOffersSync(cartId: string = 'cart-default', items?: CartItem[]): PharmacyOffer[] {
    let baseMrpTotal = 0;
    let baseItemTotal = 0;

    const safeItems = Array.isArray(items) && items.length > 0 ? items : [];

    for (const item of safeItems) {
      if (!item) continue;
      const qty = item.quantity || 1;
      const mrp = item.selectedVariant?.mrp ?? item.medicine?.mrp ?? 50;
      const price = item.selectedVariant?.discountPrice ?? item.medicine?.discountPrice ?? 42;
      baseMrpTotal += mrp * qty;
      baseItemTotal += price * qty;
    }

    if (baseMrpTotal === 0) baseMrpTotal = 420;
    if (baseItemTotal === 0) baseItemTotal = 348;

    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000;

    const p0 = SELF_PHARMACIES[0];
    const p1 = SELF_PHARMACIES[1];
    const p2 = SELF_PHARMACIES[2];
    const p3 = SELF_PHARMACIES[3];

    const offers: PharmacyOffer[] = [
      {
        id: `off-rec-${cartId}`,
        cartId,
        pharmacyId: p0.id,
        pharmacy: p0,
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
        estimatedDeliveryMinutes: 10,
        estimatedDeliveryTimeText: '10 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: safeItems.map((it) => ({
          medicineId: it.medicineId || it.medicine?.id || 'med-1',
          medicineName: it.medicine?.name || 'Prescription Medicine',
          quantity: it.quantity || 1,
          unitPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.94),
          totalPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.94 * (it.quantity || 1)),
          isAvailable: true,
        })),
        notes: 'Best combination of fast 10 min delivery, highest 4.9★ rating, and free delivery.',
      },
      {
        id: `off-fast-${cartId}`,
        cartId,
        pharmacyId: p1.id,
        pharmacy: p1,
        createdAt: now,
        expiresAt,
        isExpired: false,
        tags: ['fastest_delivery'],
        primaryTag: 'fastest_delivery',
        mrpTotal: baseMrpTotal,
        medicineSubtotal: Math.round(baseItemTotal * 0.98),
        discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.98),
        deliveryFee: 0,
        taxesAndFees: 4,
        finalPayableAmount: Math.round(baseItemTotal * 0.98) + 4,
        totalSavings: Math.round(baseMrpTotal - (baseItemTotal * 0.98 + 4)),
        estimatedDeliveryMinutes: 12,
        estimatedDeliveryTimeText: '12 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: safeItems.map((it) => ({
          medicineId: it.medicineId || it.medicine?.id || 'med-1',
          medicineName: it.medicine?.name || 'Prescription Medicine',
          quantity: it.quantity || 1,
          unitPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.98),
          totalPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.98 * (it.quantity || 1)),
          isAvailable: true,
        })),
        notes: 'Lightning fast 12 min emergency delivery from nearest local pharmacy (0.8 km).',
      },
      {
        id: `off-low-${cartId}`,
        cartId,
        pharmacyId: p2.id,
        pharmacy: p2,
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
        estimatedDeliveryMinutes: 25,
        estimatedDeliveryTimeText: '25 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: safeItems.map((it) => ({
          medicineId: it.medicineId || it.medicine?.id || 'med-1',
          medicineName: it.medicine?.name || 'Prescription Medicine',
          quantity: it.quantity || 1,
          unitPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.88),
          totalPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.88 * (it.quantity || 1)),
          isAvailable: true,
        })),
        notes: 'Lowest total price in your area. Maximum savings on bulk prescription orders.',
      },
      {
        id: `off-rate-${cartId}`,
        cartId,
        pharmacyId: p3.id,
        pharmacy: p3,
        createdAt: now,
        expiresAt,
        isExpired: false,
        tags: ['best_rated'],
        primaryTag: 'best_rated',
        mrpTotal: baseMrpTotal,
        medicineSubtotal: Math.round(baseItemTotal * 0.92),
        discountAmount: Math.round(baseMrpTotal - baseItemTotal * 0.92),
        deliveryFee: 0,
        taxesAndFees: 4,
        finalPayableAmount: Math.round(baseItemTotal * 0.92) + 4,
        totalSavings: Math.round(baseMrpTotal - (baseItemTotal * 0.92 + 4)),
        estimatedDeliveryMinutes: 14,
        estimatedDeliveryTimeText: '14 mins',
        fulfillmentScore: 100,
        allMedicinesAvailable: true,
        itemPrices: safeItems.map((it) => ({
          medicineId: it.medicineId || it.medicine?.id || 'med-1',
          medicineName: it.medicine?.name || 'Prescription Medicine',
          quantity: it.quantity || 1,
          unitPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.92),
          totalPrice: Math.round(((it.medicine?.discountPrice || it.medicine?.mrp) || 40) * 0.92 * (it.quantity || 1)),
          isAvailable: true,
        })),
        notes: 'NABH-accredited pharmacy with tamper-proof seal and temperature-controlled delivery.',
      },
    ];

    this.activeOffers.set(cartId, offers);
    return offers;
  }

  static async generateOffersForCart(cartId: string, items: CartItem[], address?: Address | null): Promise<PharmacyOffer[]> {
    try {
      if (address?.id) {
        const response = await apiClient.post<PharmacyOffer[]>('/offers/generate', {
          cartId,
          items: items || [],
          addressId: address.id,
        });
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          this.activeOffers.set(cartId, response.data);
          return response.data;
        }
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(600);
      return this.getMockOffersSync(cartId, items);
    }

    return this.getMockOffersSync(cartId, items);
  }

  static getActiveOffers(cartId: string): PharmacyOffer[] {
    const list = this.activeOffers.get(cartId) || [];
    if (list.length === 0) {
      return this.getMockOffersSync(cartId);
    }
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
