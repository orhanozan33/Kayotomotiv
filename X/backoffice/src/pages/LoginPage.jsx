import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { authAPI } from '../services/api'
import LanguageSwitcher from '../components/LanguageSwitcher'
import './LoginPage.css'

function LoginPage({ onLogin }) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      const { token, user } = response.data

      // Allow admin and user roles to login
      if (user.role !== 'admin' && user.role !== 'user') {
        setError('Yetkisiz erişim')
        return
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      onLogin(true)
    } catch (err) {
      // Handle error - convert object to string if needed
      let errorMessage = t('login.error')
      
      if (err.response?.data) {
        const errorData = err.response.data
        // If error is an object, extract message or stringify
        if (typeof errorData.error === 'object' && errorData.error !== null) {
          errorMessage = errorData.error.message || errorData.error.code || JSON.stringify(errorData.error)
        } else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>{t('login.title')}</h1>
          <LanguageSwitcher />
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <input
            type="email"
            placeholder={t('login.email')}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder={t('login.password')}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? t('login.loggingIn') : t('login.login')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

