import { Prescription, DetectedMedicine } from '../types/prescription';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

export class PrescriptionService {
  private static savedPrescriptions: Prescription[] = [
    {
      id: 'rx-saved-1',
      name: 'General Health & Fever (25 Aug)',
      uri: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      fileName: 'Rx_DrMurthy_GeneralPhysician.jpg',
      fileSize: 1024 * 450,
      mimeType: 'image/jpeg',
      uploadedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      doctorName: 'Dr. K. Murthy (MD, Gen Med)',
      patientName: 'Aryan Kumar',
      prescriptionDate: '25 Aug 2026',
      status: 'verified',
      reviewStatus: 'saved',
      notes: 'Valid for 6 months. Contains Dolo 650, Augmentin 625 & Pan 40.',
      detectedMedicines: [
        {
          id: 'det-1',
          medicineId: 'med-1',
          name: 'Dolo 650 Tablet',
          composition: 'Paracetamol 650mg',
          strength: '650mg',
          form: 'Tablet',
          dosageInstructions: '1 tablet twice daily for 5 days',
          suggestedRequirement: '10 tablets',
          availablePack: 'Strip of 15',
          quantity: 1,
          price: 30.5,
          mrp: 34.0,
          rxRequired: false,
          reviewStatus: 'matched',
          source: 'ocr',
          brandName: 'Micro Labs',
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
        },
        {
          id: 'det-2',
          medicineId: 'med-augmentin',
          name: 'Augmentin 625 Duo Tablet',
          composition: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
          strength: '625mg',
          form: 'Tablet',
          dosageInstructions: '1 tablet twice daily for 5 days after food',
          suggestedRequirement: '10 tablets',
          availablePack: 'Strip of 10',
          quantity: 1,
          price: 185.0,
          mrp: 205.0,
          rxRequired: true,
          reviewStatus: 'matched',
          source: 'ocr',
          brandName: 'GSK',
          image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&q=80',
        },
        {
          id: 'det-3',
          medicineId: 'med-pan40',
          name: 'Pan 40 Tablet',
          composition: 'Pantoprazole Gastro-resistant 40mg',
          strength: '40mg',
          form: 'Tablet',
          dosageInstructions: '1 tablet once daily morning before food',
          suggestedRequirement: '5 tablets',
          availablePack: 'Strip of 15',
          quantity: 1,
          price: 135.0,
          mrp: 155.0,
          rxRequired: true,
          reviewStatus: 'matched',
          source: 'ocr',
          brandName: 'Alkem Laboratories',
          image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&q=80',
        },
      ],
    },
    {
      id: 'rx-saved-2',
      name: 'Chronic Diabetic & BP Care (10 Jul)',
      uri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
      fileName: 'Rx_DrGupta_Diabetologist.pdf',
      fileSize: 1024 * 820,
      mimeType: 'application/pdf',
      uploadedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      doctorName: 'Dr. Anjali Gupta (DM, Endocrinology)',
      patientName: 'Aryan Kumar',
      prescriptionDate: '13 Aug 2026',
      status: 'verified',
      reviewStatus: 'saved',
      notes: 'Chronic care prescription for Glycomet & Telma.',
      detectedMedicines: [
        {
          id: 'det-4',
          medicineId: 'med-glycomet',
          name: 'Glycomet 500mg SR Tablet',
          composition: 'Metformin Hydrochloride 500mg',
          strength: '500mg',
          form: 'Tablet',
          dosageInstructions: '1 tablet twice daily with meals',
          suggestedRequirement: '30 tablets',
          availablePack: 'Strip of 20',
          quantity: 2,
          price: 52.0,
          mrp: 60.0,
          rxRequired: true,
          reviewStatus: 'matched',
          source: 'ocr',
          brandName: 'USV Ltd',
          image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80',
        },
        {
          id: 'det-5',
          medicineId: 'med-telma',
          name: 'Telma 40 Tablet',
          composition: 'Telmisartan 40mg',
          strength: '40mg',
          form: 'Tablet',
          dosageInstructions: '1 tablet once daily morning',
          suggestedRequirement: '30 tablets',
          availablePack: 'Strip of 30',
          quantity: 1,
          price: 198.0,
          mrp: 228.0,
          rxRequired: true,
          reviewStatus: 'matched',
          source: 'ocr',
          brandName: 'Glenmark',
          image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&q=80',
        },
      ],
    },
  ];

