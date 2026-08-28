export type PrescriptionStatus = 'uploading' | 'uploaded' | 'verified' | 'rejected' | 'unreadable';

export type MedicineDetectionStatus = 'matched' | 'review_needed' | 'unclear';
export type MedicineDetectionSource = 'ocr' | 'manual' | 'edited';

export interface DetectedMedicine {
  id: string;
  medicineId?: string; // Mapped catalog medicine ID if matched
  name: string;
  composition: string;
  strength: string;
  form: string;
  dosageInstructions?: string; // e.g. "1 tablet twice daily for 5 days"
  suggestedRequirement?: string; // e.g. "10 tablets"
  availablePack: string; // e.g. "Strip of 15"
  quantity: number; // purchasable pack quantity
  price: number;
  mrp: number;
  rxRequired: boolean;
  reviewStatus: MedicineDetectionStatus; // 'matched' | 'review_needed' | 'unclear'
  source: MedicineDetectionSource; // 'ocr' | 'manual' | 'edited'
  rawOcrText?: string; // Original extracted OCR text for assistance
  image?: string;
  brandName?: string;
}

export interface Prescription {
  id: string;
  name?: string; // User-facing prescription title e.g. "Viral Fever - 29 Aug"
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
  detectedMedicines?: DetectedMedicine[];
  reviewStatus?: 'draft' | 'reviewed' | 'saved' | 'ordered';
  isClarificationNeeded?: boolean;
  clarificationMessage?: string;
}

export interface PrescriptionUploadProgress {
  prescriptionId: string;
  progressPercentage: number; // 0 - 100
  isComplete: boolean;
  error?: string;
}

