import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { customersAPI, repairAPI, carWashAPI, settingsAPI, receiptsAPI } from '../services/api'
import { carBrandsAndModels, years } from '../data/carBrands'
import ConfirmModal from './ConfirmModal'
import './CustomerDetailModal.css'

function CustomerDetailModal({ customer, onClose, onUpdate }) {
  const { t, i18n } = useTranslation()
  const { showError } = useError()
  const [customerData, setCustomerData] = useState(customer)
  const [activeTab, setActiveTab] = useState('details')
  const [editMode, setEditMode] = useState(false)
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
  })
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [vehicleFormData, setVehicleFormData] = useState({
    brand: '',
    model: '',
    year: '',
    license_plate: '',
    vin: '',
    color: '',
    mileage: '',
    notes: ''
  })
  const [serviceFormData, setServiceFormData] = useState({
    vehicle_id: '',
    service_type: 'repair',
    service_name: '',
    service_description: '',
    price: '',
    performed_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [repairServices, setRepairServices] = useState([])
  const [carWashPackages, setCarWashPackages] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [availableVehicleModels, setAvailableVehicleModels] = useState([])
  const [serviceCart, setServiceCart] = useState([]) // Sepet sistemi - her tıklama sepete eklenir
  const [deleteServiceModal, setDeleteServiceModal] = useState({ isOpen: false, serviceRecordId: null })
  const [taxRate, setTaxRate] = useState(0) // Legacy support - total tax rate
  const [federalTaxRate, setFederalTaxRate] = useState(0) // GST/HST
  const [provincialTaxRate, setProvincialTaxRate] = useState(0) // PST/QST

  useEffect(() => {
    loadRepairServices()
    loadCarWashPackages()
    loadTaxRate()
  }, [])

  const loadTaxRate = async () => {
    try {
      const response = await settingsAPI.getSettings()
      if (response.data?.settings) {
        const rate = parseFloat(response.data.settings.tax_rate || '0')
        const federal = parseFloat(response.data.settings.federal_tax_rate || '0')
        const provincial = parseFloat(response.data.settings.provincial_tax_rate || '0')
        setTaxRate(rate)
        setFederalTaxRate(federal)
        setProvincialTaxRate(provincial)
      }
    } catch (error) {
      console.error('Error loading tax rate:', error)
    }
  }

  const loadRepairServices = async () => {
    try {
      setLoadingServices(true)
      const response = await repairAPI.getServices().catch(() => ({ data: { services: [] } }))
      setRepairServices(response.data?.services || [])
    } catch (error) {
      console.error('Error loading repair services:', error)
      setRepairServices([])
    } finally {
      setLoadingServices(false)
    }
  }

  const loadCarWashPackages = async () => {
    try {
      const response = await carWashAPI.getPackages().catch(() => ({ data: { packages: [] } }))
      setCarWashPackages(response.data?.packages || [])
    } catch (error) {
      console.error('Error loading car wash packages:', error)
      setCarWashPackages([])
    }
  }

  useEffect(() => {
    if (customer) {
      setCustomerData(customer)
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        vehicle_brand: customer.vehicle_brand || '',
        vehicle_model: customer.vehicle_model || '',
        vehicle_year: customer.vehicle_year || '',
        license_plate: customer.license_plate || '',
        notes: customer.notes || ''
      })
    }
  }, [customer])


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleVehicleFormChange = (e) => {
    const { name, value } = e.target
    if (name === 'brand') {
      setVehicleFormData({
        ...vehicleFormData,
        brand: value,
        model: '' // Reset model when brand changes
      })
      setAvailableVehicleModels(value ? (carBrandsAndModels[value] || []) : [])
    } else {
      setVehicleFormData({
        ...vehicleFormData,
        [name]: value
      })
    }
  }

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target
    setServiceFormData({
      ...serviceFormData,
      [name]: value
    })
  }

  const handleSelectRepairService = (service) => {
    setServiceFormData({
      ...serviceFormData,
      service_name: service.name,
      service_description: service.description || '',
      price: service.base_price || ''
    })
  }

  const handleSelectCarWashService = (packageItem) => {
    setServiceFormData({
      ...serviceFormData,
      service_name: packageItem.name,
      service_description: packageItem.description || '',
      price: packageItem.base_price || ''
    })
  }

  const handleAddToCart = (service, type = 'repair') => {
    const cartItem = {
      id: `${type}_${service.id}_${Date.now()}`, // Unique ID for each cart item
      service: service,
      type: type,
      price: service.base_price || service.price || 0
    }
    setServiceCart(prev => [...prev, cartItem])
  }

  const handleRemoveFromCart = (itemId) => {
    setServiceCart(prev => prev.filter(item => item.id !== itemId))
  }

  // Helper function to calculate price with tax
  const calculatePriceWithTax = (price) => {
    const basePrice = parseFloat(price || 0)
    const totalTaxRate = federalTaxRate + provincialTaxRate
    // If no separate taxes set, fall back to legacy taxRate
    const effectiveTaxRate = (federalTaxRate > 0 || provincialTaxRate > 0) ? totalTaxRate : taxRate
    const taxAmount = basePrice * (effectiveTaxRate / 100)
    return basePrice + taxAmount
  }

  const calculateTotal = () => {
    return serviceCart.reduce((total, item) => {
      const itemPrice = parseFloat(item.price || 0)
      const itemTotal = calculatePriceWithTax(itemPrice)
      return total + itemTotal
    }, 0)
  }

  const calculateSubtotal = () => {
    return serviceCart.reduce((total, item) => total + parseFloat(item.price || 0), 0)
  }

  const calculateTaxAmount = () => {
    return calculateTotal() - calculateSubtotal()
  }

  const calculateFederalTax = () => {
    const subtotal = calculateSubtotal()
    const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2) // Fallback: split legacy rate
    return subtotal * (effectiveFederalRate / 100)
  }

  const calculateProvincialTax = () => {
    const subtotal = calculateSubtotal()
    const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2) // Fallback: split legacy rate
    return subtotal * (effectiveProvincialRate / 100)
  }

  const handleCheckoutCart = async () => {
    if (serviceCart.length === 0) {
      showError(t('customers.detail.cartEmpty') || 'Sepet boş!')
      return
    }

    try {
      const promises = serviceCart.map(async (cartItem) => {
        // Calculate price with tax for the service record
        const priceWithTax = calculatePriceWithTax(cartItem.price)
        const serviceData = {
          vehicle_id: (serviceFormData.vehicle_id && serviceFormData.vehicle_id.trim()) ? serviceFormData.vehicle_id : null,
          service_type: cartItem.type === 'repair' ? 'repair' : 'car_wash',
          service_name: cartItem.service.name,
          service_description: cartItem.service.description || '',
          price: priceWithTax, // Save price with tax
          performed_date: serviceFormData.performed_date || new Date().toISOString().split('T')[0],
          notes: ''
        }
        return customersAPI.addServiceRecord(displayCustomer.id, serviceData)
      })

      await Promise.all(promises)
      // Services added successfully
      setServiceCart([])
      setShowServiceForm(false)
      setServiceFormData({
        vehicle_id: '', service_type: 'repair', service_name: '',
        service_description: '', price: '', performed_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      await reloadCustomerData()
      onUpdate()
    } catch (error) {
      console.error('Error adding services:', error)
      showError(t('customers.errors.addingServices') + ': ' + (error.response?.data?.error || error.message))
    }
  }

  // Helper function to reload customer data
  const reloadCustomerData = async () => {
    const currentCustomer = customerData || customer
    if (currentCustomer?.id) {
      try {
        const response = await customersAPI.getById(currentCustomer.id)
        const updatedCustomer = response.data.customer
        setCustomerData(updatedCustomer)
      } catch (error) {
        console.error('Error reloading customer:', error)
      }
    }
  }

  const displayCustomer = customerData || customer

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!displayCustomer?.id) return
    try {
      await customersAPI.update(displayCustomer.id, formData)
      // Customer updated successfully
      setEditMode(false)
      await reloadCustomerData()
      onUpdate()
    } catch (error) {
      showError(t('customers.errors.updating') + ': ' + (error.response?.data?.error || error.message))
    }
  }

  const handleAddVehicle = async (e) => {
    e.preventDefault()
    if (!displayCustomer?.id) {
      showError('Müşteri bilgisi bulunamadı')
      return
    }
    
    // Validate required fields
    if (!vehicleFormData.brand || !vehicleFormData.brand.trim()) {
      showError('Marka gereklidir')
      return
    }
    if (!vehicleFormData.model || !vehicleFormData.model.trim()) {
      showError('Model gereklidir')
      return
    }
    
    try {
      const yearValue = vehicleFormData.year && vehicleFormData.year.trim() ? parseInt(vehicleFormData.year) : null
      const mileageValue = vehicleFormData.mileage && vehicleFormData.mileage.toString().trim() ? parseInt(vehicleFormData.mileage) : null
      
      await customersAPI.addVehicle(displayCustomer.id, {
        brand: vehicleFormData.brand.trim(),
        model: vehicleFormData.model.trim(),
        year: isNaN(yearValue) ? null : yearValue,
        license_plate: vehicleFormData.license_plate?.trim() || null,
        vin: vehicleFormData.vin?.trim() || null,
        color: vehicleFormData.color?.trim() || null,
        mileage: isNaN(mileageValue) ? null : mileageValue,
        notes: vehicleFormData.notes?.trim() || null
      })
      setShowVehicleForm(false)
      setAvailableVehicleModels([])
      setVehicleFormData({
        brand: '', model: '', year: '', license_plate: '', vin: '',
        color: '', mileage: '', notes: ''
      })
      await reloadCustomerData()
      onUpdate()
    } catch (error) {
      console.error('Error adding vehicle:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Araç eklenirken hata oluştu'
      showError(errorMsg)
    }
  }

  const handleDeleteServiceRecord = (serviceRecordId) => {
    setDeleteServiceModal({ isOpen: true, serviceRecordId })
  }

  const confirmDeleteServiceRecord = async () => {
    if (!displayCustomer?.id || !deleteServiceModal.serviceRecordId) return
    try {
      await customersAPI.deleteServiceRecord(displayCustomer.id, deleteServiceModal.serviceRecordId)
      // Service deleted successfully
      setDeleteServiceModal({ isOpen: false, serviceRecordId: null })
      await reloadCustomerData()
      onUpdate()
    } catch (error) {
      console.error('Error deleting service record:', error)
      showError(t('customers.errors.deletingService') + ': ' + (error.response?.data?.error || error.message))
      setDeleteServiceModal({ isOpen: false, serviceRecordId: null })
    }
  }

  const handlePrintReceipt = async (record) => {
    try {
      console.log('Print receipt clicked for record:', record)
      
      // Load company info
      let companyInfo = {}
      try {
        const companyResponse = await settingsAPI.getCompanyInfo()
        companyInfo = companyResponse.data?.companyInfo || {}
      } catch (error) {
        console.error('Error loading company info:', error)
        // Continue with empty company info
      }

      // Calculate tax amounts - Use federal and provincial tax rates if available
      const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2)
      const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2)
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate
      
      const totalPrice = parseFloat(record.price || 0)
      let basePrice = totalPrice
      let federalTaxAmount = 0
      let provincialTaxAmount = 0
      let totalTaxAmount = 0
      
      if (totalTaxRate > 0) {
        // Calculate base price from total price including tax
        basePrice = totalPrice / (1 + totalTaxRate / 100)
        totalTaxAmount = totalPrice - basePrice
        federalTaxAmount = basePrice * (effectiveFederalRate / 100)
        provincialTaxAmount = basePrice * (effectiveProvincialRate / 100)
      }

      // Create receipt HTML - Termal makbuz formatı (80mm)
      const receiptHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Makbuz</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
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
    .info-label {
      font-weight: bold;
    }
    .service-details {
      margin: 8px 0;
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
    .service-row-left {
      flex: 1;
    }
    .service-row-right {
      text-align: right;
      font-weight: bold;
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
      font-family: Arial, sans-serif;
    }
    .no-print button:hover {
      background: #45a049;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    <div class="company-name">${(companyInfo.company_name || 'Nom de l\'entreprise').toUpperCase()}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address.replace(/\n/g, '<br>')}</div>` : ''}
      ${companyInfo.company_phone ? `<div>Tél: ${companyInfo.company_phone}</div>` : ''}
      ${companyInfo.company_tax_number ? `<div>No d'immatriculation: ${companyInfo.company_tax_number}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    <div class="section-divider">
      <div class="info-row">
        <span class="info-label">Client:</span>
        <span>${displayCustomer.first_name} ${displayCustomer.last_name}</span>
      </div>
      ${displayCustomer.phone ? `
      <div class="info-row">
        <span class="info-label">Tél:</span>
        <span>${displayCustomer.phone}</span>
      </div>
      ` : ''}
    </div>

    <div class="service-details">
      <div class="service-title">SERVICE EFFECTUÉ</div>
      <div class="service-row">
        <span class="service-row-left">${record.service_name}</span>
      </div>
      ${record.service_description ? `
      <div class="service-row">
        <span class="service-row-left">${record.service_description}</span>
      </div>
      ` : ''}
      <div class="service-row">
        <span class="service-row-left">Type: ${record.service_type === 'repair' ? 'Réparation' : record.service_type === 'car_wash' ? 'Lavage de voiture' : record.service_type}</span>
      </div>
      ${totalTaxRate > 0 ? `
      <div class="service-row">
        <span class="service-row-left">Sous-total:</span>
        <span class="service-row-right">$${basePrice.toFixed(2)}</span>
      </div>
      ${effectiveFederalRate > 0 ? `
      <div class="service-row">
        <span class="service-row-left">Taxe fédérale (TPS/TVH) (%${effectiveFederalRate.toFixed(2)}):</span>
        <span class="service-row-right">$${federalTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${effectiveProvincialRate > 0 ? `
      <div class="service-row">
        <span class="service-row-left">Taxe provinciale (TVP/TVQ) (%${effectiveProvincialRate.toFixed(2)}):</span>
        <span class="service-row-right">$${provincialTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ` : ''}
      <div class="total-row">
        <span>TOTAL:</span>
        <span>$${totalPrice.toFixed(2)}</span>
      </div>
    </div>

    <div class="date-info">
      <div>${new Date(record.performed_date).toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
      <div style="margin-top: 8px;">Merci!</div>
    </div>
  </div>

  <div class="no-print">
    <button onclick="window.print()">Imprimer</button>
    <button onclick="window.close()" style="margin-left: 10px; background: #666;">Fermer</button>
  </div>
</body>
</html>
      `

      // Save receipt to database
      try {
        await receiptsAPI.create({
          customer_id: displayCustomer.id || null,
          service_record_id: record.id || null,
          customer_name: `${displayCustomer.first_name} ${displayCustomer.last_name}`,
          customer_phone: displayCustomer.phone || null,
          customer_email: displayCustomer.email || null,
          license_plate: displayCustomer.license_plate || null,
          service_name: record.service_name,
          service_description: record.service_description || null,
          service_type: record.service_type || null,
          price: totalPrice,
          performed_date: record.performed_date,
          company_info: { 
            ...companyInfo, 
            tax_rate: totalTaxRate,
            federal_tax_rate: effectiveFederalRate,
            provincial_tax_rate: effectiveProvincialRate
          }
        })
        console.log('Receipt saved to database')
      } catch (error) {
        console.error('Error saving receipt:', error)
        // Continue even if save fails
      }

      // Open print window - termal makbuz formatı için dar pencere
      console.log('Opening print window...')
      const printWindow = window.open('', '_blank', 'width=320,height=600')
      
      if (!printWindow) {
        showError(t('customers.detail.popupBlockerError'))
        return
      }
      
      try {
        printWindow.document.open()
        printWindow.document.write(receiptHTML)
        printWindow.document.close()
        
        console.log('Print window opened, waiting for load...')
        
        // Wait for content to load then trigger print
        printWindow.addEventListener('load', () => {
          console.log('Print window loaded, triggering print...')
          setTimeout(() => {
            printWindow.focus()
            printWindow.print()
          }, 500)
        }, { once: true })
        
        // Fallback: if onload doesn't fire, try after a delay
        setTimeout(() => {
          if (printWindow.document.readyState === 'complete') {
            console.log('Document ready, triggering print...')
            printWindow.focus()
            printWindow.print()
          }
        }, 1000)
      } catch (error) {
        console.error('Error writing to print window:', error)
        showError(t('customers.detail.printReceiptError') + ' ' + error.message)
        printWindow.close()
      }
    } catch (error) {
      console.error('Error printing receipt:', error)
      showError(t('customers.detail.printReceiptError') + ' ' + (error.response?.data?.error || error.message))
    }
  }

  const handleAddService = async (e) => {
    e.preventDefault()
    if (!displayCustomer?.id) return
    try {
      if (!serviceFormData.service_name || !serviceFormData.price) {
        showError(t('customers.detail.fillRequiredFields') || 'Lütfen hizmet adı ve fiyat girin')
        return
      }
      
      // Calculate price with tax
      const basePrice = parseFloat(serviceFormData.price)
      const priceWithTax = calculatePriceWithTax(basePrice)
      
      await customersAPI.addServiceRecord(displayCustomer.id, {
        ...serviceFormData,
        price: priceWithTax, // Save price with tax
        vehicle_id: (serviceFormData.vehicle_id && serviceFormData.vehicle_id.trim()) ? serviceFormData.vehicle_id : null
      })
      // Service added successfully
      setShowServiceForm(false)
      setServiceCart([])
      setServiceFormData({
        vehicle_id: '', service_type: 'repair', service_name: '',
        service_description: '', price: '', performed_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      await reloadCustomerData()
      onUpdate()
    } catch (error) {
      console.error('Error adding service record:', error)
      showError(t('customers.errors.addingService') + ': ' + (error.response?.data?.error || error.message))
    }
  }

  if (!displayCustomer) return null

  return (
    <div className="customer-detail-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content-large">
        <div className="modal-header">
          <h2>{displayCustomer.first_name} {displayCustomer.last_name}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-tabs">
          <button
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            {t('customers.detail.details')}
          </button>
          <button
            className={activeTab === 'vehicles' ? 'active' : ''}
            onClick={() => setActiveTab('vehicles')}
          >
            {t('customers.detail.vehicles')} ({displayCustomer.vehicles?.length || 0})
          </button>
          <button
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => setActiveTab('services')}
          >
            {t('customers.detail.services')} ({displayCustomer.serviceRecords?.length || 0})
          </button>
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            {t('customers.detail.stats')}
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'details' && (
            <div className="tab-content">
              {!editMode ? (
                <>
                  <div className="detail-section">
                    <div className="detail-sections-row">
                      <div className="detail-subsection">
                        <h3>{t('customers.detail.personalInfo')}</h3>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>{t('customers.detail.firstName')}:</label>
                            <span>{displayCustomer.first_name}</span>
                          </div>
                          <div className="detail-item">
                            <label>{t('customers.detail.lastName')}:</label>
                            <span>{displayCustomer.last_name}</span>
                          </div>
                          <div className="detail-item">
                            <label>{t('customers.detail.email')}:</label>
                            <span>{displayCustomer.email || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <label>{t('customers.detail.phone')}:</label>
                            <span>{displayCustomer.phone || '-'}</span>
                          </div>
                          <div className="detail-item full-width">
                            <label>{t('customers.detail.address')}:</label>
                            <span>{displayCustomer.address || '-'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-subsection">
                        <h3>{t('customers.detail.vehicleInfo')}</h3>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <label>{t('customers.detail.brand')}:</label>
                            <span>{displayCustomer.vehicle_brand || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <label>{t('customers.detail.model')}:</label>
                            <span>{displayCustomer.vehicle_model || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <label>{t('customers.detail.year')}:</label>
                            <span>{displayCustomer.vehicle_year || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <label>{t('customers.detail.licensePlate')}:</label>
                            <span>{displayCustomer.license_plate || '-'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {displayCustomer.notes && (
                    <div className="detail-section">
                      <h3>{t('customers.detail.notes')}</h3>
                      <p>{displayCustomer.notes}</p>
                    </div>
                  )}

                  <div className="detail-actions">
                    <button onClick={() => setEditMode(true)} className="btn-primary">{t('customers.detail.edit')}</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="form-section">
                    <h3>{t('customers.detail.personalInfo')}</h3>
                    <div className="form-grid">
                      <input name="first_name" placeholder={t('customers.detail.firstName')} value={formData.first_name} onChange={handleInputChange} required />
                      <input name="last_name" placeholder={t('customers.detail.lastName')} value={formData.last_name} onChange={handleInputChange} required />
                      <input type="email" name="email" placeholder={t('customers.detail.email')} value={formData.email} onChange={handleInputChange} />
                      <input type="tel" name="phone" placeholder={t('customers.detail.phone')} value={formData.phone} onChange={handleInputChange} />
                      <div className="full-width">
                        <textarea name="address" placeholder={t('customers.detail.address')} value={formData.address} onChange={handleInputChange} rows="2" />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>{t('customers.detail.vehicleInfo')}</h3>
                    <div className="form-grid">
                      <input name="vehicle_brand" placeholder={t('customers.detail.brand')} value={formData.vehicle_brand} onChange={handleInputChange} />
                      <input name="vehicle_model" placeholder={t('customers.detail.model')} value={formData.vehicle_model} onChange={handleInputChange} />
                      <input type="number" name="vehicle_year" placeholder={t('customers.detail.year')} value={formData.vehicle_year} onChange={handleInputChange} />
                      <input name="license_plate" placeholder={t('customers.detail.licensePlate')} value={formData.license_plate} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="form-section">
                    <textarea name="notes" placeholder={t('customers.detail.notes')} value={formData.notes} onChange={handleInputChange} rows="4" />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn-primary">{t('customers.detail.save')}</button>
                    <button type="button" onClick={() => setEditMode(false)}>{t('customers.detail.cancel')}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>{t('customers.detail.customerVehicles')}</h3>
                <button onClick={() => setShowVehicleForm(true)} className="btn-primary">{t('customers.detail.addVehicle')}</button>
              </div>

              {showVehicleForm && (
                <div className="form-modal modern-form">
                  <h4>{t('customers.detail.addVehicle')}</h4>
                  <form onSubmit={handleAddVehicle}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>{t('customers.detail.brand')}</label>
                        <select name="brand" value={vehicleFormData.brand} onChange={handleVehicleFormChange} required>
                          <option value="">{t('customers.form.selectBrand')}</option>
                          {Object.keys(carBrandsAndModels).sort().map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t('customers.detail.model')}</label>
                        <select name="model" value={vehicleFormData.model} onChange={handleVehicleFormChange} required disabled={!vehicleFormData.brand}>
                          <option value="">{t('customers.form.selectModel')}</option>
                          {availableVehicleModels.sort().map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t('customers.detail.year')}</label>
                        <select name="year" value={vehicleFormData.year} onChange={handleVehicleFormChange}>
                          <option value="">{t('customers.form.selectYear')}</option>
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>{t('customers.detail.licensePlate')}</label>
                        <input name="license_plate" placeholder={t('customers.detail.licensePlate')} value={vehicleFormData.license_plate} onChange={handleVehicleFormChange} />
                      </div>
                      <div className="form-group">
                        <label>{t('customers.detail.vin')}</label>
                        <input name="vin" placeholder={t('customers.detail.vin')} value={vehicleFormData.vin} onChange={handleVehicleFormChange} />
                      </div>
                      <div className="form-group">
                        <label>{t('customers.detail.color')}</label>
                        <input name="color" placeholder={t('customers.detail.color')} value={vehicleFormData.color} onChange={handleVehicleFormChange} />
                      </div>
                      <div className="form-group">
                        <label>{t('customers.detail.mileage')}</label>
                        <input type="number" name="mileage" placeholder={t('customers.detail.mileage')} value={vehicleFormData.mileage} onChange={handleVehicleFormChange} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>{t('customers.detail.notes')}</label>
                      <textarea name="notes" placeholder={t('customers.detail.notes')} value={vehicleFormData.notes} onChange={handleVehicleFormChange} rows="2" />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">{t('customers.detail.addVehicle')}</button>
                      <button type="button" onClick={() => {
                        setShowVehicleForm(false)
                        setAvailableVehicleModels([])
                        setVehicleFormData({
                          brand: '', model: '', year: '', license_plate: '', vin: '',
                          color: '', mileage: '', notes: ''
                        })
                      }} className="btn-secondary">{t('customers.detail.cancel')}</button>
                    </div>
                  </form>
                </div>
              )}

              {displayCustomer.vehicles && displayCustomer.vehicles.length > 0 ? (
                <div className="vehicles-list">
                  {displayCustomer.vehicles.map(vehicle => (
                    <div key={vehicle.id} className="vehicle-card">
                      <h4>{vehicle.brand} {vehicle.model} {vehicle.year || ''}</h4>
                      <div className="vehicle-details">
                        {vehicle.license_plate && <span>{t('customers.detail.licensePlate')}: {vehicle.license_plate}</span>}
                        {vehicle.vin && <span>{t('customers.detail.vin')}: {vehicle.vin}</span>}
                        {vehicle.color && <span>{t('customers.detail.color')}: {t(`vehicles.colors.${vehicle.color}`) || vehicle.color}</span>}
                        {vehicle.mileage && <span>{t('customers.detail.mileage')}: {vehicle.mileage.toLocaleString()} km</span>}
                      </div>
                      {vehicle.notes && <p className="notes">{vehicle.notes}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t('customers.detail.noVehicles')}</p>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="tab-content">
              <div className="section-header">
                <h3>{t('customers.detail.serviceHistory')}</h3>
                <button onClick={() => setShowServiceForm(true)} className="btn-primary">{t('customers.detail.addServiceRecord')}</button>
              </div>

              {showServiceForm && (
                <div className="form-modal modern-form">
                  <h4>{t('customers.detail.addServiceRecord')}</h4>
                  <form onSubmit={handleAddService}>
                    <div className="form-group">
                      <label>{t('customers.detail.type')}</label>
                      <select name="service_type" value={serviceFormData.service_type} onChange={handleServiceFormChange} required>
                        <option value="repair">{t('customers.detail.repair')}</option>
                        <option value="car_wash">{t('customers.detail.carWash')}</option>
                        <option value="maintenance">{t('customers.detail.maintenance')}</option>
                        <option value="other">{t('customers.detail.other')}</option>
                      </select>
                    </div>

                    <div className="service-selection-layout">
                      {(serviceFormData.service_type === 'repair' && repairServices.length > 0) || (serviceFormData.service_type === 'car_wash' && carWashPackages.length > 0) ? (
                        <div className="services-section">
                          {serviceFormData.service_type === 'repair' && repairServices.length > 0 && (
                            <div className="repair-services-list">
                              <label>{t('customers.detail.selectRepairService')}</label>
                              <div className="services-grid">
                                {repairServices.filter(s => s.is_active).map(service => (
                                  <div 
                                    key={service.id} 
                                    className="service-item-card"
                                    onClick={() => handleAddToCart(service, 'repair')}
                                  >
                                    <div className="service-item-content">
                                      <h5>{service.name}</h5>
                                      {service.description && <p className="service-description">{service.description}</p>}
                                      <div className="service-price" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {taxRate > 0 ? (
                                          <>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                              ${parseFloat(service.base_price || 0).toFixed(2)} + ${(parseFloat(service.base_price || 0) * taxRate / 100).toFixed(2)} vergi
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: '#333' }}>
                                              Toplam: ${calculatePriceWithTax(service.base_price || 0).toFixed(2)}
                                            </div>
                                          </>
                                        ) : (
                                          <div>${parseFloat(service.base_price || 0).toFixed(2)}</div>
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      type="button" 
                                      className="btn-add-service"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddToCart(service, 'repair')
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
                            <div className="repair-services-list">
                              <label>{t('customers.detail.selectCarWashService')}</label>
                              <div className="services-grid">
                                {carWashPackages.filter(p => p.is_active).map(packageItem => (
                                  <div 
                                    key={packageItem.id} 
                                    className="service-item-card"
                                    onClick={() => handleAddToCart(packageItem, 'car_wash')}
                                  >
                                    <div className="service-item-content">
                                      <h5>{packageItem.name}</h5>
                                      {packageItem.description && <p className="service-description">{packageItem.description}</p>}
                                      <div className="service-price" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        {taxRate > 0 ? (
                                          <>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                              ${parseFloat(packageItem.base_price || 0).toFixed(2)} + ${(parseFloat(packageItem.base_price || 0) * taxRate / 100).toFixed(2)} vergi
                                            </div>
                                            <div style={{ fontWeight: 'bold', color: '#333' }}>
                                              Toplam: ${calculatePriceWithTax(packageItem.base_price || 0).toFixed(2)}
                                            </div>
                                          </>
                                        ) : (
                                          <div>${parseFloat(packageItem.base_price || 0).toFixed(2)}</div>
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      type="button" 
                                      className="btn-add-service"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddToCart(packageItem, 'car_wash')
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
                        <div className="cart-section">
                          <div className="cart-header">
                            <h4>{t('customers.detail.selectedServices') || 'Yapılacak İşlemler'}</h4>
                            <button 
                              type="button" 
                              className="btn-clear-cart"
                              onClick={() => setServiceCart([])}
                            >
                              {t('customers.detail.clearCart') || 'Temizle'}
                            </button>
                          </div>
                          <div className="cart-items">
                            {serviceCart.map((item, index) => (
                              <div key={item.id} className="cart-item">
                                <div className="cart-item-content">
                                  <span className="cart-item-number">{index + 1}.</span>
                                  <div className="cart-item-details">
                                    <span className="cart-item-name">{item.service.name}</span>
                                    {item.service.description && (
                                      <span className="cart-item-desc">{item.service.description}</span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', minWidth: '180px', textAlign: 'right' }}>
                                    {(federalTaxRate > 0 || provincialTaxRate > 0 || taxRate > 0) ? (
                                      <>
                                        <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
                                          <div style={{ marginBottom: '0.15rem' }}>Fiyat: ${parseFloat(item.price || 0).toFixed(2)}</div>
                                          {federalTaxRate > 0 && (
                                            <div>Federal Vergi (GST/HST): ${(parseFloat(item.price || 0) * federalTaxRate / 100).toFixed(2)}</div>
                                          )}
                                          {provincialTaxRate > 0 && (
                                            <div>Eyalet Vergisi (PST/QST): ${(parseFloat(item.price || 0) * provincialTaxRate / 100).toFixed(2)}</div>
                                          )}
                                          {(federalTaxRate === 0 && provincialTaxRate === 0 && taxRate > 0) && (
                                            <div>Vergi: ${(parseFloat(item.price || 0) * taxRate / 100).toFixed(2)}</div>
                                          )}
                                        </div>
                                        <div className="cart-item-price" style={{ fontWeight: 'bold', color: '#333', fontSize: '1.05rem', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid #e0e0e0' }}>
                                          Toplam: ${calculatePriceWithTax(item.price || 0).toFixed(2)}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="cart-item-price">
                                        ${calculatePriceWithTax(item.price || 0).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button 
                                  type="button"
                                  className="btn-remove-item"
                                  onClick={() => handleRemoveFromCart(item.id)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="cart-footer">
                            <div className="cart-total">
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
                                    <span className="total-label" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{t('customers.detail.totalAmount') || 'Toplam'}:</span>
                                    <span className="total-amount" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>${calculateTotal().toFixed(2)}</span>
                                  </div>
                                </>
                              ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span className="total-label" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{t('customers.detail.totalAmount') || 'Toplam'}:</span>
                                  <span className="total-amount" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>${calculateTotal().toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                            <button 
                              type="button"
                              className="btn-checkout"
                              onClick={handleCheckoutCart}
                            >
                              {t('customers.detail.completeServices') || 'İşlemleri Tamamla'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>


                    {displayCustomer.vehicles && displayCustomer.vehicles.length > 0 && (
                      <div className="form-group">
                        <label>{t('customers.detail.selectVehicle')}</label>
                        <select name="vehicle_id" value={serviceFormData.vehicle_id} onChange={handleServiceFormChange}>
                          <option value="">{t('customers.detail.selectVehicle')}</option>
                          {displayCustomer.vehicles.map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.brand} {vehicle.model} {vehicle.year || ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <label>{t('customers.detail.serviceName')}</label>
                      <input name="service_name" placeholder={t('customers.detail.serviceName')} value={serviceFormData.service_name} onChange={handleServiceFormChange} required />
                    </div>

                    <div className="form-group">
                      <label>{t('customers.detail.serviceDescription')}</label>
                      <textarea name="service_description" placeholder={t('customers.detail.serviceDescription')} value={serviceFormData.service_description} onChange={handleServiceFormChange} rows="3" />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('customers.detail.price')}</label>
                        <input type="number" name="price" placeholder={t('customers.detail.price')} value={serviceFormData.price} onChange={handleServiceFormChange} required step="0.01" />
                        {serviceFormData.price && taxRate > 0 && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                            <div>Fiyat: ${parseFloat(serviceFormData.price || 0).toFixed(2)}</div>
                            <div>Vergi (%{taxRate}): ${(parseFloat(serviceFormData.price || 0) * taxRate / 100).toFixed(2)}</div>
                            <div style={{ marginTop: '0.25rem', fontWeight: 'bold', color: '#333' }}>
                              Toplam: ${calculatePriceWithTax(serviceFormData.price || 0).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>{t('customers.detail.date')}</label>
                        <input type="date" name="performed_date" value={serviceFormData.performed_date} onChange={handleServiceFormChange} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t('customers.detail.notes')}</label>
                      <textarea name="notes" placeholder={t('customers.detail.notes')} value={serviceFormData.notes} onChange={handleServiceFormChange} rows="2" />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary">{t('customers.detail.addService')}</button>
                      <button type="button" onClick={() => setShowServiceForm(false)} className="btn-secondary">{t('customers.detail.cancel')}</button>
                    </div>
                  </form>
                </div>
              )}

              {displayCustomer.serviceRecords && displayCustomer.serviceRecords.length > 0 ? (
                <div className="services-list">
                  <div className="services-table-header">
                    <span>{t('customers.detail.date')}</span>
                    <span>{t('customers.detail.service')}</span>
                    <span>{t('customers.detail.type')}</span>
                    <span>{t('customers.detail.price')}</span>
                    <span>{t('customers.detail.actions')}</span>
                  </div>
                  {displayCustomer.serviceRecords.map(record => (
                    <div key={record.id} className="service-record">
                      <span>{new Date(record.performed_date).toLocaleDateString()}</span>
                      <span>
                        <strong>{record.service_name}</strong>
                        {record.service_description && <p>{record.service_description}</p>}
                      </span>
                      <span>{record.service_type}</span>
                      <span>${parseFloat(record.price).toFixed(2)}</span>
                      <span>
                        <button
                          className="btn-print-service"
                          onClick={() => handlePrintReceipt(record)}
                          title="Makbuz Yazdır"
                        >
                          🖨️ Yazdır
                        </button>
                        <button
                          className="btn-delete-service"
                          onClick={() => handleDeleteServiceRecord(record.id)}
                          title={t('customers.detail.deleteService')}
                        >
                          {t('common.delete')}
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t('customers.detail.noServices')}</p>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="tab-content">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{t('customers.detail.totalSpent')}</h3>
                  <p className="stat-value">${parseFloat(displayCustomer.total_spent || 0).toFixed(2)}</p>
                </div>
                {displayCustomer.stats && (
                  <>
                    <div className="stat-card">
                      <h3>{t('customers.detail.totalServices')}</h3>
                      <p className="stat-value">{displayCustomer.stats.total_services || 0}</p>
                    </div>
                    {displayCustomer.stats.first_service_date && (
                      <div className="stat-card">
                        <h3>{t('customers.detail.firstService')}</h3>
                        <p className="stat-value">{new Date(displayCustomer.stats.first_service_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {displayCustomer.stats.last_service_date && (
                      <div className="stat-card">
                        <h3>{t('customers.detail.lastService')}</h3>
                        <p className="stat-value">{new Date(displayCustomer.stats.last_service_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteServiceModal.isOpen}
        onClose={() => setDeleteServiceModal({ isOpen: false, serviceRecordId: null })}
        onConfirm={confirmDeleteServiceRecord}
        title={t('customers.detail.confirmDeleteServiceTitle') || 'Hizmet Kaydını Sil'}
        message={t('customers.detail.confirmDeleteService') || 'Bu hizmet kaydını silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="success"
      />
    </div>
  )
}

export default CustomerDetailModal

