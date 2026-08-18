import { Medicine, MedicineCategory, AlternativeMedicine } from '../types/medicine';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from './mockData';

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
    await this.delay(150);
    return [...this.medicines];
  }

  static async getPopularMedicines(): Promise<Medicine[]> {
    await this.delay(150);
    return this.medicines.filter((m) => m.isPopular);
  }

  static async getCategories(): Promise<MedicineCategory[]> {
    await this.delay(100);
    return [...this.categories];
  }

  static async getMedicineById(id: string): Promise<Medicine | null> {
    await this.delay(100);
    const found = this.medicines.find((m) => m.id === id);
    return found ? { ...found } : null;
  }

  static async getMedicinesByCategory(categorySlug: string): Promise<Medicine[]> {
    await this.delay(150);
    const validSlugs = SLUG_ALIASES[categorySlug] || [categorySlug];
    const results = this.medicines.filter(
      (m) =>
        validSlugs.includes(m.categorySlug) ||
        m.categorySlug.toLowerCase().includes(categorySlug.toLowerCase()) ||
        categorySlug.toLowerCase().includes(m.categorySlug.toLowerCase())
    );

    // If still empty fallback to all or category title match
    if (results.length === 0) {
      return this.medicines.slice(0, 6);
    }
    return results;
  }

  static async searchMedicines(query: string): Promise<{
    medicines: Medicine[];
    bySaltMatches: Medicine[];
    byGenericMatches: Medicine[];
    byBrandMatches: Medicine[];
  }> {
    await this.delay(180);
    const q = query.trim().toLowerCase();
    if (!q) {
      return { medicines: [], bySaltMatches: [], byGenericMatches: [], byBrandMatches: [] };
    }

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

  static async getAlternatives(medicineId: string): Promise<AlternativeMedicine[]> {
    await this.delay(120);
    const medicine = await this.getMedicineById(medicineId);
    if (!medicine || !medicine.alternatives) {
      return [];
    }
    return medicine.alternatives;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
