'use client';

import { useEffect } from 'react';
import styles from './SuccessToast.module.css';

interface SuccessToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function SuccessToast({ message, onClose, duration = 5000 }: SuccessToastProps) {
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
    <div className={styles.successToastContainer}>
      <div className={styles.successToast}>
        <div className={styles.successToastContent}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successMessageText}>{message}</div>
          <button className={styles.successCloseBtn} onClick={onClose}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

