import { useTranslation } from 'react-i18next'
import './ConfirmModal.css'

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title || t('common.confirm') || 'Onay'}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="confirm-modal-btn cancel" onClick={onClose}>
            {cancelText || t('common.cancel') || 'İptal'}
          </button>
          <button className={`confirm-modal-btn confirm ${type}`} onClick={onConfirm}>
            {confirmText || t('common.confirm') || 'Onayla'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

