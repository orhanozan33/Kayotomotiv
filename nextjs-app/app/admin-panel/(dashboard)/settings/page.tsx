'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useError } from '@/contexts/ErrorContext';
import { adminUsersAPI as usersAPI, adminSettingsAPI as settingsAPI, adminReceiptsAPI as receiptsAPI } from '@/lib/services/adminApi';
import ConfirmModal from '@/components/admin/ConfirmModal';
import styles from './settings.module.css';

const AVAILABLE_PAGES = [
  { value: 'vehicles', labelKey: 'adminNav.vehicles', label: 'Oto Galeri' },
  { value: 'customers', labelKey: 'adminNav.customers', label: 'Müşteri Kayıt' },
  { value: 'repair-services', labelKey: 'adminNav.repairServices', label: 'Oto Tamir Hizmetleri' },
  { value: 'repair-quotes', labelKey: 'adminNav.repairQuotes', label: 'Oto Yıkama Kayıt' },
  { value: 'car-wash', labelKey: 'adminNav.carWash', label: 'Oto Yıkama Hizmetleri' },
  { value: 'reservations', labelKey: 'adminNav.reservations', label: 'Rezervasyonlar' },
  { value: 'pages', labelKey: 'adminNav.pages', label: 'Sayfalar' }
];

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Permission {
  page: string;
  can_view: boolean;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  permission_password: string;
}