  static async getSavedPrescriptions(): Promise<Prescription[]> {
    try {
      const response = await apiClient.get<Prescription[]>('/prescriptions');
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        this.savedPrescriptions = response.data;
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      await this.delay(100);
      return [...this.savedPrescriptions];
    }
    return [];
  }

  static async uploadPrescription(
    uri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void
  ): Promise<Prescription> {
    try {
      onProgress?.(30);
      const response = await apiClient.post<Prescription>('/prescriptions/upload', {
        uri,
        fileName,
        mimeType,
      });
      onProgress?.(100);
      if (response.success && response.data) {
        this.savedPrescriptions.unshift(response.data);
        return response.data;
      }
    } catch {
      // fallback
    }

    if (ENV.ENABLE_MOCK_FALLBACK) {
      for (let progress = 10; progress <= 100; progress += 25) {
        await this.delay(80);
        onProgress?.(progress);
      }

      const detected = await this.simulatePrescriptionOCR(uri);

      const newPrescription: Prescription = {
        id: `rx-${Date.now()}`,
        uri,
        fileName,
        mimeType,
        uploadedAt: Date.now(),
        status: 'verified',
        reviewStatus: 'reviewed',
        doctorName: 'Dr. R. K. Sharma (MD, Physician)',
        patientName: 'Aryan Kumar',
        prescriptionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        notes: 'AI assisted extraction reviewed by user.',
        detectedMedicines: detected,
      };

      this.savedPrescriptions.unshift(newPrescription);
      return newPrescription;
    }

    throw new Error('Could not upload prescription');
  }

  /**
   * Simulates realistic assistive OCR extraction.
   * Produces Matched, Please Review, and Medicine Unclear items per specification.
   */
  static async simulatePrescriptionOCR(_uri: string): Promise<DetectedMedicine[]> {
    await this.delay(400);
    return [
      {
        id: `det-${Date.now()}-1`,
        medicineId: 'med-1',
        name: 'Dolo 650 Tablet',
        composition: 'Paracetamol 650mg',
        strength: '650mg',
        form: 'Tablet',
        dosageInstructions: '1 tablet twice daily for 5 days',
        suggestedRequirement: '10 tablets',
        availablePack: 'Strip of 15',
        quantity: 1,
        price: 30.5,
        mrp: 34.0,
        rxRequired: false,
        reviewStatus: 'matched',
        source: 'ocr',
        brandName: 'Micro Labs',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80',
      },
      {
        id: `det-${Date.now()}-2`,
        medicineId: 'med-azithral',
        name: 'Azithral 500 Tablet',
        composition: 'Azithromycin 500mg',
        strength: '500mg',
        form: 'Tablet',
        dosageInstructions: '1 tablet once daily for 3 days after food',
        suggestedRequirement: '3 tablets',
        availablePack: 'Strip of 5',
        quantity: 1,
        price: 118.0,
        mrp: 132.0,
        rxRequired: true,
        reviewStatus: 'matched',
        source: 'ocr',
        brandName: 'Alembic Pharmaceuticals',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=200&q=80',
      },
      {
        id: `det-${Date.now()}-3`,
        medicineId: 'med-pan40',
        name: 'Pantocid 40 Tablet',
        composition: 'Pantoprazole 40mg',
        strength: '40mg',
        form: 'Tablet',
        dosageInstructions: '1 tablet empty stomach once daily',
        suggestedRequirement: '5 tablets',
        availablePack: 'Strip of 15',
        quantity: 1,
        price: 142.0,
        mrp: 160.0,
        rxRequired: true,
        reviewStatus: 'review_needed',
        source: 'ocr',
        brandName: 'Sun Pharma',
        image: 'https://images.unsplash.com/photo-1550572017-edb79a557451?w=200&q=80',
      },
      {
        id: `det-${Date.now()}-4`,
        name: 'Unclear Medicine ("Azit...500")',
        composition: 'Antibiotic formulation (unconfirmed)',
        strength: '500mg',
        form: 'Tablet',
        dosageInstructions: '1 tablet daily',
        suggestedRequirement: '3 tablets',
        availablePack: 'Strip of 5',
        quantity: 1,
        price: 95.0,
        mrp: 110.0,
        rxRequired: true,
        reviewStatus: 'unclear',
        source: 'ocr',
        rawOcrText: 'Azit...500',
      },
    ];
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
