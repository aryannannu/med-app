import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/feedback/Toast';
import { haptics } from '../services/hapticService';

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    actionLabel?: string,
    onAction?: () => void
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
    actionLabel?: string;
    onAction?: () => void;
  }>({
    visible: false,
    message: '',
    type: 'success',
    duration: 3000,
  });

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'success',
      duration = 3000,
      actionLabel?: string,
      onAction?: () => void
    ) => {
      // Trigger haptic feedback for meaningful toasts
      if (type === 'success') {
        haptics.success();
      } else if (type === 'error') {
        haptics.error();
      } else if (type === 'warning') {
        haptics.warning();
      } else if (type === 'info') {
        if (message.toLowerCase().includes('copied') || message.toLowerCase().includes('saved')) {
          haptics.light();
        }
      }

      setToastState({
        visible: true,
        message,
        type,
        duration,
        actionLabel,
        onAction,
      });
    },
    []
  );

  const handleDismiss = useCallback(() => {
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toastState.visible}
        message={toastState.message}
        type={toastState.type}
        duration={toastState.duration}
        actionLabel={toastState.actionLabel}
        onAction={toastState.onAction}
        onDismiss={handleDismiss}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
