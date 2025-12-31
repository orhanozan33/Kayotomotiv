import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { carWashAPI, settingsAPI, receiptsAPI } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import './CarWashPage.css'

function CarWashPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [packages, setPackages] = useState([])
  const [addons, setAddons] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('packages')
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [showAddonForm, setShowAddonForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [editingAddon, setEditingAddon] = useState(null)
  const [deletePackageModal, setDeletePackageModal] = useState({ isOpen: false, packageId: null })
  const [deleteAddonModal, setDeleteAddonModal] = useState({ isOpen: false, addonId: null })
  const [detailPackageModal, setDetailPackageModal] = useState({ isOpen: false, package: null })
  const [detailAddonModal, setDetailAddonModal] = useState({ isOpen: false, addon: null })
  const [packageFormData, setPackageFormData] = useState({
    name: '', description: '', base_price: '', duration_minutes: '', display_order: '0', is_active: true
  })
  const [addonFormData, setAddonFormData] = useState({
    name: '', description: '', price: '', display_order: '0', is_active: true
  })
  const [taxRate, setTaxRate] = useState(0) // Legacy support
  const [federalTaxRate, setFederalTaxRate] = useState(0) // GST/HST
  const [provincialTaxRate, setProvincialTaxRate] = useState(0) // PST/QST

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [packagesRes, addonsRes, appointmentsRes] = await Promise.all([
        carWashAPI.getPackages().catch(err => {
          console.error('Error loading packages:', err)
          return { data: { packages: [] } }
        }),
        carWashAPI.getAddons().catch(err => {
          console.error('Error loading addons:', err)
          return { data: { addons: [] } }
        }),
        carWashAPI.getAppointments().catch(err => {
          console.error('Error loading appointments:', err)
          return { data: { appointments: [] } }
        })
      ])
      setPackages(packagesRes.data?.packages || [])
      setAddons(addonsRes.data?.addons || [])
      setAppointments(appointmentsRes.data?.appointments || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setPackages([])
      setAddons([])
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    loadTaxRate()
  }, []) // Empty dependency array - only run once on mount

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

  const handlePackageSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...packageFormData,
        base_price: parseFloat(packageFormData.base_price),
        duration_minutes: packageFormData.duration_minutes ? parseInt(packageFormData.duration_minutes) : null,
        display_order: parseInt(packageFormData.display_order)
      }
      if (editingPackage) {
        await carWashAPI.updatePackage(editingPackage.id, data)
      } else {
        await carWashAPI.createPackage(data)
      }
      // Package saved successfully
      setShowPackageForm(false)
      setEditingPackage(null)
      showSuccess(t('carWash.packageSavedSuccessfully') || 'Paket başarıyla kaydedildi!')
      loadData()
    } catch (error) {
      showError(t('carWash.errors.savingPackage') || 'Paket kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleTogglePackageActive = async (pkg) => {
    try {
      await carWashAPI.updatePackage(pkg.id, { is_active: !pkg.is_active })
      showSuccess(t('carWash.statusUpdated') || 'Durum başarıyla güncellendi!')
      setDetailPackageModal({ isOpen: false, package: null })
      loadData()
    } catch (error) {
      showError(t('carWash.errors.updatingStatus') || 'Durum güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleDeletePackage = (packageId) => {
    setDeletePackageModal({ isOpen: true, packageId })
  }

  const confirmDeletePackage = async () => {
    if (!deletePackageModal.packageId) return
    try {
      await carWashAPI.deletePackage(deletePackageModal.packageId)
      showSuccess(t('carWash.packageDeletedSuccessfully') || 'Paket başarıyla silindi!')
      setDeletePackageModal({ isOpen: false, packageId: null })
      loadData()
    } catch (error) {
      showError(t('carWash.errors.deletingPackage') || 'Paket silinirken hata oluştu: ' + (error.response?.data?.error || error.message))
      setDeletePackageModal({ isOpen: false, packageId: null })
    }
  }

  const handleAddonSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...addonFormData,
        price: parseFloat(addonFormData.price),
        display_order: parseInt(addonFormData.display_order)
      }
      if (editingAddon) {
        await carWashAPI.updateAddon(editingAddon.id, data)
      } else {
        await carWashAPI.createAddon(data)
      }
      // Addon saved successfully
      setShowAddonForm(false)
      setEditingAddon(null)
      showSuccess(t('carWash.addonSavedSuccessfully') || 'Eklenti başarıyla kaydedildi!')
      loadData()
    } catch (error) {
      showError(t('carWash.errors.savingAddon') || 'Eklenti kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleToggleAddonActive = async (addon) => {
    try {
      await carWashAPI.updateAddon(addon.id, { is_active: !addon.is_active })
      showSuccess(t('carWash.statusUpdated') || 'Durum başarıyla güncellendi!')
      setDetailAddonModal({ isOpen: false, addon: null })
      loadData()
    } catch (error) {
      showError(t('carWash.errors.updatingStatus') || 'Durum güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleDeleteAddon = (addonId) => {
    setDeleteAddonModal({ isOpen: true, addonId })
  }

  const confirmDeleteAddon = async () => {
    if (!deleteAddonModal.addonId) return
    try {
      await carWashAPI.deleteAddon(deleteAddonModal.addonId)
      showSuccess(t('carWash.addonDeletedSuccessfully') || 'Eklenti başarıyla silindi!')
      setDeleteAddonModal({ isOpen: false, addonId: null })
      loadData()
    } catch (error) {
      showError(t('carWash.errors.deletingAddon') || 'Eklenti silinirken hata oluştu: ' + (error.response?.data?.error || error.message))
      setDeleteAddonModal({ isOpen: false, addonId: null })
    }
  }

  const handlePackageRowClick = (pkg) => {
    setDetailPackageModal({ isOpen: true, package: pkg })
  }

  const handleAddonRowClick = (addon) => {
    setDetailAddonModal({ isOpen: true, addon })
  }

  const handleEditPackageFromModal = () => {
    if (detailPackageModal.package) {
      setEditingPackage(detailPackageModal.package)
      setPackageFormData({
        name: detailPackageModal.package.name, 
        description: detailPackageModal.package.description || '', 
        base_price: detailPackageModal.package.base_price.toString(),
        duration_minutes: detailPackageModal.package.duration_minutes?.toString() || '', 
        display_order: detailPackageModal.package.display_order?.toString() || '0',
        is_active: detailPackageModal.package.is_active !== false
      })
      setDetailPackageModal({ isOpen: false, package: null })
      setShowPackageForm(true)
    }
  }

  const handleEditAddonFromModal = () => {
    if (detailAddonModal.addon) {
      setEditingAddon(detailAddonModal.addon)
      setAddonFormData({
        name: detailAddonModal.addon.name, 
        description: detailAddonModal.addon.description || '', 
        price: detailAddonModal.addon.price.toString(),
        display_order: detailAddonModal.addon.display_order?.toString() || '0', 
        is_active: detailAddonModal.addon.is_active !== false
      })
      setDetailAddonModal({ isOpen: false, addon: null })
      setShowAddonForm(true)
    }
  }

  const handleDeletePackageFromModal = () => {
    if (detailPackageModal.package) {
      setDetailPackageModal({ isOpen: false, package: null })
      handleDeletePackage(detailPackageModal.package.id)
    }
  }

  const handleDeleteAddonFromModal = () => {
    if (detailAddonModal.addon) {
      setDetailAddonModal({ isOpen: false, addon: null })
      handleDeleteAddon(detailAddonModal.addon.id)
    }
  }

  const handleTogglePackageActiveFromModal = async () => {
    if (detailPackageModal.package) {
      await handleTogglePackageActive(detailPackageModal.package)
    }
  }

  const handleToggleAddonActiveFromModal = async () => {
    if (detailAddonModal.addon) {
      await handleToggleAddonActive(detailAddonModal.addon)
    }
  }

  const handleAppointmentStatusUpdate = async (id, status) => {
    try {
      await carWashAPI.updateAppointmentStatus(id, status)
      showSuccess(t('carWash.updatedSuccessfully') || 'Durum başarıyla güncellendi!')
      loadData()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('carWash.errors.updating') + ': ' + errorMessage)
    }
  }

  const handlePrintReceipt = async (appointment) => {
    try {
      // Load company info
      let companyInfo = {}
      try {
        const companyResponse = await settingsAPI.getCompanyInfo()
        companyInfo = companyResponse.data?.companyInfo || {}
      } catch (error) {
        console.error('Error loading company info:', error)
      }

      // Calculate tax amounts - Use federal and provincial tax rates if available
      const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2)
      const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2)
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate
      
      const totalPrice = parseFloat(appointment.total_price || 0)
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
        <span class="info-label">Client:</span>
        <span>${appointment.customer_name}</span>
      </div>
      ${appointment.customer_phone ? `
      <div class="info-row">
        <span class="info-label">Tél:</span>
        <span>${appointment.customer_phone}</span>
      </div>
      ` : ''}
    </div>

    <div class="service-details">
      <div class="service-title">SERVICE EFFECTUÉ</div>
      <div class="service-row">
        <span class="service-row-left">${appointment.package_name}</span>
      </div>
      ${appointment.notes ? `
      <div class="service-row">
        <span class="service-row-left">${appointment.notes}</span>
      </div>
      ` : ''}
      <div class="service-row">
        <span class="service-row-left">Type: Lavage de voiture</span>
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
      <div>${new Date(appointment.appointment_date).toLocaleDateString('fr-FR')} ${appointment.appointment_time}</div>
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
          customer_id: appointment.user_id || null,
          service_record_id: appointment.id || null,
          customer_name: appointment.customer_name,
          customer_phone: appointment.customer_phone || null,
          customer_email: appointment.customer_email || null,
          license_plate: null,
          service_name: appointment.package_name,
          service_description: appointment.notes || null,
          service_type: 'car_wash',
          price: totalPrice,
          performed_date: appointment.appointment_date,
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

      // Open print window
      const printWindow = window.open('', '_blank', 'width=320,height=600')
      if (!printWindow) {
        showError(t('carWash.errors.popupBlocked') || 'Popup engellendi. Lütfen popup blocker\'ı kapatın.')
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
        showError('Makbuz yazdırılırken hata oluştu: ' + error.message)
        printWindow.close()
      }
    } catch (error) {
      console.error('Error printing receipt:', error)
      showError(t('carWash.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  if (loading) return <div className="loading">{t('common.loading')}</div>

  return (
    <div className="car-wash-admin-page">
      <h1>{t('carWash.management')}</h1>

      <div className="tabs">
        <button className={activeTab === 'packages' ? 'active' : ''} onClick={() => setActiveTab('packages')}>
          {t('carWash.packages')}
        </button>
        <button className={activeTab === 'addons' ? 'active' : ''} onClick={() => setActiveTab('addons')}>
          {t('carWash.addons')}
        </button>
        <button className={activeTab === 'appointments' ? 'active' : ''} onClick={() => setActiveTab('appointments')}>
          {t('carWash.appointments')}
        </button>
      </div>

      {activeTab === 'packages' && (
        <>
          <div className="page-header">
            <button onClick={() => {
              setEditingPackage(null)
              setPackageFormData({ name: '', description: '', base_price: '', duration_minutes: '', display_order: '0', is_active: true })
              setShowPackageForm(true)
            }} className="btn-primary">{t('carWash.addPackage')}</button>
          </div>
          {showPackageForm && (
            <div className="modal">
              <div className="modal-content">
                <h2>{editingPackage ? t('carWash.editPackage') : t('carWash.addPackage')}</h2>
                <form onSubmit={handlePackageSubmit}>
                  <input name="name" placeholder={t('carWash.name')} value={packageFormData.name} onChange={(e) => setPackageFormData({...packageFormData, name: e.target.value})} required />
                  <textarea name="description" placeholder={t('carWash.description')} value={packageFormData.description} onChange={(e) => setPackageFormData({...packageFormData, description: e.target.value})} rows="4" />
                  <input type="number" name="base_price" placeholder={t('carWash.price')} value={packageFormData.base_price} onChange={(e) => setPackageFormData({...packageFormData, base_price: e.target.value})} required step="0.01" />
                  <input type="number" name="duration_minutes" placeholder={t('carWash.durationMinutes')} value={packageFormData.duration_minutes} onChange={(e) => setPackageFormData({...packageFormData, duration_minutes: e.target.value})} />
                  <input type="number" name="display_order" placeholder={t('carWash.displayOrder')} value={packageFormData.display_order} onChange={(e) => setPackageFormData({...packageFormData, display_order: e.target.value})} />
                  <label><input type="checkbox" name="is_active" checked={packageFormData.is_active} onChange={(e) => setPackageFormData({...packageFormData, is_active: e.target.checked})} /> {t('common.active')}</label>
                  <div className="modal-actions">
                    <button type="submit">{t('common.save')}</button>
                    <button type="button" onClick={() => setShowPackageForm(false)}>{t('common.cancel')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      {loading ? (t('common.loading') || 'Loading...') : (t('carWash.noPackages') || 'Henüz paket eklenmemiş')}
                    </td>
                  </tr>
                ) : (
                  packages.map(pkg => (
                  <tr key={pkg.id} onClick={() => handlePackageRowClick(pkg)} style={{ cursor: 'pointer' }}>
                    <td>{pkg.name}</td>
                    <td>${pkg.base_price}</td>
                    <td>{pkg.duration_minutes || 'N/A'} min</td>
                    <td>{pkg.is_active ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingPackage(pkg)
                          setPackageFormData({
                            name: pkg.name, description: pkg.description || '', base_price: pkg.base_price.toString(),
                            duration_minutes: pkg.duration_minutes?.toString() || '', display_order: pkg.display_order?.toString() || '0',
                            is_active: pkg.is_active !== false
                          })
                          setShowPackageForm(true)
                        }} className="btn-edit">{t('common.edit') || 'Edit'}</button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTogglePackageActive(pkg); }} 
                          className={pkg.is_active ? 'btn-deactivate' : 'btn-activate'}
                        >
                          {pkg.is_active ? (t('common.deactivate') || 'Deactivate') : (t('common.activate') || 'Activate')}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeletePackage(pkg.id); }} className="btn-delete">{t('common.delete') || 'Delete'}</button>
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
          <div className="page-header">
            <button onClick={() => {
              setEditingAddon(null)
              setAddonFormData({ name: '', description: '', price: '', display_order: '0', is_active: true })
              setShowAddonForm(true)
            }} className="btn-primary">{t('carWash.addAddon')}</button>
          </div>
          {showAddonForm && (
            <div className="modal">
              <div className="modal-content">
                <h2>{editingAddon ? t('carWash.editAddon') : t('carWash.addAddon')}</h2>
                <form onSubmit={handleAddonSubmit}>
                  <input name="name" placeholder={t('carWash.name')} value={addonFormData.name} onChange={(e) => setAddonFormData({...addonFormData, name: e.target.value})} required />
                  <textarea name="description" placeholder={t('carWash.description')} value={addonFormData.description} onChange={(e) => setAddonFormData({...addonFormData, description: e.target.value})} rows="4" />
                  <input type="number" name="price" placeholder={t('carWash.price')} value={addonFormData.price} onChange={(e) => setAddonFormData({...addonFormData, price: e.target.value})} required step="0.01" />
                  <input type="number" name="display_order" placeholder={t('carWash.displayOrder')} value={addonFormData.display_order} onChange={(e) => setAddonFormData({...addonFormData, display_order: e.target.value})} />
                  <label><input type="checkbox" name="is_active" checked={addonFormData.is_active} onChange={(e) => setAddonFormData({...addonFormData, is_active: e.target.checked})} /> {t('common.active')}</label>
                  <div className="modal-actions">
                    <button type="submit">{t('common.save')}</button>
                    <button type="button" onClick={() => setShowAddonForm(false)}>{t('common.cancel')}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>{t('carWash.name')}</th><th>{t('carWash.price')}</th><th>{t('carWash.status')}</th><th>{t('repairServices.actions')}</th></tr>
              </thead>
              <tbody>
                {addons.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                      {loading ? (t('common.loading') || 'Loading...') : (t('carWash.noAddons') || 'Henüz ekstra hizmet eklenmemiş')}
                    </td>
                  </tr>
                ) : (
                  addons.map(addon => (
                  <tr key={addon.id} onClick={() => handleAddonRowClick(addon)} style={{ cursor: 'pointer' }}>
                    <td>{addon.name}</td>
                    <td>${addon.price}</td>
                    <td>{addon.is_active ? t('common.active') : t('common.inactive')}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="action-buttons">
                        <button onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingAddon(addon)
                          setAddonFormData({
                            name: addon.name, description: addon.description || '', price: addon.price.toString(),
                            display_order: addon.display_order?.toString() || '0', is_active: addon.is_active !== false
                          })
                          setShowAddonForm(true)
                        }} className="btn-edit">{t('common.edit')}</button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleAddonActive(addon); }} 
                          className={addon.is_active ? 'btn-deactivate' : 'btn-activate'}
                        >
                          {addon.is_active ? t('common.deactivate') : t('common.activate')}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteAddon(addon.id); }} className="btn-delete">{t('common.delete')}</button>
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
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Package</th>
                <th>Date</th>
                <th>Time</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appointment => (
                <tr key={appointment.id}>
                  <td>{appointment.customer_name}</td>
                  <td>{appointment.package_name}</td>
                  <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>${appointment.total_price}</td>
                  <td>{appointment.status}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select value={appointment.status} onChange={(e) => handleAppointmentStatusUpdate(appointment.id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button 
                        onClick={() => handlePrintReceipt(appointment)}
                        className="btn-primary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        title="Imprimer le reçu"
                      >
                        🖨️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deletePackageModal.isOpen}
        onClose={() => setDeletePackageModal({ isOpen: false, packageId: null })}
        onConfirm={confirmDeletePackage}
        title={t('carWash.confirmDeletePackageTitle') || 'Paketi Sil'}
        message={t('carWash.confirmDeletePackage') || 'Bu paketi silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />

      <ConfirmModal
        isOpen={deleteAddonModal.isOpen}
        onClose={() => setDeleteAddonModal({ isOpen: false, addonId: null })}
        onConfirm={confirmDeleteAddon}
        title={t('carWash.confirmDeleteAddonTitle')}
        message={t('carWash.confirmDeleteAddon')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />

      {detailPackageModal.isOpen && detailPackageModal.package && (
        <div className="modal">
          <div className="modal-content">
            <h2>{detailPackageModal.package.name}</h2>
            <button 
              type="button" 
              className="modal-close" 
              onClick={() => setDetailPackageModal({ isOpen: false, package: null })}
            >×</button>
            <div className="service-detail">
              <div className="detail-row">
                <label>{t('carWash.description') || 'Description'}:</label>
                <span>{detailPackageModal.package.description || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>{t('carWash.price') || 'Price'}:</label>
                <span>${detailPackageModal.package.base_price}</span>
              </div>
              <div className="detail-row">
                <label>{t('carWash.duration') || 'Duration'}:</label>
                <span>{detailPackageModal.package.duration_minutes || 'N/A'} {t('carWash.minutes') || 'minutes'}</span>
              </div>
              <div className="detail-row">
                <label>{t('carWash.displayOrder') || 'Display Order'}:</label>
                <span>{detailPackageModal.package.display_order}</span>
              </div>
              <div className="detail-row">
                <label>{t('carWash.status') || 'Status'}:</label>
                <span>{detailPackageModal.package.is_active ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}</span>
              </div>
              <div className="detail-actions">
                <button onClick={handleEditPackageFromModal} className="btn-edit">{t('common.edit')}</button>
                <button 
                  onClick={handleTogglePackageActiveFromModal} 
                  className={detailPackageModal.package.is_active ? 'btn-deactivate' : 'btn-activate'}
                >
                  {detailPackageModal.package.is_active ? t('common.deactivate') : t('common.activate')}
                </button>
                <button onClick={handleDeletePackageFromModal} className="btn-delete">{t('common.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailAddonModal.isOpen && detailAddonModal.addon && (
        <div className="modal">
          <div className="modal-content">
            <h2>{detailAddonModal.addon.name}</h2>
            <button 
              type="button" 
              className="modal-close" 
              onClick={() => setDetailAddonModal({ isOpen: false, addon: null })}
            >×</button>
            <div className="service-detail">
              <div className="detail-row">
                <label>{t('carWash.description')}:</label>
                <span>{detailAddonModal.addon.description || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>{t('carWash.price')}:</label>
                <span>${detailAddonModal.addon.price}</span>
              </div>
              <div className="detail-row">
                <label>{t('carWash.displayOrder')}:</label>
                <span>{detailAddonModal.addon.display_order}</span>
              </div>
              <div className="detail-row">
                <label>{t('carWash.status')}:</label>
                <span>{detailAddonModal.addon.is_active ? t('common.active') : t('common.inactive')}</span>
              </div>
              <div className="detail-actions">
                <button onClick={handleEditAddonFromModal} className="btn-edit">{t('common.edit')}</button>
                <button 
                  onClick={handleToggleAddonActiveFromModal} 
                  className={detailAddonModal.addon.is_active ? 'btn-deactivate' : 'btn-activate'}
                >
                  {detailAddonModal.addon.is_active ? t('common.deactivate') : t('common.activate')}
                </button>
                <button onClick={handleDeleteAddonFromModal} className="btn-delete">{t('common.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarWashPage

