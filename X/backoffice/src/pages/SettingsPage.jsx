import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { usersAPI, settingsAPI, receiptsAPI } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import './SettingsPage.css'

const AVAILABLE_PAGES = [
  { value: 'vehicles', labelKey: 'nav.vehicles', label: 'Araçlar' },
  { value: 'customers', labelKey: 'nav.customers', label: 'Müşteriler' },
  { value: 'repair-services', labelKey: 'nav.repairServices', label: 'Tamir Hizmetleri' },
  { value: 'repair-quotes', labelKey: 'nav.repairQuotes', label: 'Oto Yıkama Kayıt' },
  { value: 'car-wash', labelKey: 'nav.carWash', label: 'Oto Yıkama' },
  { value: 'reservations', labelKey: 'nav.reservations', label: 'Rezervasyonlar' },
  { value: 'pages', labelKey: 'nav.pages', label: 'Sayfalar' }
]

function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { showError, showSuccess } = useError()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'user'
  })
  const [permissions, setPermissions] = useState([])
  const [showSocialMediaModal, setShowSocialMediaModal] = useState(false)
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    facebook: '',
    instagram: '',
    x: '',
    phone: ''
  })
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    company_tax_number: '',
    company_address: '',
    company_phone: '',
    company_email: ''
  })
  const [showTaxModal, setShowTaxModal] = useState(false)
  const [taxRate, setTaxRate] = useState('0') // Legacy support
  const [federalTaxRate, setFederalTaxRate] = useState('0') // GST/HST
  const [provincialTaxRate, setProvincialTaxRate] = useState('0') // PST/QST
  const [showContactLocationsModal, setShowContactLocationsModal] = useState(false)
  const [contactLocations, setContactLocations] = useState([
    { name: '', address: '', phone: '', hours: '' },
    { name: '', address: '', phone: '', hours: '' },
    { name: '', address: '', phone: '', hours: '' }
  ])
  const [activeTab, setActiveTab] = useState('users') // 'users' or 'receipts'
  const [receipts, setReceipts] = useState([])
  const [receiptSearchTerm, setReceiptSearchTerm] = useState('')
  const [receiptsLoading, setReceiptsLoading] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll().catch(err => {
        console.error('Error loading users:', err)
        return { data: { users: [] } }
      })
      setUsers(response.data?.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadUserPermissions = async (userId) => {
    try {
      const response = await usersAPI.getPermissions(userId).catch(err => {
        console.error('Error loading permissions:', err)
        return { data: { permissions: [] } }
      })
      const existingPermissions = response.data?.permissions || []
      
      // Initialize permissions for all pages
      // Note: permission_password is hashed in DB, so we don't load it back
      const allPermissions = AVAILABLE_PAGES.map(page => {
        const existing = existingPermissions.find(p => p.page === page.value)
        return existing ? {
          page: page.value,
          can_view: existing.can_view || false,
          can_add: existing.can_add || false,
          can_edit: existing.can_edit || false,
          can_delete: existing.can_delete || false,
          permission_password: '' // Don't load existing password, user must set new one
        } : {
          page: page.value,
          can_view: false,
          can_add: false,
          can_edit: false,
          can_delete: false,
          permission_password: ''
        }
      })
      
      setPermissions(allPermissions)
    } catch (error) {
      console.error('Error loading permissions:', error)
      setPermissions([])
    }
  }

  useEffect(() => {
    loadUsers()
    loadSocialMediaLinks()
    loadCompanyInfo()
    loadTaxRate()
    loadContactLocations()
  }, [loadUsers])

  const loadReceipts = useCallback(async () => {
    try {
      setReceiptsLoading(true)
      const params = receiptSearchTerm ? { search: receiptSearchTerm } : {}
      const response = await receiptsAPI.getAll(params)
      setReceipts(response.data?.receipts || [])
    } catch (error) {
      console.error('Error loading receipts:', error)
      setReceipts([])
    } finally {
      setReceiptsLoading(false)
    }
  }, [receiptSearchTerm])

  useEffect(() => {
    if (activeTab === 'receipts') {
      loadReceipts()
    }
  }, [activeTab, loadReceipts])

  const loadSocialMediaLinks = async () => {
    try {
      const response = await settingsAPI.getSocialMediaLinks()
      if (response.data?.links) {
        setSocialMediaLinks(response.data.links)
      }
    } catch (error) {
      console.error('Error loading social media links:', error)
    }
  }

  const loadCompanyInfo = async () => {
    try {
      const response = await settingsAPI.getSettings()
      if (response.data?.settings) {
        setCompanyInfo({
          company_name: response.data.settings.company_name || '',
          company_tax_number: response.data.settings.company_tax_number || '',
          company_address: response.data.settings.company_address || '',
          company_phone: response.data.settings.company_phone || '',
          company_email: response.data.settings.company_email || ''
        })
      }
    } catch (error) {
      console.error('Error loading company info:', error)
    }
  }

  const loadTaxRate = async () => {
    try {
      const response = await settingsAPI.getSettings()
      console.log('getSettings response:', response.data)
      if (response.data?.settings) {
        const settings = response.data.settings
        const newTaxRate = settings.tax_rate || '0'
        const newFederalRate = settings.federal_tax_rate || '0'
        const newProvincialRate = settings.provincial_tax_rate || '0'
        
        setTaxRate(newTaxRate)
        setFederalTaxRate(newFederalRate)
        setProvincialTaxRate(newProvincialRate)
        
        console.log('Tax rates loaded and set:', {
          tax_rate: newTaxRate,
          federal_tax_rate: newFederalRate,
          provincial_tax_rate: newProvincialRate
        })
      }
    } catch (error) {
      console.error('Error loading tax rate:', error)
    }
  }

  const handleSaveTaxRate = async () => {
    try {
      const federalValue = parseFloat(federalTaxRate) || 0
      const provincialValue = parseFloat(provincialTaxRate) || 0
      
      if (federalValue < 0 || federalValue > 100) {
        showError(t('settings.federalTaxRateError') || 'Federal vergi oranı 0-100 arasında olmalıdır')
        return
      }
      if (provincialValue < 0 || provincialValue > 100) {
        showError(t('settings.provincialTaxRateError') || 'Eyalet vergi oranı 0-100 arasında olmalıdır')
        return
      }
      
      // Calculate total tax rate for backward compatibility
      const totalTaxRate = federalValue + provincialValue
      
      const settingsToSave = {
        tax_rate: totalTaxRate.toString(), // Legacy support
        federal_tax_rate: federalValue.toString(),
        provincial_tax_rate: provincialValue.toString()
      }
      
      console.log('Saving tax rates:', settingsToSave)
      
      const response = await settingsAPI.updateSettings(settingsToSave)
      
      console.log('Save response:', response.data)
      
      showSuccess(t('settings.taxRatesSaved') || 'Vergi oranları kaydedildi')
      setShowTaxModal(false)
      
      // Wait a bit for DB to commit, then reload
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadTaxRate()
    } catch (error) {
      console.error('Error saving tax rates:', error)
      showError((t('settings.errors.savingTaxRates') || 'Vergi oranları kaydedilirken hata oluştu') + ': ' + (error.response?.data?.error || error.message))
    }
  }

  const handlePrintReceipt = async (receipt) => {
    try {
      // Load company info
      let companyInfo = {}
      try {
        const companyResponse = await settingsAPI.getCompanyInfo()
        companyInfo = companyResponse.data?.companyInfo || {}
      } catch (error) {
        console.error('Error loading company info:', error)
      }

      const taxRateValue = parseFloat(taxRate) || 0
      const subtotal = taxRateValue > 0 ? parseFloat(receipt.price) / (1 + taxRateValue / 100) : parseFloat(receipt.price)
      const taxAmount = parseFloat(receipt.price) - subtotal

      // Get locale for date formatting - Default to French for receipts
      const locale = i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'fr-FR'
      const htmlLang = i18n.language || 'fr'

      // Create receipt HTML
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
    }
    .no-print button:hover {
      background: #45a049;
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    <div class="company-name">${companyInfo.company_name || t('settings.companyName')}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address.replace(/\n/g, '<br>')}</div>` : ''}
      ${companyInfo.company_phone ? `<div>${t('settings.tel')}: ${companyInfo.company_phone}</div>` : ''}
      ${companyInfo.company_email ? `<div>${t('settings.email')}: ${companyInfo.company_email}</div>` : ''}
      ${companyInfo.company_tax_number ? `<div>${t('settings.taxNumberShort')}: ${companyInfo.company_tax_number}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    <div class="customer-info">
      ${receipt.customer_name ? `
      <div class="info-row">
        <span class="info-label">${t('settings.receiptCustomerLabel')}</span>
        <span>${receipt.customer_name}</span>
      </div>
      ` : ''}
      ${receipt.customer_phone ? `
      <div class="info-row">
        <span class="info-label">${t('settings.receiptPhoneLabel')}</span>
        <span>${receipt.customer_phone}</span>
      </div>
      ` : ''}
      ${receipt.customer_email ? `
      <div class="info-row">
        <span class="info-label">${t('settings.receiptEmailLabel')}</span>
        <span>${receipt.customer_email}</span>
      </div>
      ` : ''}
      ${receipt.license_plate ? `
      <div class="info-row">
        <span class="info-label">${t('settings.receiptPlateLabel')}</span>
        <span>${receipt.license_plate}</span>
      </div>
      ` : ''}
    </div>

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
        <div class="total-row">
          <span>${t('settings.receiptTax')} (%${taxRateValue}):</span>
          <span>$${taxAmount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="total-row grand-total-row">
          <span>${t('settings.receiptTotal')}</span>
          <span>$${parseFloat(receipt.price).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div class="date-info">
      <div>${t('settings.receiptDateLabel')} ${new Date(receipt.performed_date).toLocaleDateString(locale)}</div>
    </div>
  </div>

  <div class="no-print">
    <button onclick="window.print()">${t('settings.receiptPrintBtn')}</button>
    <button onclick="window.close()" style="margin-left: 10px; background: #666;">${t('settings.receiptCloseBtn')}</button>
  </div>
</body>
</html>
      `

      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write(receiptHTML)
        printWindow.document.close()
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 250)
        }
      } else {
        showError(t('settings.receiptPopupError'))
      }
    } catch (error) {
      console.error('Error printing receipt:', error)
      showError(t('settings.receiptPrintError') + ' ' + (error.response?.data?.error || error.message))
    }
  }

  const handleSocialMediaChange = (platform, value) => {
    setSocialMediaLinks({
      ...socialMediaLinks,
      [platform]: value
    })
  }

  const handleSaveSocialMedia = async () => {
    try {
      await settingsAPI.updateSettings({
        social_facebook: socialMediaLinks.facebook || '',
        social_instagram: socialMediaLinks.instagram || '',
        social_x: socialMediaLinks.x || '',
        contact_phone: socialMediaLinks.phone || ''
      })
      showSuccess(t('settings.socialMediaSaved'))
      setShowSocialMediaModal(false)
    } catch (error) {
      showError(t('settings.errors.savingSocialMedia') + ' ' + (error.response?.data?.error || error.message))
    }
  }

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo({
      ...companyInfo,
      [field]: value
    })
  }

  const handleSaveCompanyInfo = async () => {
    try {
      await settingsAPI.updateSettings({
        company_name: companyInfo.company_name || '',
        company_tax_number: companyInfo.company_tax_number || '',
        company_address: companyInfo.company_address || '',
        company_phone: companyInfo.company_phone || '',
        company_email: companyInfo.company_email || ''
      })
      showSuccess(t('settings.companyInfoSaved'))
      setShowCompanyModal(false)
    } catch (error) {
      showError(t('settings.errors.savingCompanyInfo') + ' ' + (error.response?.data?.error || error.message))
    }
  }

  const loadContactLocations = async () => {
    try {
      const response = await settingsAPI.getContactLocations()
      if (response.data?.locations) {
        setContactLocations(response.data.locations)
      }
    } catch (error) {
      console.error('Error loading contact locations:', error)
    }
  }

  const handleContactLocationChange = (index, field, value) => {
    const updated = [...contactLocations]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setContactLocations(updated)
  }

  const handleSaveContactLocations = async () => {
    try {
      const settings = {}
      contactLocations.forEach((location, index) => {
        const num = index + 1
        settings[`contact_location_${num}_name`] = location.name || ''
        settings[`contact_location_${num}_address`] = location.address || ''
        settings[`contact_location_${num}_phone`] = location.phone || ''
        settings[`contact_location_${num}_hours`] = location.hours || ''
      })
      await settingsAPI.updateSettings(settings)
      showSuccess('İletişim bilgileri kaydedildi')
      setShowContactLocationsModal(false)
    } catch (error) {
      showError('İletişim bilgileri kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handlePermissionChange = (pageIndex, field, value) => {
    const updated = [...permissions]
    updated[pageIndex] = {
      ...updated[pageIndex],
      [field]: value
    }
    setPermissions(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Trim email before submitting
      const submitData = {
        ...formData,
        email: formData.email.trim().toLowerCase()
      }

      if (editingUser) {
        await usersAPI.update(editingUser.id, submitData)
        showSuccess(t('settings.userUpdated'))
      } else {
        if (!submitData.password || !submitData.password.trim()) {
          showError(t('settings.passwordRequired'))
          return
        }
        
        // Check if email already exists in the current users list
        const emailExists = users.some(u => u.email.toLowerCase() === submitData.email.toLowerCase())
        if (emailExists) {
          showError(t('settings.emailAlreadyExists'))
          return
        }
        
        await usersAPI.create(submitData)
        showSuccess(t('settings.userCreated'))
      }
      setShowUserForm(false)
      setEditingUser(null)
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'user'
      })
      loadUsers()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('settings.errors.savingUser') + ' ' + errorMessage)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      email: user.email || '',
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      role: user.role || 'user'
    })
    setShowUserForm(true)
  }

  const handleUserClick = async (user) => {
    setSelectedUser(user)
    await loadUserPermissions(user.id)
    setShowUserDetailModal(true)
  }

  const handleOpenPermissions = async (user) => {
    setSelectedUser(user)
    await loadUserPermissions(user.id)
    setShowPermissionsModal(true)
  }

  const handleSavePermissions = async () => {
    if (!selectedUser) return
    
    try {
      // Validate: if can_delete is true, permission_password is required
      for (const p of permissions) {
        if (p.can_delete && (!p.permission_password || !p.permission_password.trim())) {
          const pageInfo = AVAILABLE_PAGES.find(page => page.value === p.page)
          const pageLabel = pageInfo ? (t(pageInfo.labelKey) || pageInfo.label) : p.page
          showError(`${pageLabel} ${t('settings.permissionPasswordRequired')}`)
          return
        }
      }
      
      // Only send permissions that have at least one permission enabled
      const permissionsToSave = permissions.filter(p => 
        p.can_view || p.can_add || p.can_edit || p.can_delete
      ).map(p => ({
        page: p.page,
        can_view: p.can_view || false,
        can_add: p.can_add || false,
        can_edit: p.can_edit || false,
        can_delete: p.can_delete || false,
        permission_password: p.can_delete && p.permission_password ? p.permission_password : null
      }))
      
      await usersAPI.updatePermissions(selectedUser.id, permissionsToSave)
      showSuccess(t('settings.permissionsSaved'))
      setShowPermissionsModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      showError(t('settings.errors.savingPermissions') + ' ' + (error.response?.data?.error || error.message))
    }
  }

  const handleDelete = (userId) => {
    setDeleteModal({ isOpen: true, userId })
  }

  const confirmDelete = async () => {
    if (!deleteModal.userId) return
    try {
      await usersAPI.delete(deleteModal.userId)
      showSuccess(t('settings.userDeleted'))
      setDeleteModal({ isOpen: false, userId: null })
      loadUsers()
    } catch (error) {
      showError(t('settings.errors.deletingUser') + ' ' + (error.response?.data?.error || error.message))
      setDeleteModal({ isOpen: false, userId: null })
    }
  }

  if (loading) return <div className="loading">{t('common.loading')}</div>

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>{t('settings.title')}</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setShowSocialMediaModal(true)} className="btn-primary">{t('settings.socialMediaLinks')}</button>
          <button onClick={() => setShowCompanyModal(true)} className="btn-primary">{t('settings.companyInfo')}</button>
          <button onClick={() => setShowContactLocationsModal(true)} className="btn-primary">{t('settings.contactInfo') || 'İletişim Bilgileri'}</button>
          <button onClick={() => setShowTaxModal(true)} className="btn-primary">{t('settings.taxRate')}</button>
          <button onClick={() => {
            setEditingUser(null)
            setFormData({
              email: '',
              password: '',
              first_name: '',
              last_name: '',
              phone: '',
              role: 'user'
            })
            setShowUserForm(true)
          }} className="btn-primary">{t('settings.addUser')}</button>
        </div>
      </div>

      <div className="modal-tabs" style={{ marginBottom: '2rem', borderBottom: '2px solid #ddd', display: 'flex', gap: '1rem' }}>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'users' ? '#667eea' : 'transparent',
            color: activeTab === 'users' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'users' ? '600' : '400',
            borderBottom: activeTab === 'users' ? '3px solid #667eea' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.3s ease'
          }}
        >
          {t('settings.users')}
        </button>
        <button
          className={activeTab === 'receipts' ? 'active' : ''}
          onClick={() => setActiveTab('receipts')}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'receipts' ? '#667eea' : 'transparent',
            color: activeTab === 'receipts' ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'receipts' ? '600' : '400',
            borderBottom: activeTab === 'receipts' ? '3px solid #667eea' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.3s ease'
          }}
        >
          {t('settings.receipts')}
        </button>
      </div>

      {showSocialMediaModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{t('settings.socialMediaLinks')}</h2>
            <div className="social-media-form">
              <div className="form-group">
                <label>{t('settings.phone')}</label>
                <input
                  type="tel"
                  placeholder={t('settings.phonePlaceholder')}
                  value={socialMediaLinks.phone}
                  onChange={(e) => handleSocialMediaChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('settings.facebookUrl')}</label>
                <input
                  type="url"
                  placeholder={t('settings.facebookPlaceholder')}
                  value={socialMediaLinks.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('settings.instagramUrl')}</label>
                <input
                  type="url"
                  placeholder={t('settings.instagramPlaceholder')}
                  value={socialMediaLinks.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('settings.xUrl')}</label>
                <input
                  type="url"
                  placeholder={t('settings.xPlaceholder')}
                  value={socialMediaLinks.x}
                  onChange={(e) => handleSocialMediaChange('x', e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveSocialMedia} className="btn-primary">{t('common.save')}</button>
              <button onClick={() => {
                setShowSocialMediaModal(false)
                loadSocialMediaLinks()
              }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showCompanyModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{t('settings.companyInfoForReceipt')}</h2>
            <div className="social-media-form">
              <div className="form-group">
                <label>{t('settings.companyName')}</label>
                <input
                  type="text"
                  placeholder={t('settings.companyNamePlaceholder')}
                  value={companyInfo.company_name}
                  onChange={(e) => handleCompanyInfoChange('company_name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('settings.taxNumber')}</label>
                <input
                  type="text"
                  placeholder={t('settings.taxNumberPlaceholder')}
                  value={companyInfo.company_tax_number}
                  onChange={(e) => handleCompanyInfoChange('company_tax_number', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('settings.address')}</label>
                <textarea
                  placeholder={t('settings.addressPlaceholder')}
                  value={companyInfo.company_address}
                  onChange={(e) => handleCompanyInfoChange('company_address', e.target.value)}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>{t('settings.phone')}</label>
                <input
                  type="tel"
                  placeholder={t('settings.phonePlaceholder2')}
                  value={companyInfo.company_phone}
                  onChange={(e) => handleCompanyInfoChange('company_phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('settings.email')}</label>
                <input
                  type="email"
                  placeholder={t('settings.emailPlaceholder')}
                  value={companyInfo.company_email}
                  onChange={(e) => handleCompanyInfoChange('company_email', e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveCompanyInfo} className="btn-primary">{t('common.save')}</button>
              <button onClick={() => {
                setShowCompanyModal(false)
                loadCompanyInfo()
              }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showTaxModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{t('settings.taxSettingsCanada') || 'Vergi Ayarları (Kanada)'}</h2>
            <div className="social-media-form">
              <div className="form-group">
                <label>{t('settings.federalTax') || 'Federal Vergi (GST/HST) %'}</label>
                <input
                  type="number"
                  placeholder={t('settings.federalTaxPlaceholder') || 'Örn: 5 (GST için) veya 13 (HST için)'}
                  value={federalTaxRate}
                  onChange={(e) => setFederalTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                  {t('settings.federalTaxDescription') || 'Kanada federal vergisi (GST veya HST)'}
                </small>
              </div>
              <div className="form-group">
                <label>{t('settings.provincialTax') || 'Eyalet Vergisi (PST/QST) %'}</label>
                <input
                  type="number"
                  placeholder={t('settings.provincialTaxPlaceholder') || 'Örn: 7 (PST için) veya 9.975 (QST için)'}
                  value={provincialTaxRate}
                  onChange={(e) => setProvincialTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                />
                <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
                  {t('settings.provincialTaxDescription') || 'Eyalet vergisi (PST veya QST). Bazı eyaletlerde bu vergi yoktur (0 olarak bırakın).'}
                </small>
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
                <strong>{t('settings.totalTaxRate') || 'Toplam Vergi Oranı'}: %{(parseFloat(federalTaxRate || 0) + parseFloat(provincialTaxRate || 0)).toFixed(2)}</strong>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveTaxRate} className="btn-primary">{t('common.save')}</button>
              <button onClick={() => {
                setShowTaxModal(false)
                // Reset to saved values on cancel
                loadTaxRate()
              }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {showContactLocationsModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>{t('settings.contactInfoBranches') || 'İletişim Bilgileri (Şubeler)'}</h2>
            <div className="social-media-form">
              {contactLocations.map((location, index) => (
                <div key={index} style={{ marginBottom: '2rem', padding: '1.5rem', border: '2px solid #eee', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>{t('settings.branch') || 'Şube'} {index + 1}</h3>
                  <div className="form-group">
                    <label>{t('settings.branchName') || 'Şube Adı'}</label>
                    <input
                      type="text"
                      placeholder={t('settings.branchNamePlaceholder') || 'Örn: Merkez Şube'}
                      value={location.name}
                      onChange={(e) => handleContactLocationChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('settings.address') || 'Adres'}</label>
                    <textarea
                      placeholder={t('settings.addressPlaceholder') || 'Örn: Atatürk Bulvarı No:123, Çankaya, Ankara'}
                      value={location.address}
                      onChange={(e) => handleContactLocationChange(index, 'address', e.target.value)}
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('settings.phone') || 'Telefon'}</label>
                    <input
                      type="tel"
                      placeholder={t('settings.phonePlaceholder') || 'Örn: +90 312 123 45 67'}
                      value={location.phone}
                      onChange={(e) => handleContactLocationChange(index, 'phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('settings.workingHours') || 'Çalışma Saatleri'}</label>
                    <input
                      type="text"
                      placeholder={t('settings.workingHoursPlaceholder') || 'Örn: Pazartesi - Cumartesi: 09:00 - 18:00'}
                      value={location.hours}
                      onChange={(e) => handleContactLocationChange(index, 'hours', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveContactLocations} className="btn-primary">{t('common.save')}</button>
              <button onClick={() => {
                setShowContactLocationsModal(false)
                loadContactLocations()
              }}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <>
      <div className="section-header">
        <h2>{t('settings.userManagement')}</h2>
      </div>

      {showUserForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingUser ? t('settings.editUser') : t('settings.addUser')}</h2>
            <form onSubmit={handleSubmit}>
              <input
                name="email"
                type="email"
                placeholder={t('settings.email')}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                name="password"
                type="password"
                placeholder={editingUser ? t('settings.newPasswordPlaceholder') : t('settings.password')}
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
              />
              <input
                name="first_name"
                placeholder={t('settings.firstName')}
                value={formData.first_name}
                onChange={handleInputChange}
              />
              <input
                name="last_name"
                placeholder={t('settings.lastName')}
                value={formData.last_name}
                onChange={handleInputChange}
              />
              <input
                name="phone"
                placeholder={t('settings.phone')}
                value={formData.phone}
                onChange={handleInputChange}
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">{t('settings.user')}</option>
                <option value="admin">{t('settings.admin')}</option>
              </select>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">{t('common.save')}</button>
                <button type="button" onClick={() => setShowUserForm(false)}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserDetailModal && selectedUser && (
        <div className="modal">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>{t('settings.userDetails')}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowUserDetailModal(false)
                  setSelectedUser(null)
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail-section">
                <div className="detail-row">
                  <label>{t('settings.email')}:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <label>{t('settings.nameSurname')}:</label>
                  <span>{selectedUser.first_name || '-'} {selectedUser.last_name || ''}</span>
                </div>
                <div className="detail-row">
                  <label>{t('settings.phone')}:</label>
                  <span>{selectedUser.phone || '-'}</span>
                </div>
                <div className="detail-row">
                  <label>{t('settings.role')}:</label>
                  <span>{selectedUser.role === 'admin' ? t('settings.admin') : t('settings.user')}</span>
                </div>
                <div className="detail-row">
                  <label>{t('settings.status')}:</label>
                  <span>{selectedUser.is_active ? t('settings.active') : t('settings.inactive')}</span>
                </div>
                <div className="detail-row">
                  <label>{t('settings.createdAt')}:</label>
                  <span>{new Date(selectedUser.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
              </div>

              <div className="user-detail-section">
                <h3>{t('settings.permissions')}</h3>
                {permissions && permissions.length > 0 ? (
                  <div className="permissions-summary">
                    {permissions.filter(p => p.can_view || p.can_add || p.can_edit || p.can_delete).map((perm, idx) => {
                      const pageInfo = AVAILABLE_PAGES.find(p => p.value === perm.page)
                      const pageLabel = pageInfo ? (t(pageInfo.labelKey) || pageInfo.label) : perm.page
                      return (
                        <div key={idx} className="permission-summary-item">
                          <strong>{pageLabel}:</strong>
                          <div className="permission-badges">
                            {perm.can_view && <span className="badge badge-view">{t('settings.viewPermission')}</span>}
                            {perm.can_add && <span className="badge badge-add">{t('settings.addPermission')}</span>}
                            {perm.can_edit && <span className="badge badge-edit">{t('settings.editPermission')}</span>}
                            {perm.can_delete && <span className="badge badge-delete">{t('settings.deletePermission')}</span>}
                          </div>
                        </div>
                      )
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
            <div className="modal-actions">
              <button onClick={() => {
                setShowUserDetailModal(false)
                handleOpenPermissions(selectedUser)
              }} className="btn-permissions">{t('settings.editPermissions')}</button>
              <button onClick={() => handleEdit(selectedUser)} className="btn-edit">{t('settings.editUserBtn')}</button>
              <button onClick={() => {
                setShowUserDetailModal(false)
                handleDelete(selectedUser.id)
              }} className="btn-delete">{t('settings.deleteUser')}</button>
              <button onClick={() => {
                setShowUserDetailModal(false)
                setSelectedUser(null)
              }} className="btn-cancel">{t('common.close')}</button>
            </div>
          </div>
        </div>
      )}

      {showPermissionsModal && selectedUser && (
        <div className="modal">
          <div className="modal-content large-modal">
            <h2>{selectedUser.email} - {t('settings.permissionsSettings')}</h2>
            <div className="permissions-container">
              {AVAILABLE_PAGES.map((page, idx) => {
                const perm = permissions[idx] || {
                  page: page.value,
                  can_view: false,
                  can_add: false,
                  can_edit: false,
                  can_delete: false,
                  permission_password: ''
                }
                const pageLabel = t(page.labelKey) || page.label
                return (
                  <div key={page.value} className="permission-section">
                    <h3>{pageLabel}</h3>
                    <div className="permission-checkboxes">
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_view || false}
                          onChange={(e) => handlePermissionChange(idx, 'can_view', e.target.checked)}
                        />
                        {t('settings.viewPermission')}
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_add || false}
                          onChange={(e) => handlePermissionChange(idx, 'can_add', e.target.checked)}
                        />
                        {t('settings.addPermission')}
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_edit || false}
                          onChange={(e) => handlePermissionChange(idx, 'can_edit', e.target.checked)}
                        />
                        {t('settings.editPermission')}
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={perm.can_delete || false}
                          onChange={(e) => handlePermissionChange(idx, 'can_delete', e.target.checked)}
                        />
                        {t('settings.deletePermission')}
                      </label>
                      {perm.can_delete && (
                        <div className="permission-password">
                          <label>{t('settings.deletePermissionPassword')}</label>
                          <input
                            type="password"
                            placeholder={t('settings.deletePermissionPasswordPlaceholder')}
                            value={perm.permission_password || ''}
                            onChange={(e) => handlePermissionChange(idx, 'permission_password', e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="modal-actions">
              <button onClick={handleSavePermissions} className="btn-primary">{t('common.save')}</button>
              <button onClick={() => {
                setShowPermissionsModal(false)
                setSelectedUser(null)
              }}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
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
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(user)} className="btn-edit">{t('common.edit')}</button>
                    <button onClick={() => handleOpenPermissions(user)} className="btn-permissions">{t('settings.permissions')}</button>
                    <button onClick={() => handleDelete(user.id)} className="btn-delete">{t('common.delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {activeTab === 'receipts' && (
        <div className="receipts-section">
          <div className="section-header">
            <h2>{t('settings.receiptsTitle')}</h2>
          </div>

          <div className="search-container" style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder={t('settings.receiptsSearch')}
              value={receiptSearchTerm}
              onChange={(e) => setReceiptSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>

          {receiptsLoading ? (
            <div className="loading">{t('settings.receiptsLoading')}</div>
          ) : receipts.length === 0 ? (
            <div className="no-results">{t('settings.noReceipts')}</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
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
                      <td>${parseFloat(receipt.price).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => handlePrintReceipt(receipt)}
                          className="btn-primary"
                          style={{ marginRight: '0.5rem' }}
                        >
                          🖨️ {t('settings.receiptPrint')}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReceipt(receipt)
                            setShowReceiptModal(true)
                          }}
                          className="btn-edit"
                        >
                          {t('settings.receiptDetail')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showReceiptModal && selectedReceipt && (
        <div className="modal">
          <div className="modal-content large-modal">
            <div className="modal-header">
                    <h2>{t('settings.receiptDetailTitle')}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setShowReceiptModal(false)
                  setSelectedReceipt(null)
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>{t('settings.receiptCustomerInfo')}</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>{t('settings.receiptName')}:</label>
                    <span>{selectedReceipt.customer_name}</span>
                  </div>
                  {selectedReceipt.customer_phone && (
                    <div className="detail-item">
                      <label>{t('settings.receiptPhone')}:</label>
                      <span>{selectedReceipt.customer_phone}</span>
                    </div>
                  )}
                  {selectedReceipt.customer_email && (
                    <div className="detail-item">
                      <label>{t('settings.email')}:</label>
                      <span>{selectedReceipt.customer_email}</span>
                    </div>
                  )}
                  {selectedReceipt.license_plate && (
                    <div className="detail-item">
                      <label>{t('settings.receiptPlate')}:</label>
                      <span>{selectedReceipt.license_plate}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3>{t('settings.receiptServiceInfo')}</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <label>{t('settings.receiptServiceName')}:</label>
                    <span>{selectedReceipt.service_name}</span>
                  </div>
                  {selectedReceipt.service_description && (
                    <div className="detail-item full-width">
                      <label>{t('settings.receiptDescription')}:</label>
                      <span>{selectedReceipt.service_description}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <label>{t('settings.receiptType')}:</label>
                    <span>{selectedReceipt.service_type === 'repair' ? t('settings.receiptTypeRepair') : selectedReceipt.service_type === 'car_wash' ? t('settings.receiptTypeCarWash') : selectedReceipt.service_type || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('settings.receiptAmountLabel')}:</label>
                    <span>${parseFloat(selectedReceipt.price).toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('settings.receiptPerformedDate')}:</label>
                    <span>{new Date(selectedReceipt.performed_date).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                  </div>
                  {selectedReceipt.created_at && (
                    <div className="detail-item">
                      <label>{t('settings.receiptCreatedDate')}:</label>
                      <span>{new Date(selectedReceipt.created_at).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => handlePrintReceipt(selectedReceipt)}
                className="btn-primary"
              >
                🖨️ {t('settings.receiptPrint')}
              </button>
              <button
                onClick={() => {
                  setShowReceiptModal(false)
                  setSelectedReceipt(null)
                }}
                className="btn-cancel"
              >
                {t('settings.receiptCloseBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsPage

