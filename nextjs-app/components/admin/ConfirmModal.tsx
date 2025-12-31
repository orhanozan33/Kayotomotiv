'use client';

import { useTranslation } from 'react-i18next';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'success';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger',
}: ConfirmModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className={styles.confirmModalOverlay} onClick={onClose}>
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.confirmModalHeader}>
          <h3>{title || t('common.confirm') || 'Onay'}</h3>
        </div>
        <div className={styles.confirmModalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.confirmModalFooter}>
          <button className={`${styles.confirmModalBtn} ${styles.cancel}`} onClick={onClose}>
            {cancelText || t('common.cancel') || 'İptal'}
          </button>
          <button className={`${styles.confirmModalBtn} ${styles.confirm} ${styles[type]}`} onClick={onConfirm}>
            {confirmText || t('common.confirm') || 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  );
}

