'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminCustomersAPI, adminRepairAPI, adminCarWashAPI, adminSettingsAPI, adminReceiptsAPI } from '@/lib/services/adminApi';
import { carBrandsAndModels, years } from '@/lib/data/carBrands';
import ConfirmModal from './ConfirmModal';
import styles from './CustomerDetailModal.module.css';

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  vehicle_brand?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: number | null;
  license_plate?: string | null;
  notes?: string | null;
  vehicles?: any[];
  serviceRecords?: any[];
  total_spent?: number | string;
  stats?: any;
}

interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CustomerDetailModal({ customer, onClose, onUpdate }: CustomerDetailModalProps) {
  const { t } = useTranslation('common');
  const [customerData, setCustomerData] = useState<Customer>(customer);
  const [activeTab, setActiveTab] = useState<'details' | 'vehicles' | 'services' | 'stats'>('details');
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  useEffect(() => {
    if (customer) {
      setCustomerData(customer);
    }
  }, [customer]);

  const displayCustomer = customerData || customer;

  if (!displayCustomer) return null;

  return (
    <div className={styles.customerDetailModal}>
      <div className={styles.modalOverlay} onClick={onClose}></div>
      <div className={styles.modalContentLarge}>
        <div className={styles.modalHeader}>
          <h2>
            {displayCustomer.first_name} {displayCustomer.last_name}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalTabs}>
          <button className={activeTab === 'details' ? styles.active : ''} onClick={() => setActiveTab('details')}>
            {t('customers.detail.details') || 'Detaylar'}
          </button>
          <button className={activeTab === 'vehicles' ? styles.active : ''} onClick={() => setActiveTab('vehicles')}>
            {t('customers.detail.vehicles') || 'Araçlar'} ({displayCustomer.vehicles?.length || 0})
          </button>
          <button className={activeTab === 'services' ? styles.active : ''} onClick={() => setActiveTab('services')}>
            {t('customers.detail.services') || 'Hizmetler'} ({displayCustomer.serviceRecords?.length || 0})
          </button>
          <button className={activeTab === 'stats' ? styles.active : ''} onClick={() => setActiveTab('stats')}>
            {t('customers.detail.stats') || 'İstatistikler'}
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && (
            <div className={styles.errorToast}>
              <div className={styles.errorToastContent}>
                <div className={styles.errorIcon}>⚠</div>
                <div className={styles.errorMessageText}>{error}</div>
                <button className={styles.errorCloseBtn} onClick={() => setError(null)}>
                  ×
                </button>
              </div>
            </div>
          )}
          {activeTab === 'details' && (
            <div className={styles.tabContent}>
              <div className={styles.detailSection}>
                <h3>{t('customers.detail.personalInfo') || 'Kişisel Bilgiler'}</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>{t('customers.detail.firstName') || 'Ad'}:</label>
                    <span>{displayCustomer.first_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('customers.detail.lastName') || 'Soyad'}:</label>
                    <span>{displayCustomer.last_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('customers.detail.email') || 'E-posta'}:</label>
                    <span>{displayCustomer.email || '-'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('customers.detail.phone') || 'Telefon'}:</label>
                    <span>{displayCustomer.phone || '-'}</span>
                  </div>
                </div>
              </div>
              {displayCustomer.notes && (
                <div className={styles.detailSection}>
                  <h3>{t('customers.detail.notes') || 'Notlar'}</h3>
                  <p>{displayCustomer.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className={styles.tabContent}>
              <h3>{t('customers.detail.customerVehicles') || 'Müşteri Araçları'}</h3>
              {displayCustomer.vehicles && displayCustomer.vehicles.length > 0 ? (
                <div className={styles.vehiclesList}>
                  {displayCustomer.vehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className={styles.vehicleCard}>
                      <h4>
                        {vehicle.brand} {vehicle.model} {vehicle.year || ''}
                      </h4>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t('customers.detail.noVehicles') || 'Araç bulunamadı'}</p>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className={styles.tabContent}>
              <h3>{t('customers.detail.serviceHistory') || 'Hizmet Geçmişi'}</h3>
              {displayCustomer.serviceRecords && displayCustomer.serviceRecords.length > 0 ? (
                <div className={styles.servicesList}>
                  {displayCustomer.serviceRecords.map((record: any) => (
                    <div key={record.id} className={styles.serviceRecord}>
                      <span>{new Date(record.performed_date).toLocaleDateString()}</span>
                      <span>
                        <strong>{record.service_name}</strong>
                      </span>
                      <span>${parseFloat(record.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t('customers.detail.noServices') || 'Hizmet bulunamadı'}</p>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className={styles.tabContent}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>{t('customers.detail.totalSpent') || 'Toplam Harcama'}</h3>
                  <p className={styles.statValue}>${parseFloat((displayCustomer.total_spent || 0).toString()).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

