'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useError } from '@/contexts/ErrorContext';
import { adminSettingsAPI as settingsAPI } from '@/lib/services/adminApi';
import styles from '../settings.module.css';

export default function CompanyInfoPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    tps_percentage: '',
    tps_number: '',
    tvq_percentage: '',
    tvq_number: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      if (response.data?.settings) {
        const logoUrl = response.data.settings.company_logo_url || '';
        setCompanyInfo({
          company_name: response.data.settings.company_name || '',
          company_address: response.data.settings.company_address || '',
          company_phone: response.data.settings.company_phone || '',
          tps_percentage: response.data.settings.tps_percentage || '',
          tps_number: response.data.settings.tps_number || '',
          tvq_percentage: response.data.settings.tvq_percentage || '',
          tvq_number: response.data.settings.tvq_number || ''
        });
      }
    } catch (error) {
      console.error('Error loading company info:', error);
      showError(t('settings.errors.loadingCompanyInfo') || 'Şirket bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanyInfo = async () => {
    try {
      await settingsAPI.updateSettings({
        company_name: companyInfo.company_name || '',
        company_address: companyInfo.company_address || '',
        company_phone: companyInfo.company_phone || '',
        tps_percentage: companyInfo.tps_percentage || '',
        tps_number: companyInfo.tps_number || '',
        tvq_percentage: companyInfo.tvq_percentage || '',
        tvq_number: companyInfo.tvq_number || ''
      });
      showSuccess(t('settings.companyInfoSaved'));
      router.push('/admin-panel/settings');
    } catch (error: any) {
      showError(t('settings.errors.savingCompanyInfo') + ' ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className={styles.loading}>{t('common.loading')}</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.pageHeader}>
        <h1>{t('settings.companyInfoForReceipt')}</h1>
        <button 
          onClick={() => router.push('/admin-panel/settings')}
          className={styles.btnSecondary}
        >
          {t('common.back') || 'Geri'}
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className={styles.formGroup}>
          <label>{t('settings.companyName')}</label>
          <input
            type="text"
            placeholder={t('settings.companyNamePlaceholder')}
            value={companyInfo.company_name}
            onChange={(e) => setCompanyInfo({ ...companyInfo, company_name: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('settings.address')}</label>
          <textarea
            placeholder={t('settings.addressPlaceholder')}
            value={companyInfo.company_address}
            onChange={(e) => setCompanyInfo({ ...companyInfo, company_address: e.target.value })}
            rows={3}
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('settings.phone')}</label>
          <input
            type="tel"
            placeholder={t('settings.phonePlaceholder2')}
            value={companyInfo.company_phone}
            onChange={(e) => setCompanyInfo({ ...companyInfo, company_phone: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('settings.tpsPercentage') || 'TPS Yüzde (%)'}</label>
          <input
            type="number"
            step="0.01"
            placeholder={t('settings.tpsPercentagePlaceholder') || 'Örn: 5.00'}
            value={companyInfo.tps_percentage}
            onChange={(e) => setCompanyInfo({ ...companyInfo, tps_percentage: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('settings.tpsNumber') || 'TPS Numarası'}</label>
          <input
            type="text"
            placeholder={t('settings.tpsNumberPlaceholder') || 'TPS numarasını girin'}
            value={companyInfo.tps_number}
            onChange={(e) => setCompanyInfo({ ...companyInfo, tps_number: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('settings.tvqPercentage') || 'TVQ Yüzde (%)'}</label>
          <input
            type="number"
            step="0.01"
            placeholder={t('settings.tvqPercentagePlaceholder') || 'Örn: 9.97'}
            value={companyInfo.tvq_percentage}
            onChange={(e) => setCompanyInfo({ ...companyInfo, tvq_percentage: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('settings.tvqNumber') || 'TVQ Numarası'}</label>
          <input
            type="text"
            placeholder={t('settings.tvqNumberPlaceholder') || 'TVQ numarasını girin'}
            value={companyInfo.tvq_number}
            onChange={(e) => setCompanyInfo({ ...companyInfo, tvq_number: e.target.value })}
          />
        </div>
        <div className={styles.modalActions} style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
          <button onClick={handleSaveCompanyInfo} className={styles.btnPrimary}>{t('common.save')}</button>
          <button onClick={() => router.push('/admin-panel/settings')}>{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

