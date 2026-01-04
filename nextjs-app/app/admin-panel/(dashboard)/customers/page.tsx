'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { adminCustomersAPI } from '@/lib/services/adminApi';
import CustomerDetailModal from '@/components/admin/CustomerDetailModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { carBrandsAndModels, years } from '@/lib/data/carBrands';
import styles from './customers.module.css';

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
  total_spent?: number | string;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: string;
  license_plate: string;
  notes: string;
}

export default function CustomersPage() {
  const { t } = useTranslation('common');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteCustomerModal, setDeleteCustomerModal] = useState<{ isOpen: boolean; customerId: number | null }>({ isOpen: false, customerId: null });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    license_plate: '',
    notes: '',
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await adminCustomersAPI.getAll(params).catch((err) => {
        console.error('Error loading customers:', err);
        return { data: { customers: [] } };
      });
      setCustomers(response.data?.customers || []);
    } catch (error: unknown) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delay = searchTerm ? 500 : 0;
    const timer = setTimeout(() => {
      loadCustomers();
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, loadCustomers]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'vehicle_brand') {
      setFormData(prev => ({
        ...prev,
        vehicle_brand: value,
        vehicle_model: '',
      }));
      setAvailableModels(value ? carBrandsAndModels[value] || [] : []);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        vehicle_brand: formData.vehicle_brand || null,
        vehicle_model: formData.vehicle_model || null,
        vehicle_year: formData.vehicle_year ? parseInt(formData.vehicle_year) : null,
        license_plate: formData.license_plate.trim() || null,
        notes: formData.notes.trim() || null,
      };

      await adminCustomersAPI.create(submitData);
      showSuccessMessage(t('customers.createdSuccessfully') || 'Customer created successfully!');
      setShowForm(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        vehicle_brand: '',
        vehicle_model: '',
        vehicle_year: '',
        license_plate: '',
        notes: '',
      });
      setAvailableModels([]);
      loadCustomers();
    } catch (error: unknown) {
      console.error('Error creating customer:', error);
      const errorMessage = (error as { response?: { data?: { error?: string; message?: string } }; message?: string })?.response?.data?.error || (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as { message?: string })?.message;
      showError('Error creating customer: ' + errorMessage);
    }
  };

  const handleCustomerClick = async (customer: Customer) => {
    try {
      const response = await adminCustomersAPI.getById(customer.id.toString());
      setSelectedCustomer(response.data.customer);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError((t('customers.errors.loadingDetails') || 'Error loading details') + ': ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCloseModal = () => {
    setSelectedCustomer(null);
    loadCustomers();
  };

  const handleCustomerUpdate = async () => {
    if (selectedCustomer) {
      try {
        const response = await adminCustomersAPI.getById(selectedCustomer.id.toString());
        setSelectedCustomer(response.data.customer);
      } catch (error) {
        console.error('Error reloading customer:', error);
      }
    }
    loadCustomers();
  };

  const handleDelete = (id: number) => {
    setDeleteCustomerModal({ isOpen: true, customerId: id });
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteCustomerModal.customerId) return;
    try {
      await adminCustomersAPI.delete(deleteCustomerModal.customerId.toString());
      setDeleteCustomerModal({ isOpen: false, customerId: null });
      loadCustomers();
      showSuccessMessage(t('customers.deletedSuccessfully') || 'Customer deleted successfully!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError((t('customers.errors.deleting') || 'Error deleting') + ': ' + (err.response?.data?.error || err.message));
      setDeleteCustomerModal({ isOpen: false, customerId: null });
    }
  };

  return (
    <div className={styles.customersPage}>
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
      {success && (
        <div className={styles.successToast}>
          <div className={styles.successToastContent}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successMessageText}>{success}</div>
            <button className={styles.successCloseBtn} onClick={() => setSuccess(null)}>
              ×
            </button>
          </div>
        </div>
      )}
      <div className={styles.pageHeader}>
        <h1>{t('customers.title') || 'Müşteri Kayıt'}</h1>
        <button onClick={() => setShowForm(true)} className={styles.btnPrimary}>
          {t('customers.addCustomer') || 'Müşteri Ekle'}
        </button>
      </div>

      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder={t('customers.search') || 'Ara...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{t('customers.form.title') || 'Yeni Müşteri'}</h2>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => {
                setShowForm(false);
                setFormData({
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone: '',
                  address: '',
                  vehicle_brand: '',
                  vehicle_model: '',
                  vehicle_year: '',
                  license_plate: '',
                  notes: '',
                });
                setAvailableModels([]);
              }}
            >
              ×
            </button>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <input
                  name="first_name"
                  placeholder={t('customers.form.firstName') || 'Ad'}
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  name="last_name"
                  placeholder={t('customers.form.lastName') || 'Soyad'}
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t('customers.form.email') || 'E-posta'}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={t('customers.form.phone') || 'Telefon'}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <select name="vehicle_brand" value={formData.vehicle_brand} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="">{t('customers.form.selectBrand') || 'Marka Seç'}</option>
                  {Object.keys(carBrandsAndModels)
                    .sort()
                    .map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                </select>
                <select
                  name="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  disabled={!formData.vehicle_brand}
                >
                  <option value="">{t('customers.form.selectModel') || 'Model Seç'}</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <select name="vehicle_year" value={formData.vehicle_year} onChange={handleInputChange} className={styles.formSelect}>
                  <option value="">{t('customers.form.selectYear') || 'Yıl Seç'}</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <input
                  name="license_plate"
                  placeholder={t('customers.form.licensePlate') || 'Plaka'}
                  value={formData.license_plate}
                  onChange={handleInputChange}
                />
              </div>
              <textarea
                name="address"
                placeholder={t('customers.form.address') || 'Adres'}
                value={formData.address}
                onChange={handleInputChange}
                rows={2}
              />
              <textarea
                name="notes"
                placeholder={t('customers.form.notes') || 'Notlar'}
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
              />
              <div className={styles.modalActions}>
                <button type="submit">{t('customers.form.create') || 'Oluştur'}</button>
                <button type="button" onClick={() => setShowForm(false)}>
                  {t('customers.form.cancel') || 'İptal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailModal customer={selectedCustomer} onClose={handleCloseModal} onUpdate={handleCustomerUpdate} />
      )}

      {loading ? (
        <div className={styles.loading}>{t('customers.loading') || 'Yükleniyor...'}</div>
      ) : customers.length === 0 ? (
        <div className={styles.noResults}>{t('customers.noResults') || 'Sonuç bulunamadı'}</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className={styles.customersTableContainer}>
            <table className={styles.customersTable}>
              <thead>
                <tr>
                  <th>{t('customers.name') || 'İsim'}</th>
                  <th>{t('customers.email') || 'E-posta'}</th>
                  <th>{t('customers.phone') || 'Telefon'}</th>
                  <th>{t('customers.vehicle') || 'Araç'}</th>
                  <th>{t('customers.totalSpent') || 'Toplam Harcama'}</th>
                  <th>{t('customers.actions') || 'İşlemler'}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>
                      {customer.vehicle_brand && customer.vehicle_model
                        ? `${customer.vehicle_brand} ${customer.vehicle_model} ${customer.vehicle_year || ''}`
                        : '-'}
                    </td>
                    <td>${parseFloat((customer.total_spent || 0).toString()).toFixed(2)}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button onClick={() => handleCustomerClick(customer)} className={styles.btnView}>
                          {t('customers.viewDetails') || 'Detaylar'}
                        </button>
                        <button onClick={() => handleDelete(customer.id)} className={styles.btnDanger}>
                          {t('customers.delete') || 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.mobileCustomersList}>
            {customers.map((customer) => (
              <div key={customer.id} className={styles.customerCard}>
                <div className={styles.customerCardHeader}>
                  <div>
                    <h3 className={styles.customerCardName}>
                      {customer.first_name} {customer.last_name}
                    </h3>
                  </div>
                  <div className={styles.customerCardActions}>
                    <button
                      onClick={() => handleCustomerClick(customer)}
                      className={styles.btnView}
                    >
                      {t('customers.viewDetails') || 'Detaylar'}
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className={styles.btnDelete}
                    >
                      {t('customers.delete') || 'Sil'}
                    </button>
                  </div>
                </div>
                <div className={styles.customerCardDetails}>
                  {customer.phone && (
                    <div className={styles.customerCardDetail}>
                      <span className={styles.detailLabel}>📞</span>
                      <span className={styles.detailValue}>{customer.phone}</span>
                    </div>
                  )}
                  {customer.vehicle_brand && customer.vehicle_model && (
                    <div className={styles.customerCardDetail}>
                      <span className={styles.detailLabel}>🚗</span>
                      <span className={styles.detailValue}>
                        {customer.vehicle_brand} {customer.vehicle_model} {customer.vehicle_year || ''}
                      </span>
                    </div>
                  )}
                  <div className={styles.customerCardDetail}>
                    <span className={styles.detailLabel}>💰</span>
                    <span className={styles.detailValue}>
                      ${parseFloat((customer.total_spent || 0).toString()).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={deleteCustomerModal.isOpen}
        onClose={() => setDeleteCustomerModal({ isOpen: false, customerId: null })}
        onConfirm={confirmDeleteCustomer}
        title={t('customers.confirmDeleteTitle') || 'Müşteriyi Sil'}
        message={t('customers.confirmDelete') || 'Bu müşteriyi silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />
    </div>
  );
}