interface Receipt {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  license_plate?: string;
  service_name: string;
  service_description?: string;
  service_type: string;
  price: number;
  performed_date: string;
  created_at: string;
  company_info?: any;
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { showError, showSuccess } = useError();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null as string | null });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user'
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showSocialMediaModal, setShowSocialMediaModal] = useState(false);
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    x: '',
    phone: ''
  });
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxRate, setTaxRate] = useState('0');
  const [federalTaxRate, setFederalTaxRate] = useState('0');
  const [provincialTaxRate, setProvincialTaxRate] = useState('0');
  const [showContactLocationsModal, setShowContactLocationsModal] = useState(false);
  const [contactLocations, setContactLocations] = useState([
    { name: '', address: '', phone: '', hours: '' },
    { name: '', address: '', phone: '', hours: '' },
    { name: '', address: '', phone: '', hours: '' }
  ]);
  const [activeTab, setActiveTab] = useState<'users' | 'receipts'>('users');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [receiptSearchTerm, setReceiptSearchTerm] = useState('');
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll().catch(err => {
        console.error('Error loading users:', err);
        return { data: { users: [] } };
      });
      // Transform API response to match frontend interface (camelCase to snake_case)
      const users = (response.data?.users || []).map((user: any) => ({
        ...user,
        first_name: user.firstName || user.first_name || '',
        last_name: user.lastName || user.last_name || '',
        is_active: user.isActive !== undefined ? user.isActive : user.is_active !== undefined ? user.is_active : true,
        created_at: user.createdAt || user.created_at || new Date().toISOString(),
      }));
      setUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserPermissions = async (userId: string) => {
    try {
      const response = await usersAPI.getPermissions(userId).catch(err => {
        console.error('Error loading permissions:', err);
        return { data: { permissions: [] } };
      });
      const existingPermissions = response.data?.permissions || [];
      
      const allPermissions = AVAILABLE_PAGES.map(page => {
        const existing = existingPermissions.find((p: any) => p.page === page.value);
        return existing ? {
          page: page.value,
          can_view: existing.can_view || false,
          can_add: existing.can_add || false,
          can_edit: existing.can_edit || false,
          can_delete: existing.can_delete || false,
          permission_password: ''
        } : {
          page: page.value,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
          permission_password: ''
        };
      });
      
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadSocialMediaLinks();
    loadTaxRate();
    loadContactLocations();
  }, [loadUsers]);

  const loadReceipts = useCallback(async () => {
    try {
      setReceiptsLoading(true);
      const params = receiptSearchTerm ? { search: receiptSearchTerm } : {};
      const response = await receiptsAPI.getAll(params);
      setReceipts(response.data?.receipts || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
      setReceipts([]);
    } finally {
      setReceiptsLoading(false);
    }
  }, [receiptSearchTerm]);

  useEffect(() => {
    if (activeTab === 'receipts') {
      loadReceipts();
    }
  }, [activeTab, loadReceipts]);

  const loadSocialMediaLinks = async () => {
    try {
      const response = await settingsAPI.getSocialMediaLinks();
      if (response.data?.links) {
        setSocialMediaLinks(response.data.links);
      }
    } catch (error) {
      console.error('Error loading social media links:', error);
    }
  };


  const loadTaxRate = async () => {
    try {
      const response = await settingsAPI.getSettings();
      if (response.data?.settings) {
        const settings = response.data.settings;
        setTaxRate(settings.tax_rate || '0');
        setFederalTaxRate(settings.federal_tax_rate || '0');
        setProvincialTaxRate(settings.provincial_tax_rate || '0');
      }
    } catch (error) {
      console.error('Error loading tax rate:', error);
    }
  };

  const loadContactLocations = async () => {
    try {
      const response = await settingsAPI.getContactLocations();
      if (response.data?.locations) {
        setContactLocations(response.data.locations);
      }
    } catch (error) {
      console.error('Error loading contact locations:', error);
    }
  };

  const handleSaveTaxRate = async () => {
    try {
      const federalValue = parseFloat(federalTaxRate) || 0;
      const provincialValue = parseFloat(provincialTaxRate) || 0;
      
      if (federalValue < 0 || federalValue > 100) {
        showError(t('settings.federalTaxRateError') || 'Federal vergi oranı 0-100 arasında olmalıdır');
        return;
      }
      if (provincialValue < 0 || provincialValue > 100) {
        showError(t('settings.provincialTaxRateError') || 'Eyalet vergi oranı 0-100 arasında olmalıdır');
        return;
      }
      
      const totalTaxRate = federalValue + provincialValue;
      
      const settingsToSave = {
        tax_rate: totalTaxRate.toString(),
        federal_tax_rate: federalValue.toString(),
        provincial_tax_rate: provincialValue.toString()
      };
      
      await settingsAPI.updateSettings(settingsToSave);
      showSuccess(t('settings.taxRatesSaved') || 'Vergi oranları kaydedildi');
      setShowTaxModal(false);
      await loadTaxRate();
    } catch (error: any) {
      showError((t('settings.errors.savingTaxRates') || 'Vergi oranları kaydedilirken hata oluştu') + ': ' + (error.response?.data?.error || error.message));
    }
  };

  const handlePrintReceipt = async (receipt: Receipt) => {
    try {
      let companyInfo: any = {};
      try {
        const companyResponse = await settingsAPI.getCompanyInfo();
        companyInfo = companyResponse.data?.companyInfo || {};
      } catch (error) {
        console.error('Error loading company info:', error);
      }

      // Also load logo and tax numbers from settings - always load from settings to get latest values
      let tpsPercentage = 0;
      let tpsNumber = '';
      let tvqPercentage = 0;
      let tvqNumber = '';
      try {
        const settingsResponse = await settingsAPI.getSettings();
        if (settingsResponse.data?.settings) {
          if (settingsResponse.data.settings.company_logo_url) {
            companyInfo.company_logo_url = settingsResponse.data.settings.company_logo_url;
          }
          if (settingsResponse.data.settings.company_federal_tax_number) {
            companyInfo.company_federal_tax_number = settingsResponse.data.settings.company_federal_tax_number;
          }
          if (settingsResponse.data.settings.company_provincial_tax_number) {
            companyInfo.company_provincial_tax_number = settingsResponse.data.settings.company_provincial_tax_number;
          }
          // Load TPS and TVQ from new fields
          tpsPercentage = parseFloat(settingsResponse.data.settings.tps_percentage || '0');
          tpsNumber = settingsResponse.data.settings.tps_number || '';
          tvqPercentage = parseFloat(settingsResponse.data.settings.tvq_percentage || '0');
          tvqNumber = settingsResponse.data.settings.tvq_number || '';
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }

      // Ensure logo URL is absolute (if it's from Supabase Storage)
      if (companyInfo.company_logo_url && !companyInfo.company_logo_url.startsWith('http')) {
        // If it's a relative path, make it absolute
        if (companyInfo.company_logo_url.startsWith('/uploads')) {
          companyInfo.company_logo_url = `${window.location.origin}${companyInfo.company_logo_url}`;
        } else if (companyInfo.company_logo_url.startsWith('uploads')) {
          companyInfo.company_logo_url = `${window.location.origin}/${companyInfo.company_logo_url}`;
        }
      }

      // Use TPS/TVQ percentages from settings if available, otherwise fall back to old tax rate
      const effectiveTpsRate = tpsPercentage > 0 ? tpsPercentage : 0;
      const effectiveTvqRate = tvqPercentage > 0 ? tvqPercentage : 0;
      const totalTaxRate = effectiveTpsRate + effectiveTvqRate;
      const taxRateValue = totalTaxRate > 0 ? totalTaxRate : (parseFloat(taxRate) || 0);
      
      const subtotal = taxRateValue > 0 ? parseFloat(String(receipt.price)) / (1 + taxRateValue / 100) : parseFloat(String(receipt.price));
      const totalTaxAmount = parseFloat(String(receipt.price)) - subtotal;
      const tpsAmount = effectiveTpsRate > 0 ? subtotal * (effectiveTpsRate / 100) : 0;
      const tvqAmount = effectiveTvqRate > 0 ? subtotal * (effectiveTvqRate / 100) : 0;

      const locale = 'fr-CA';
      const htmlLang = 'fr';

      const receiptHTML = `
<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('settings.receiptPrintTitle')}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .receipt-header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .company-info {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }
    .receipt-body {
      margin: 30px 0;
    }
    .customer-info {
      margin-bottom: 30px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      width: 150px;
    }
    .service-details {
      border: 1px solid #ddd;
      padding: 15px;
      margin: 20px 0;
    }
    .service-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .service-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .total-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #000;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 16px;
    }
    .grand-total-row {
      font-size: 20px;
      font-weight: bold;
    }
    .date-info {
      text-align: right;
      margin-top: 30px;
      font-size: 14px;
      color: #666;
    }
    .no-print {
      text-align: center;
      margin-top: 20px;
    }
    .no-print button {
      padding: 10px 20px;
      font-size: 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 5px;
    }
    .no-print button:hover {
      background: #45a049;
    }
    .no-print button.close {
      background: #666;
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    ${companyInfo.company_logo_url ? `
    <div style="text-align: center; margin-bottom: 15px;">
      <img src="${companyInfo.company_logo_url}" alt="Company Logo" style="max-width: 200px; max-height: 100px; object-fit: contain;" />
    </div>
    ` : ''}
    <div class="company-name">${companyInfo.company_name || t('settings.companyName')}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address.replace(/\n/g, '<br>')}</div>` : ''}
      ${companyInfo.company_phone ? `<div>${t('settings.tel')}: ${companyInfo.company_phone}</div>` : ''}
      ${companyInfo.company_email ? `<div>${t('settings.email')}: ${companyInfo.company_email}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    <div class="service-details">
      <div class="service-title">${t('settings.performedOperation')}</div>
      <div class="service-row">
        <span><strong>${t('settings.receiptServiceNameLabel')}</strong></span>
        <span>${receipt.service_name}</span>
      </div>
      ${receipt.service_description ? `
      <div class="service-row">
        <span><strong>${t('settings.receiptDescriptionLabel')}</strong></span>
        <span>${receipt.service_description}</span>
      </div>
      ` : ''}
      <div class="service-row">
        <span><strong>${t('settings.receiptTypeLabel')}</strong></span>
        <span>${receipt.service_type === 'repair' ? t('settings.receiptTypeRepair') : receipt.service_type === 'car_wash' ? t('settings.receiptTypeCarWash') : receipt.service_type || '-'}</span>
      </div>
      <div class="total-section">
        ${taxRateValue > 0 ? `
        <div class="total-row">
          <span>${t('settings.receiptSubtotal')}</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${effectiveTpsRate > 0 ? `
        <div class="total-row">
          <span>TPS: ${tpsNumber || companyInfo.company_federal_tax_number || ''} (${effectiveTpsRate.toFixed(2)}%)</span>
          <span>$${tpsAmount.toFixed(2)}</span>
        </div>
        ` : ''}
        ${effectiveTvqRate > 0 ? `
        <div class="total-row">
          <span>TVQ: ${tvqNumber || companyInfo.company_provincial_tax_number || ''} (${effectiveTvqRate.toFixed(2)}%)</span>
          <span>$${tvqAmount.toFixed(2)}</span>
        </div>
        ` : ''}
        ${effectiveTpsRate === 0 && effectiveTvqRate === 0 ? `
        <div class="total-row">
          <span>${t('settings.receiptTax')} (%${taxRateValue}):</span>
          <span>$${totalTaxAmount.toFixed(2)}</span>
        </div>
        ` : ''}
        ` : ''}
        <div class="total-row grand-total-row">
          <span>${t('settings.receiptTotal')}</span>
          <span>$${parseFloat(String(receipt.price)).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="date-info">
      <div>${t('settings.receiptDateLabel')}: ${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
    </div>
    <div style="margin-top: 20px; padding-top: 10px; text-align: center; font-size: 12px;">
      <div>www.kayauto.ca</div>
    </div>
  </div>

  <div class="no-print">
    <button onclick="window.print()">${t('settings.receiptPrintBtn')}</button>
    <button class="close" onclick="window.close()">${t('settings.receiptCloseBtn')}</button>
  </div>
</body>
</html>
      `;

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      } else {
        showError(t('settings.receiptPopupError'));
      }
    } catch (error: any) {
      console.error('Error printing receipt:', error);
      showError(t('settings.receiptPrintError') + ' ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSaveSocialMedia = async () => {
    try {
      await settingsAPI.updateSettings({
        social_facebook: socialMediaLinks.facebook || '',
        social_instagram: socialMediaLinks.instagram || '',
        social_x: socialMediaLinks.x || '',
        contact_phone: socialMediaLinks.phone || ''
      });
      showSuccess(t('settings.socialMediaSaved'));
      setShowSocialMediaModal(false);
    } catch (error: any) {
      showError(t('settings.errors.savingSocialMedia') + ' ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSaveContactLocations = async () => {
    try {
      const settings: any = {};
      contactLocations.forEach((location, index) => {
        const num = index + 1;
        settings[`contact_location_${num}_name`] = location.name || '';
        settings[`contact_location_${num}_address`] = location.address || '';
        settings[`contact_location_${num}_phone`] = location.phone || '';
        settings[`contact_location_${num}_hours`] = location.hours || '';
      });
      await settingsAPI.updateSettings(settings);
      showSuccess('İletişim bilgileri kaydedildi');
      setShowContactLocationsModal(false);
    } catch (error: any) {
      showError('İletişim bilgileri kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        email: formData.email.trim().toLowerCase()
      };

      if (editingUser) {
        await usersAPI.update(editingUser.id, submitData);
        showSuccess(t('settings.userUpdated'));
      } else {
        if (!submitData.password || !submitData.password.trim()) {
          showError(t('settings.passwordRequired'));
          return;
        }
        
        const emailExists = users.some(u => u.email.toLowerCase() === submitData.email.toLowerCase());
        if (emailExists) {
          showError(t('settings.emailAlreadyExists'));
          return;
        }
        
        await usersAPI.create({
          ...submitData,
          is_active: true
        });
        showSuccess(t('settings.userCreated'));
      }
      setShowUserForm(false);
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'user'
      });
      loadUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showError(t('settings.errors.savingUser') + ' ' + errorMessage);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    // Handle both camelCase and snake_case formats
    const firstName = (user as any).firstName || user.first_name || '';
    const lastName = (user as any).lastName || user.last_name || '';
    setFormData({
      email: user.email || '',
      password: '',
      first_name: firstName,
      last_name: lastName,
      phone: user.phone || '',
      role: user.role || 'user'
    });
    setShowUserForm(true);
  };

  const handleUserClick = async (user: User) => {
    // Ensure user data is in correct format
    const formattedUser = {
      ...user,
      first_name: (user as any).firstName || user.first_name || '',
      last_name: (user as any).lastName || user.last_name || '',
      is_active: (user as any).isActive !== undefined ? (user as any).isActive : user.is_active !== undefined ? user.is_active : true,
    };
    setSelectedUser(formattedUser as User);
    await loadUserPermissions(user.id);
    setShowUserDetailModal(true);
  };

  const handleOpenPermissions = async (user: User) => {
    setSelectedUser(user);
    await loadUserPermissions(user.id);
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    
    try {
      for (const p of permissions) {
        if (p.can_delete && (!p.permission_password || !p.permission_password.trim())) {
          const pageInfo = AVAILABLE_PAGES.find(page => page.value === p.page);
          const pageLabel = pageInfo ? (t(pageInfo.labelKey) || pageInfo.label) : p.page;
          showError(`${pageLabel} ${t('settings.permissionPasswordRequired')}`);
          return;
        }
      }
      
      const permissionsToSave = permissions.filter(p => 
        p.can_view || p.can_add || p.can_edit || p.can_delete
      ).map(p => ({
        page: p.page,
        can_view: p.can_view || false,
        can_add: p.can_add || false,
        can_edit: p.can_edit || false,
        can_delete: p.can_delete || false,
        permission_password: p.can_delete && p.permission_password ? p.permission_password : null
      }));
      
      await usersAPI.updatePermissions(selectedUser.id, permissionsToSave);
      showSuccess(t('settings.permissionsSaved'));
      setShowPermissionsModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      showError(t('settings.errors.savingPermissions') + ' ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = (userId: string) => {
    setDeleteModal({ isOpen: true, userId });
  };

  const confirmDelete = async () => {
    if (!deleteModal.userId) return;
    try {
      await usersAPI.delete(deleteModal.userId);
      showSuccess(t('settings.userDeleted'));
      setDeleteModal({ isOpen: false, userId: null });
      loadUsers();
    } catch (error: any) {
      showError(t('settings.errors.deletingUser') + ' ' + (error.response?.data?.error || error.message));
      setDeleteModal({ isOpen: false, userId: null });
    }
  };

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.settingsPage}>
      <div className={styles.pageHeader}>
        <h1>{t('settings.title')}</h1>
        <div className={styles.headerButtons}>
          <button onClick={() => setShowSocialMediaModal(true)} className={styles.btnPrimary}>{t('settings.socialMediaLinks')}</button>
          <button onClick={() => router.push('/admin-panel/settings/company-info')} className={styles.btnPrimary}>{t('settings.companyInfo')}</button>
          <button onClick={() => setShowContactLocationsModal(true)} className={styles.btnPrimary}>{t('settings.contactInfo') || 'İletişim Bilgileri'}</button>
          <button onClick={() => setShowTaxModal(true)} className={styles.btnPrimary}>{t('settings.taxRate')}</button>
          <button onClick={() => {
            setEditingUser(null);
            setFormData({
              email: '',
              password: '',
              first_name: '',
              last_name: '',
              phone: '',
              role: 'user'
            });
            setShowUserForm(true);
          }} className={styles.btnPrimary}>{t('settings.addUser')}</button>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'users' ? styles.active : ''}
          onClick={() => setActiveTab('users')}
        >
          {t('settings.users')}
        </button>
        <button
          className={activeTab === 'receipts' ? styles.active : ''}
          onClick={() => setActiveTab('receipts')}
        >
          {t('settings.receipts')}
        </button>
      </div>

      {/* Social Media Modal */}
      {showSocialMediaModal && (
        <div className={styles.modal} onClick={() => setShowSocialMediaModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('settings.socialMediaLinks')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowSocialMediaModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.formGroup}>
              <label>{t('settings.phone')}</label>
              <input
                type="tel"
                placeholder={t('settings.phonePlaceholder')}
                value={socialMediaLinks.phone}
                onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, phone: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('settings.facebookUrl')}</label>
              <input
                type="url"
                placeholder={t('settings.facebookPlaceholder')}
                value={socialMediaLinks.facebook}
                onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, facebook: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('settings.instagramUrl')}</label>
              <input
                type="url"
                placeholder={t('settings.instagramPlaceholder')}
                value={socialMediaLinks.instagram}
                onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, instagram: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t('settings.xUrl')}</label>
              <input
                type="url"
                placeholder={t('settings.xPlaceholder')}
                value={socialMediaLinks.x}
                onChange={(e) => setSocialMediaLinks({ ...socialMediaLinks, x: e.target.value })}
              />
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveSocialMedia} className={styles.btnPrimary}>{t('common.save')}</button>
              <button onClick={() => setShowSocialMediaModal(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Modal */}
      {showTaxModal && (
        <div className={styles.modal} onClick={() => setShowTaxModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('settings.taxSettingsCanada')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowTaxModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.formGroup}>
              <label>{t('settings.federalTax')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder={t('settings.federalTaxPlaceholder')}
                value={federalTaxRate}
                onChange={(e) => setFederalTaxRate(e.target.value)}
              />
              <small>{t('settings.federalTaxDescription')}</small>
            </div>
            <div className={styles.formGroup}>
              <label>{t('settings.provincialTax')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder={t('settings.provincialTaxPlaceholder')}
                value={provincialTaxRate}
                onChange={(e) => setProvincialTaxRate(e.target.value)}
              />
              <small>{t('settings.provincialTaxDescription')}</small>
            </div>
            <div className={styles.totalTaxRate}>
              <strong>{t('settings.totalTaxRate')}:</strong> {(parseFloat(federalTaxRate) + parseFloat(provincialTaxRate)).toFixed(2)}%
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSaveTaxRate} className={styles.btnPrimary}>{t('common.save')}</button>
              <button onClick={() => setShowTaxModal(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Locations Modal */}
      {showContactLocationsModal && (
        <div className={styles.modal} onClick={() => setShowContactLocationsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('settings.contactInfoBranches')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowContactLocationsModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {contactLocations.map((location, index) => (
              <div key={index} className={styles.locationSection}>
                <h3>{t('settings.branch')} {index + 1}</h3>
                <div className={styles.formGroup}>
                  <label>{t('settings.branchName')}</label>
                  <input
                    type="text"
                    placeholder={t('settings.branchNamePlaceholder')}
                    value={location.name}
                    onChange={(e) => {
                      const updated = [...contactLocations];
                      updated[index].name = e.target.value;
                      setContactLocations(updated);
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('settings.address')}</label>
                  <input
                    type="text"
                    placeholder={t('settings.addressPlaceholder')}
                    value={location.address}
                    onChange={(e) => {
                      const updated = [...contactLocations];
                      updated[index].address = e.target.value;
                      setContactLocations(updated);
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('settings.phone')}</label>
                  <input
                    type="tel"
                    placeholder={t('settings.phonePlaceholder')}
                    value={location.phone}
                    onChange={(e) => {
                      const updated = [...contactLocations];
                      updated[index].phone = e.target.value;
                      setContactLocations(updated);
                    }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>{t('settings.workingHours')}</label>
                  <input
                    type="text"
                    placeholder={t('settings.workingHoursPlaceholder')}
                    value={location.hours}
                    onChange={(e) => {
                      const updated = [...contactLocations];
                      updated[index].hours = e.target.value;
                      setContactLocations(updated);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className={styles.modalActions}>
              <button onClick={handleSaveContactLocations} className={styles.btnPrimary}>{t('common.save')}</button>
              <button onClick={() => setShowContactLocationsModal(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className={styles.modal} onClick={() => setShowUserForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingUser ? t('settings.editUser') : t('settings.addUser')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowUserForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <input
                name="email"
                type="email"
                placeholder={t('settings.email')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                name="password"
                type="text"
                placeholder={editingUser ? t('settings.newPasswordPlaceholder') : t('settings.password')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
              />
              {editingUser?.role !== 'admin' && (
                <>
                  <input
                    name="first_name"
                    placeholder={t('settings.firstName')}
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                  <input
                    name="last_name"
                    placeholder={t('settings.lastName')}
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                  <input
                    name="phone"
                    placeholder={t('settings.phone')}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">{t('settings.user')}</option>
                    <option value="admin">{t('settings.admin')}</option>
                  </select>
                </>
              )}
              <div className={styles.modalActions}>
                <button type="submit" className={styles.btnPrimary}>{t('common.save')}</button>
                <button type="button" onClick={() => setShowUserForm(false)}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className={styles.modal} onClick={() => setShowUserDetailModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('settings.userDetails')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUser(null);
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.userDetailSection}>
                <div className={styles.detailRow}>
                  <label>{t('settings.email')}:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>{t('settings.nameSurname')}:</label>
                  <span>{selectedUser.first_name || '-'} {selectedUser.last_name || ''}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>{t('settings.phone')}:</label>
                  <span>{selectedUser.phone || '-'}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>{t('settings.role')}:</label>
                  <span>{selectedUser.role === 'admin' ? t('settings.admin') : t('settings.user')}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>{t('settings.status')}:</label>
                  <span>{selectedUser.is_active ? t('settings.active') : t('settings.inactive')}</span>
                </div>
                <div className={styles.detailRow}>
                  <label>{t('settings.createdAt')}:</label>
                  <span>{new Date(selectedUser.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
              </div>

              <div className={styles.userDetailSection}>
                <h3>{t('settings.permissions')}</h3>
                {permissions && permissions.length > 0 ? (
                  <div className={styles.permissionsSummary}>
                    {permissions.filter(p => p.can_view || p.can_add || p.can_edit || p.can_delete).map((perm, idx) => {
                      const pageInfo = AVAILABLE_PAGES.find(p => p.value === perm.page);
                      const pageLabel = pageInfo ? (t(pageInfo.labelKey) || pageInfo.label) : perm.page;
                      return (
                        <div key={idx} className={styles.permissionSummaryItem}>
                          <strong>{pageLabel}:</strong>
                          <div className={styles.permissionBadges}>
                            {perm.can_view && <span className={`${styles.badge} ${styles.badgeView}`}>{t('settings.viewPermission')}</span>}
                            {perm.can_add && <span className={`${styles.badge} ${styles.badgeAdd}`}>{t('settings.addPermission')}</span>}
                            {perm.can_edit && <span className={`${styles.badge} ${styles.badgeEdit}`}>{t('settings.editPermission')}</span>}
                            {perm.can_delete && <span className={`${styles.badge} ${styles.badgeDelete}`}>{t('settings.deletePermission')}</span>}
                          </div>
                        </div>
                      );
                    })}
                    {permissions.filter(p => p.can_view || p.can_add || p.can_edit || p.can_delete).length === 0 && (
                      <p>{t('settings.noPermissions')}</p>
                    )}
                  </div>
                ) : (
                  <p>{t('settings.noPermissions')}</p>
                )}
              </div>
            </div>
            <div className={styles.modalActions}>
              {selectedUser.role !== 'admin' && (
                <>
                  <button onClick={() => {
                    setShowUserDetailModal(false);
                    handleOpenPermissions(selectedUser);
                  }} className={styles.btnPermissions}>{t('settings.editPermissions')}</button>
                  <button onClick={() => {
                    setShowUserDetailModal(false);
                    handleDelete(selectedUser.id);
                  }} className={styles.btnDelete}>{t('settings.deleteUser')}</button>
                </>
              )}
              <button onClick={() => handleEdit(selectedUser)} className={styles.btnEdit}>{t('settings.editUserBtn')}</button>
              <button onClick={() => {
                setShowUserDetailModal(false);
                setSelectedUser(null);
              }} className={styles.btnCancel}>{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedUser && (
        <div className={styles.modal} onClick={() => setShowPermissionsModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedUser.email} - {t('settings.permissionsSettings')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowPermissionsModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.permissionsContainer}>
              {AVAILABLE_PAGES.map((page, idx) => {
                const perm = permissions[idx] || {
                  page: page.value,
                  can_view: false,
                  can_add: false,
                  can_edit: false,
                  can_delete: false,
                  permission_password: ''
                };
                const pageLabel = t(page.labelKey) || page.label;
                return (
                  <div key={page.value} className={styles.permissionSection}>
                    <h3>{pageLabel}</h3>
                    <div className={styles.permissionCheckboxes}>
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_view || false}
                          onChange={(e) => {
                            const updated = [...permissions];
                            updated[idx] = { ...perm, can_view: e.target.checked };
                            setPermissions(updated);
                          }}
                        />
                        {t('settings.viewPermission')}
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_add || false}
                          onChange={(e) => {
                            const updated = [...permissions];
                            updated[idx] = { ...perm, can_add: e.target.checked };
                            setPermissions(updated);
                          }}
                        />
                        {t('settings.addPermission')}
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_edit || false}
                          onChange={(e) => {
                            const updated = [...permissions];
                            updated[idx] = { ...perm, can_edit: e.target.checked };
                            setPermissions(updated);
                          }}
                        />
                        {t('settings.editPermission')}
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_delete || false}
                          onChange={(e) => {
                            const updated = [...permissions];
                            updated[idx] = { ...perm, can_delete: e.target.checked };
                            setPermissions(updated);
                          }}
                        />
                        {t('settings.deletePermission')}
                      </label>
                      {perm.can_delete && (
                        <div className={styles.permissionPassword}>
                          <label>{t('settings.deletePermissionPassword')}</label>
                          <input
                            type="password"
                            placeholder={t('settings.deletePermissionPasswordPlaceholder')}
                            value={perm.permission_password}
                            onChange={(e) => {
                              const updated = [...permissions];
                              updated[idx] = { ...perm, permission_password: e.target.value };
                              setPermissions(updated);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.modalActions}>
              <button onClick={handleSavePermissions} className={styles.btnPrimary}>{t('common.save')}</button>
              <button onClick={() => {
                setShowPermissionsModal(false);
                setSelectedUser(null);
              }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div className={styles.sectionHeader}>
            <h2>{t('settings.userManagement')}</h2>
          </div>

          {/* Desktop Table */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>{t('settings.email')}</th>
                  <th>{t('settings.nameSurname')}</th>
                  <th>{t('settings.phone')}</th>
                  <th>{t('settings.role')}</th>
                  <th>{t('settings.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} onClick={() => handleUserClick(user)} style={{ cursor: 'pointer' }}>
                    <td>{user.email}</td>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.role === 'admin' ? t('settings.admin') : t('settings.user')}</td>
                    <td>{user.is_active ? t('settings.active') : t('settings.inactive')}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionButtons}>
                        <button onClick={() => handleEdit(user)} className={styles.btnEdit}>{t('common.edit')}</button>
                        {user.role !== 'admin' && (
                          <>
                            <button onClick={() => handleOpenPermissions(user)} className={styles.btnPermissions}>{t('settings.permissions')}</button>
                            <button onClick={() => handleDelete(user.id)} className={styles.btnDelete}>{t('common.delete')}</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className={styles.mobileUsersList}>
            {users.map(user => (
              <div key={user.id} className={styles.userCard} onClick={() => handleUserClick(user)}>
                <div className={styles.userCardHeader}>
                  <div className={styles.userCardInfo}>
                    <div className={styles.userCardName}>{user.first_name} {user.last_name}</div>
                    <div className={styles.userCardEmail}>{user.email}</div>
                  </div>
                  <div className={styles.userCardBadges}>
                    <span className={`${styles.userCardBadge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                      {user.role === 'admin' ? t('settings.admin') : t('settings.user')}
                    </span>
                    <span className={`${styles.userCardBadge} ${user.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                      {user.is_active ? t('settings.active') : t('settings.inactive')}
                    </span>
                  </div>
                </div>
                {user.phone && (
                  <div className={styles.userCardDetail}>
                    <span className={styles.userCardLabel}>{t('settings.phone')}:</span>
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className={styles.userCardActions} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEdit(user)} className={styles.btnEdit}>{t('common.edit')}</button>
                  {user.role !== 'admin' && (
                    <>
                      <button onClick={() => handleOpenPermissions(user)} className={styles.btnPermissions}>{t('settings.permissions')}</button>
                      <button onClick={() => handleDelete(user.id)} className={styles.btnDelete}>{t('common.delete')}</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <ConfirmModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, userId: null })}
            onConfirm={confirmDelete}
            title={t('settings.deleteUserTitle')}
            message={t('settings.deleteUserConfirm')}
            confirmText={t('common.delete')}
            cancelText={t('common.cancel')}
            type="danger"
          />
        </>
      )}

      {/* Receipts Tab */}
      {activeTab === 'receipts' && (
        <div className={styles.receiptsSection}>
          <div className={styles.sectionHeader}>
            <h2>{t('settings.receiptsTitle')}</h2>
          </div>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder={t('settings.receiptsSearch')}
              value={receiptSearchTerm}
              onChange={(e) => setReceiptSearchTerm(e.target.value)}
            />
          </div>

          {receiptsLoading ? (
            <div className={styles.loading}>{t('settings.receiptsLoading')}</div>
          ) : receipts.length === 0 ? (
            <div className={styles.noResults}>{t('settings.noReceipts')}</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>{t('settings.receiptDate')}</th>
                      <th>{t('settings.receiptCustomer')}</th>
                      <th>{t('settings.receiptPhone')}</th>
                      <th>{t('settings.receiptPlate')}</th>
                      <th>{t('settings.receiptService')}</th>
                      <th>{t('settings.receiptAmount')}</th>
                      <th>{t('settings.receiptActions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map(receipt => (
                      <tr key={receipt.id}>
                        <td>{new Date(receipt.performed_date).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</td>
                        <td>{receipt.customer_name}</td>
                        <td>{receipt.customer_phone || '-'}</td>
                        <td>{receipt.license_plate || '-'}</td>
                        <td>{receipt.service_name}</td>
                        <td>${parseFloat(String(receipt.price)).toFixed(2)}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button
                              onClick={() => handlePrintReceipt(receipt)}
                              className={styles.btnPrimary}
                            >
                              🖨️ {t('settings.receiptPrint') || 'Makbuz Yazdır'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReceipt(receipt);
                                setShowReceiptModal(true);
                              }}
                              className={styles.btnEdit}
                            >
                              {t('settings.receiptDetail') || 'Detay'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className={styles.mobileReceiptsList}>
                {receipts.map(receipt => (
                  <div key={receipt.id} className={styles.receiptCard}>
                    <div className={styles.receiptCardHeader}>
                      <div className={styles.receiptCardDate}>
                        {new Date(receipt.performed_date).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                      </div>
                      <div className={styles.receiptCardAmount}>
                        ${parseFloat(String(receipt.price)).toFixed(2)}
                      </div>
                    </div>
                    <div className={styles.receiptCardBody}>
                      <div className={styles.receiptCardDetail}>
                        <span className={styles.receiptCardLabel}>{t('settings.receiptCustomer')}:</span>
                        <span>{receipt.customer_name}</span>
                      </div>
                      {receipt.customer_phone && (
                        <div className={styles.receiptCardDetail}>
                          <span className={styles.receiptCardLabel}>{t('settings.receiptPhone')}:</span>
                          <span>{receipt.customer_phone}</span>
                        </div>
                      )}
                      {receipt.license_plate && (
                        <div className={styles.receiptCardDetail}>
                          <span className={styles.receiptCardLabel}>{t('settings.receiptPlate')}:</span>
                          <span>{receipt.license_plate}</span>
                        </div>
                      )}
                      <div className={styles.receiptCardDetail}>
                        <span className={styles.receiptCardLabel}>{t('settings.receiptService')}:</span>
                        <span>{receipt.service_name}</span>
                      </div>
                    </div>
                    <div className={styles.receiptCardActions}>
                      <button
                        onClick={() => handlePrintReceipt(receipt)}
                        className={styles.btnPrimary}
                      >
                        🖨️ {t('settings.receiptPrint') || 'Yazdır'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowReceiptModal(true);
                        }}
                        className={styles.btnEdit}
                      >
                        {t('settings.receiptDetail') || 'Detay'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Receipt Detail Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className={styles.modal} onClick={() => setShowReceiptModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('settings.receiptDetailTitle') || 'Makbuz Detayları'}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>{t('settings.receiptCustomerInfo') || 'Müşteri Bilgileri'}</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>{t('settings.receiptName') || 'İsim'}:</label>
                    <span>{selectedReceipt.customer_name}</span>
                  </div>
                  {selectedReceipt.customer_phone && (
                    <div className={styles.detailItem}>
                      <label>{t('settings.receiptPhone') || 'Telefon'}:</label>
                      <span>{selectedReceipt.customer_phone}</span>
                    </div>
                  )}
                  {selectedReceipt.customer_email && (
                    <div className={styles.detailItem}>
                      <label>{t('settings.email') || 'E-posta'}:</label>
                      <span>{selectedReceipt.customer_email}</span>
                    </div>
                  )}
                  {selectedReceipt.license_plate && (
                    <div className={styles.detailItem}>
                      <label>{t('settings.receiptPlate') || 'Plaka'}:</label>
                      <span>{selectedReceipt.license_plate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>{t('settings.receiptServiceInfo') || 'Hizmet Bilgileri'}</h3>
                <div className={styles.detailGrid}>
                  <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                    <label>{t('settings.receiptServiceName') || 'Hizmet Adı'}:</label>
                    <span>{selectedReceipt.service_name}</span>
                  </div>
                  {selectedReceipt.service_description && (
                    <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                      <label>{t('settings.receiptDescription') || 'Açıklama'}:</label>
                      <span>{selectedReceipt.service_description}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <label>{t('settings.receiptType') || 'Tip'}:</label>
                    <span>{selectedReceipt.service_type === 'repair' ? (t('settings.receiptTypeRepair') || 'Tamir') : selectedReceipt.service_type === 'car_wash' ? (t('settings.receiptTypeCarWash') || 'Oto Yıkama') : selectedReceipt.service_type || '-'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('settings.receiptAmountLabel') || 'Tutar'}:</label>
                    <span>${parseFloat(String(selectedReceipt.price)).toFixed(2)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('settings.receiptPerformedDate') || 'Yapılan Tarih'}:</label>
                    <span>{new Date(selectedReceipt.performed_date).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                  </div>
                  {selectedReceipt.created_at && (
                    <div className={styles.detailItem}>
                      <label>{t('settings.receiptCreatedDate') || 'Oluşturulma Tarihi'}:</label>
                      <span>{new Date(selectedReceipt.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => handlePrintReceipt(selectedReceipt)}
                className={styles.btnPrimary}
              >
                🖨️ {t('settings.receiptPrint') || 'Makbuz Yazdır'}
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setSelectedReceipt(null);
                }}
                className={styles.btnCancel}
              >
                {t('settings.receiptCloseBtn') || 'Kapat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
