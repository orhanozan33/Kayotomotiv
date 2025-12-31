import { useEffect } from 'react'
import './SuccessToast.css'

function SuccessToast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!message) return null

  return (
    <div className="success-toast-container">
      <div className="success-toast">
        <div className="success-toast-content">
          <div className="success-icon">✓</div>
          <div className="success-message-text">{message}</div>
          <button className="success-close-btn" onClick={onClose}>×</button>
        </div>
      </div>
    </div>
  )
}

export default SuccessToast

