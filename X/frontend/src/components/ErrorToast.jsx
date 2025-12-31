import { useEffect } from 'react'
import './ErrorToast.css'

function ErrorToast({ message, onClose, duration = 5000 }) {
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
    <div className="error-toast-container">
      <div className="error-toast">
        <div className="error-toast-content">
          <div className="error-icon">⚠</div>
          <div className="error-message-text">{message}</div>
          <button className="error-close-btn" onClick={onClose}>×</button>
        </div>
      </div>
    </div>
  )
}

export default ErrorToast

