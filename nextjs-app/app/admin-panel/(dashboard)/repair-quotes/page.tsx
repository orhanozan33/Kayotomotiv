'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { adminRepairAPI as repairAPI, adminCarWashAPI as carWashAPI, adminSettingsAPI as settingsAPI, adminReceiptsAPI as receiptsAPI, adminUsersAPI as usersAPI } from '@/lib/services/adminApi';
import { carBrandsAndModels } from '@/lib/data/carBrands';
import ConfirmModal from '@/components/admin/ConfirmModal';
import styles from './repair-quotes.module.css';

interface Quote {
  id: string;
  vehicle_brand: string;
  vehicle_model: string;
  license_plate?: string;
  total_price: number;
  parsed_services?: Array<{ name: string; price: number }>;
  created_at: string;
}

interface Package {
  id: string;
  name: string;
  base_price: number;
  is_active: boolean;
}

interface Addon {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

interface ServiceItem {
  id: string;
  type: 'package' | 'addon';
  name: string;
  price: number;
  priceWithTax: number;
}

interface RevenueStats {
  count: number;
  totalRevenue: number;
  avgPrice: number;
}

export default function RepairQuotesPage() {
  const { t, i18n } = useTranslation();
  const { showError, showSuccess } = useError();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [revenueStats, setRevenueStats] = useState({
    daily: { count: 0, totalRevenue: 0, avgPrice: 0 },
    monthly: { count: 0, totalRevenue: 0, avgPrice: 0 },
    yearly: { count: 0, totalRevenue: 0, avgPrice: 0 },
    custom: { count: 0, totalRevenue: 0, avgPrice: 0 }
  });
  const [revenuePeriod, setRevenuePeriod] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [federalTaxRate, setFederalTaxRate] = useState(0);
  const [provincialTaxRate, setProvincialTaxRate] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quoteId: null as string | null });
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<any[] | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    vehicle_brand: '',
    vehicle_model: '',
    license_plate: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = searchTerm.trim() ? { search: searchTerm.trim() } : {};
      const quotesRes = await repairAPI.getVehicleRecords(params).catch(err => {
        console.error('Error loading vehicle records:', err);
        return { data: { quotes: [] } };
      });
      
      const quotesData = quotesRes.data?.quotes || [];
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const loadRevenueStats = useCallback(async () => {
    try {
      const periods = ['daily', 'monthly', 'yearly'];
      const revenuePromises = periods.map(period => 
        repairAPI.getVehicleRecordsRevenue({ period }).catch(err => {
          console.error(`Error loading ${period} revenue:`, err);
          return { data: { count: 0, totalRevenue: 0, avgPrice: 0 } };
        })
      );
      
      const [dailyRes, monthlyRes, yearlyRes] = await Promise.all(revenuePromises);
      
      setRevenueStats(prev => ({
        ...prev,
        daily: dailyRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 },
        monthly: monthlyRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 },
        yearly: yearlyRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 }
      }));

      if (customStartDate && customEndDate && revenuePeriod === 'custom') {
        const customRes = await repairAPI.getVehicleRecordsRevenue({ 
          period: 'custom', 
          startDate: customStartDate, 
          endDate: customEndDate 
        }).catch(err => {
          console.error('Error loading custom revenue:', err);
          return { data: { count: 0, totalRevenue: 0, avgPrice: 0 } };
        });
        setRevenueStats(prev => ({
          ...prev,
          custom: customRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 }
        }));
      }
    } catch (error) {
      console.error('Error loading revenue stats:', error);
    }
  }, [customStartDate, customEndDate, revenuePeriod]);

  const loadCarWashServices = useCallback(async () => {
    try {
      const [packagesRes, addonsRes] = await Promise.all([
        carWashAPI.getPackages().catch(err => {
          console.error('Error loading packages:', err);
          return { data: { packages: [] } };
        }),
        carWashAPI.getAddons().catch(err => {
          console.error('Error loading addons:', err);
          return { data: { addons: [] } };
        })
      ]);
      setPackages(packagesRes.data?.packages || []);
      setAddons(addonsRes.data?.addons || []);
    } catch (error) {
      console.error('Error loading car wash services:', error);
    }
  }, []);


  const loadTaxRate = useCallback(async () => {
    try {
      const response = await settingsAPI.getSettings();
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

  useEffect(() => {
    loadCarWashServices();
    loadTaxRate();
  }, [loadCarWashServices, loadTaxRate]);

  useEffect(() => {
    const delay = searchTerm ? 500 : 0;
    const timer = setTimeout(() => {
      loadData();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [searchTerm, loadData]);

  useEffect(() => {
    loadRevenueStats();
  }, [loadRevenueStats]);

  // Load user role and permissions
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (typeof window === 'undefined') return;
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);

          if (user.role === 'admin') {
            setUserPermissions([]);
            setPermissionsLoading(false);
          } else {
            try {
              setPermissionsLoading(true);
              const response = await usersAPI.getPermissions(user.id);
              const permissions = response.data?.permissions || [];
              setUserPermissions(permissions);
            } catch (error) {
              console.error('Error loading permissions:', error);
              setUserPermissions([]);
            } finally {
              setPermissionsLoading(false);
            }
          }
        } catch (e) {
          console.error('Error parsing user:', e);
          setPermissionsLoading(false);
        }
      } else {
        setPermissionsLoading(false);
      }
    };

    loadUserPermissions();
  }, []);

  // Check if user can delete
  const canDelete = () => {
    if (userRole === 'admin') return true;
    if (permissionsLoading || userPermissions === null) return false;
    const permission = userPermissions.find((p) => p.page === 'repair-quotes');
    return permission?.can_delete === true;
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'vehicle_brand') {
      setFormData(prev => ({
        ...prev,
        vehicle_brand: value,
        vehicle_model: ''
      }));
      setAvailableModels(value ? (carBrandsAndModels[value] || []) : []);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const calculatePriceWithTax = useCallback((basePrice: number) => {
    const price = parseFloat(String(basePrice));
    if (isNaN(price) || taxRate === 0) return price;
    return price * (1 + taxRate / 100);
  }, [taxRate]);

  const handleAddService = useCallback((service: Package | Addon, type: 'package' | 'addon') => {
    const basePrice = type === 'package' ? (service as Package).base_price : (service as Addon).price;
    const serviceItem: ServiceItem = {
      id: service.id,
      type: type,
      name: service.name,
      price: basePrice,
      priceWithTax: calculatePriceWithTax(basePrice)
    };
    setSelectedServices(prev => [...prev, serviceItem]);
  }, [calculatePriceWithTax]);

  const handleRemoveService = useCallback((index: number) => {
    setSelectedServices(prev => prev.filter((_, i) => i !== index));
  }, []);

  const calculateSubtotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => sum + parseFloat(String(service.price || 0)), 0);
  }, [selectedServices]);

  const calculateTotal = useMemo(() => {
    return selectedServices.reduce((sum, service) => {
      const itemPrice = parseFloat(String(service.price || 0));
      const itemTotal = calculatePriceWithTax(itemPrice);
      return sum + itemTotal;
    }, 0);
  }, [selectedServices, calculatePriceWithTax]);

  const calculateTaxAmount = useMemo(() => {
    return calculateTotal - calculateSubtotal;
  }, [calculateTotal, calculateSubtotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedServices.length === 0) {
        showError(t('repairQuotes.form.selectAtLeastOneService'));
        return;
      }

      // Map services to match API schema (id, type, name, price only)
      const servicesWithTax = selectedServices.map(service => ({
        id: service.id,
        type: service.type,
        name: service.name,
        price: calculatePriceWithTax(service.price)
      }));

      const vehicleData = {
        vehicle_brand: formData.vehicle_brand.trim(),
        vehicle_model: formData.vehicle_model.trim(),
        license_plate: formData.license_plate.trim() || null,
        selected_services: servicesWithTax,
        total_price: calculateTotal
      };

      await repairAPI.createVehicleRecord(vehicleData);
      showSuccess(t('repairQuotes.createdSuccessfully'));
      setShowModal(false);
      setFormData({
        vehicle_brand: '',
        vehicle_model: '',
        license_plate: ''
      });
      setAvailableModels([]);
      setSelectedServices([]);
      loadData();
      loadRevenueStats();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
      showError(t('repairQuotes.errors.creating') + ': ' + errorMessage);
    }
  };

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      loadRevenueStats();
    }
  };

  const getCurrentRevenue = (): RevenueStats => {
    if (revenuePeriod === 'custom' && customStartDate && customEndDate) {
      return revenueStats.custom;
    }
    return revenueStats[revenuePeriod] || { count: 0, totalRevenue: 0, avgPrice: 0 };
  };

  const handleRowClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
    setShowServiceForm(false);
  };

  const handleDeleteRecord = (quoteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, quoteId });
  };

  const confirmDeleteRecord = async () => {
    if (!deleteModal.quoteId) return;
    try {
      await repairAPI.deleteVehicleRecord(deleteModal.quoteId);
      showSuccess(t('repairQuotes.deletedSuccessfully'));
      setDeleteModal({ isOpen: false, quoteId: null });
      loadData();
      loadRevenueStats();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      showError(err.response?.data?.error || t('repairQuotes.errors.deletingService'));
    }
  };

  const handleDeleteService = async (serviceIndex: number) => {
    if (!selectedQuote) return;
    
    try {
      const services = selectedQuote.parsed_services || [];
      const updatedServices = services.filter((_, idx) => idx !== serviceIndex);
      const newTotal = updatedServices.reduce((sum, s) => sum + parseFloat(String(s.price || 0)), 0);
      
      const notesData = {
        license_plate: selectedQuote.license_plate || '',
        services: updatedServices
      };
      
      await repairAPI.updateQuoteStatus(selectedQuote.id, 'completed', JSON.stringify(notesData), newTotal);
      
      setSelectedQuote({
        ...selectedQuote,
        parsed_services: updatedServices,
        total_price: newTotal
      });
      
      await loadData();
      showSuccess(t('repairQuotes.serviceDeleted'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError(t('repairQuotes.errors.deletingService') + ': ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const handleAddServiceToQuote = async (service: any) => {
    if (!selectedQuote) return;
    
    try {
      const services = selectedQuote.parsed_services || [];
      const priceWithTax = calculatePriceWithTax(service.base_price || service.price || 0);
      const newService = {
        name: service.name,
        price: priceWithTax
      };
      const updatedServices = [...services, newService];
      const newTotal = updatedServices.reduce((sum, s) => sum + parseFloat(String(s.price || 0)), 0);
      
      const notesData = {
        license_plate: selectedQuote.license_plate || '',
        services: updatedServices
      };
      
      await repairAPI.updateQuoteStatus(selectedQuote.id, 'completed', JSON.stringify(notesData), newTotal);
      
      setSelectedQuote({
        ...selectedQuote,
        parsed_services: updatedServices,
        total_price: newTotal
      });
      
      await loadData();
      setShowServiceForm(false);
      showSuccess(t('repairQuotes.serviceAdded'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError(t('repairQuotes.errors.addingService') + ': ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const handlePrintReceipt = async () => {
    if (!selectedQuote) return;
    
    try {
      let companyInfo: any = {};
      try {
        const companyResponse = await settingsAPI.getCompanyInfo();
        companyInfo = companyResponse.data?.companyInfo || {};
      } catch (error) {
        console.error('Error loading company info:', error);
      }

      const services = selectedQuote.parsed_services || [];

      const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2);
      const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2);
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate;
      
      const totalPrice = parseFloat(String(selectedQuote.total_price || 0));
      
      // Calculate base prices for each service (tax excluded)
      let servicesSubtotal = 0;
      const servicesWithBasePrice = services.map((s: any) => {
        const servicePrice = parseFloat(String(s.price || 0));
        let baseServicePrice = servicePrice;
        
        // If tax rate > 0, service price is likely tax-inclusive, so extract base price
        if (totalTaxRate > 0) {
          baseServicePrice = servicePrice / (1 + totalTaxRate / 100);
        }
        
        servicesSubtotal += baseServicePrice;
        return {
          ...s,
          basePrice: baseServicePrice,
          taxIncludedPrice: servicePrice
        };
      });
      
      // Calculate base price (subtotal) - sum of all service base prices
      const basePrice = servicesSubtotal > 0 ? servicesSubtotal : (totalTaxRate > 0 ? totalPrice / (1 + totalTaxRate / 100) : totalPrice);
      
      // Calculate taxes from base price (subtotal)
      let federalTaxAmount = 0;
      let provincialTaxAmount = 0;
      let calculatedTotal = basePrice;
      
      if (totalTaxRate > 0 && basePrice > 0) {
        federalTaxAmount = basePrice * (effectiveFederalRate / 100);
        provincialTaxAmount = basePrice * (effectiveProvincialRate / 100);
        calculatedTotal = basePrice + federalTaxAmount + provincialTaxAmount;
      }
      
      // Use calculated total to ensure accuracy
      const finalTotal = calculatedTotal > 0 ? calculatedTotal : totalPrice;

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
    ${selectedQuote.license_plate ? `
    <div class="info-row">
      <span>Plaque:</span>
      <span>${selectedQuote.license_plate}</span>
    </div>
    ` : ''}
    <div class="info-row">
      <span>Véhicule:</span>
      <span>${selectedQuote.vehicle_brand} ${selectedQuote.vehicle_model}</span>
    </div>

    <div class="section-divider">
      <div class="service-title">SERVICES EFFECTUÉS</div>
      ${servicesWithBasePrice.map((s: any) => `
      <div class="service-row">
        <span>${s.name}</span>
        <span>$${s.basePrice.toFixed(2)}</span>
      </div>
      `).join('')}
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
      <span>$${finalTotal.toFixed(2)}</span>
    </div>

    <div class="date-info">
      <div>${new Date(selectedQuote.created_at).toLocaleDateString('fr-CA')}</div>
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
          showError(t('repairQuotes.errors.printingReceipt'));
          printWindow.close();
        }
      } else {
        showError(t('repairQuotes.errors.popupBlocked'));
      }
    } catch (error: any) {
      console.error('Error printing receipt:', error);
      showError(t('repairQuotes.errors.printingReceipt') + ': ' + (error.response?.data?.error || error.message || 'Unknown error'));
    }
  };

  const currentRevenue = getCurrentRevenue();

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.repairQuotesPage}>
      <div className={styles.pageHeader}>
        <h1>{t('repairQuotes.title')}</h1>
        <button className={styles.btnAdd} onClick={() => setShowModal(true)}>
          {t('repairQuotes.addVehicle')}
        </button>
      </div>

      {/* Revenue Statistics Section */}
      <div className={styles.revenueSection}>
        <div className={styles.revenueControls}>
          <div className={styles.periodSelector}>
            <button 
              className={revenuePeriod === 'daily' ? styles.active : ''} 
              onClick={() => setRevenuePeriod('daily')}
            >
              {t('repairQuotes.revenue.daily')}
            </button>
            <button 
              className={revenuePeriod === 'monthly' ? styles.active : ''} 
              onClick={() => setRevenuePeriod('monthly')}
            >
              {t('repairQuotes.revenue.monthly')}
            </button>
            <button 
              className={revenuePeriod === 'yearly' ? styles.active : ''} 
              onClick={() => setRevenuePeriod('yearly')}
            >
              {t('repairQuotes.revenue.yearly')}
            </button>
            <button 
              className={revenuePeriod === 'custom' ? styles.active : ''} 
              onClick={() => setRevenuePeriod('custom')}
            >
              {t('repairQuotes.revenue.dateRange')}
            </button>
          </div>
          {revenuePeriod === 'custom' && (
            <div className={styles.customDateRange}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={styles.dateInput}
              />
              <span> - </span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={styles.dateInput}
              />
              <button onClick={handleCustomDateChange} className={styles.btnApply}>
                {t('repairQuotes.revenue.apply')}
              </button>
            </div>
          )}
        </div>
        <div className={styles.revenueStats}>
          <div className={styles.revenueStatCard}>
            <h3>{t('repairQuotes.revenue.totalRecords')}</h3>
            <p className={styles.statNumber}>{currentRevenue.count}</p>
          </div>
          <div className={styles.revenueStatCard}>
            <h3>{t('repairQuotes.revenue.totalRevenue')}</h3>
            <p className={styles.statNumber}>${currentRevenue.totalRevenue.toFixed(2)}</p>
          </div>
          <div className={styles.revenueStatCard}>
            <h3>{t('repairQuotes.revenue.averagePrice')}</h3>
            <p className={styles.statNumber}>${currentRevenue.avgPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder={t('repairQuotes.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>{t('repairQuotes.tableHeaders.date')}</th>
              <th>{t('repairQuotes.tableHeaders.brand')}</th>
              <th>{t('repairQuotes.tableHeaders.model')}</th>
              <th>{t('repairQuotes.tableHeaders.licensePlate')}</th>
              <th>{t('repairQuotes.tableHeaders.services')}</th>
              <th>{t('repairQuotes.tableHeaders.totalPrice')}</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.noDataCell}>
                  {t('repairQuotes.noData')}
                </td>
              </tr>
            ) : (
              quotes.map(quote => {
                const services = quote.parsed_services || [];
                const licensePlate = quote.license_plate || '-';
                return (
                  <tr key={quote.id} onClick={() => handleRowClick(quote)} style={{ cursor: 'pointer' }}>
                    <td>{new Date(quote.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</td>
                    <td>{quote.vehicle_brand}</td>
                    <td>{quote.vehicle_model}</td>
                    <td>{licensePlate}</td>
                    <td>
                      {services.length > 0 ? (
                        <ul className={styles.servicesList}>
                          {services.map((service, idx) => (
                            <li key={idx}>{service.name} (${parseFloat(String(service.price || 0)).toFixed(2)})</li>
                          ))}
                        </ul>
                      ) : '-'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.priceActionCell}>
                        <span className={styles.priceText}>${parseFloat(String(quote.total_price || 0)).toFixed(2)}</span>
                        {canDelete() && (
                          <button
                            className={styles.btnDelete}
                            onClick={(e) => handleDeleteRecord(quote.id, e)}
                            title={t('common.delete')}
                          >
                            {t('common.delete')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileQuotesList}>
        {quotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            {t('repairQuotes.noData')}
          </div>
        ) : (
          quotes.map(quote => {
            const services = quote.parsed_services || [];
            const licensePlate = quote.license_plate || '-';
            return (
              <div
                key={quote.id}
                className={styles.quoteCard}
                onClick={() => handleRowClick(quote)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.quoteCardHeader}>
                  <div>
                    <div className={styles.quoteCardDate}>
                      {new Date(quote.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}
                    </div>
                    <div className={styles.quoteCardVehicle}>
                      {quote.vehicle_brand} {quote.vehicle_model}
                    </div>
                    <div className={styles.quoteCardPlate}>
                      🚗 {licensePlate}
                    </div>
                  </div>
                  <div className={styles.quoteCardPrice}>
                    ${parseFloat(String(quote.total_price || 0)).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('repairQuotes.addVehicle')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setShowModal(false);
                  setSelectedServices([]);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.vehicleForm}>
              <div className={styles.formSection}>
                <h3>Araç Bilgileri</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Araç Markası</label>
                    <select
                      name="vehicle_brand"
                      value={formData.vehicle_brand}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Marka Seçin</option>
                      {Object.keys(carBrandsAndModels).sort().map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Araç Modeli</label>
                    <select
                      name="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={handleInputChange}
                      disabled={!formData.vehicle_brand}
                      required
                    >
                      <option value="">Model Seçin</option>
                      {availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Plaka</label>
                    <input
                      type="text"
                      name="license_plate"
                      value={formData.license_plate}
                      onChange={handleInputChange}
                      placeholder={t('repairQuotes.tableHeaders.licensePlate')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3>{t('repairQuotes.form.carWashServices')}</h3>
                
                {/* Packages */}
                <div className={styles.servicesGroup}>
                  <h4>{t('repairQuotes.form.packages')}</h4>
                  <div className={styles.servicesGrid}>
                    {packages.filter(pkg => pkg.is_active).map(pkg => (
                      <div key={pkg.id} className={styles.serviceCard}>
                        <div className={styles.serviceInfo}>
                          <strong>{pkg.name}</strong>
                          <span className={styles.servicePrice}>${pkg.base_price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddService(pkg, 'package')}
                          className={styles.btnAddService}
                        >
                          {t('repairQuotes.form.addToCart')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Addons */}
                <div className={styles.servicesGroup}>
                  <h4>{t('repairQuotes.form.addons')}</h4>
                  <div className={styles.servicesGrid}>
                    {addons.filter(addon => addon.is_active).map(addon => (
                      <div key={addon.id} className={styles.serviceCard}>
                        <div className={styles.serviceInfo}>
                          <strong>{addon.name}</strong>
                          <span className={styles.servicePrice}>${addon.price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddService(addon, 'addon')}
                          className={styles.btnAddService}
                        >
                          {t('repairQuotes.form.addToCart')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Services Cart */}
                {selectedServices.length > 0 && (
                  <div className={styles.selectedServicesSection}>
                    <h4>{t('repairQuotes.form.selectedServices')}</h4>
                    <div className={styles.selectedServicesList}>
                      {selectedServices.map((service, idx) => (
                        <div key={idx} className={styles.selectedServiceItem}>
                          <span>{service.name}</span>
                          <span>${parseFloat(String(service.price || 0)).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(idx)}
                            className={styles.btnRemove}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className={styles.cartSummary}>
                      <div className={styles.summaryRow}>
                        <span>{t('repairQuotes.form.subtotal')}:</span>
                        <span>${calculateSubtotal.toFixed(2)}</span>
                      </div>
                      {taxRate > 0 && (
                        <div className={styles.summaryRow}>
                          <span>{t('repairQuotes.form.tax')} ({taxRate}%):</span>
                          <span>${calculateTaxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>{t('repairQuotes.form.total')}:</span>
                        <span>${calculateTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.btnPrimary}>
                  {t('repairQuotes.form.saveRecord')}
                </button>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setSelectedServices([]);
                }}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedQuote && (
        <div className={styles.modalOverlay} onClick={() => {
          setShowDetailModal(false);
          setShowServiceForm(false);
        }}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('repairQuotes.detail.title')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setShowDetailModal(false);
                  setShowServiceForm(false);
                }}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>{t('repairQuotes.detail.vehicleInfo')}</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>{t('repairQuotes.tableHeaders.brand')}:</label>
                    <span>{selectedQuote.vehicle_brand}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('repairQuotes.tableHeaders.model')}:</label>
                    <span>{selectedQuote.vehicle_model}</span>
                  </div>
                  {selectedQuote.license_plate && (
                    <div className={styles.detailItem}>
                      <label>{t('repairQuotes.tableHeaders.licensePlate')}:</label>
                      <span>{selectedQuote.license_plate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{t('repairQuotes.detail.services')}</h3>
                  <button
                    onClick={() => setShowServiceForm(!showServiceForm)}
                    className={styles.btnPrimary}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {showServiceForm ? t('common.cancel') : t('repairQuotes.detail.addService')}
                  </button>
                </div>
                
                {showServiceForm && (
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: '8px', border: '2px solid #e0e0e0' }}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>{t('repairQuotes.detail.selectService')}</h4>
                    
                    {/* Packages */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem', fontWeight: 600, color: '#333' }}>{t('repairQuotes.form.packages')}</h5>
                      <div className={styles.servicesGrid}>
                        {packages.filter((pkg: any) => pkg.is_active).map((pkg: any) => (
                          <div key={pkg.id} className={styles.serviceCard}>
                            <div className={styles.serviceInfo}>
                              <strong>{pkg.name}</strong>
                              {pkg.description && <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>{pkg.description}</div>}
                              <span className={styles.servicePrice}>
                                ${parseFloat(String(pkg.base_price || 0)).toFixed(2)}
                                {taxRate > 0 && (
                                  <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
                                    (${calculatePriceWithTax(pkg.base_price || 0).toFixed(2)} vergi ile)
                                  </span>
                                )}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddServiceToQuote({ ...pkg, type: 'package', base_price: pkg.base_price })}
                              className={styles.btnAddService}
                            >
                              {t('repairQuotes.form.addToCart')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Addons */}
                    <div>
                      <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem', fontWeight: 600, color: '#333' }}>{t('repairQuotes.form.addons')}</h5>
                      <div className={styles.servicesGrid}>
                        {addons.filter((addon: any) => addon.is_active).map((addon: any) => (
                          <div key={addon.id} className={styles.serviceCard}>
                            <div className={styles.serviceInfo}>
                              <strong>{addon.name}</strong>
                              {addon.description && <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>{addon.description}</div>}
                              <span className={styles.servicePrice}>
                                ${parseFloat(String(addon.price || 0)).toFixed(2)}
                                {taxRate > 0 && (
                                  <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem' }}>
                                    (${calculatePriceWithTax(addon.price || 0).toFixed(2)} vergi ile)
                                  </span>
                                )}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddServiceToQuote({ ...addon, type: 'addon', base_price: addon.price })}
                              className={styles.btnAddService}
                            >
                              {t('repairQuotes.form.addToCart')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedQuote.parsed_services && selectedQuote.parsed_services.length > 0 ? (
                  <div className={styles.servicesList}>
                    {selectedQuote.parsed_services.map((service, idx) => (
                      <div key={idx} className={styles.serviceItem}>
                        <span>{service.name}</span>
                        <span>${parseFloat(String(service.price || 0)).toFixed(2)}</span>
                        <button
                          onClick={() => handleDeleteService(idx)}
                          className={styles.btnDeleteService}
                          title={t('common.delete')}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{t('repairQuotes.detail.noServices')}</p>
                )}
              </div>

              <div className={styles.detailSection}>
                <div className={`${styles.detailItem} ${styles.totalPrice}`}>
                  <label>{t('repairQuotes.tableHeaders.totalPrice')}:</label>
                  <span>${parseFloat(String(selectedQuote.total_price || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handlePrintReceipt} className={styles.btnPrimary}>
                🖨️ {t('repairQuotes.detail.printReceipt')}
              </button>
              {canDelete() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRecord(selectedQuote.id, e);
                    setShowDetailModal(false);
                    setShowServiceForm(false);
                  }}
                  className={styles.btnDelete}
                >
                  🗑️ {t('common.delete')}
                </button>
              )}
              <button onClick={() => {
                setShowDetailModal(false);
                setShowServiceForm(false);
              }}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quoteId: null })}
        onConfirm={confirmDeleteRecord}
        title={t('repairQuotes.confirmDeleteTitle')}
        message={t('repairQuotes.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />
    </div>
  );
}
