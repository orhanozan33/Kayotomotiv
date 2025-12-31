'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authAPI } from '@/lib/services/adminApi';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import styles from './login.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;

      // Allow admin and user roles to login
      if (user.role !== 'admin' && user.role !== 'user') {
        setError('Yetkisiz erişim');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Use window.location to force a full page reload and re-check auth
      window.location.href = '/admin-panel/dashboard';
    } catch (err: any) {
      let errorMessage = t('login.error') || 'Giriş başarısız';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData.error === 'object' && errorData.error !== null) {
          errorMessage = errorData.error.message || errorData.error.code || JSON.stringify(errorData.error);
        } else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <h1>{t('login.title') || 'Admin Girişi'}</h1>
          <LanguageSwitcher />
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <input
            type="email"
            placeholder={t('login.email') || 'E-posta'}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder={t('login.password') || 'Şifre'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? t('login.loggingIn') || 'Giriş yapılıyor...' : t('login.login') || 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}

