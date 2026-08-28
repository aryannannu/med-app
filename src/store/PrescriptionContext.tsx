import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Prescription, DetectedMedicine } from '../types/prescription';
import { PrescriptionService } from '../services/prescriptionService';

export interface ScanSession {
  imageUri: string | null;
  detectedMedicines: DetectedMedicine[];
  isProcessing: boolean;
  processingStage: number; // 1: Reading names, 2: Checking strengths, 3: Preparing list
  lastRemovedMedicine: { medicine: DetectedMedicine; index: number } | null;
}

interface PrescriptionContextType {
  prescriptions: Prescription[];
  activePrescription: Prescription | null;
  isLoading: boolean;
  scanSession: ScanSession;
  startScanSession: (uri: string) => Promise<DetectedMedicine[]>;
  loadScanSession: (uri: string, medicines: DetectedMedicine[]) => void;
  resetScanSession: () => void;
  updateMedicineQuantity: (id: string, qty: number) => void;
  editDetectedMedicine: (id: string, updated: Partial<DetectedMedicine>) => void;
  addMissingMedicine: (medicine: DetectedMedicine) => void;
  removeDetectedMedicine: (id: string) => DetectedMedicine | null;
  undoRemoveMedicine: () => void;
  clearLastRemoved: () => void;
  savePrescriptionForLater: (imageUri?: string, medicines?: DetectedMedicine[], existingId?: string, customName?: string) => Promise<Prescription>;
  updatePrescriptionName: (id: string, name: string) => void;
  uploadPrescription: (uri: string, fileName: string, mimeType: string, onProgress?: (p: number) => void) => Promise<Prescription>;
  selectActivePrescription: (rx: Prescription | null) => void;
  removePrescription: (id: string) => void;
  getPrescriptionById: (id: string) => Prescription | undefined;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

export const PrescriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [scanSession, setScanSession] = useState<ScanSession>({
    imageUri: null,
    detectedMedicines: [],
    isProcessing: false,
    processingStage: 1,
    lastRemovedMedicine: null,
  });

  useEffect(() => {
    PrescriptionService.getSavedPrescriptions().then((list) => {
      setPrescriptions(list);
      if (list.length > 0) {
        setActivePrescription(list[0]);
      }
      setIsLoading(false);
    });
  }, []);

  const startScanSession = useCallback(async (uri: string): Promise<DetectedMedicine[]> => {
    setScanSession({
      imageUri: uri,
      detectedMedicines: [],
      isProcessing: true,
      processingStage: 1,
      lastRemovedMedicine: null,
    });

    // Stage 1 -> 2
    await new Promise((r) => setTimeout(r, 900));
    setScanSession((prev) => ({ ...prev, processingStage: 2 }));

    // Stage 2 -> 3
    await new Promise((r) => setTimeout(r, 900));
    setScanSession((prev) => ({ ...prev, processingStage: 3 }));

    // Stage 3 -> Results
    await new Promise((r) => setTimeout(r, 800));
    const detected = await PrescriptionService.simulatePrescriptionOCR(uri);

    setScanSession((prev) => ({
      ...prev,
      detectedMedicines: detected,
      isProcessing: false,
      processingStage: 3,
    }));

    return detected;
  }, []);

  const loadScanSession = useCallback((uri: string, medicines: DetectedMedicine[]) => {
    setScanSession({
      imageUri: uri,
      detectedMedicines: medicines,
      isProcessing: false,
      processingStage: 3,
      lastRemovedMedicine: null,
    });
  }, []);

  const resetScanSession = useCallback(() => {
    setScanSession({
      imageUri: null,
      detectedMedicines: [],
      isProcessing: false,
      processingStage: 1,
      lastRemovedMedicine: null,
    });
  }, []);

  const updateMedicineQuantity = useCallback((id: string, qty: number) => {
    if (qty < 1) return;
    setScanSession((prev) => ({
      ...prev,
      detectedMedicines: prev.detectedMedicines.map((m) => (m.id === id ? { ...m, quantity: qty } : m)),
    }));
  }, []);

  const editDetectedMedicine = useCallback((id: string, updated: Partial<DetectedMedicine>) => {
    setScanSession((prev) => ({
      ...prev,
      detectedMedicines: prev.detectedMedicines.map((m) =>
        m.id === id ? { ...m, ...updated, source: 'edited', reviewStatus: 'matched' } : m
      ),
    }));
  }, []);

  const addMissingMedicine = useCallback((medicine: DetectedMedicine) => {
    setScanSession((prev) => ({
      ...prev,
      detectedMedicines: [...prev.detectedMedicines, { ...medicine, source: 'manual', reviewStatus: 'matched' }],
    }));
  }, []);

