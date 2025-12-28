import { createContext, useContext, useState } from 'react'
import ErrorToast from '../components/ErrorToast'
import SuccessToast from '../components/SuccessToast'

const ErrorContext = createContext()

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const showError = (message) => {
    setError(message)
  }

  const hideError = () => {
    setError(null)
  }

  const showSuccess = (message) => {
    setSuccess(message)
  }

  const hideSuccess = () => {
    setSuccess(null)
  }

  return (
    <ErrorContext.Provider value={{ showError, hideError, showSuccess, hideSuccess }}>
      {children}
      {error && (
        <ErrorToast 
          message={error} 
          onClose={hideError}
          duration={5000}
        />
      )}
      {success && (
        <SuccessToast 
          message={success} 
          onClose={hideSuccess}
          duration={5000}
        />
      )}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within ErrorProvider')
  }
  return context
}

