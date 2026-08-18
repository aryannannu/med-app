import { Prescription } from '../types/prescription';
import { apiClient } from './apiClient';
import { ENV } from '../config/env';

export class PrescriptionService {
  private static savedPrescriptions: Prescription[] = [
    {
      id: 'rx-saved-1',
      uri: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      fileName: 'Rx_DrMurthy_GeneralPhysician.jpg',
      fileSize: 1024 * 450,
      mimeType: 'image/jpeg',
      uploadedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      doctorName: 'Dr. K. Murthy (MD, Gen Med)',
      patientName: 'Rahul Sharma',
      prescriptionDate: '15 Aug 2026',
      status: 'verified',
      notes: 'Valid for 6 months. Contains Augmentin 625 & Pan-D.',
    },
    {
      id: 'rx-saved-2',
      uri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
      fileName: 'Rx_DrGupta_Diabetologist.pdf',
      fileSize: 1024 * 820,
      mimeType: 'application/pdf',
      uploadedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      doctorName: 'Dr. Anjali Gupta (DM, Endocrinology)',
      patientName: 'Rahul Sharma',
      prescriptionDate: '01 Aug 2026',
      status: 'verified',
      notes: 'Annual chronic prescription for Glycomet & Telma.',
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
      // Try multipart or base64 upload to server if configured
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
      for (let progress = 10; progress <= 100; progress += 20) {
        await this.delay(80);
        onProgress?.(progress);
      }

      const newPrescription: Prescription = {
        id: `rx-${Date.now()}`,
        uri,
        fileName,
        mimeType,
        uploadedAt: Date.now(),
        status: 'verified',
        doctorName: 'Dr. Verified Prescriber',
        patientName: 'Rahul Sharma',
        prescriptionDate: new Date().toLocaleDateString('en-IN'),
        notes: 'Uploaded and verified by system.',
      };

      this.savedPrescriptions.unshift(newPrescription);
      return newPrescription;
    }

    throw new Error('Could not upload prescription');
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
