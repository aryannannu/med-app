import { Prescription } from '../types/prescription';

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
    await this.delay(150);
    return [...this.savedPrescriptions];
  }

  static async uploadPrescription(
    uri: string,
    fileName: string,
    mimeType: string,
    onProgress?: (progress: number) => void
  ): Promise<Prescription> {
    // Simulate upload progress steps
    for (let progress = 10; progress <= 100; progress += 20) {
      await this.delay(100);
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

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
