'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminCustomersAPI, adminSettingsAPI, adminRepairAPI, adminCarWashAPI } from '@/lib/services/adminApi';
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

interface ServiceCartItem {
  id: string;
  service: any;
  type: string;
  price: number | string;
}

export default function CustomerDetailModal({ customer, onClose, onUpdate }: CustomerDetailModalProps) {
  const { t } = useTranslation('common');
  const [customerData, setCustomerData] = useState<Customer>(customer);
  const [activeTab, setActiveTab] = useState<'details' | 'vehicles' | 'services' | 'stats'>('details');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteServiceModal, setDeleteServiceModal] = useState({ isOpen: false, serviceId: null as string | null });
  const [taxRate, setTaxRate] = useState(0);
  const [federalTaxRate, setFederalTaxRate] = useState(0);
  const [provincialTaxRate, setProvincialTaxRate] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    license_plate: '',
    notes: ''
  });
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [vehicleFormData, setVehicleFormData] = useState({
    brand: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    color: '',
    mileage: '',
    notes: ''
  });
  const [serviceFormData, setServiceFormData] = useState({
    vehicle_id: '',
    service_type: 'repair',
    service_name: '',
    service_description: '',
    price: '',
    performed_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [repairServices, setRepairServices] = useState<any[]>([]);
  const [carWashPackages, setCarWashPackages] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [availableVehicleModels, setAvailableVehicleModels] = useState<string[]>([]);
  const [serviceCart, setServiceCart] = useState<ServiceCartItem[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  useEffect(() => {
    if (customer) {
      setCustomerData(customer);
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        vehicle_brand: customer.vehicle_brand || '',
        vehicle_model: customer.vehicle_model || '',
        vehicle_year: customer.vehicle_year?.toString() || '',
        license_plate: customer.license_plate || '',
        notes: customer.notes || ''
      });
    }
  }, [customer]);

  useEffect(() => {
    loadTaxRate();
    loadRepairServices();
    loadCarWashPackages();
  }, []);

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

  const loadRepairServices = async () => {
    try {
      setLoadingServices(true);
      const response = await adminRepairAPI.getServices().catch(() => ({ data: { services: [] } }));
      setRepairServices(response.data?.services || []);
    } catch (error) {
      console.error('Error loading repair services:', error);
      setRepairServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadCarWashPackages = async () => {
    try {
      const response = await adminCarWashAPI.getPackages().catch(() => ({ data: { packages: [] } }));
      setCarWashPackages(response.data?.packages || []);
    } catch (error) {
      console.error('Error loading car wash packages:', error);
      setCarWashPackages([]);
    }
  };

  const loadCustomerData = async () => {
    try {
      const response = await adminCustomersAPI.getById(customerData.id.toString());
      setCustomerData(response.data.customer);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError((t('customers.errors.loadingDetails') || 'Error loading details') + ': ' + (err.response?.data?.error || err.message));
    }
  };

  const reloadCustomerData = async () => {
    const currentCustomer = customerData || customer;
    if (currentCustomer?.id) {
      try {
        const response = await adminCustomersAPI.getById(currentCustomer.id.toString());
        const updatedCustomer = response.data.customer;
        setCustomerData(updatedCustomer);
      } catch (error) {
        console.error('Error reloading customer:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleVehicleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'brand') {
      setVehicleFormData({
        ...vehicleFormData,
        brand: value,
        model: '' // Reset model when brand changes
      });
      setAvailableVehicleModels(value ? (carBrandsAndModels[value] || []) : []);
    } else {
      setVehicleFormData({
        ...vehicleFormData,
        [name]: value
      });
    }
  };

  const handleServiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServiceFormData({
      ...serviceFormData,
      [name]: value
    });
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData?.id) {
      showError('Müşteri bilgisi bulunamadı');
      return;
    }
    
    // Validate required fields
    if (!vehicleFormData.brand || !vehicleFormData.brand.trim()) {
      showError('Marka gereklidir');
      return;
    }
    if (!vehicleFormData.model || !vehicleFormData.model.trim()) {
      showError('Model gereklidir');
      return;
    }
    
    try {
      const yearValue = vehicleFormData.year && vehicleFormData.year.trim() ? parseInt(vehicleFormData.year) : null;
      const mileageValue = vehicleFormData.mileage && vehicleFormData.mileage.toString().trim() ? parseInt(vehicleFormData.mileage) : null;
      
      await adminCustomersAPI.addVehicle(customerData.id.toString(), {
        brand: vehicleFormData.brand.trim(),
        model: vehicleFormData.model.trim(),
        year: isNaN(yearValue || 0) ? null : yearValue,
        license_plate: vehicleFormData.license_plate?.trim() || null,
        vin: vehicleFormData.vin?.trim() || null,
        color: vehicleFormData.color?.trim() || null,
        mileage: isNaN(mileageValue || 0) ? null : mileageValue,
        notes: vehicleFormData.notes?.trim() || null
      });
      showSuccessMessage(t('customers.detail.vehicleAdded') || 'Araç başarıyla eklendi!');
      setShowVehicleForm(false);
      setAvailableVehicleModels([]);
      setVehicleFormData({
        brand: '', model: '', year: '', license_plate: '', vin: '',
        color: '', mileage: '', notes: ''
      });
      await reloadCustomerData();
      onUpdate();
    } catch (error: unknown) {
      console.error('Error adding vehicle:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = err.response?.data?.error || err.message || 'Araç eklenirken hata oluştu';
      showError(errorMsg);
    }
  };

  const handleAddToCart = (service: any, type: string = 'repair') => {
    const cartItem: ServiceCartItem = {
      id: `${type}_${service.id}_${Date.now()}`,
      service: service,
      type: type,
      price: service.base_price || service.price || 0
    };
    setServiceCart(prev => [...prev, cartItem]);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setServiceCart(prev => prev.filter(item => item.id !== itemId));
  };

  const calculatePriceWithTax = (price: number | string): number => {
    const basePrice = parseFloat(String(price || 0));
    const totalTaxRate = federalTaxRate + provincialTaxRate;
    const effectiveTaxRate = (federalTaxRate > 0 || provincialTaxRate > 0) ? totalTaxRate : taxRate;
    const taxAmount = basePrice * (effectiveTaxRate / 100);
    return basePrice + taxAmount;
  };

  const calculateTotal = (): number => {
    return serviceCart.reduce((total, item) => {
      const itemPrice = parseFloat(String(item.price || 0));
      const itemTotal = calculatePriceWithTax(itemPrice);
      return total + itemTotal;
    }, 0);
  };

  const calculateSubtotal = (): number => {
    return serviceCart.reduce((total, item) => total + parseFloat(String(item.price || 0)), 0);
  };

  const calculateTaxAmount = (): number => {
    return calculateTotal() - calculateSubtotal();
  };

  const calculateFederalTax = (): number => {
    const subtotal = calculateSubtotal();
    const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2);
    return subtotal * (effectiveFederalRate / 100);
  };

  const calculateProvincialTax = (): number => {
    const subtotal = calculateSubtotal();
    const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2);
    return subtotal * (effectiveProvincialRate / 100);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData?.id) {
      showError('Müşteri bilgisi bulunamadı');
      return;
    }

    try {
      const priceWithTax = calculatePriceWithTax(serviceFormData.price || 0);
      const serviceData = {
        vehicle_id: (serviceFormData.vehicle_id && serviceFormData.vehicle_id.trim()) ? serviceFormData.vehicle_id : null,
        service_type: serviceFormData.service_type || 'other',
        service_name: serviceFormData.service_name,
        service_description: serviceFormData.service_description || '',
        price: priceWithTax,
        performed_date: serviceFormData.performed_date || new Date().toISOString().split('T')[0],
      };
      await adminCustomersAPI.addServiceRecord(customerData.id.toString(), serviceData);
      showSuccessMessage(t('customers.detail.serviceAdded') || 'Hizmet başarıyla eklendi!');
      setShowServiceForm(false);
      setServiceFormData({
        vehicle_id: '', service_type: 'repair', service_name: '',
        service_description: '', price: '', performed_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      await reloadCustomerData();
      onUpdate();
    } catch (error: unknown) {
      console.error('Error adding service:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError((t('customers.errors.addingService') || 'Hizmet eklenirken hata oluştu') + ': ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCheckoutCart = async () => {
    if (serviceCart.length === 0) {
      showError(t('customers.detail.cartEmpty') || 'Sepet boş!');
      return;
    }

    try {
      const promises = serviceCart.map(async (cartItem) => {
        const priceWithTax = calculatePriceWithTax(cartItem.price);
        const serviceData = {
          vehicle_id: (serviceFormData.vehicle_id && serviceFormData.vehicle_id.trim()) ? serviceFormData.vehicle_id : null,
          service_type: cartItem.type === 'repair' ? 'repair' : 'car_wash',
          service_name: cartItem.service.name,
          service_description: cartItem.service.description || '',
          price: priceWithTax,
          performed_date: serviceFormData.performed_date || new Date().toISOString().split('T')[0],
        };
        return adminCustomersAPI.addServiceRecord(customerData.id.toString(), serviceData);
      });

      await Promise.all(promises);
      showSuccessMessage(t('customers.detail.servicesAdded') || 'Hizmetler başarıyla eklendi!');
      setServiceCart([]);
      setShowServiceForm(false);
      setServiceFormData({
        vehicle_id: '', service_type: 'repair', service_name: '',
        service_description: '', price: '', performed_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      await reloadCustomerData();
      onUpdate();
    } catch (error: unknown) {
      console.error('Error adding services:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError((t('customers.errors.addingServices') || 'Hizmet eklenirken hata oluştu') + ': ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData?.id) return;
    try {
      await adminCustomersAPI.update(customerData.id.toString(), formData);
      showSuccessMessage(t('customers.detail.updated') || 'Müşteri başarıyla güncellendi!');
      setEditMode(false);
      await reloadCustomerData();
      onUpdate();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError((t('customers.errors.updating') || 'Güncellenirken hata oluştu') + ': ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteService = (serviceId: string) => {
    setDeleteServiceModal({ isOpen: true, serviceId });
  };

  const confirmDeleteService = async () => {
    if (!deleteServiceModal.serviceId) return;
    try {
      await adminCustomersAPI.deleteServiceRecord(customerData.id.toString(), deleteServiceModal.serviceId);
      showSuccessMessage(t('customers.detail.serviceDeleted') || 'Hizmet kaydı başarıyla silindi!');
      setDeleteServiceModal({ isOpen: false, serviceId: null });
      await reloadCustomerData();
      onUpdate();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError((t('customers.errors.deletingService') || 'Hizmet silinirken hata oluştu') + ': ' + (err.response?.data?.error || err.message || 'Unknown error'));
      setDeleteServiceModal({ isOpen: false, serviceId: null });
    }
  };

  const handlePrintSelectedServicesReceipt = async () => {
    if (selectedServices.size === 0) {
      showError('Lütfen yazdırmak için en az bir hizmet seçin');
      return;
    }

    if (!displayCustomer.serviceRecords || displayCustomer.serviceRecords.length === 0) {
      showError('Hizmet kaydı bulunamadı');
      return;
    }

    const selectedRecords = displayCustomer.serviceRecords.filter((record: any) => 
      selectedServices.has(record.id.toString())
    );

    if (selectedRecords.length === 0) {
      showError('Seçilen hizmet bulunamadı');
      return;
    }

    try {
      let companyInfo: any = {};
      try {
        const companyResponse = await adminSettingsAPI.getCompanyInfo();
        companyInfo = companyResponse.data?.companyInfo || {};
      } catch (error) {
        console.error('Error loading company info:', error);
      }

      // Also load logo and tax numbers from settings
      let tpsPercentage = 0;
      let tpsNumber = '';
      let tvqPercentage = 0;
      let tvqNumber = '';
        try {
          const settingsResponse = await adminSettingsAPI.getSettings();
        if (settingsResponse.data?.settings) {
          if (settingsResponse.data.settings.company_logo_url) {
            companyInfo.company_logo_url = settingsResponse.data.settings.company_logo_url;
          }
          companyInfo.company_federal_tax_number = settingsResponse.data.settings.company_federal_tax_number || '';
          companyInfo.company_provincial_tax_number = settingsResponse.data.settings.company_provincial_tax_number || '';
          tpsPercentage = parseFloat(settingsResponse.data.settings.tps_percentage || '0');
          tpsNumber = settingsResponse.data.settings.tps_number || '';
          tvqPercentage = parseFloat(settingsResponse.data.settings.tvq_percentage || '0');
          tvqNumber = settingsResponse.data.settings.tvq_number || '';
          }
        } catch (error) {
        console.error('Error loading settings:', error);
      }

      if (companyInfo.company_logo_url && typeof window !== 'undefined') {
        if (!companyInfo.company_logo_url.startsWith('http')) {
          if (companyInfo.company_logo_url.startsWith('/uploads')) {
            companyInfo.company_logo_url = `${window.location.origin}${companyInfo.company_logo_url}`;
          } else if (companyInfo.company_logo_url.startsWith('uploads')) {
            companyInfo.company_logo_url = `${window.location.origin}/${companyInfo.company_logo_url}`;
          }
        }
      }

      const effectiveFederalRate = tpsPercentage > 0 ? tpsPercentage : (federalTaxRate > 0 ? federalTaxRate : (taxRate / 2));
      const effectiveProvincialRate = tvqPercentage > 0 ? tvqPercentage : (provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2));
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate;

      // Group selected services by vehicle and date
      const servicesByVehicle = selectedRecords.reduce((acc: any, record: any) => {
        const key = `${record.vehicle_id || 'no-vehicle'}_${record.performed_date || 'no-date'}`;
        if (!acc[key]) {
          acc[key] = {
            vehicle_id: record.vehicle_id,
            vehicle_brand: record.vehicle_brand,
            vehicle_model: record.vehicle_model,
            vehicle_year: record.vehicle_year,
            license_plate: record.license_plate,
            performed_date: record.performed_date,
            services: []
          };
        }
        acc[key].services.push(record);
        return acc;
      }, {});

      // Print receipt for each vehicle/date group
      for (const [key, group] of Object.entries(servicesByVehicle)) {
        const vehicleGroup = group as any;
        const services = vehicleGroup.services;
        
        let totalPrice = 0;
        services.forEach((service: any) => {
          totalPrice += parseFloat(String(service.price || 0));
        });

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
    .company-logo {
      text-align: center;
      margin-bottom: 8px;
    }
    .company-logo img {
      max-width: 120px;
      max-height: 60px;
      object-fit: contain;
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
    ${companyInfo.company_logo_url ? `
    <div class="company-logo">
      <img src="${companyInfo.company_logo_url}" alt="Company Logo" />
    </div>
    ` : ''}
    <div class="company-name">${companyInfo.company_name || 'KAY Oto Servis'}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address}</div>` : ''}
      ${companyInfo.company_phone ? `<div>Tel: ${companyInfo.company_phone}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    ${vehicleGroup.vehicle_brand ? `
    <div class="info-row">
      <span>Véhicule:</span>
      <span>${vehicleGroup.vehicle_brand} ${vehicleGroup.vehicle_model || ''} ${vehicleGroup.vehicle_year || ''}</span>
    </div>
    ` : ''}
    ${vehicleGroup.license_plate ? `
    <div class="info-row">
      <span>Plaque:</span>
      <span>${vehicleGroup.license_plate}</span>
    </div>
    ` : ''}

    <div class="section-divider">
      <div class="service-title">SERVICES EFFECTUÉS</div>
      ${services.map((service: any) => {
        const servicePrice = parseFloat(String(service.price || 0));
        let serviceBasePrice = servicePrice;
        if (totalTaxRate > 0) {
          serviceBasePrice = servicePrice / (1 + totalTaxRate / 100);
        }
        return `
      <div class="service-row">
        <span>${service.service_name}</span>
        <span>$${serviceBasePrice.toFixed(2)}</span>
      </div>
        `;
      }).join('')}
    </div>

    ${totalTaxRate > 0 ? `
    <div class="section-divider">
      <div class="info-row">
        <span>Sous-total:</span>
        <span>$${basePrice.toFixed(2)}</span>
      </div>
      ${effectiveFederalRate > 0 ? `
      <div class="info-row">
        <span>TPS: ${tpsNumber || companyInfo.company_federal_tax_number || ''} (${effectiveFederalRate.toFixed(2)}%)</span>
        <span>$${federalTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${effectiveProvincialRate > 0 ? `
      <div class="info-row">
        <span>TVQ: ${tvqNumber || companyInfo.company_provincial_tax_number || ''} (${effectiveProvincialRate.toFixed(2)}%)</span>
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
      <div>${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
      <div>Merci de votre visite!</div>
    </div>
    <div style="margin-top: 20px; padding-top: 10px; text-align: center; font-size: 10px;">
      <div>www.kayauto.ca</div>
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
            showError('Makbuz yazdırılırken hata oluştu');
            printWindow.close();
          }
        } else {
          showError('Popup engellendi. Lütfen popup blocker\'ı kapatın.');
        }
      }

      // Clear selection after printing
      setSelectedServices(new Set());
    } catch (error: unknown) {
      console.error('Error printing receipt:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError('Makbuz yazdırılırken hata oluştu: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const handlePrintAllServicesReceipt = async () => {
    if (!displayCustomer.serviceRecords || displayCustomer.serviceRecords.length === 0) {
      showError('Yazdırılacak hizmet bulunamadı');
      return;
    }

    try {
      let companyInfo: any = {};
      try {
        const companyResponse = await adminSettingsAPI.getCompanyInfo();
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
        const settingsResponse = await adminSettingsAPI.getSettings();
        if (settingsResponse.data?.settings) {
          if (settingsResponse.data.settings.company_logo_url) {
            companyInfo.company_logo_url = settingsResponse.data.settings.company_logo_url;
          }
          companyInfo.company_federal_tax_number = settingsResponse.data.settings.company_federal_tax_number || '';
          companyInfo.company_provincial_tax_number = settingsResponse.data.settings.company_provincial_tax_number || '';
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
      if (companyInfo.company_logo_url && typeof window !== 'undefined') {
        if (!companyInfo.company_logo_url.startsWith('http')) {
          if (companyInfo.company_logo_url.startsWith('/uploads')) {
            companyInfo.company_logo_url = `${window.location.origin}${companyInfo.company_logo_url}`;
          } else if (companyInfo.company_logo_url.startsWith('uploads')) {
            companyInfo.company_logo_url = `${window.location.origin}/${companyInfo.company_logo_url}`;
          }
        }
      }

      // Use TPS/TVQ percentages from settings if available, otherwise fall back to old tax rates
      const effectiveFederalRate = tpsPercentage > 0 ? tpsPercentage : (federalTaxRate > 0 ? federalTaxRate : (taxRate / 2));
      const effectiveProvincialRate = tvqPercentage > 0 ? tvqPercentage : (provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2));
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate;
      
      // Group services by vehicle and date
      const servicesByVehicle = (displayCustomer.serviceRecords || []).reduce((acc: any, record: any) => {
        const key = `${record.vehicle_id || 'no-vehicle'}_${record.performed_date || 'no-date'}`;
        if (!acc[key]) {
          acc[key] = {
            vehicle_id: record.vehicle_id,
            vehicle_brand: record.vehicle_brand,
            vehicle_model: record.vehicle_model,
            vehicle_year: record.vehicle_year,
            license_plate: record.license_plate,
            performed_date: record.performed_date,
            services: []
          };
        }
        acc[key].services.push(record);
        return acc;
      }, {});

      // Print receipt for each vehicle/date group
      for (const [key, group] of Object.entries(servicesByVehicle)) {
        const vehicleGroup = group as any;
        const services = vehicleGroup.services;
        
        // Calculate totals
        let totalPrice = 0;
        services.forEach((service: any) => {
          totalPrice += parseFloat(String(service.price || 0));
        });

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
    .company-logo {
      text-align: center;
      margin-bottom: 8px;
    }
    .company-logo img {
      max-width: 120px;
      max-height: 60px;
      object-fit: contain;
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
    ${companyInfo.company_logo_url ? `
    <div class="company-logo">
      <img src="${companyInfo.company_logo_url}" alt="Company Logo" />
    </div>
    ` : ''}
    <div class="company-name">${companyInfo.company_name || 'KAY Oto Servis'}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address}</div>` : ''}
      ${companyInfo.company_phone ? `<div>Tel: ${companyInfo.company_phone}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    ${vehicleGroup.vehicle_brand ? `
    <div class="info-row">
      <span>Véhicule:</span>
      <span>${vehicleGroup.vehicle_brand} ${vehicleGroup.vehicle_model || ''} ${vehicleGroup.vehicle_year || ''}</span>
    </div>
    ` : ''}
    ${vehicleGroup.license_plate ? `
    <div class="info-row">
      <span>Plaque:</span>
      <span>${vehicleGroup.license_plate}</span>
    </div>
    ` : ''}

    <div class="section-divider">
      <div class="service-title">SERVICES EFFECTUÉS</div>
      ${services.map((service: any) => {
        const servicePrice = parseFloat(String(service.price || 0));
        let serviceBasePrice = servicePrice;
        if (totalTaxRate > 0) {
          serviceBasePrice = servicePrice / (1 + totalTaxRate / 100);
        }
        return `
      <div class="service-row">
        <span>${service.service_name}</span>
        <span>$${serviceBasePrice.toFixed(2)}</span>
      </div>
        `;
      }).join('')}
    </div>

    ${totalTaxRate > 0 ? `
    <div class="section-divider">
      <div class="info-row">
        <span>Sous-total:</span>
        <span>$${basePrice.toFixed(2)}</span>
      </div>
      ${effectiveFederalRate > 0 ? `
      <div class="info-row">
        <span>TPS: ${tpsNumber || companyInfo.company_federal_tax_number || ''} (${effectiveFederalRate.toFixed(2)}%)</span>
        <span>$${federalTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${effectiveProvincialRate > 0 ? `
      <div class="info-row">
        <span>TVQ: ${tvqNumber || companyInfo.company_provincial_tax_number || ''} (${effectiveProvincialRate.toFixed(2)}%)</span>
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
      <div>${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
      <div>Merci de votre visite!</div>
    </div>
    <div style="margin-top: 20px; padding-top: 10px; text-align: center; font-size: 10px;">
      <div>www.kayauto.ca</div>
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
            showError('Makbuz yazdırılırken hata oluştu');
            printWindow.close();
          }
        } else {
          showError('Popup engellendi. Lütfen popup blocker\'ı kapatın.');
        }
      }
    } catch (error: unknown) {
      console.error('Error printing receipt:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError('Makbuz yazdırılırken hata oluştu: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const handlePrintReceipt = async (serviceRecord: any) => {
    try {
      let companyInfo: any = {};
      try {
        const companyResponse = await adminSettingsAPI.getCompanyInfo();
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
        const settingsResponse = await adminSettingsAPI.getSettings();
        if (settingsResponse.data?.settings) {
          if (settingsResponse.data.settings.company_logo_url) {
            companyInfo.company_logo_url = settingsResponse.data.settings.company_logo_url;
          }
          companyInfo.company_federal_tax_number = settingsResponse.data.settings.company_federal_tax_number || '';
          companyInfo.company_provincial_tax_number = settingsResponse.data.settings.company_provincial_tax_number || '';
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
      if (companyInfo.company_logo_url && typeof window !== 'undefined') {
        if (!companyInfo.company_logo_url.startsWith('http')) {
          // If it's a relative path, make it absolute
          if (companyInfo.company_logo_url.startsWith('/uploads')) {
            companyInfo.company_logo_url = `${window.location.origin}${companyInfo.company_logo_url}`;
          } else if (companyInfo.company_logo_url.startsWith('uploads')) {
            companyInfo.company_logo_url = `${window.location.origin}/${companyInfo.company_logo_url}`;
          }
        }
      }

      // Get vehicle information from serviceRecord or from customer vehicles
      let vehicleBrand = serviceRecord.vehicle_brand || '';
      let vehicleModel = serviceRecord.vehicle_model || '';
      let vehicleYear = serviceRecord.vehicle_year || '';
      let licensePlate = serviceRecord.license_plate || '';
      
      // If vehicle info is not in serviceRecord, try to get it from the vehicle_id
      if (!vehicleBrand && serviceRecord.vehicle_id && displayCustomer.vehicles) {
        const vehicle = displayCustomer.vehicles.find((v: any) => v.id === serviceRecord.vehicle_id);
        if (vehicle) {
          vehicleBrand = vehicle.brand || '';
          vehicleModel = vehicle.model || '';
          vehicleYear = vehicle.year || '';
          licensePlate = vehicle.license_plate || '';
        }
      }

      // Use TPS/TVQ percentages from settings if available, otherwise fall back to old tax rates
      const effectiveFederalRate = tpsPercentage > 0 ? tpsPercentage : (federalTaxRate > 0 ? federalTaxRate : (taxRate / 2));
      const effectiveProvincialRate = tvqPercentage > 0 ? tvqPercentage : (provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2));
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate;
      
      const totalPrice = parseFloat(String(serviceRecord.price || 0));
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
    .company-logo {
      text-align: center;
      margin-bottom: 8px;
    }
    .company-logo img {
      max-width: 120px;
      max-height: 60px;
      object-fit: contain;
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
    ${companyInfo.company_logo_url ? `
    <div class="company-logo">
      <img src="${companyInfo.company_logo_url}" alt="Company Logo" />
    </div>
    ` : ''}
    <div class="company-name">${companyInfo.company_name || 'KAY Oto Servis'}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address}</div>` : ''}
      ${companyInfo.company_phone ? `<div>Tel: ${companyInfo.company_phone}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    ${vehicleBrand ? `
    <div class="info-row">
      <span>Véhicule:</span>
      <span>${vehicleBrand} ${vehicleModel || ''} ${vehicleYear || ''}</span>
    </div>
    ` : ''}
    ${licensePlate ? `
    <div class="info-row">
      <span>Plaque:</span>
      <span>${licensePlate}</span>
    </div>
    ` : ''}

    <div class="section-divider">
      <div class="service-title">SERVICE EFFECTUÉ</div>
      <div class="service-row">
        <span>${serviceRecord.service_name}</span>
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
        <span>TPS: ${tpsNumber || companyInfo.company_federal_tax_number || ''} (${effectiveFederalRate.toFixed(2)}%)</span>
        <span>$${federalTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${effectiveProvincialRate > 0 ? `
      <div class="info-row">
        <span>TVQ: ${tvqNumber || companyInfo.company_provincial_tax_number || ''} (${effectiveProvincialRate.toFixed(2)}%)</span>
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
      <div>${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Montreal' })).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
      <div>Merci de votre visite!</div>
    </div>
    <div style="margin-top: 20px; padding-top: 10px; text-align: center; font-size: 10px;">
      <div>www.kayauto.ca</div>
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
    } catch (error: unknown) {
      console.error('Error printing receipt:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError(t('repairQuotes.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

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
            {t('customers.detail.services') || 'Hizmet Geçmişi'} ({displayCustomer.serviceRecords?.length || 0})
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
          {activeTab === 'details' && (
            <div className={styles.tabContent}>
              {!editMode ? (
                <>
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
                      {displayCustomer.address && (
                        <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                          <label>{t('customers.detail.address') || 'Adres'}:</label>
                          <span>{displayCustomer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {displayCustomer.notes && (
                    <div className={styles.detailSection}>
                      <h3>{t('customers.detail.notes') || 'Notlar'}</h3>
                      <p>{displayCustomer.notes}</p>
                    </div>
                  )}
                  <div className={styles.detailActions}>
                    <button onClick={() => setEditMode(true)} className={styles.btnPrimary}>{t('customers.detail.edit') || 'Düzenle'}</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className={styles.formSection}>
                    <h3>{t('customers.detail.personalInfo') || 'Kişisel Bilgiler'}</h3>
                    <div className={styles.formGrid}>
                      <input name="first_name" placeholder={t('customers.detail.firstName') || 'Ad'} value={formData.first_name} onChange={handleInputChange} required />
                      <input name="last_name" placeholder={t('customers.detail.lastName') || 'Soyad'} value={formData.last_name} onChange={handleInputChange} required />
                      <input type="email" name="email" placeholder={t('customers.detail.email') || 'E-posta'} value={formData.email} onChange={handleInputChange} />
                      <input type="tel" name="phone" placeholder={t('customers.detail.phone') || 'Telefon'} value={formData.phone} onChange={handleInputChange} />
                      <div className={styles.fullWidth}>
                        <textarea name="address" placeholder={t('customers.detail.address') || 'Adres'} value={formData.address} onChange={handleInputChange} rows={2} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.formSection}>
                    <textarea name="notes" placeholder={t('customers.detail.notes') || 'Notlar'} value={formData.notes} onChange={handleInputChange} rows={4} />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.btnPrimary}>{t('customers.detail.save') || 'Kaydet'}</button>
                    <button type="button" onClick={() => setEditMode(false)} className={styles.btnSecondary}>{t('customers.detail.cancel') || 'İptal'}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className={styles.tabContent}>
              <div className={styles.sectionHeader}>
                <h3>{t('customers.detail.customerVehicles') || 'Müşteri Araçları'}</h3>
                <button onClick={() => setShowVehicleForm(true)} className={styles.btnPrimary}>{t('customers.detail.addVehicle') || 'Araç Ekle'}</button>
              </div>

              {showVehicleForm && (
                <div className={`${styles.formModal} ${styles.modernForm}`}>
                  <h4>{t('customers.detail.addVehicle') || 'Araç Ekle'}</h4>
                  <form onSubmit={handleAddVehicle}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.brand') || 'Marka'}</label>
                        <select name="brand" value={vehicleFormData.brand} onChange={handleVehicleFormChange} required>
                          <option value="">{t('customers.form.selectBrand') || 'Marka Seç'}</option>
                          {Object.keys(carBrandsAndModels).sort().map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.model') || 'Model'}</label>
                        <select name="model" value={vehicleFormData.model} onChange={handleVehicleFormChange} required disabled={!vehicleFormData.brand}>
                          <option value="">{t('customers.form.selectModel') || 'Model Seç'}</option>
                          {availableVehicleModels.sort().map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.year') || 'Yıl'}</label>
                        <select name="year" value={vehicleFormData.year} onChange={handleVehicleFormChange}>
                          <option value="">{t('customers.form.selectYear') || 'Yıl Seç'}</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.licensePlate') || 'Plaka'}</label>
                        <input name="license_plate" placeholder={t('customers.detail.licensePlate') || 'Plaka'} value={vehicleFormData.license_plate} onChange={handleVehicleFormChange} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.vin') || 'VIN'}</label>
                        <input name="vin" placeholder={t('customers.detail.vin') || 'VIN'} value={vehicleFormData.vin} onChange={handleVehicleFormChange} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.color') || 'Renk'}</label>
                        <input name="color" placeholder={t('customers.detail.color') || 'Renk'} value={vehicleFormData.color} onChange={handleVehicleFormChange} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.mileage') || 'Kilometre'}</label>
                        <input type="number" name="mileage" placeholder={t('customers.detail.mileage') || 'Kilometre'} value={vehicleFormData.mileage} onChange={handleVehicleFormChange} />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label>{t('customers.detail.notes') || 'Notlar'}</label>
                      <textarea name="notes" placeholder={t('customers.detail.notes') || 'Notlar'} value={vehicleFormData.notes} onChange={handleVehicleFormChange} rows={2} />
                    </div>
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.btnPrimary}>{t('customers.detail.addVehicle') || 'Araç Ekle'}</button>
                      <button type="button" onClick={() => {
                        setShowVehicleForm(false);
                        setAvailableVehicleModels([]);
                        setVehicleFormData({
                          brand: '', model: '', year: '', license_plate: '', vin: '',
                          color: '', mileage: '', notes: ''
                        });
                      }} className={styles.btnSecondary}>{t('customers.detail.cancel') || 'İptal'}</button>
                    </div>
                  </form>
                </div>
              )}

              {displayCustomer.vehicles && displayCustomer.vehicles.length > 0 ? (
                <div className={styles.vehiclesList}>
                  {displayCustomer.vehicles.map((vehicle: any) => (
                    <div key={vehicle.id} className={styles.vehicleCard}>
                      <h4>
                        {vehicle.brand} {vehicle.model} {vehicle.year || ''}
                      </h4>
                      <div className={styles.vehicleDetails}>
                        {vehicle.license_plate && <span>{t('customers.detail.licensePlate') || 'Plaka'}: {vehicle.license_plate}</span>}
                        {vehicle.vin && <span>{t('customers.detail.vin') || 'VIN'}: {vehicle.vin}</span>}
                        {vehicle.color && <span>{t('customers.detail.color') || 'Renk'}: {vehicle.color}</span>}
                        {vehicle.mileage && <span>{t('customers.detail.mileage') || 'Kilometre'}: {vehicle.mileage.toLocaleString()} km</span>}
                      </div>
                      {vehicle.notes && <p className={styles.notes}>{vehicle.notes}</p>}
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
              <div className={styles.sectionHeader}>
                <h3>{t('customers.detail.serviceHistory') || 'Hizmet Geçmişi'}</h3>
                <button onClick={() => setShowServiceForm(true)} className={styles.btnPrimary}>{t('customers.detail.addServiceRecord') || 'Hizmet Ekle'}</button>
              </div>

              {showServiceForm && (
                <div className={`${styles.formModal} ${styles.modernForm}`}>
                  <h4>{t('customers.detail.addServiceRecord') || 'Hizmet Ekle'}</h4>
                  <div className={styles.serviceSelectionLayout}>
                    {(serviceFormData.service_type === 'repair' && repairServices.length > 0) || (serviceFormData.service_type === 'car_wash' && carWashPackages.length > 0) ? (
                      <div className={styles.servicesSection}>
                        {serviceFormData.service_type === 'repair' && repairServices.length > 0 && (
                          <div className={styles.repairServicesList}>
                            <label>{t('customers.detail.selectRepairService') || 'Tamir Hizmeti Seç'}</label>
                            <div className={styles.servicesGrid}>
                              {repairServices.filter((s: any) => s.is_active).map((service: any) => (
                                <div 
                                  key={service.id} 
                                  className={styles.serviceItemCard}
                                  onClick={() => handleAddToCart(service, 'repair')}
                                >
                                  <div className={styles.serviceItemContent}>
                                    <h5>{service.name}</h5>
                                    {service.description && <p className={styles.serviceDescription}>{service.description}</p>}
                                    <div className={styles.servicePrice} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      {taxRate > 0 ? (
                                        <>
                                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            ${parseFloat(String(service.base_price || 0)).toFixed(2)} + ${(parseFloat(String(service.base_price || 0)) * taxRate / 100).toFixed(2)} vergi
                                          </div>
                                          <div style={{ fontWeight: 'bold', color: '#333' }}>
                                            Toplam: ${calculatePriceWithTax(service.base_price || 0).toFixed(2)}
                                          </div>
                                        </>
                                      ) : (
                                        <div>${parseFloat(String(service.base_price || 0)).toFixed(2)}</div>
                                      )}
                                    </div>
                                  </div>
                                  <button 
                                    type="button" 
                                    className={styles.btnAddService}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(service, 'repair');
                                    }}
                                  >
                                    {t('customers.detail.addToCart') || 'Sepete Ekle'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {serviceFormData.service_type === 'car_wash' && carWashPackages.length > 0 && (
                          <div className={styles.repairServicesList}>
                            <label>{t('customers.detail.selectCarWashService') || 'Oto Yıkama Paketi Seç'}</label>
                            <div className={styles.servicesGrid}>
                              {carWashPackages.filter((p: any) => p.is_active).map((packageItem: any) => (
                                <div 
                                  key={packageItem.id} 
                                  className={styles.serviceItemCard}
                                  onClick={() => handleAddToCart(packageItem, 'car_wash')}
                                >
                                  <div className={styles.serviceItemContent}>
                                    <h5>{packageItem.name}</h5>
                                    {packageItem.description && <p className={styles.serviceDescription}>{packageItem.description}</p>}
                                    <div className={styles.servicePrice} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                      {taxRate > 0 ? (
                                        <>
                                          <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                            ${parseFloat(String(packageItem.base_price || 0)).toFixed(2)} + ${(parseFloat(String(packageItem.base_price || 0)) * taxRate / 100).toFixed(2)} vergi
                                          </div>
                                          <div style={{ fontWeight: 'bold', color: '#333' }}>
                                            Toplam: ${calculatePriceWithTax(packageItem.base_price || 0).toFixed(2)}
                                          </div>
                                        </>
                                      ) : (
                                        <div>${parseFloat(String(packageItem.base_price || 0)).toFixed(2)}</div>
                                      )}
                                    </div>
                                  </div>
                                  <button 
                                    type="button" 
                                    className={styles.btnAddService}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(packageItem, 'car_wash');
                                    }}
                                  >
                                    {t('customers.detail.addToCart') || 'Sepete Ekle'}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {serviceCart.length > 0 && (
                      <div className={styles.cartSection}>
                        <div className={styles.cartHeader}>
                          <h4>{t('customers.detail.selectedServices') || 'Yapılacak İşlemler'}</h4>
                          <button 
                            type="button" 
                            className={styles.btnClearCart}
                            onClick={() => setServiceCart([])}
                          >
                            {t('customers.detail.clearCart') || 'Temizle'}
                          </button>
                        </div>
                        <div className={styles.cartItems}>
                          {serviceCart.map((item, index) => (
                            <div key={item.id} className={styles.cartItem}>
                              <div className={styles.cartItemContent}>
                                <span className={styles.cartItemNumber}>{index + 1}.</span>
                                <div className={styles.cartItemDetails}>
                                  <span className={styles.cartItemName}>{item.service.name}</span>
                                  {item.service.description && (
                                    <span className={styles.cartItemDesc}>{item.service.description}</span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', minWidth: '180px', textAlign: 'right' }}>
                                  {(federalTaxRate > 0 || provincialTaxRate > 0 || taxRate > 0) ? (
                                    <>
                                      <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
                                        <div style={{ marginBottom: '0.15rem' }}>Fiyat: ${parseFloat(String(item.price || 0)).toFixed(2)}</div>
                                        {federalTaxRate > 0 && (
                                          <div>Federal Vergi (GST/HST): ${(parseFloat(String(item.price || 0)) * federalTaxRate / 100).toFixed(2)}</div>
                                        )}
                                        {provincialTaxRate > 0 && (
                                          <div>Eyalet Vergisi (PST/QST): ${(parseFloat(String(item.price || 0)) * provincialTaxRate / 100).toFixed(2)}</div>
                                        )}
                                        {(federalTaxRate === 0 && provincialTaxRate === 0 && taxRate > 0) && (
                                          <div>Vergi: ${(parseFloat(String(item.price || 0)) * taxRate / 100).toFixed(2)}</div>
                                        )}
                                      </div>
                                      <div className={styles.cartItemPrice} style={{ fontWeight: 'bold', color: '#333', fontSize: '1.05rem', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid #e0e0e0' }}>
                                        Toplam: ${calculatePriceWithTax(item.price || 0).toFixed(2)}
                                      </div>
                                    </>
                                  ) : (
                                    <span className={styles.cartItemPrice}>
                                      ${calculatePriceWithTax(item.price || 0).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button 
                                type="button"
                                className={styles.btnRemoveItem}
                                onClick={() => handleRemoveFromCart(item.id)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className={styles.cartFooter}>
                          <div className={styles.cartTotal}>
                            {(federalTaxRate > 0 || provincialTaxRate > 0 || taxRate > 0) ? (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
                                  <span>Ara Toplam:</span>
                                  <span style={{ fontWeight: '600' }}>${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                {federalTaxRate > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
                                    <span>Federal Vergi (GST/HST) (%{federalTaxRate.toFixed(2)}):</span>
                                    <span style={{ fontWeight: '600' }}>${calculateFederalTax().toFixed(2)}</span>
                                  </div>
                                )}
                                {provincialTaxRate > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
                                    <span>Eyalet Vergisi (PST/QST) (%{provincialTaxRate.toFixed(2)}):</span>
                                    <span style={{ fontWeight: '600' }}>${calculateProvincialTax().toFixed(2)}</span>
                                  </div>
                                )}
                                {(federalTaxRate === 0 && provincialTaxRate === 0 && taxRate > 0) && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
                                    <span>Vergi (%{taxRate}):</span>
                                    <span style={{ fontWeight: '600' }}>${calculateTaxAmount().toFixed(2)}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid #e0e0e0', marginTop: '0.5rem' }}>
                                  <span className={styles.totalLabel} style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{t('customers.detail.totalAmount') || 'Toplam'}:</span>
                                  <span className={styles.totalAmount} style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>${calculateTotal().toFixed(2)}</span>
                                </div>
                              </>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className={styles.totalLabel} style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{t('customers.detail.totalAmount') || 'Toplam'}:</span>
                                <span className={styles.totalAmount} style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>${calculateTotal().toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                          <button 
                            type="button"
                            className={styles.btnCheckout}
                            onClick={handleCheckoutCart}
                          >
                            {t('customers.detail.completeServices') || 'İşlemleri Tamamla'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={serviceCart.length > 0 ? (e) => { e.preventDefault(); handleCheckoutCart(); } : handleAddService}>
                    <div className={styles.formGroup}>
                      <label>{t('customers.detail.type') || 'Tip'}</label>
                      <select name="service_type" value={serviceFormData.service_type} onChange={handleServiceFormChange} required>
                        <option value="repair">{t('customers.detail.repair') || 'Tamir'}</option>
                        <option value="car_wash">{t('customers.detail.carWash') || 'Oto Yıkama'}</option>
                        <option value="maintenance">{t('customers.detail.maintenance') || 'Bakım'}</option>
                        <option value="other">{t('customers.detail.other') || 'Diğer'}</option>
                      </select>
                    </div>

                    {displayCustomer.vehicles && displayCustomer.vehicles.length > 0 && (
                      <div className={styles.formGroup}>
                        <label>{t('customers.detail.selectVehicle') || 'Araç Seç'}</label>
                        <select name="vehicle_id" value={serviceFormData.vehicle_id} onChange={handleServiceFormChange}>
                          <option value="">{t('customers.detail.selectVehicle') || 'Araç Seç'}</option>
                          {displayCustomer.vehicles.map((vehicle: any) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} {vehicle.model} {vehicle.year || ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {serviceCart.length === 0 && (
                      <>
                        <div className={styles.formGroup}>
                          <label>{t('customers.detail.serviceName') || 'Hizmet Adı'}</label>
                          <input name="service_name" placeholder={t('customers.detail.serviceName') || 'Hizmet Adı'} value={serviceFormData.service_name} onChange={handleServiceFormChange} required />
                        </div>

                        <div className={styles.formGroup}>
                          <label>{t('customers.detail.serviceDescription') || 'Hizmet Açıklaması'}</label>
                          <textarea name="service_description" placeholder={t('customers.detail.serviceDescription') || 'Hizmet Açıklaması'} value={serviceFormData.service_description} onChange={handleServiceFormChange} rows={3} />
                        </div>

                        <div className={styles.formRow}>
                          <div className={styles.formGroup}>
                            <label>{t('customers.detail.price') || 'Fiyat'}</label>
                            <input type="number" name="price" placeholder={t('customers.detail.price') || 'Fiyat'} value={serviceFormData.price} onChange={handleServiceFormChange} required step="0.01" />
                            {serviceFormData.price && taxRate > 0 && (
                              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                <div>Fiyat: ${parseFloat(String(serviceFormData.price || 0)).toFixed(2)}</div>
                                <div>Vergi (%{taxRate}): ${(parseFloat(String(serviceFormData.price || 0)) * taxRate / 100).toFixed(2)}</div>
                                <div style={{ marginTop: '0.25rem', fontWeight: 'bold', color: '#333' }}>
                                  Toplam: ${calculatePriceWithTax(serviceFormData.price || 0).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className={styles.formGroup}>
                            <label>{t('customers.detail.date') || 'Tarih'}</label>
                            <input type="date" name="performed_date" value={serviceFormData.performed_date} onChange={handleServiceFormChange} required />
                          </div>
                        </div>

                        <div className={styles.formActions}>
                          <button type="submit" className={styles.btnPrimary}>{t('customers.detail.addService') || 'Hizmet Ekle'}</button>
                          <button type="button" onClick={() => {
                            setShowServiceForm(false);
                            setServiceCart([]);
                            setServiceFormData({
                              vehicle_id: '', service_type: 'repair', service_name: '',
                              service_description: '', price: '', performed_date: new Date().toISOString().split('T')[0],
                              notes: ''
                            });
                          }} className={styles.btnSecondary}>{t('customers.detail.cancel') || 'İptal'}</button>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              )}

              {displayCustomer.serviceRecords && displayCustomer.serviceRecords.length > 0 ? (
                <>
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        className={styles.btnPrintService}
                        onClick={() => {
                          if (selectedServices.size === 0) {
                            setSelectedServices(new Set((displayCustomer.serviceRecords || []).map((r: any) => r.id.toString())));
                          } else {
                            setSelectedServices(new Set());
                          }
                        }}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        {selectedServices.size === (displayCustomer.serviceRecords?.length || 0) ? (t('customers.detail.deselectAll') || 'Tümünü Kaldır') : (t('customers.detail.selectAll') || 'Tümünü Seç')}
                      </button>
                      {selectedServices.size > 0 && (
                        <button
                          className={styles.btnPrintService}
                          onClick={handlePrintSelectedServicesReceipt}
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: '#10b981' }}
                        >
                          🖨️ {t('customers.detail.printSelectedServices') || 'Seçilenleri Yazdır'} ({selectedServices.size})
                        </button>
                      )}
                    </div>
                    <button
                      className={styles.btnPrintService}
                      onClick={handlePrintAllServicesReceipt}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                    >
                      🖨️ {t('customers.detail.printAllServices') || 'Tüm Hizmetleri Yazdır'}
                    </button>
                  </div>
                  {/* Desktop Table View */}
                  <div className={styles.servicesList}>
                    <div className={styles.servicesTableHeader}>
                      <span style={{ width: '30px' }}></span>
                      <span>{t('customers.detail.date') || 'Tarih'}</span>
                      <span>{t('customers.detail.service') || 'Hizmet'}</span>
                      <span>{t('customers.detail.type') || 'Tip'}</span>
                      <span>{t('customers.detail.price') || 'Fiyat'}</span>
                      <span>{t('customers.detail.actions') || 'İşlemler'}</span>
                    </div>
                    {(displayCustomer.serviceRecords || []).map((record: any) => (
                      <div key={record.id} className={styles.serviceRecord} style={{ gridTemplateColumns: '30px 1fr 2fr 1fr 1fr auto' }}>
                        <span>
                          <input
                            type="checkbox"
                            checked={selectedServices.has(record.id.toString())}
                            onChange={(e) => {
                              const newSelected = new Set(selectedServices);
                              if (e.target.checked) {
                                newSelected.add(record.id.toString());
                              } else {
                                newSelected.delete(record.id.toString());
                              }
                              setSelectedServices(newSelected);
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </span>
                        <span>{new Date(record.performed_date).toLocaleDateString()}</span>
                        <span>
                          <strong>{record.service_name}</strong>
                          {record.service_description && <p>{record.service_description}</p>}
                        </span>
                        <span>{record.service_type}</span>
                        <span>${parseFloat(String(record.price || 0)).toFixed(2)}</span>
                        <span>
                          <button
                            className={styles.btnPrintService}
                            onClick={() => handlePrintReceipt(record)}
                            title={t('customers.detail.printReceipt') || 'Yazdır'}
                          >
                            🖨️ {t('common.print')}
                          </button>
                          <button
                            className={styles.btnDeleteService}
                            onClick={() => handleDeleteService(record.id)}
                            title={t('customers.detail.deleteService') || 'Sil'}
                          >
                            {t('common.delete') || 'Sil'}
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Card View */}
                  <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        className={styles.btnPrintService}
                        onClick={() => {
                          const recordsLength = displayCustomer.serviceRecords?.length || 0;
                          if (selectedServices.size === 0 || selectedServices.size < recordsLength) {
                            setSelectedServices(new Set((displayCustomer.serviceRecords || []).map((r: any) => r.id.toString())));
                          } else {
                            setSelectedServices(new Set());
                          }
                        }}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', flex: 1 }}
                      >
                        {selectedServices.size === (displayCustomer.serviceRecords?.length || 0) ? (t('customers.detail.deselectAll') || 'Tümünü Kaldır') : (t('customers.detail.selectAll') || 'Tümünü Seç')}
                      </button>
                      {selectedServices.size > 0 && (
                        <button
                          className={styles.btnPrintService}
                          onClick={handlePrintSelectedServicesReceipt}
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', background: '#10b981', flex: 1 }}
                        >
                          🖨️ {t('customers.detail.printSelectedServices') || 'Seçilenleri Yazdır'} ({selectedServices.size})
                        </button>
                      )}
                    </div>
                    <button
                      className={styles.btnPrintService}
                      onClick={handlePrintAllServicesReceipt}
                      style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', width: '100%' }}
                    >
                      🖨️ {t('customers.detail.printAllServices') || 'Tüm Hizmetleri Yazdır'}
                    </button>
                  </div>
                  <div className={styles.mobileServicesList}>
                    {(displayCustomer.serviceRecords || []).map((record: any) => (
                      <div key={record.id} className={styles.serviceCard}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedServices.has(record.id.toString())}
                            onChange={(e) => {
                              const newSelected = new Set(selectedServices);
                              if (e.target.checked) {
                                newSelected.add(record.id.toString());
                              } else {
                                newSelected.delete(record.id.toString());
                              }
                              setSelectedServices(newSelected);
                            }}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '4px', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1 }}>
                        <div className={styles.serviceCardHeader}>
                          <div className={styles.serviceCardTitle}>
                            <h4>{record.service_name}</h4>
                            <div className={styles.serviceCardDate}>
                              {new Date(record.performed_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={styles.serviceCardPrice}>
                            ${parseFloat(String(record.price || 0)).toFixed(2)}
                          </div>
                        </div>
                        {record.service_description && (
                          <div className={styles.serviceCardDescription}>
                            {record.service_description}
                          </div>
                        )}
                        <div className={styles.serviceCardFooter}>
                          <div className={styles.serviceCardType}>
                            {record.service_type === 'repair' ? '🔧 Tamir' : record.service_type === 'car_wash' ? '🚗 Oto Yıkama' : record.service_type}
                          </div>
                          <div className={styles.serviceCardActions}>
                            <button
                              className={styles.btnPrintService}
                              onClick={() => handlePrintReceipt(record)}
                              title={t('customers.detail.printReceipt') || 'Yazdır'}
                            >
                              🖨️
                            </button>
                            <button
                              className={styles.btnDeleteService}
                              onClick={() => handleDeleteService(record.id)}
                              title={t('customers.detail.deleteService') || 'Sil'}
                            >
                              🗑️
                            </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
                  <p className={styles.statValue}>${parseFloat(String(displayCustomer.stats?.total_spent || displayCustomer.total_spent || 0)).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteServiceModal.isOpen}
        onClose={() => setDeleteServiceModal({ isOpen: false, serviceId: null })}
        onConfirm={confirmDeleteService}
        title={t('customers.detail.confirmDeleteServiceTitle') || 'Hizmet Kaydını Sil'}
        message={t('customers.detail.confirmDeleteService') || 'Bu hizmet kaydını silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />
    </div>
  );
}