  const removeDetectedMedicine = useCallback((id: string): DetectedMedicine | null => {
    let removedItem: DetectedMedicine | null = null;
    setScanSession((prev) => {
      const index = prev.detectedMedicines.findIndex((m) => m.id === id);
      if (index === -1) return prev;
      removedItem = prev.detectedMedicines[index];
      const remaining = prev.detectedMedicines.filter((m) => m.id !== id);
      return {
        ...prev,
        detectedMedicines: remaining,
        lastRemovedMedicine: { medicine: removedItem, index },
      };
    });
    return removedItem;
  }, []);

  const undoRemoveMedicine = useCallback(() => {
    setScanSession((prev) => {
      if (!prev.lastRemovedMedicine) return prev;
      const { medicine, index } = prev.lastRemovedMedicine;
      const updated = [...prev.detectedMedicines];
      const insertAt = Math.min(index, updated.length);
      updated.splice(insertAt, 0, medicine);
      return {
        ...prev,
        detectedMedicines: updated,
        lastRemovedMedicine: null,
      };
    });
  }, []);

  const clearLastRemoved = useCallback(() => {
    setScanSession((prev) => ({ ...prev, lastRemovedMedicine: null }));
  }, []);

  const savePrescriptionForLater = useCallback(
    async (
      imageUri?: string,
      medicines?: DetectedMedicine[],
      existingId?: string,
      customName?: string
    ): Promise<Prescription> => {
      const uri = imageUri || scanSession.imageUri || 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&q=80';
      const medsToSave = medicines || scanSession.detectedMedicines;

      // Smart default prescription title
      const firstMed = medsToSave[0]?.name ? medsToSave[0].name.split(' ')[0] : 'General';
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const defaultTitle = `${firstMed} Care (${dateStr})`;

      if (existingId) {
        // Update existing prescription
        setPrescriptions((prev) =>
          prev.map((rx) =>
            rx.id === existingId
              ? {
                  ...rx,
                  name: customName || rx.name || defaultTitle,
                  detectedMedicines: medsToSave,
                  reviewStatus: 'saved',
                }
              : rx
          )
        );
        const existing = prescriptions.find((p) => p.id === existingId);
        return (
          existing || {
            id: existingId,
            name: customName || defaultTitle,
            uri,
            fileName: 'Updated_Prescription.jpg',
            mimeType: 'image/jpeg',
            uploadedAt: Date.now(),
            status: 'verified',
            reviewStatus: 'saved',
            detectedMedicines: medsToSave,
          }
        );
      }

      const newRx: Prescription = {
        id: `rx-${Date.now()}`,
        name: customName || defaultTitle,
        uri,
        fileName: `Prescription_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.jpg`,
        mimeType: 'image/jpeg',
        uploadedAt: Date.now(),
        status: 'verified',
        reviewStatus: 'saved',
        doctorName: 'Dr. Physician (Verified)',
        patientName: 'Aryan Kumar',
        prescriptionDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        notes: 'Saved for later order.',
        detectedMedicines: medsToSave,
      };

      setPrescriptions((prev) => [newRx, ...prev]);
      setActivePrescription(newRx);
      return newRx;
    },
    [scanSession, prescriptions]
  );

  const updatePrescriptionName = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPrescriptions((prev) =>
      prev.map((rx) => (rx.id === id ? { ...rx, name: trimmed } : rx))
    );
    setActivePrescription((prev) =>
      prev && prev.id === id ? { ...prev, name: trimmed } : prev
    );
  }, []);

  const uploadPrescription = useCallback(
    async (uri: string, fileName: string, mimeType: string, onProgress?: (p: number) => void) => {
      const newRx = await PrescriptionService.uploadPrescription(uri, fileName, mimeType, onProgress);
      setPrescriptions((prev) => [newRx, ...prev]);
      setActivePrescription(newRx);
      return newRx;
    },
    []
  );

  const selectActivePrescription = useCallback((rx: Prescription | null) => {
    setActivePrescription(rx);
  }, []);

  const removePrescription = useCallback((id: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    setActivePrescription((prev) => (prev?.id === id ? null : prev));
  }, []);

  const getPrescriptionById = useCallback(
    (id: string) => {
      return prescriptions.find((p) => p.id === id);
    },
    [prescriptions]
  );

  return (
    <PrescriptionContext.Provider
      value={{
        prescriptions,
        activePrescription,
        isLoading,
        scanSession,
        startScanSession,
        loadScanSession,
        resetScanSession,
        updateMedicineQuantity,
        editDetectedMedicine,
        addMissingMedicine,
        removeDetectedMedicine,
        undoRemoveMedicine,
        clearLastRemoved,
        savePrescriptionForLater,
        updatePrescriptionName,
        uploadPrescription,
        selectActivePrescription,
        removePrescription,
        getPrescriptionById,
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
};

export const usePrescription = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescription must be used within a PrescriptionProvider');
  }
  return context;
};

