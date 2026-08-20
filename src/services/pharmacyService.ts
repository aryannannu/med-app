import { Pharmacy, PharmacyInventoryItem } from '../types/pharmacy';
import { Medicine } from '../types/medicine';
import { MOCK_PHARMACIES, MOCK_MEDICINES } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

export class PharmacyService {
  private static pharmacies: Pharmacy[] | null = null;

  private static getPharmaciesList(): Pharmacy[] {
    if (!this.pharmacies) {
      this.pharmacies = Array.isArray(MOCK_PHARMACIES) ? [...MOCK_PHARMACIES] : [];
    }
    return this.pharmacies;
  }

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
      return [...this.getPharmaciesList()];
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
      await this.delay(100);
      const list = this.getPharmaciesList();
      const pharmacy = list.find((p) => p.id === id);
      return pharmacy || list[0] || null;
    }
    return null;
  }

  static async searchPharmacies(query: string): Promise<Pharmacy[]> {
    const list = this.getPharmaciesList();
    if (!query) return [...list];
    const q = query.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.line1.toLowerCase().includes(q) ||
        p.address.city.toLowerCase().includes(q)
    );
  }

  static async getPharmacyInventory(pharmacyId: string): Promise<{ pharmacy: Pharmacy | null; items: { medicine: Medicine; inventory: PharmacyInventoryItem }[] }> {
    const pharmacy = await this.getPharmacyById(pharmacyId);
    if (!pharmacy) {
      return { pharmacy: null, items: [] };
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(150);
      const medList = Array.isArray(MOCK_MEDICINES) ? MOCK_MEDICINES : [];
      const items = medList.map((med, index) => {
        const isAvailable = index !== 3;
        const discountPrice = Math.round(med.mrp * (1 - (pharmacy.id === 'pharm-1' ? 0.15 : 0.1)));
        return {
          medicine: {
            ...med,
            discountPrice,
            discountPercentage: Math.round(((med.mrp - discountPrice) / med.mrp) * 100),
          },
          inventory: {
            medicineId: med.id,
            pharmacyId: pharmacy.id,
            isAvailable,
            inStock: isAvailable,
            stockQuantity: isAvailable ? 25 : 0,
            batchNumber: `BAT-${index + 101}`,
            expiryDate: '12/2026',
            mrp: med.mrp,
            discountPrice,
            discountPercentage: Math.round(((med.mrp - discountPrice) / med.mrp) * 100),
          },
        };
      });
      return { pharmacy, items };
    }

    return { pharmacy, items: [] };
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
