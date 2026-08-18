import { Pharmacy, PharmacyInventoryItem } from '../types/pharmacy';
import { Medicine } from '../types/medicine';
import { MOCK_PHARMACIES, MOCK_MEDICINES } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

export class PharmacyService {
  private static pharmacies: Pharmacy[] = [...MOCK_PHARMACIES];

  static async getNearbyPharmacies(): Promise<Pharmacy[]> {
    try {
      const response = await apiClient.get<Pharmacy[]>('/pharmacies/nearby');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.pharmacies = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      return [...this.pharmacies];
    }
    return [];
  }

  static async getPharmacyById(id: string): Promise<Pharmacy | null> {
    try {
      const response = await apiClient.get<Pharmacy>(`/pharmacies/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(80);
      const pharmacy = this.pharmacies.find((p) => p.id === id);
      return pharmacy ? { ...pharmacy } : null;
    }
    return null;
  }

  static async getPharmacyInventory(pharmacyId: string): Promise<{
    pharmacy: Pharmacy | null;
    items: { medicine: Medicine; inventory: PharmacyInventoryItem }[];
  }> {
    try {
      const response = await apiClient.get<{
        pharmacy: Pharmacy;
        items: { medicine: Medicine; inventory: PharmacyInventoryItem }[];
      }>(`/pharmacies/${pharmacyId}/inventory`);
      if (response.success && response.data && response.data.items) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(120);
      const pharmacy = await this.getPharmacyById(pharmacyId);
      if (!pharmacy) {
        return { pharmacy: null, items: [] };
      }

      const items = MOCK_MEDICINES.map((med, index) => {
        const priceVariation = 1 + ((index % 3) - 1) * 0.04;
        const customPrice = Math.round(med.discountPrice * priceVariation);
        const inStock = index !== 7;
        const stockQuantity = inStock ? 15 + index * 5 : 0;

        return {
          medicine: med,
          inventory: {
            medicineId: med.id,
            inStock,
            stockQuantity,
            customPrice,
            batchNumber: `BAT-${index + 101}`,
            expiryDate: '12/2027',
          },
        };
      });

      return { pharmacy, items };
    }

    return { pharmacy: null, items: [] };
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
