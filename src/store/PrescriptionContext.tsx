import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Prescription } from '../types/prescription';
import { PrescriptionService } from '../services/prescriptionService';

interface PrescriptionContextType {
  prescriptions: Prescription[];
  activePrescription: Prescription | null;
  isLoading: boolean;
  uploadPrescription: (uri: string, fileName: string, mimeType: string, onProgress?: (p: number) => void) => Promise<Prescription>;
  selectActivePrescription: (rx: Prescription | null) => void;
  removePrescription: (id: string) => void;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

export const PrescriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    PrescriptionService.getSavedPrescriptions().then((list) => {
      setPrescriptions(list);
      if (list.length > 0) {
        setActivePrescription(list[0]);
      }
      setIsLoading(false);
    });
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

  return (
    <PrescriptionContext.Provider
      value={{
        prescriptions,
        activePrescription,
        isLoading,
        uploadPrescription,
        selectActivePrescription,
        removePrescription,
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
