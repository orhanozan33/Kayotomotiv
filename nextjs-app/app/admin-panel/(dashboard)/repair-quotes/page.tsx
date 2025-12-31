'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { adminRepairAPI as repairAPI, adminCarWashAPI as carWashAPI, adminSettingsAPI as settingsAPI, adminReceiptsAPI as receiptsAPI } from '@/lib/services/adminApi';
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

  useEffect(() => {
    loadCarWashServices();
    loadTaxRate();
  }, [loadCarWashServices]);

  const loadTaxRate = async () => {
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
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'vehicle_brand') {
      setFormData({
        ...formData,
        vehicle_brand: value,
        vehicle_model: ''
      });
      setAvailableModels(value ? (carBrandsAndModels[value] || []) : []);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const calculatePriceWithTax = (basePrice: number) => {
    const price = parseFloat(String(basePrice));
    if (isNaN(price) || taxRate === 0) return price;
    return price * (1 + taxRate / 100);
  };

  const handleAddService = (service: Package | Addon, type: 'package' | 'addon') => {
    const basePrice = type === 'package' ? (service as Package).base_price : (service as Addon).price;
    const serviceItem: ServiceItem = {
      id: service.id,
      type: type,
      name: service.name,
      price: basePrice,
      priceWithTax: calculatePriceWithTax(basePrice)
    };
    setSelectedServices([...selectedServices, serviceItem]);
  };

  const handleRemoveService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return selectedServices.reduce((sum, service) => sum + parseFloat(String(service.price || 0)), 0);
  };

  const calculateTaxAmount = () => {
    return calculateTotal() - calculateSubtotal();
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => {
      const itemPrice = parseFloat(String(service.price || 0));
      const itemTotal = calculatePriceWithTax(itemPrice);
      return sum + itemTotal;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedServices.length === 0) {
        showError(t('repairQuotes.form.selectAtLeastOneService') || 'Lütfen en az bir hizmet seçin!');
        return;
      }

      const servicesWithTax = selectedServices.map(service => ({
        ...service,
        price: calculatePriceWithTax(service.price)
      }));

      const vehicleData = {
        vehicle_brand: formData.vehicle_brand.trim(),
        vehicle_model: formData.vehicle_model.trim(),
        license_plate: formData.license_plate.trim(),
        selected_services: servicesWithTax,
        total_price: calculateTotal()
      };

      await repairAPI.createVehicleRecord(vehicleData);
      showSuccess(t('repairQuotes.createdSuccessfully') || 'Araç başarıyla eklendi!');
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
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showError(t('repairQuotes.errors.creating') || 'Araç eklenirken hata oluştu: ' + errorMessage);
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
  };

  const handleDeleteRecord = (quoteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, quoteId });
  };

  const confirmDeleteRecord = async () => {
    if (!deleteModal.quoteId) return;
    try {
      await repairAPI.deleteQuote(deleteModal.quoteId);
      showSuccess(t('repairQuotes.deletedSuccessfully') || 'Kayıt başarıyla silindi!');
      setDeleteModal({ isOpen: false, quoteId: null });
      loadData();
      loadRevenueStats();
    } catch (error: any) {
      showError(error.response?.data?.error || 'Kayıt silinirken hata oluştu');
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
      showSuccess(t('repairQuotes.serviceDeleted') || 'Hizmet silindi!');
    } catch (error: any) {
      showError(t('repairQuotes.errors.deletingService') || 'Hizmet silinirken hata oluştu: ' + (error.response?.data?.error || error.message));
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
      const servicesList = services.map(s => `${s.name} - $${parseFloat(String(s.price || 0)).toFixed(2)}`).join(', ');

      const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2);
      const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2);
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate;
      
      const totalPrice = parseFloat(String(selectedQuote.total_price || 0));
      let basePrice = totalPrice;
      let federalTaxAmount = 0;
      let provincialTaxAmount = 0;
      let totalTaxAmount = 0;
      
      if (totalTaxRate > 0) {
        basePrice = totalPrice / (1 + totalTaxRate / 100);
        totalTaxAmount = totalPrice - basePrice;
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
      ${services.map(s => `
      <div class="service-row">
        <span>${s.name}</span>
        <span>$${parseFloat(String(s.price)).toFixed(2)}</span>
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
      <span>$${totalPrice.toFixed(2)}</span>
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
          showError(t('repairQuotes.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu');
          printWindow.close();
        }
      } else {
        showError('Popup engellendi. Lütfen popup blocker\'ı kapatın.');
      }
    } catch (error: any) {
      console.error('Error printing receipt:', error);
      showError(t('repairQuotes.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const currentRevenue = getCurrentRevenue();

  if (loading) return <div className={styles.loading}>{t('common.loading') || 'Loading...'}</div>;

  return (
    <div className={styles.repairQuotesPage}>
      <div className={styles.pageHeader}>
        <h1>{t('repairQuotes.title') || 'Oto Yıkama Kayıt'}</h1>
        <button className={styles.btnAdd} onClick={() => setShowModal(true)}>
          {t('repairQuotes.addVehicle') || 'Araç Ekle'}
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
              {t('repairQuotes.revenue.daily') || 'Günlük'}
            </button>
            <button 
              className={revenuePeriod === 'monthly' ? styles.active : ''} 
              onClick={() => setRevenuePeriod('monthly')}
            >
              {t('repairQuotes.revenue.monthly') || 'Aylık'}
            </button>
            <button 
              className={revenuePeriod === 'yearly' ? styles.active : ''} 
              onClick={() => setRevenuePeriod('yearly')}
            >
              {t('repairQuotes.revenue.yearly') || 'Yıllık'}
            </button>
            <button 
              className={revenuePeriod === 'custom' ? styles.active : ''} 
              onClick={() => setRevenuePeriod('custom')}
            >
              {t('repairQuotes.revenue.dateRange') || 'Tarih Aralığı'}
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
                {t('repairQuotes.revenue.apply') || 'Uygula'}
              </button>
            </div>
          )}
        </div>
        <div className={styles.revenueStats}>
          <div className={styles.revenueStatCard}>
            <h3>{t('repairQuotes.revenue.totalRecords') || 'Toplam Kayıt'}</h3>
            <p className={styles.statNumber}>{currentRevenue.count}</p>
          </div>
          <div className={styles.revenueStatCard}>
            <h3>{t('repairQuotes.revenue.totalRevenue') || 'Toplam Gelir'}</h3>
            <p className={styles.statNumber}>${currentRevenue.totalRevenue.toFixed(2)}</p>
          </div>
          <div className={styles.revenueStatCard}>
            <h3>{t('repairQuotes.revenue.averagePrice') || 'Ortalama Fiyat'}</h3>
            <p className={styles.statNumber}>${currentRevenue.avgPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder={t('repairQuotes.search') || 'Marka, model veya plaka ile ara...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>{t('repairQuotes.tableHeaders.date') || 'Tarih'}</th>
              <th>{t('repairQuotes.tableHeaders.brand') || 'Marka'}</th>
              <th>{t('repairQuotes.tableHeaders.model') || 'Model'}</th>
              <th>{t('repairQuotes.tableHeaders.licensePlate') || 'Plaka'}</th>
              <th>{t('repairQuotes.tableHeaders.services') || 'Hizmetler'}</th>
              <th>{t('repairQuotes.tableHeaders.totalPrice') || 'Toplam'}</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.noDataCell}>
                  {t('repairQuotes.noData') || 'Kayıt bulunamadı'}
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
                            <li key={idx}>{service.name} (${service.price})</li>
                          ))}
                        </ul>
                      ) : '-'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.priceActionCell}>
                        <span className={styles.priceText}>${parseFloat(String(quote.total_price || 0)).toFixed(2)}</span>
                        <button
                          className={styles.btnDelete}
                          onClick={(e) => handleDeleteRecord(quote.id, e)}
                          title={t('common.delete') || 'Sil'}
                        >
                          {t('common.delete') || 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('repairQuotes.addVehicle') || 'Araç Ekle'}</h2>
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
                      placeholder={t('repairQuotes.tableHeaders.licensePlate') || 'Plaka'}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3>{t('repairQuotes.form.carWashServices') || 'Oto Yıkama Hizmetleri'}</h3>
                
                {/* Packages */}
                <div className={styles.servicesGroup}>
                  <h4>{t('repairQuotes.form.packages') || 'Paketler'}</h4>
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
                          {t('repairQuotes.form.addToCart') || 'Sepete Ekle'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Addons */}
                <div className={styles.servicesGroup}>
                  <h4>{t('repairQuotes.form.addons') || 'Ekstralar'}</h4>
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
                          {t('repairQuotes.form.addToCart') || 'Sepete Ekle'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Services Cart */}
                {selectedServices.length > 0 && (
                  <div className={styles.selectedServicesSection}>
                    <h4>{t('repairQuotes.form.selectedServices') || 'Seçilen Hizmetler'}</h4>
                    <div className={styles.selectedServicesList}>
                      {selectedServices.map((service, idx) => (
                        <div key={idx} className={styles.selectedServiceItem}>
                          <span>{service.name}</span>
                          <span>${service.price.toFixed(2)}</span>
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
                        <span>{t('repairQuotes.form.subtotal') || 'Ara Toplam'}:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      {taxRate > 0 && (
                        <div className={styles.summaryRow}>
                          <span>{t('repairQuotes.form.tax') || 'Vergi'} ({taxRate}%):</span>
                          <span>${calculateTaxAmount().toFixed(2)}</span>
                        </div>
                      )}
                      <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>{t('repairQuotes.form.total') || 'Toplam'}:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.btnPrimary}>
                  {t('repairQuotes.form.saveRecord') || 'Kaydet'}
                </button>
                <button type="button" onClick={() => {
                  setShowModal(false);
                  setSelectedServices([]);
                }}>
                  {t('common.cancel') || 'İptal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedQuote && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{t('repairQuotes.detail.title') || 'Kayıt Detayları'}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>{t('repairQuotes.detail.vehicleInfo') || 'Araç Bilgileri'}</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>{t('repairQuotes.tableHeaders.brand') || 'Marka'}:</label>
                    <span>{selectedQuote.vehicle_brand}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>{t('repairQuotes.tableHeaders.model') || 'Model'}:</label>
                    <span>{selectedQuote.vehicle_model}</span>
                  </div>
                  {selectedQuote.license_plate && (
                    <div className={styles.detailItem}>
                      <label>{t('repairQuotes.tableHeaders.licensePlate') || 'Plaka'}:</label>
                      <span>{selectedQuote.license_plate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>{t('repairQuotes.detail.services') || 'Hizmetler'}</h3>
                {selectedQuote.parsed_services && selectedQuote.parsed_services.length > 0 ? (
                  <div className={styles.servicesList}>
                    {selectedQuote.parsed_services.map((service, idx) => (
                      <div key={idx} className={styles.serviceItem}>
                        <span>{service.name}</span>
                        <span>${parseFloat(String(service.price)).toFixed(2)}</span>
                        <button
                          onClick={() => handleDeleteService(idx)}
                          className={styles.btnDeleteService}
                          title={t('common.delete') || 'Sil'}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{t('repairQuotes.detail.noServices') || 'Hizmet bulunamadı'}</p>
                )}
              </div>

              <div className={styles.detailSection}>
                <div className={`${styles.detailItem} ${styles.totalPrice}`}>
                  <label>{t('repairQuotes.tableHeaders.totalPrice') || 'Toplam Tutar'}:</label>
                  <span>${parseFloat(String(selectedQuote.total_price || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button onClick={handlePrintReceipt} className={styles.btnPrimary}>
                🖨️ {t('repairQuotes.detail.printReceipt') || 'Makbuz Yazdır'}
              </button>
              <button onClick={() => setShowDetailModal(false)}>
                {t('common.close') || 'Kapat'}
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
        title={t('repairQuotes.deleteTitle') || 'Kaydı Sil'}
        message={t('repairQuotes.deleteConfirm') || 'Bu kaydı silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />
    </div>
  );
}
