'use client';

import { useEffect } from 'react';
import styles from './ErrorToast.module.css';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function ErrorToast({ message, onClose, duration = 5000 }: ErrorToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div className={styles.errorToastContainer}>
      <div className={styles.errorToast}>
        <div className={styles.errorToastContent}>
          <div className={styles.errorIcon}>⚠</div>
          <div className={styles.errorMessageText}>{message}</div>
          <button className={styles.errorCloseBtn} onClick={onClose}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

