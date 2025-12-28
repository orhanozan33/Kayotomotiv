import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { repairAPI, carWashAPI, settingsAPI, receiptsAPI } from '../services/api'
import { carBrandsAndModels } from '../data/carBrands'
import ConfirmModal from '../components/ConfirmModal'
import './RepairQuotesPage.css'

function RepairQuotesPage() {
  const { t, i18n } = useTranslation()
  const { showError, showSuccess } = useError()
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const [packages, setPackages] = useState([])
  const [addons, setAddons] = useState([])
  const [selectedServices, setSelectedServices] = useState([]) // Cart for packages and addons
  const [revenueStats, setRevenueStats] = useState({
    daily: { count: 0, totalRevenue: 0, avgPrice: 0 },
    monthly: { count: 0, totalRevenue: 0, avgPrice: 0 },
    yearly: { count: 0, totalRevenue: 0, avgPrice: 0 },
    custom: { count: 0, totalRevenue: 0, avgPrice: 0 }
  })
  const [revenuePeriod, setRevenuePeriod] = useState('daily') // daily, monthly, yearly, custom
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [taxRate, setTaxRate] = useState(0) // Legacy support
  const [federalTaxRate, setFederalTaxRate] = useState(0) // GST/HST
  const [provincialTaxRate, setProvincialTaxRate] = useState(0) // PST/QST
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quoteId: null })
  
  const [formData, setFormData] = useState({
    vehicle_brand: '',
    vehicle_model: '',
    license_plate: ''
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const params = searchTerm.trim() ? { search: searchTerm.trim() } : {}
      const quotesRes = await repairAPI.getVehicleRecords(params).catch(err => {
        console.error('Error loading vehicle records:', err)
        return { data: { quotes: [] } }
      })
      
      const quotesData = quotesRes.data?.quotes || []
      setQuotes(quotesData)
    } catch (error) {
      console.error('Error loading data:', error)
      setQuotes([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  const loadRevenueStats = useCallback(async () => {
    try {
      const periods = ['daily', 'monthly', 'yearly']
      const revenuePromises = periods.map(period => 
        repairAPI.getVehicleRecordsRevenue({ period }).catch(err => {
          console.error(`Error loading ${period} revenue:`, err)
          return { data: { count: 0, totalRevenue: 0, avgPrice: 0 } }
        })
      )
      
      const [dailyRes, monthlyRes, yearlyRes] = await Promise.all(revenuePromises)
      
      setRevenueStats(prev => ({
        ...prev,
        daily: dailyRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 },
        monthly: monthlyRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 },
        yearly: yearlyRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 }
      }))

      // Load custom period if dates are set
      if (customStartDate && customEndDate && revenuePeriod === 'custom') {
        const customRes = await repairAPI.getVehicleRecordsRevenue({ 
          period: 'custom', 
          startDate: customStartDate, 
          endDate: customEndDate 
        }).catch(err => {
          console.error('Error loading custom revenue:', err)
          return { data: { count: 0, totalRevenue: 0, avgPrice: 0 } }
        })
        setRevenueStats(prev => ({
          ...prev,
          custom: customRes.data || { count: 0, totalRevenue: 0, avgPrice: 0 }
        }))
      }
    } catch (error) {
      console.error('Error loading revenue stats:', error)
    }
  }, [customStartDate, customEndDate, revenuePeriod])

  const loadCarWashServices = useCallback(async () => {
    try {
      const [packagesRes, addonsRes] = await Promise.all([
        carWashAPI.getPackages().catch(err => {
          console.error('Error loading packages:', err)
          return { data: { packages: [] } }
        }),
        carWashAPI.getAddons().catch(err => {
          console.error('Error loading addons:', err)
          return { data: { addons: [] } }
        })
      ])
      setPackages(packagesRes.data?.packages || [])
      setAddons(addonsRes.data?.addons || [])
    } catch (error) {
      console.error('Error loading car wash services:', error)
    }
  }, [])

  useEffect(() => {
    loadCarWashServices()
    loadTaxRate()
  }, [loadCarWashServices])

  const loadTaxRate = async () => {
    try {
      const response = await settingsAPI.getSettings()
      if (response.data?.settings) {
        const settings = response.data.settings
        setTaxRate(parseFloat(settings.tax_rate || '0'))
        setFederalTaxRate(parseFloat(settings.federal_tax_rate || '0'))
        setProvincialTaxRate(parseFloat(settings.provincial_tax_rate || '0'))
      }
    } catch (error) {
      console.error('Error loading tax rate:', error)
    }
  }

  useEffect(() => {
    // Debounce search - wait 500ms before searching (but not on initial load)
    const delay = searchTerm ? 500 : 0
    const timer = setTimeout(() => {
      loadData()
    }, delay)
    
    return () => clearTimeout(timer)
  }, [searchTerm, loadData])

  useEffect(() => {
    loadRevenueStats()
  }, [loadRevenueStats])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'vehicle_brand') {
      setFormData({
        ...formData,
        vehicle_brand: value,
        vehicle_model: ''
      })
      setAvailableModels(value ? (carBrandsAndModels[value] || []) : [])
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const calculatePriceWithTax = (basePrice) => {
    const price = parseFloat(basePrice)
    if (isNaN(price) || taxRate === 0) return price
    return price * (1 + taxRate / 100)
  }

  const handleAddService = (service, type) => {
    const basePrice = type === 'package' ? service.base_price : service.price
    const serviceItem = {
      id: service.id,
      type: type, // 'package' or 'addon'
      name: service.name,
      price: basePrice, // Store base price
      priceWithTax: calculatePriceWithTax(basePrice) // Store price with tax
    }
    setSelectedServices([...selectedServices, serviceItem])
  }

  const handleRemoveService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index))
  }

  const calculateSubtotal = () => {
    return selectedServices.reduce((sum, service) => sum + parseFloat(service.price || 0), 0)
  }

  const calculateTaxAmount = () => {
    return calculateTotal() - calculateSubtotal()
  }

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => {
      const itemPrice = parseFloat(service.price || 0)
      const itemTotal = calculatePriceWithTax(itemPrice)
      return sum + itemTotal
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedServices.length === 0) {
        showError(t('repairQuotes.form.selectAtLeastOneService') || 'Lütfen en az bir hizmet seçin!')
        return
      }

      // Map services with price with tax
      const servicesWithTax = selectedServices.map(service => ({
        ...service,
        price: calculatePriceWithTax(service.price) // Send price with tax
      }))

      const vehicleData = {
        vehicle_brand: formData.vehicle_brand.trim(),
        vehicle_model: formData.vehicle_model.trim(),
        license_plate: formData.license_plate.trim(),
        selected_services: servicesWithTax,
        total_price: calculateTotal() // Send total with tax
      }

      await repairAPI.createVehicleRecord(vehicleData)
      showSuccess(t('repairQuotes.createdSuccessfully') || 'Araç başarıyla eklendi!')
      setShowModal(false)
      setFormData({
        vehicle_brand: '',
        vehicle_model: '',
        license_plate: ''
      })
      setAvailableModels([])
      setSelectedServices([])
      loadData()
      loadRevenueStats()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('repairQuotes.errors.creating') || 'Araç eklenirken hata oluştu: ' + errorMessage)
    }
  }

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      loadRevenueStats()
    }
  }

  const getCurrentRevenue = () => {
    if (revenuePeriod === 'custom' && customStartDate && customEndDate) {
      return revenueStats.custom
    }
    return revenueStats[revenuePeriod] || { count: 0, totalRevenue: 0, avgPrice: 0 }
  }

  const handleRowClick = (quote) => {
    setSelectedQuote(quote)
    setShowDetailModal(true)
  }

  const handleDeleteRecord = (quoteId, e) => {
    e.stopPropagation() // Prevent row click
    setDeleteModal({ isOpen: true, quoteId })
  }

  const confirmDeleteRecord = async () => {
    try {
      await repairAPI.deleteQuote(deleteModal.quoteId)
      showSuccess(t('repairQuotes.deletedSuccessfully') || 'Kayıt başarıyla silindi!')
      setDeleteModal({ isOpen: false, quoteId: null })
      loadData()
    } catch (error) {
      showError(error.response?.data?.error || 'Kayıt silinirken hata oluştu')
    }
  }

  const handleDeleteService = async (serviceIndex) => {
    if (!selectedQuote) return
    
    try {
      const services = selectedQuote.parsed_services || []
      const updatedServices = services.filter((_, idx) => idx !== serviceIndex)
      const newTotal = updatedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
      
      const notesData = {
        license_plate: selectedQuote.license_plate || '',
        services: updatedServices
      }
      
      // Update quote with new services and total_price
      await repairAPI.updateQuoteStatus(selectedQuote.id, 'completed', JSON.stringify(notesData), newTotal)
      
      // Update local state
      setSelectedQuote({
        ...selectedQuote,
        parsed_services: updatedServices,
        total_price: newTotal
      })
      
      // Reload data to refresh table
      await loadData()
      showSuccess(t('repairQuotes.serviceDeleted') || 'Hizmet silindi!')
    } catch (error) {
      showError(t('repairQuotes.errors.deletingService') || 'Hizmet silinirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handlePrintReceipt = async () => {
    if (!selectedQuote) return
    
    try {
      // Load company info
      let companyInfo = {}
      try {
        const companyResponse = await settingsAPI.getCompanyInfo()
        companyInfo = companyResponse.data?.companyInfo || {}
      } catch (error) {
        console.error('Error loading company info:', error)
      }

      const services = selectedQuote.parsed_services || []
      const servicesList = services.map(s => `${s.name} - $${parseFloat(s.price || 0).toFixed(2)}`).join(', ')

      // Calculate tax amounts - Use federal and provincial tax rates if available
      const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2)
      const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2)
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate
      
      const totalPrice = parseFloat(selectedQuote.total_price || 0)
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
  <title>Reçu</title>
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
        <span class="info-label">Date:</span>
        <span>${new Date(selectedQuote.created_at).toLocaleDateString('fr-FR')}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Marque:</span>
        <span>${selectedQuote.vehicle_brand}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Modèle:</span>
        <span>${selectedQuote.vehicle_model}</span>
      </div>
      ${selectedQuote.license_plate ? `
      <div class="info-row">
        <span class="info-label">Plaque:</span>
        <span>${selectedQuote.license_plate}</span>
      </div>
      ` : ''}
    </div>

    <div class="service-details">
      <div class="service-title">SERVICES EFFECTUÉS</div>
      ${services.map(s => {
        const servicePrice = parseFloat(s.price || 0)
        const serviceBasePrice = totalTaxRate > 0 ? servicePrice / (1 + totalTaxRate / 100) : servicePrice
        return `<div class="service-row">
          <span class="service-row-left">${s.name}</span>
          <span class="service-row-right">$${serviceBasePrice.toFixed(2)}</span>
        </div>`
      }).join('')}
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
      <div>${new Date(selectedQuote.created_at).toLocaleDateString('fr-FR')} ${new Date(selectedQuote.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
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
          customer_id: null,
          service_record_id: null,
          customer_name: null,
          customer_phone: null,
          customer_email: null,
          license_plate: selectedQuote.license_plate || null,
          service_name: servicesList,
          service_description: null,
          service_type: 'car_wash',
          price: parseFloat(selectedQuote.total_price || 0),
          performed_date: selectedQuote.created_at.split('T')[0],
          company_info: { 
            ...companyInfo, 
            tax_rate: totalTaxRate,
            federal_tax_rate: effectiveFederalRate,
            provincial_tax_rate: effectiveProvincialRate
          }
        })
      } catch (error) {
        console.error('Error saving receipt:', error)
      }

      // Open print window
      const printWindow = window.open('', '_blank', 'width=320,height=600')
      if (!printWindow) {
        showError(t('repairQuotes.errors.popupBlocked') || 'Popup engellendi. Lütfen popup blocker\'ı kapatın.')
        return
      }

      try {
        printWindow.document.write(receiptHTML)
        printWindow.document.close()

        printWindow.addEventListener('load', () => {
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
        showError(t('repairQuotes.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu: ' + error.message)
        printWindow.close()
      }
    } catch (error) {
      console.error('Error printing receipt:', error)
      showError(t('repairQuotes.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const currentRevenue = getCurrentRevenue()

  if (loading) return <div className="loading">{t('common.loading') || 'Loading...'}</div>

  return (
    <div className="repair-quotes-page">
      <div className="page-header">
        <h1>{t('repairQuotes.title') || 'Oto Yıkama Kayıt'}</h1>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          {t('repairQuotes.addVehicle') || 'Araç Ekle'}
        </button>
      </div>

      {/* Revenue Statistics Section */}
      <div className="revenue-section">
        <div className="revenue-controls">
          <div className="period-selector">
            <button 
              className={revenuePeriod === 'daily' ? 'active' : ''} 
              onClick={() => setRevenuePeriod('daily')}
            >
              {t('repairQuotes.revenue.daily')}
            </button>
            <button 
              className={revenuePeriod === 'monthly' ? 'active' : ''} 
              onClick={() => setRevenuePeriod('monthly')}
            >
              {t('repairQuotes.revenue.monthly')}
            </button>
            <button 
              className={revenuePeriod === 'yearly' ? 'active' : ''} 
              onClick={() => setRevenuePeriod('yearly')}
            >
              {t('repairQuotes.revenue.yearly')}
            </button>
            <button 
              className={revenuePeriod === 'custom' ? 'active' : ''} 
              onClick={() => setRevenuePeriod('custom')}
            >
              {t('repairQuotes.revenue.dateRange')}
            </button>
          </div>
          {revenuePeriod === 'custom' && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="date-input"
              />
              <span> - </span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="date-input"
              />
              <button onClick={handleCustomDateChange} className="btn-apply">
                {t('repairQuotes.revenue.apply')}
              </button>
            </div>
          )}
        </div>
        <div className="revenue-stats">
          <div className="revenue-stat-card">
            <h3>{t('repairQuotes.revenue.totalRecords')}</h3>
            <p className="stat-number">{currentRevenue.count}</p>
          </div>
          <div className="revenue-stat-card">
            <h3>{t('repairQuotes.revenue.totalRevenue')}</h3>
            <p className="stat-number">${currentRevenue.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="revenue-stat-card">
            <h3>{t('repairQuotes.revenue.averagePrice')}</h3>
            <p className="stat-number">${currentRevenue.avgPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder={t('repairQuotes.search') || 'Marka, model veya plaka ile ara...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
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
                <td colSpan="6" className="no-data-cell">
                  {t('repairQuotes.noData') || 'Kayıt bulunamadı'}
                </td>
              </tr>
            ) : (
              quotes.map(quote => {
                const services = quote.parsed_services || []
                const licensePlate = quote.license_plate || '-'
                return (
                  <tr key={quote.id} onClick={() => handleRowClick(quote)} style={{ cursor: 'pointer' }}>
                    <td>{new Date(quote.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</td>
                    <td>{quote.vehicle_brand}</td>
                    <td>{quote.vehicle_model}</td>
                    <td>{licensePlate}</td>
                    <td>
                      {services.length > 0 ? (
                        <ul className="services-list">
                          {services.map((service, idx) => (
                            <li key={idx}>{service.name} (${service.price})</li>
                          ))}
                        </ul>
                      ) : '-'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="price-action-cell">
                        <span className="price-text">${parseFloat(quote.total_price || 0).toFixed(2)}</span>
                        <button
                          className="btn-delete"
                          onClick={(e) => handleDeleteRecord(quote.id, e)}
                          title={t('common.delete') || 'Sil'}
                        >
                          {t('common.delete') || 'Sil'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('repairQuotes.addVehicle') || 'Araç Ekle'}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowModal(false)
                  setSelectedServices([])
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="vehicle-form">
              <div className="form-section">
                <h3>Araç Bilgileri</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Araç Markası</label>
                    <select
                      name="vehicle_brand"
                      value={formData.vehicle_brand}
                      onChange={handleInputChange}
                      className="form-select-modern"
                      required
                    >
                      <option value="">Marka Seçin</option>
                      {Object.keys(carBrandsAndModels).sort().map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Araç Modeli</label>
                    <select
                      name="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={handleInputChange}
                      className="form-select-modern"
                      disabled={!formData.vehicle_brand}
                      required
                    >
                      <option value="">Model Seçin</option>
                      {availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Plaka</label>
                    <input
                      type="text"
                      name="license_plate"
                      value={formData.license_plate}
                      onChange={handleInputChange}
                      className="form-input-modern"
                      placeholder={t('repairQuotes.tableHeaders.licensePlate') || 'Plaka'}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>{t('repairQuotes.form.carWashServices')}</h3>
                
                {/* Packages */}
                <div className="services-group">
                  <h4>{t('repairQuotes.form.packages')}</h4>
                  <div className="services-grid">
                    {packages.filter(pkg => pkg.is_active).map(pkg => (
                      <div key={pkg.id} className="service-card">
                        <div className="service-info">
                          <strong>{pkg.name}</strong>
                          <span className="service-price">${pkg.base_price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddService(pkg, 'package')}
                          className="btn-add-service"
                        >
                          {t('repairQuotes.form.addToCart')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Addons */}
                <div className="services-group">
                  <h4>{t('repairQuotes.form.addons')}</h4>
                  <div className="services-grid">
                    {addons.filter(addon => addon.is_active).map(addon => (
                      <div key={addon.id} className="service-card">
                        <div className="service-info">
                          <strong>{addon.name}</strong>
                          <span className="service-price">${addon.price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddService(addon, 'addon')}
                          className="btn-add-service"
                        >
                          {t('repairQuotes.form.addToCart')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart */}
                {selectedServices.length > 0 && (
                  <div className="cart-section">
                    <h4>{t('repairQuotes.form.cart')}</h4>
                    <div className="cart-items">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="cart-item">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                            <span><strong>{service.name}</strong></span>
                            {taxRate > 0 ? (
                              <>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                  {t('repairQuotes.form.price')}: ${parseFloat(service.price || 0).toFixed(2)} + {t('repairQuotes.form.tax')}: ${(parseFloat(service.price || 0) * taxRate / 100).toFixed(2)}
                                </span>
                                <span style={{ fontWeight: 'bold', color: '#333' }}>
                                  {t('repairQuotes.form.total')}: ${calculatePriceWithTax(service.price || 0).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>${parseFloat(service.price || 0).toFixed(2)}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(index)}
                            className="btn-remove"
                          >
                            {t('repairQuotes.form.remove')}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="cart-total">
                      {taxRate > 0 ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
                            <span>{t('repairQuotes.form.subtotal')}:</span>
                            <span style={{ fontWeight: '600' }}>${calculateSubtotal().toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#666' }}>
                            <span>{t('repairQuotes.form.tax')} (%{taxRate}):</span>
                            <span style={{ fontWeight: '600' }}>${calculateTaxAmount().toFixed(2)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '2px solid #e0e0e0', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{t('repairQuotes.form.total')}:</span>
                            <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>${calculateTotal().toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>{t('repairQuotes.form.total')}:</span>
                          <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#333' }}>${calculateTotal().toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowModal(false)
                  setSelectedServices([])
                }}>
                  {t('common.cancel') || 'İptal'}
                </button>
                <button type="submit" className="btn-submit">
                  {t('common.save') || 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedQuote && (
        <div className="modal-overlay" style={{ pointerEvents: 'auto' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Araç Detayları</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-row">
                  <label>{t('repairQuotes.date')}:</label>
                  <span>{new Date(selectedQuote.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
                <div className="detail-row">
                  <label>{t('repairQuotes.tableHeaders.brand')}:</label>
                  <span>{selectedQuote.vehicle_brand}</span>
                </div>
                <div className="detail-row">
                  <label>{t('repairQuotes.tableHeaders.model')}:</label>
                  <span>{selectedQuote.vehicle_model}</span>
                </div>
                <div className="detail-row">
                  <label>{t('repairQuotes.tableHeaders.licensePlate')}:</label>
                  <span>{selectedQuote.license_plate || '-'}</span>
                </div>
                <div className="detail-row">
                  <label>{t('repairQuotes.detail.total')}:</label>
                  <span>${parseFloat(selectedQuote.total_price || 0).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>{t('repairQuotes.detail.services')}</h3>
                {selectedQuote.parsed_services && selectedQuote.parsed_services.length > 0 ? (
                  <div className="services-detail-list">
                    {selectedQuote.parsed_services.map((service, idx) => (
                      <div key={idx} className="service-detail-item">
                        <span>{service.name} - ${service.price}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(idx)}
                          className="btn-delete-service"
                        >
                          {t('repairQuotes.detail.delete')}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{t('repairQuotes.detail.noServices')}</p>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-print-service"
                onClick={handlePrintReceipt}
              >
                🖨️ Yazdır
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowDetailModal(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quoteId: null })}
        onConfirm={confirmDeleteRecord}
        title={t('repairQuotes.confirmDeleteTitle') || 'Kaydı Sil'}
        message={t('repairQuotes.confirmDelete') || 'Bu kaydı silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />
    </div>
  )
}

export default RepairQuotesPage
