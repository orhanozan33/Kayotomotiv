import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { carWashAPI } from '../services/api'
import { carBrandsAndModels } from '../data/carBrands'
import './CarWashPage.css'

function CarWashPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [packages, setPackages] = useState([])
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    vehicle_brand: '',
    vehicle_model: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [packagesRes, addonsRes] = await Promise.all([
        carWashAPI.getPackages(),
        carWashAPI.getAddons()
      ])
      setPackages(packagesRes.data.packages)
      setAddons(addonsRes.data.addons)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'vehicle_brand') {
      setFormData({
        ...formData,
        vehicle_brand: value,
        vehicle_model: '' // Reset model when brand changes
      })
      setAvailableModels(value ? (carBrandsAndModels[value] || []) : [])
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const toggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a === addon.id)
      if (exists) {
        return prev.filter(a => a !== addon.id)
      } else {
        return [...prev, addon.id]
      }
    })
  }

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPackage) {
      showError('Lütfen bir paket seçin')
      return
    }
    try {
      await carWashAPI.createAppointment({
        package_id: selectedPackage.id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        addon_ids: selectedAddons,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        vehicle_brand: formData.vehicle_brand || null,
        vehicle_model: formData.vehicle_model || null,
        notes: formData.notes
      })
      showSuccess('Randevu talebi başarıyla gönderildi!')
      setShowAppointmentForm(false)
      setSelectedPackage(null)
      setSelectedAddons([])
      setFormData({
        appointment_date: '',
        appointment_time: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        vehicle_brand: '',
        vehicle_model: '',
        notes: ''
      })
      setAvailableModels([])
    } catch (error) {
      showError('Randevu gönderilirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const openAppointmentForm = (pkg) => {
    setSelectedPackage(pkg)
    setShowAppointmentForm(true)
    setFormData({
      appointment_date: '',
      appointment_time: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      vehicle_brand: '',
      vehicle_model: '',
      notes: ''
    })
    setAvailableModels([])
  }

  const calculateTotal = () => {
    if (!selectedPackage) return 0
    let total = parseFloat(selectedPackage.base_price)
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId)
      if (addon) {
        total += parseFloat(addon.price)
      }
    })
    return total
  }

  const openAppointmentFormFromHeader = () => {
    setSelectedPackage(null)
    setShowAppointmentForm(true)
    setSelectedAddons([])
    setFormData({
      appointment_date: '',
      appointment_time: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      vehicle_brand: '',
      vehicle_model: '',
      notes: ''
    })
    setAvailableModels([])
  }

  return (
    <div className="car-wash-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
        <h1>{t('carWash.title')}</h1>
        <p className="intro">{t('carWash.subtitle')}</p>
          </div>
          <button 
            onClick={openAppointmentFormFromHeader}
            className="btn-appointment-header"
          >
            {t('carWash.bookAppointment') || 'Randevu Al'}
          </button>
        </div>

        {!loading && (
          <>
            <div className="hero-section">
              <div className="hero-content">
                <div className="hero-text">
                  <h2>{t('carWash.hero.title') || 'Profesyonel Oto Yıkama Hizmetleri'}</h2>
                  <p>{t('carWash.hero.description') || 'Aracınızı en iyi şekilde temizlemek için profesyonel ekipmanlarımız ve deneyimli ekibimizle hizmetinizdeyiz. Detaylı yıkama paketleri ve ekstra hizmetlerimizle aracınızı parlak tutun.'}</p>
                </div>
                <div className="hero-image">
                  <img 
                    src="https://carcare.yocar.com.tr/upload/images/blog/otoyikama/oto-yikama-kpk-2.PNG" 
                    alt="Oto Yıkama Hizmetleri" 
                    className="hero-img"
                  />
                  </div>
              </div>
            </div>

            <div className="features-section">
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                    <path d="M2 17L12 22L22 17"/>
                    <path d="M2 12L12 17L22 12"/>
                  </svg>
                </div>
                <h3>{t('carWash.features.professional.title') || 'Profesyonel Ekipman'}</h3>
                <p>{t('carWash.features.professional.description') || 'Son teknoloji yıkama ekipmanları ile aracınıza zarar vermeden temizlik.'}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M21 16V8A2 2 0 0019 6H5A2 2 0 003 8V16A2 2 0 005 18H19A2 2 0 0021 16Z"/>
                    <path d="M3 10H21"/>
                  </svg>
                </div>
                <h3>{t('carWash.features.quality.title') || 'Kaliteli Ürünler'}</h3>
                <p>{t('carWash.features.quality.description') || 'Araç boyasına uygun özel temizlik ürünleri kullanıyoruz.'}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h3>{t('carWash.features.detailing.title') || 'Detaylı Temizlik'}</h3>
                <p>{t('carWash.features.detailing.description') || 'Her detaya özen göstererek kapsamlı temizlik hizmeti.'}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  </div>
                <h3>{t('carWash.features.fast.title') || 'Hızlı Servis'}</h3>
                <p>{t('carWash.features.fast.description') || 'Randevu sistemi ile beklemeden hızlı hizmet.'}</p>
              </div>
            </div>

            <div className="services-info-section">
              <div className="services-info-content">
                <h2>{t('carWash.servicesInfo.title') || 'Hizmetlerimiz'}</h2>
                <p>{t('carWash.servicesInfo.description') || 'Temel yıkama, detaylı yıkama, iç temizlik, mumlama ve daha birçok hizmet sunuyoruz. Paketlerimiz ve ekstra hizmetlerimiz için randevu al butonuna tıklayın.'}</p>
                <div className="service-categories">
                  <div className="service-category-tag">{t('carWash.categories.basic') || 'Temel Yıkama'}</div>
                  <div className="service-category-tag">{t('carWash.categories.detailed') || 'Detaylı Yıkama'}</div>
                  <div className="service-category-tag">{t('carWash.categories.interior') || 'İç Temizlik'}</div>
                  <div className="service-category-tag">{t('carWash.categories.waxing') || 'Mumlama'}</div>
                  <div className="service-category-tag">{t('carWash.categories.polishing') || 'Cilalama'}</div>
                  <div className="service-category-tag">{t('carWash.categories.engine') || 'Motor Temizliği'}</div>
                </div>
              </div>
              <div className="services-info-image">
                <img 
                  src="https://carcare.yocar.com.tr/upload/images/blog/otoyikama/oto-yikama-4-min.png" 
                  alt="Oto Yıkama Servisi" 
                  className="services-info-img"
                />
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="loading">{t('carWash.loading')}</div>
        )}

            {showAppointmentForm && (
              <div className="modal">
                <div className="modal-content">
                  <h2>{t('carWash.appointmentForm.title')}</h2>
                  <form onSubmit={handleAppointmentSubmit}>
                {selectedPackage && (
                    <div className="selected-package">
                    <h3>{t('carWash.appointmentForm.selectedPackage')}: {selectedPackage.name}</h3>
                    <p>{t('carWash.appointmentForm.price')}: ${selectedPackage.base_price}</p>
                  </div>
                )}

                {!selectedPackage && (
                  <div className="form-section">
                    <h3>{t('carWash.appointmentForm.selectPackage') || 'Paket Seçin'}</h3>
                    <div className="packages-list-modal">
                      {loading ? (
                        <div className="loading">{t('carWash.loading')}</div>
                      ) : (
                        packages.map(pkg => (
                          <label key={pkg.id} className="package-checkbox">
                            <input
                              type="radio"
                              name="package"
                              checked={selectedPackage?.id === pkg.id}
                              onChange={() => setSelectedPackage(pkg)}
                            />
                            <div className="package-checkbox-content">
                              <span className="package-checkbox-name">{pkg.name}</span>
                              <span className="package-checkbox-price">${pkg.base_price}</span>
                              {pkg.duration_minutes && (
                                <span className="package-checkbox-duration">{pkg.duration_minutes} {t('carWash.minutes') || 'dakika'}</span>
                              )}
                              {pkg.description && (
                                <span className="package-checkbox-description">{pkg.description}</span>
                              )}
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}

                    <div className="form-section">
                      <h3>{t('carWash.appointmentForm.appointmentDetails')}</h3>
                      <input
                        type="date"
                        name="appointment_date"
                        value={formData.appointment_date}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="time"
                        name="appointment_time"
                        value={formData.appointment_time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-section">
                      <h3>{t('carWash.appointmentForm.vehicleInfo') || 'Araç Bilgileri'}</h3>
                      <select
                        name="vehicle_brand"
                        value={formData.vehicle_brand}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">{t('carWash.appointmentForm.selectBrand') || 'Marka Seçin'}</option>
                        {Object.keys(carBrandsAndModels).sort().map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                      </select>
                      <select
                        name="vehicle_model"
                        value={formData.vehicle_model}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.vehicle_brand}
                      >
                        <option value="">{t('carWash.appointmentForm.selectModel') || 'Model Seçin'}</option>
                        {availableModels.sort().map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-section">
                      <h3>{t('carWash.appointmentForm.contactInfo')}</h3>
                      <input
                        type="text"
                        name="customer_name"
                        placeholder="Full Name"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="email"
                        name="customer_email"
                        placeholder="Email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="tel"
                        name="customer_phone"
                        placeholder="Phone"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-section">
                      <h3>{t('carWash.appointmentForm.addons')}</h3>
                  <div className="addons-list-modal">
                      {addons.map(addon => (
                        <label key={addon.id} className="addon-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(addon.id)}
                            onChange={() => toggleAddon(addon)}
                          />
                        <div className="addon-checkbox-content">
                          <span className="addon-checkbox-name">{addon.name}</span>
                          <span className="addon-checkbox-price">${addon.price}</span>
                          {addon.description && (
                            <span className="addon-checkbox-description">{addon.description}</span>
                          )}
                        </div>
                        </label>
                      ))}
                  </div>
                    </div>

                {selectedPackage && (
                    <div className="total-price">
                      <strong>{t('carWash.appointmentForm.total')}: ${calculateTotal().toFixed(2)}</strong>
                    </div>
                )}

                    <textarea
                      name="notes"
                      placeholder={t('carWash.appointmentForm.notes')}
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                    />

                    <div className="modal-actions">
                  <button type="submit" disabled={!selectedPackage}>{t('carWash.appointmentForm.submit')}</button>
                  <button type="button" onClick={() => {
                    setShowAppointmentForm(false)
                    setSelectedPackage(null)
                    setSelectedAddons([])
                  }}>{t('carWash.appointmentForm.cancel')}</button>
                    </div>
                  </form>
                </div>
              </div>
        )}
      </div>
    </div>
  )
}

export default CarWashPage

