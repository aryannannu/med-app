import { Medicine, MedicineCategory, AlternativeMedicine } from '../types/medicine';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from './mockData';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

const SLUG_ALIASES: Record<string, string[]> = {
  'pain-relief': ['pain-relief', 'pain-fever', 'pain'],
  'pain-fever': ['pain-relief', 'pain-fever', 'pain'],
  'cold-flu': ['cold-flu', 'cold-cough', 'cough-cold'],
  'cold-cough': ['cold-flu', 'cold-cough', 'cough-cold'],
  'diabetes': ['diabetes', 'diabetes-care'],
  'vitamins': ['vitamins', 'vitamins-immunity', 'immunity'],
  'digestive': ['digestive', 'digestion', 'stomach-digestion'],
  'digestion': ['digestive', 'digestion', 'stomach-digestion'],
  'skin': ['skin', 'skin-care', 'dermatology'],
  'skin-care': ['skin', 'skin-care', 'dermatology'],
  'baby': ['baby', 'baby-care', 'mother-baby'],
  'ayurveda': ['ayurveda', 'ayurvedic', 'herbal'],
  'heart-bp': ['heart-bp', 'cardiac', 'cardiac-care', 'bp'],
};

export class MedicineService {
  private static medicines: Medicine[] = [...MOCK_MEDICINES];
  private static categories: MedicineCategory[] = [...MOCK_CATEGORIES];

  static async getAllMedicines(): Promise<Medicine[]> {
    try {
      const response = await apiClient.get<Medicine[]>('/medicines');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.medicines = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      return [...this.medicines];
    }
    return [];
  }

  static async getPopularMedicines(): Promise<Medicine[]> {
    try {
      const response = await apiClient.get<Medicine[]>('/medicines/popular');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      return this.medicines.filter((m) => m.isPopular);
    }
    return [];
  }

  static async getCategories(): Promise<MedicineCategory[]> {
    try {
      const response = await apiClient.get<MedicineCategory[]>('/categories');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.categories = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(80);
      return [...this.categories];
    }
    return [];
  }

  static async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      const response = await apiClient.get<Medicine>(`/medicines/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(80);
      const found = this.medicines.find((m) => m.id === id);
      return found ? { ...found } : null;
    }
    return null;
  }

  static async getMedicinesByCategory(categorySlug: string): Promise<Medicine[]> {
    try {
      const response = await apiClient.get<Medicine[]>(`/categories/${categorySlug}/medicines`);
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      const validSlugs = SLUG_ALIASES[categorySlug] || [categorySlug];
      const results = this.medicines.filter(
        (m) =>
          validSlugs.includes(m.categorySlug) ||
          m.categorySlug.toLowerCase().includes(categorySlug.toLowerCase()) ||
          categorySlug.toLowerCase().includes(m.categorySlug.toLowerCase())
      );

      if (results.length === 0) {
        return this.medicines.slice(0, 6);
      }
      return results;
    }
    return [];
  }

  static async searchMedicines(query: string): Promise<{
    medicines: Medicine[];
    bySaltMatches: Medicine[];
    byGenericMatches: Medicine[];
    byBrandMatches: Medicine[];
  }> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { medicines: [], bySaltMatches: [], byGenericMatches: [], byBrandMatches: [] };
    }

    try {
      const response = await apiClient.get<{
        medicines: Medicine[];
        bySaltMatches: Medicine[];
        byGenericMatches: Medicine[];
        byBrandMatches: Medicine[];
      }>('/medicines/search', { q });
      if (response.success && response.data && response.data.medicines) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(120);
      const byBrandMatches = this.medicines.filter(
        (m) => m.name.toLowerCase().includes(q) || m.brandName.toLowerCase().includes(q)
      );

      const byGenericMatches = this.medicines.filter(
        (m) => m.genericName.toLowerCase().includes(q) && !byBrandMatches.includes(m)
      );

      const bySaltMatches = this.medicines.filter(
        (m) =>
          m.saltComposition.toLowerCase().includes(q) &&
          !byBrandMatches.includes(m) &&
          !byGenericMatches.includes(m)
      );

      const combined = [...byBrandMatches, ...byGenericMatches, ...bySaltMatches];

      return {
        medicines: combined,
        bySaltMatches,
        byGenericMatches,
        byBrandMatches,
      };
    }

    return { medicines: [], bySaltMatches: [], byGenericMatches: [], byBrandMatches: [] };
  }

  static async getAlternatives(medicineId: string): Promise<AlternativeMedicine[]> {
    try {
      const response = await apiClient.get<AlternativeMedicine[]>(`/medicines/${medicineId}/alternatives`);
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(80);
      const medicine = await this.getMedicineById(medicineId);
      if (!medicine || !medicine.alternatives) {
        return [];
      }
      return medicine.alternatives;
    }
    return [];
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
