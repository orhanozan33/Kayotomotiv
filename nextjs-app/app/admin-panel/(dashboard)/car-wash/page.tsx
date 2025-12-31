'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { adminCarWashAPI, adminSettingsAPI, adminReceiptsAPI } from '@/lib/services/adminApi';
import ConfirmModal from '@/components/admin/ConfirmModal';
import styles from './car-wash.module.css';

interface Package {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  duration_minutes: number | null;
  display_order: number;
  is_active: boolean;
}

interface Addon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  display_order: number;
  is_active: boolean;
}

interface Appointment {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  package_name: string;
  appointment_date: string;
  appointment_time: string;
  total_price: number;
  status: string;
  notes: string | null;
  user_id?: string | null;
}

export default function CarWashPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'addons' | 'appointments'>('packages');
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [deletePackageModal, setDeletePackageModal] = useState({ isOpen: false, packageId: null as string | null });
  const [deleteAddonModal, setDeleteAddonModal] = useState({ isOpen: false, addonId: null as string | null });
  const [detailPackageModal, setDetailPackageModal] = useState({ isOpen: false, package: null as Package | null });
  const [detailAddonModal, setDetailAddonModal] = useState({ isOpen: false, addon: null as Addon | null });
  const [packageFormData, setPackageFormData] = useState({
    name: '', description: '', base_price: '', duration_minutes: '', display_order: '0', is_active: true
  });
  const [addonFormData, setAddonFormData] = useState({
    name: '', description: '', price: '', display_order: '0', is_active: true
  });
  const [taxRate, setTaxRate] = useState(0);
  const [federalTaxRate, setFederalTaxRate] = useState(0);
  const [provincialTaxRate, setProvincialTaxRate] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [packagesRes, addonsRes, appointmentsRes] = await Promise.all([
        adminCarWashAPI.getPackages().catch(err => {
          console.error('Error loading packages:', err);
          return { data: { packages: [] } };
        }),
        adminCarWashAPI.getAddons().catch(err => {
          console.error('Error loading addons:', err);
          return { data: { addons: [] } };
        }),
        adminCarWashAPI.getAppointments().catch(err => {
          console.error('Error loading appointments:', err);
          return { data: { appointments: [] } };
        })
      ]);
      setPackages(packagesRes.data?.packages || []);
      setAddons(addonsRes.data?.addons || []);
      setAppointments(appointmentsRes.data?.appointments || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setPackages([]);
      setAddons([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadTaxRate();
  }, [loadData]);

  const loadTaxRate = async () => {
    try {
      const response = await adminSettingsAPI.getSettings();
      if (response.data?.settings) {
        const settings = response.data.settings;
        setTaxRate(parseFloat(settings.tax_rate || '0'));
        setFederalTaxRate(parseFloat(settings.federal_tax_rate || '0'));
        setProvincialTaxRate(parseFloat(settings.provincial_tax_rate || '0'));
      }
    } catch (error) {
      console.error('Error loading tax rate:', error);
    }
  };

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...packageFormData,
        base_price: parseFloat(packageFormData.base_price),
        duration_minutes: packageFormData.duration_minutes ? parseInt(packageFormData.duration_minutes) : null,
        display_order: parseInt(packageFormData.display_order)
      };
      if (editingPackage) {
        await adminCarWashAPI.updatePackage(editingPackage.id, data);
      } else {
        await adminCarWashAPI.createPackage(data);
      }
      setShowPackageForm(false);
      setEditingPackage(null);
      showSuccess(t('adminCarWash.packageSavedSuccessfully') || 'Paket başarıyla kaydedildi!');
      loadData();
    } catch (error: any) {
      showError(t('adminCarWash.errors.savingPackage') || 'Paket kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAddonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...addonFormData,
        price: parseFloat(addonFormData.price),
        display_order: parseInt(addonFormData.display_order)
      };
      if (editingAddon) {
        await adminCarWashAPI.updateAddon(editingAddon.id, data);
      } else {
        await adminCarWashAPI.createAddon(data);
      }
      setShowAddonForm(false);
      setEditingAddon(null);
      showSuccess(t('adminCarWash.addonSavedSuccessfully') || 'Eklenti başarıyla kaydedildi!');
      loadData();
    } catch (error: any) {
      showError(t('adminCarWash.errors.savingAddon') || 'Eklenti kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDeletePackage = async () => {
    if (!deletePackageModal.packageId) return;
    try {
      await adminCarWashAPI.deletePackage(deletePackageModal.packageId);
      showSuccess(t('adminCarWash.packageDeletedSuccessfully') || 'Paket başarıyla silindi!');
      setDeletePackageModal({ isOpen: false, packageId: null });
      loadData();
    } catch (error: any) {
      showError(t('adminCarWash.errors.deletingPackage') || 'Paket silinirken hata oluştu: ' + (error.response?.data?.error || error.message));
      setDeletePackageModal({ isOpen: false, packageId: null });
    }
  };

  const handleDeleteAddon = async () => {
    if (!deleteAddonModal.addonId) return;
    try {
      await adminCarWashAPI.deleteAddon(deleteAddonModal.addonId);
      showSuccess(t('adminCarWash.addonDeletedSuccessfully') || 'Eklenti başarıyla silindi!');
      setDeleteAddonModal({ isOpen: false, addonId: null });
      loadData();
    } catch (error: any) {
      showError(t('adminCarWash.errors.deletingAddon') || 'Eklenti silinirken hata oluştu: ' + (error.response?.data?.error || error.message));
      setDeleteAddonModal({ isOpen: false, addonId: null });
    }
  };

  const handleAppointmentStatusUpdate = async (id: string, status: string) => {
    try {
      await adminCarWashAPI.updateAppointmentStatus(id, status);
      showSuccess(t('adminCarWash.updatedSuccessfully') || 'Durum başarıyla güncellendi!');
      loadData();
    } catch (error: any) {
      showError(t('adminCarWash.errors.updatingAppointmentStatus') + ': ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.carWashPage}>
      <h1>{t('adminCarWash.title') || 'Oto Yıkama Yönetimi'}</h1>

      <div className={styles.tabs}>
        <button className={activeTab === 'packages' ? styles.active : ''} onClick={() => setActiveTab('packages')}>
          {t('adminCarWash.packages')}
        </button>
        <button className={activeTab === 'addons' ? styles.active : ''} onClick={() => setActiveTab('addons')}>
          {t('adminCarWash.addons')}
        </button>
        <button className={activeTab === 'appointments' ? styles.active : ''} onClick={() => setActiveTab('appointments')}>
          {t('adminCarWash.appointments')}
        </button>
      </div>

      {activeTab === 'packages' && (
        <>
          <div className={styles.pageHeader}>
            <button onClick={() => {
              setEditingPackage(null);
              setPackageFormData({ name: '', description: '', base_price: '', duration_minutes: '', display_order: '0', is_active: true });
              setShowPackageForm(true);
            }} className={styles.btnPrimary}>{t('adminCarWash.addPackage')}</button>
          </div>
          {showPackageForm && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h2>{editingPackage ? t('adminCarWash.editPackage') : t('adminCarWash.addPackage')}</h2>
                <form onSubmit={handlePackageSubmit}>
                  <input name="name" placeholder={t('adminCarWash.name')} value={packageFormData.name} onChange={(e) => setPackageFormData({...packageFormData, name: e.target.value})} required />
                  <textarea name="description" placeholder={t('adminCarWash.description')} value={packageFormData.description} onChange={(e) => setPackageFormData({...packageFormData, description: e.target.value})} rows={4} />
                  <input type="number" name="base_price" placeholder={t('adminCarWash.price')} value={packageFormData.base_price} onChange={(e) => setPackageFormData({...packageFormData, base_price: e.target.value})} required step="0.01" />
                  <input type="number" name="duration_minutes" placeholder={t('adminCarWash.durationMinutes')} value={packageFormData.duration_minutes} onChange={(e) => setPackageFormData({...packageFormData, duration_minutes: e.target.value})} />
                  <input type="number" name="display_order" placeholder={t('adminCarWash.displayOrder')} value={packageFormData.display_order} onChange={(e) => setPackageFormData({...packageFormData, display_order: e.target.value})} />
                  <label><input type="checkbox" name="is_active" checked={packageFormData.is_active} onChange={(e) => setPackageFormData({...packageFormData, is_active: e.target.checked})} /> {t('common.active') || 'Aktif'}</label>
                  <div className={styles.modalActions}>
                    <button type="submit">{t('common.save')}</button>
                    <button type="button" onClick={() => setShowPackageForm(false)}>{t('common.cancel')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr><th>{t('adminCarWash.name')}</th><th>{t('adminCarWash.price')}</th><th>{t('adminCarWash.duration')}</th><th>{t('adminCarWash.status')}</th><th>{t('adminCarWash.actions') || 'İşlemler'}</th></tr>
              </thead>
              <tbody>
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                      {t('adminCarWash.noPackages') || 'Henüz paket eklenmemiş'}
                    </td>
                  </tr>
                ) : (
                  packages.map(pkg => (
                  <tr key={pkg.id}>
                    <td>{pkg.name}</td>
                    <td>${pkg.base_price}</td>
                    <td>{pkg.duration_minutes || 'N/A'} {t('adminCarWash.minutes')}</td>
                    <td>{pkg.is_active ? t('common.active') || 'Aktif' : t('common.inactive') || 'Pasif'}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button onClick={() => {
                          setEditingPackage(pkg);
                          setPackageFormData({
                            name: pkg.name, description: pkg.description || '', base_price: pkg.base_price.toString(),
                            duration_minutes: pkg.duration_minutes?.toString() || '', display_order: pkg.display_order?.toString() || '0',
                            is_active: pkg.is_active !== false
                          });
                          setShowPackageForm(true);
                        }} className={styles.btnEdit}>{t('common.edit')}</button>
                        <button onClick={() => setDeletePackageModal({ isOpen: true, packageId: pkg.id })} className={styles.btnDelete}>{t('common.delete')}</button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'addons' && (
        <>
          <div className={styles.pageHeader}>
            <button onClick={() => {
              setEditingAddon(null);
              setAddonFormData({ name: '', description: '', price: '', display_order: '0', is_active: true });
              setShowAddonForm(true);
            }} className={styles.btnPrimary}>{t('adminCarWash.addAddon')}</button>
          </div>
          {showAddonForm && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h2>{editingAddon ? t('adminCarWash.editAddon') : t('adminCarWash.addAddon')}</h2>
                <form onSubmit={handleAddonSubmit}>
                  <input name="name" placeholder={t('adminCarWash.name')} value={addonFormData.name} onChange={(e) => setAddonFormData({...addonFormData, name: e.target.value})} required />
                  <textarea name="description" placeholder={t('adminCarWash.description')} value={addonFormData.description} onChange={(e) => setAddonFormData({...addonFormData, description: e.target.value})} rows={4} />
                  <input type="number" name="price" placeholder={t('adminCarWash.price')} value={addonFormData.price} onChange={(e) => setAddonFormData({...addonFormData, price: e.target.value})} required step="0.01" />
                  <input type="number" name="display_order" placeholder={t('adminCarWash.displayOrder')} value={addonFormData.display_order} onChange={(e) => setAddonFormData({...addonFormData, display_order: e.target.value})} />
                  <label><input type="checkbox" name="is_active" checked={addonFormData.is_active} onChange={(e) => setAddonFormData({...addonFormData, is_active: e.target.checked})} /> {t('common.active') || 'Aktif'}</label>
                  <div className={styles.modalActions}>
                    <button type="submit">{t('common.save')}</button>
                    <button type="button" onClick={() => setShowAddonForm(false)}>{t('common.cancel')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr><th>{t('adminCarWash.name')}</th><th>{t('adminCarWash.price')}</th><th>{t('adminCarWash.status')}</th><th>{t('adminCarWash.actions') || 'İşlemler'}</th></tr>
              </thead>
              <tbody>
                {addons.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                      {t('adminCarWash.noAddons') || 'Henüz ekstra hizmet eklenmemiş'}
                    </td>
                  </tr>
                ) : (
                  addons.map(addon => (
                  <tr key={addon.id}>
                    <td>{addon.name}</td>
                    <td>${addon.price}</td>
                    <td>{addon.is_active ? t('common.active') : t('common.inactive')}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button onClick={() => {
                          setEditingAddon(addon);
                          setAddonFormData({
                            name: addon.name, description: addon.description || '', price: addon.price.toString(),
                            display_order: addon.display_order?.toString() || '0', is_active: addon.is_active !== false
                          });
                          setShowAddonForm(true);
                        }} className={styles.btnEdit}>{t('common.edit')}</button>
                        <button onClick={() => setDeleteAddonModal({ isOpen: true, addonId: addon.id })} className={styles.btnDelete}>{t('common.delete')}</button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'appointments' && (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>{t('adminCarWash.customerInfo') || 'Müşteri'}</th>
                <th>{t('adminCarWash.package')}</th>
                <th>{t('adminCarWash.date')}</th>
                <th>{t('adminCarWash.time')}</th>
                <th>{t('adminCarWash.total')}</th>
                <th>{t('adminCarWash.status')}</th>
                <th>{t('adminCarWash.actions') || 'İşlemler'}</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('adminCarWash.noAppointments') || 'Randevu bulunamadı'}
                  </td>
                </tr>
              ) : (
                appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>{appointment.customer_name}</td>
                  <td>{appointment.package_name}</td>
                  <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>${appointment.total_price}</td>
                  <td>{appointment.status}</td>
                  <td>
                    <select value={appointment.status} onChange={(e) => handleAppointmentStatusUpdate(appointment.id, e.target.value)}>
                      <option value="pending">{t('adminCarWash.statusPending')}</option>
                      <option value="confirmed">{t('adminCarWash.statusConfirmed')}</option>
                      <option value="in_progress">{t('adminCarWash.statusInProgress')}</option>
                      <option value="completed">{t('adminCarWash.statusCompleted')}</option>
                      <option value="cancelled">{t('adminCarWash.statusCancelled')}</option>
                    </select>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deletePackageModal.isOpen}
        onClose={() => setDeletePackageModal({ isOpen: false, packageId: null })}
        onConfirm={handleDeletePackage}
        title={t('adminCarWash.confirmDeletePackageTitle') || 'Paketi Sil'}
        message={t('adminCarWash.confirmDeletePackage') || 'Bu paketi silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />

      <ConfirmModal
        isOpen={deleteAddonModal.isOpen}
        onClose={() => setDeleteAddonModal({ isOpen: false, addonId: null })}
        onConfirm={handleDeleteAddon}
        title={t('adminCarWash.confirmDeleteAddonTitle')}
        message={t('adminCarWash.confirmDeleteAddon')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
}
