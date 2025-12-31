'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ErrorToast from '@/components/ErrorToast';
import SuccessToast from '@/components/SuccessToast';

interface ErrorContextType {
  showError: (message: string) => void;
  hideError: () => void;
  showSuccess: (message: string) => void;
  hideSuccess: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
  };

  const hideError = () => {
    setError(null);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
  };

  const hideSuccess = () => {
    setSuccess(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError, showSuccess, hideSuccess }}>
      {children}
      {error && <ErrorToast message={error} onClose={hideError} duration={5000} />}
      {success && <SuccessToast message={success} onClose={hideSuccess} duration={5000} />}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}

