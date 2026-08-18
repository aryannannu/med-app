export type PrescriptionStatus = 'uploading' | 'uploaded' | 'verified' | 'rejected' | 'unreadable';

export interface Prescription {
  id: string;
  uri: string;
  fileName: string;
  fileSize?: number;
  mimeType: string;
  uploadedAt: number;
  doctorName?: string;
  patientName?: string;
  prescriptionDate?: string;
  status: PrescriptionStatus;
  rejectionReason?: string;
  notes?: string;
}

export interface PrescriptionUploadProgress {
  prescriptionId: string;
  progressPercentage: number; // 0 - 100
  isComplete: boolean;
  error?: string;
}
