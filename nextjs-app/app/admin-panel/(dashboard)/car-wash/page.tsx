'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { adminCarWashAPI, adminSettingsAPI } from '@/lib/services/adminApi';
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
  const [packageFormData, setPackageFormData] = useState({
    name: '', description: '', base_price: '', duration_minutes: '', display_order: '0', is_active: true
  });
  const [addonFormData, setAddonFormData] = useState({
    name: '', description: '', price: '', display_order: '0', is_active: true
  });
  const [taxRate, setTaxRate] = useState(0);
  const [federalTaxRate, setFederalTaxRate] = useState(0);
  const [provincialTaxRate, setProvincialTaxRate] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false);
  const [deleteAppointmentModal, setDeleteAppointmentModal] = useState({ isOpen: false, appointmentId: null as string | null });
  const [appointmentSearchTerm, setAppointmentSearchTerm] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('all');
  const [appointmentDateFilter, setAppointmentDateFilter] = useState('');

  const loadTaxRate = useCallback(async () => {
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
  }, []);

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
  }, [loadData, loadTaxRate]);

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

  const handleAppointmentClick = async (appointment: Appointment) => {
    try {
      const response = await adminCarWashAPI.getAppointmentById(appointment.id);
      setSelectedAppointment(response.data?.appointment || appointment);
      setShowAppointmentDetail(true);
    } catch (error) {
      setSelectedAppointment(appointment);
      setShowAppointmentDetail(true);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!deleteAppointmentModal.appointmentId) return;
    try {
      await adminCarWashAPI.deleteAppointment(deleteAppointmentModal.appointmentId);
      showSuccess(t('adminCarWash.appointmentDeletedSuccessfully') || 'Randevu başarıyla silindi!');
      setDeleteAppointmentModal({ isOpen: false, appointmentId: null });
      loadData();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError(t('adminCarWash.errors.deletingAppointment') || 'Randevu silinirken hata oluştu: ' + (err.response?.data?.error || err.message || 'Unknown error'));
      setDeleteAppointmentModal({ isOpen: false, appointmentId: null });
    }
  };

  const handlePrintReceipt = async () => {
    if (!selectedAppointment) return;
    
    try {
      let companyInfo: any = {};
      try {
        const companyResponse = await adminSettingsAPI.getCompanyInfo();
        companyInfo = companyResponse.data?.companyInfo || {};
      } catch (error) {
        console.error('Error loading company info:', error);
      }

      const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2);
      const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2);
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate;
      
      const totalPrice = parseFloat(String(selectedAppointment.total_price || 0));
      let basePrice = totalPrice;
      let federalTaxAmount = 0;
      let provincialTaxAmount = 0;
      
      if (totalTaxRate > 0) {
        basePrice = totalPrice / (1 + totalTaxRate / 100);
        federalTaxAmount = basePrice * (effectiveFederalRate / 100);
        provincialTaxAmount = basePrice * (effectiveProvincialRate / 100);
      }

      const receiptHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    @media print {
      body { margin: 0; padding: 5mm; }
      .no-print { display: none !important; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Courier New', 'Courier', monospace;
      font-size: 11px;
      line-height: 1.3;
      width: 70mm;
      max-width: 70mm;
      margin: 0 auto;
      padding: 5mm;
      color: #000;
    }
    .receipt-header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .company-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .company-info {
      font-size: 9px;
      line-height: 1.4;
    }
    .receipt-body {
      margin: 8px 0;
    }
    .section-divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
      padding-top: 8px;
    }
    .info-row {
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .service-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 6px;
      text-align: center;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 4px 0;
    }
    .service-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 10px;
    }
    .total-row {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 2px solid #000;
      font-size: 13px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
    }
    .date-info {
      text-align: center;
      margin-top: 8px;
      font-size: 9px;
      border-top: 1px dashed #000;
      padding-top: 8px;
    }
    .no-print {
      text-align: center;
      margin-top: 20px;
    }
    .no-print button {
      padding: 10px 20px;
      font-size: 14px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 5px;
    }
    .no-print button.close {
      background: #666;
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    <div class="company-name">${companyInfo.company_name || 'KAY Oto Servis'}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address}</div>` : ''}
      ${companyInfo.company_phone ? `<div>Tel: ${companyInfo.company_phone}</div>` : ''}
      ${companyInfo.company_tax_number ? `<div>No TVA: ${companyInfo.company_tax_number}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    <div class="info-row">
      <span>Client:</span>
      <span>${selectedAppointment.customer_name}</span>
    </div>
    <div class="info-row">
      <span>Email:</span>
      <span>${selectedAppointment.customer_email}</span>
    </div>
    ${selectedAppointment.customer_phone ? `
    <div class="info-row">
      <span>Tél:</span>
      <span>${selectedAppointment.customer_phone}</span>
    </div>
    ` : ''}
    <div class="info-row">
      <span>Date:</span>
      <span>${new Date(selectedAppointment.appointment_date).toLocaleDateString('fr-CA')}</span>
    </div>
    <div class="info-row">
      <span>Heure:</span>
      <span>${selectedAppointment.appointment_time}</span>
    </div>

    <div class="section-divider">
      <div class="service-title">SERVICE</div>
      <div class="service-row">
        <span>${selectedAppointment.package_name}</span>
        <span>$${basePrice.toFixed(2)}</span>
      </div>
    </div>

    ${totalTaxRate > 0 ? `
    <div class="section-divider">
      <div class="info-row">
        <span>Sous-total:</span>
        <span>$${basePrice.toFixed(2)}</span>
      </div>
      ${effectiveFederalRate > 0 ? `
      <div class="info-row">
        <span>TPS (${effectiveFederalRate.toFixed(2)}%):</span>
        <span>$${federalTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${effectiveProvincialRate > 0 ? `
      <div class="info-row">
        <span>TVQ (${effectiveProvincialRate.toFixed(2)}%):</span>
        <span>$${provincialTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>
    ` : ''}

    <div class="total-row">
      <span>TOTAL:</span>
      <span>$${totalPrice.toFixed(2)}</span>
    </div>

    <div class="date-info">
      <div>${new Date().toLocaleDateString('fr-CA')}</div>
      <div>Merci de votre visite!</div>
    </div>
  </div>

  <div class="no-print">
    <button onclick="window.print()">Imprimer</button>
    <button class="close" onclick="window.close()">Fermer</button>
  </div>
</body>
</html>
      `;

      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        try {
          printWindow.document.write(receiptHTML);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 1000);
        } catch (error) {
          console.error('Error writing to print window:', error);
          showError(t('adminCarWash.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu');
          printWindow.close();
        }
      } else {
        showError('Popup engellendi. Lütfen popup blocker\'ı kapatın.');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      console.error('Error printing receipt:', error);
      showError(t('adminCarWash.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !appointmentSearchTerm || 
      appointment.customer_name.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
      appointment.customer_email.toLowerCase().includes(appointmentSearchTerm.toLowerCase()) ||
      (appointment.customer_phone && appointment.customer_phone.includes(appointmentSearchTerm)) ||
      appointment.package_name.toLowerCase().includes(appointmentSearchTerm.toLowerCase());
    
    const matchesStatus = appointmentStatusFilter === 'all' || appointment.status === appointmentStatusFilter;
    
    const matchesDate = !appointmentDateFilter || 
      new Date(appointment.appointment_date).toISOString().split('T')[0] === appointmentDateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.carWashPage}>
      <h1>{t('adminCarWash.title')}</h1>

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
                <button 
                  type="button" 
                  className={styles.modalClose} 
                  onClick={() => setShowPackageForm(false)}
                >×</button>
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
          {/* Desktop Table View */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr><th>{t('adminCarWash.name')}</th><th>{t('adminCarWash.price')}</th><th>{t('adminCarWash.duration')}</th><th>{t('adminCarWash.status')}</th><th>{t('adminCarWash.actions')}</th></tr>
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

          {/* Mobile Card View */}
          <div className={styles.mobilePackagesList}>
            {packages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                {t('adminCarWash.noPackages') || 'Henüz paket eklenmemiş'}
              </div>
            ) : (
              packages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`${styles.packageCard} ${!pkg.is_active ? styles.inactiveCard : ''}`}
                >
                  <div className={styles.packageCardHeader}>
                    <div>
                      <h3 className={styles.packageCardName}>{pkg.name}</h3>
                    </div>
                    <div className={styles.packageCardPrice}>${pkg.base_price}</div>
                  </div>
                  {pkg.description && (
                    <div className={styles.packageCardDescription}>{pkg.description}</div>
                  )}
                  <div className={styles.packageCardFooter}>
                    <div className={styles.packageCardInfo}>
                      {pkg.duration_minutes && (
                        <span className={styles.packageCardDuration}>
                          ⏱️ {pkg.duration_minutes} {t('adminCarWash.minutes')}
                        </span>
                      )}
                      <span className={`${styles.packageCardStatus} ${pkg.is_active ? styles.activeStatus : styles.inactiveStatus}`}>
                        {pkg.is_active ? t('common.active') || 'Aktif' : t('common.inactive') || 'Pasif'}
                      </span>
                    </div>
                    <div className={styles.packageCardActions}>
                      <button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setPackageFormData({
                            name: pkg.name, description: pkg.description || '', base_price: pkg.base_price.toString(),
                            duration_minutes: pkg.duration_minutes?.toString() || '', display_order: pkg.display_order?.toString() || '0',
                            is_active: pkg.is_active !== false
                          });
                          setShowPackageForm(true);
                        }}
                        className={styles.btnEdit}
                        title={t('common.edit') || 'Düzenle'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeletePackageModal({ isOpen: true, packageId: pkg.id })}
                        className={styles.btnDelete}
                        title={t('common.delete') || 'Sil'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                <button 
                  type="button" 
                  className={styles.modalClose} 
                  onClick={() => setShowAddonForm(false)}
                >×</button>
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
          {/* Desktop Table View */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr><th>{t('adminCarWash.name')}</th><th>{t('adminCarWash.price')}</th><th>{t('adminCarWash.status')}</th><th>{t('adminCarWash.actions')}</th></tr>
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

          {/* Mobile Card View */}
          <div className={styles.mobileAddonsList}>
            {addons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                {t('adminCarWash.noAddons') || 'Henüz ekstra hizmet eklenmemiş'}
              </div>
            ) : (
              addons.map(addon => (
                <div
                  key={addon.id}
                  className={`${styles.addonCard} ${!addon.is_active ? styles.inactiveCard : ''}`}
                >
                  <div className={styles.addonCardHeader}>
                    <div>
                      <h3 className={styles.addonCardName}>{addon.name}</h3>
                    </div>
                    <div className={styles.addonCardPrice}>${addon.price}</div>
                  </div>
                  {addon.description && (
                    <div className={styles.addonCardDescription}>{addon.description}</div>
                  )}
                  <div className={styles.addonCardFooter}>
                    <div className={styles.addonCardInfo}>
                      <span className={`${styles.addonCardStatus} ${addon.is_active ? styles.activeStatus : styles.inactiveStatus}`}>
                        {addon.is_active ? t('common.active') || 'Aktif' : t('common.inactive') || 'Pasif'}
                      </span>
                    </div>
                    <div className={styles.addonCardActions}>
                      <button
                        onClick={() => {
                          setEditingAddon(addon);
                          setAddonFormData({
                            name: addon.name, description: addon.description || '', price: addon.price.toString(),
                            display_order: addon.display_order?.toString() || '0', is_active: addon.is_active !== false
                          });
                          setShowAddonForm(true);
                        }}
                        className={styles.btnEdit}
                        title={t('common.edit') || 'Düzenle'}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteAddonModal({ isOpen: true, addonId: addon.id })}
                        className={styles.btnDelete}
                        title={t('common.delete') || 'Sil'}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'appointments' && (
        <>
          <div className={styles.pageHeader}>
            <div className={styles.appointmentFilters}>
              <input
                type="text"
                placeholder={t('adminCarWash.searchAppointments') || 'Müşteri, email, telefon veya paket ile ara...'}
                value={appointmentSearchTerm}
                onChange={(e) => setAppointmentSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <select
                value={appointmentStatusFilter}
                onChange={(e) => setAppointmentStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">{t('adminCarWash.allStatuses') || 'Tüm Durumlar'}</option>
                <option value="pending">{t('adminCarWash.statusPending')}</option>
                <option value="confirmed">{t('adminCarWash.statusConfirmed')}</option>
                <option value="in_progress">{t('adminCarWash.statusInProgress')}</option>
                <option value="completed">{t('adminCarWash.statusCompleted')}</option>
                <option value="cancelled">{t('adminCarWash.statusCancelled')}</option>
              </select>
              <input
                type="date"
                value={appointmentDateFilter}
                onChange={(e) => setAppointmentDateFilter(e.target.value)}
                className={styles.dateInput}
                placeholder={t('adminCarWash.filterByDate') || 'Tarihe göre filtrele'}
              />
              {appointmentDateFilter && (
                <button
                  onClick={() => setAppointmentDateFilter('')}
                  className={styles.clearButton}
                >
                  {t('common.clear') || 'Temizle'}
                </button>
              )}
            </div>
          </div>
          {/* Desktop Table View */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>{t('adminCarWash.customerInfo') || 'Müşteri'}</th>
                  <th>{t('adminCarWash.package') || 'Paket'}</th>
                  <th>{t('adminCarWash.date') || 'Tarih'}</th>
                  <th>{t('adminCarWash.time') || 'Saat'}</th>
                  <th>{t('adminCarWash.total') || 'Toplam'}</th>
                  <th>{t('adminCarWash.status') || 'Durum'}</th>
                  <th>{t('adminCarWash.actions') || 'İşlemler'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                      {t('adminCarWash.noAppointments') || 'Randevu bulunamadı'}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map(appointment => (
                  <tr key={appointment.id} style={{ cursor: 'pointer' }} onClick={() => handleAppointmentClick(appointment)}>
                    <td>{appointment.customer_name}</td>
                    <td>{appointment.package_name}</td>
                    <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                    <td>{appointment.appointment_time}</td>
                    <td>${parseFloat(String(appointment.total_price || 0)).toFixed(2)}</td>
                    <td>{appointment.status}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select 
                          value={appointment.status} 
                          onChange={(e) => handleAppointmentStatusUpdate(appointment.id, e.target.value)}
                          style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                          <option value="pending">{t('adminCarWash.statusPending')}</option>
                          <option value="confirmed">{t('adminCarWash.statusConfirmed')}</option>
                          <option value="in_progress">{t('adminCarWash.statusInProgress')}</option>
                          <option value="completed">{t('adminCarWash.statusCompleted')}</option>
                          <option value="cancelled">{t('adminCarWash.statusCancelled')}</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteAppointmentModal({ isOpen: true, appointmentId: appointment.id });
                          }}
                          className={styles.btnDelete}
                          title={t('common.delete') || 'Sil'}
                        >
                          {t('common.delete') || 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.mobileAppointmentsList}>
            {filteredAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                {t('adminCarWash.noAppointments') || 'Randevu bulunamadı'}
              </div>
            ) : (
              filteredAppointments.map(appointment => {
                const statusLabels: { [key: string]: string } = {
                  pending: t('adminCarWash.statusPending') || 'Beklemede',
                  confirmed: t('adminCarWash.statusConfirmed') || 'Onaylandı',
                  in_progress: t('adminCarWash.statusInProgress') || 'Devam Ediyor',
                  completed: t('adminCarWash.statusCompleted') || 'Tamamlandı',
                  cancelled: t('adminCarWash.statusCancelled') || 'İptal Edildi',
                };
                const statusColors: { [key: string]: string } = {
                  pending: '#ff9800',
                  confirmed: '#2196F3',
                  in_progress: '#9c27b0',
                  completed: '#4CAF50',
                  cancelled: '#f44336',
                };
                return (
                  <div
                    key={appointment.id}
                    className={styles.appointmentCard}
                    onClick={() => handleAppointmentClick(appointment)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.appointmentCardHeader}>
                      <div>
                        <h3 className={styles.appointmentCardName}>{appointment.customer_name}</h3>
                        <div className={styles.appointmentCardPackage}>{appointment.package_name}</div>
                      </div>
                      <div className={styles.appointmentCardPrice}>
                        ${parseFloat(String(appointment.total_price || 0)).toFixed(2)}
                      </div>
                    </div>
                    <div className={styles.appointmentCardDetails}>
                      <div className={styles.appointmentCardDetail}>
                        <span className={styles.detailLabel}>📅</span>
                        <span className={styles.detailValue}>
                          {new Date(appointment.appointment_date).toLocaleDateString()} {appointment.appointment_time}
                        </span>
                      </div>
                      {appointment.customer_phone && (
                        <div className={styles.appointmentCardDetail}>
                          <span className={styles.detailLabel}>📞</span>
                          <span className={styles.detailValue}>{appointment.customer_phone}</span>
                        </div>
                      )}
                      <div className={styles.appointmentCardDetail}>
                        <span className={styles.detailLabel}>📧</span>
                        <span className={styles.detailValue}>{appointment.customer_email}</span>
                      </div>
                    </div>
                    <div className={styles.appointmentCardFooter}>
                      <div
                        className={styles.appointmentCardStatus}
                        style={{
                          backgroundColor: `${statusColors[appointment.status]}20`,
                          color: statusColors[appointment.status],
                        }}
                      >
                        {statusLabels[appointment.status] || appointment.status}
                      </div>
                      <div className={styles.appointmentCardActions} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={appointment.status}
                          onChange={(e) => handleAppointmentStatusUpdate(appointment.id, e.target.value)}
                          className={styles.statusSelect}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="pending">{t('adminCarWash.statusPending')}</option>
                          <option value="confirmed">{t('adminCarWash.statusConfirmed')}</option>
                          <option value="in_progress">{t('adminCarWash.statusInProgress')}</option>
                          <option value="completed">{t('adminCarWash.statusCompleted')}</option>
                          <option value="cancelled">{t('adminCarWash.statusCancelled')}</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteAppointmentModal({ isOpen: true, appointmentId: appointment.id });
                          }}
                          className={styles.btnDelete}
                          title={t('common.delete') || 'Sil'}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
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

      <ConfirmModal
        isOpen={deleteAppointmentModal.isOpen}
        onClose={() => setDeleteAppointmentModal({ isOpen: false, appointmentId: null })}
        onConfirm={handleDeleteAppointment}
        title={t('adminCarWash.confirmDeleteAppointmentTitle') || 'Randevuyu Sil'}
        message={t('adminCarWash.confirmDeleteAppointment') || 'Bu randevuyu silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />

      {showAppointmentDetail && selectedAppointment && (
        <div className={styles.modal} onClick={() => setShowAppointmentDetail(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <h2>{t('adminCarWash.appointmentDetails') || 'Randevu Detayları'}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowAppointmentDetail(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.appointmentDetailContent}>
              <div className={styles.detailSection}>
                <h3>{t('adminCarWash.customerInfo') || 'Müşteri Bilgileri'}</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>{t('adminCarWash.name') || 'Ad'}:</label>
                    <span>{selectedAppointment.customer_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('adminCarWash.email') || 'Email'}:</label>
                    <span>{selectedAppointment.customer_email}</span>
                  </div>
                  {selectedAppointment.customer_phone && (
                    <div className={styles.detailItem}>
                      <label>{t('adminCarWash.phone') || 'Telefon'}:</label>
                      <span>{selectedAppointment.customer_phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.detailSection}>
                <h3>{t('adminCarWash.appointmentInfo') || 'Randevu Bilgileri'}</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>{t('adminCarWash.package') || 'Paket'}:</label>
                    <span>{selectedAppointment.package_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('adminCarWash.date') || 'Tarih'}:</label>
                    <span>{new Date(selectedAppointment.appointment_date).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('adminCarWash.time') || 'Saat'}:</label>
                    <span>{selectedAppointment.appointment_time}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('adminCarWash.status') || 'Durum'}:</label>
                    <span>{selectedAppointment.status}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('adminCarWash.total') || 'Toplam'}:</label>
                    <span>${parseFloat(String(selectedAppointment.total_price || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div className={styles.detailSection}>
                  <h3>{t('adminCarWash.notes') || 'Notlar'}</h3>
                  <div className={styles.notesContent}>
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handlePrintReceipt} className={styles.btnPrimary}>
                🖨️ {t('adminCarWash.printReceipt') || 'Makbuz Yazdır'}
              </button>
              <button onClick={() => setShowAppointmentDetail(false)} className={styles.btnSecondary}>
                {t('common.close') || 'Kapat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
