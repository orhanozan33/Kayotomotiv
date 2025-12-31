import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { repairAPI } from '../services/api'
import { carBrandsAndModels, years } from '../data/carBrands'
import './AutoRepairPage.css'

function AutoRepairPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [selectedServices, setSelectedServices] = useState([])
  const [availableModels, setAvailableModels] = useState([])
  const [formData, setFormData] = useState({
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    customer_name: '',
    customer_email: '',
    customer_phone: ''
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      setLoading(true)
      const response = await repairAPI.getServices()
      setServices(response.data.services)
    } catch (error) {
      console.error('Error loading services:', error)
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

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.service_id === service.id)
      if (exists) {
        return prev.filter(s => s.service_id !== service.id)
      } else {
        return [...prev, { service_id: service.id, price: service.base_price, quantity: 1 }]
      }
    })
  }

  const handleQuoteSubmit = async (e) => {
    e.preventDefault()
    try {
      await repairAPI.createQuote({
        ...formData,
        services: selectedServices
      })
      showSuccess(t('common.success') || 'Başarılı!')
      setShowQuoteForm(false)
      setSelectedServices([])
      setFormData({
        vehicle_brand: '',
        vehicle_model: '',
        vehicle_year: '',
        customer_name: '',
        customer_email: '',
        customer_phone: ''
      })
      setAvailableModels([])
    } catch (error) {
      showError('Teklif gönderilirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  return (
    <div className="auto-repair-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
        <h1>{t('autoRepair.title')}</h1>
        <p className="intro">{t('autoRepair.subtitle')}</p>
                  </div>
          <button 
            onClick={() => {
                setShowQuoteForm(true)
                setFormData({
                  vehicle_brand: '',
                  vehicle_model: '',
                  vehicle_year: '',
                  customer_name: '',
                  customer_email: '',
                  customer_phone: ''
                })
                setAvailableModels([])
            }} 
            className="btn-quote-header"
          >
                {t('autoRepair.getQuote')}
              </button>
            </div>

        {!loading && (
          <>
            <div className="hero-section">
              <div className="hero-content">
                <div className="hero-text">
                  <h2>{t('autoRepair.hero.title') || 'Profesyonel Oto Tamir Hizmetleri'}</h2>
                  <p>{t('autoRepair.hero.description') || 'Deneyimli teknisyenlerimiz ve modern ekipmanlarımızla aracınıza en iyi hizmeti sunuyoruz. Motor tamiri, fren bakımı, klima servisi ve daha fazlası için bizimle iletişime geçin.'}</p>
                </div>
                <div className="hero-image">
                  <img 
                    src="https://avatars.mds.yandex.net/get-altay/14396200/2a00000193b878634142afd54ef53f888e85/XXXL" 
                    alt="Oto Tamir Hizmetleri" 
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
                <h3>{t('autoRepair.features.experienced.title') || 'Deneyimli Teknisyenler'}</h3>
                <p>{t('autoRepair.features.experienced.description') || 'Yılların deneyimi ile aracınızı güvenle teslim edebilirsiniz.'}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M21 16V8A2 2 0 0019 6H5A2 2 0 003 8V16A2 2 0 005 18H19A2 2 0 0021 16Z"/>
                    <path d="M3 10H21"/>
                  </svg>
                </div>
                <h3>{t('autoRepair.features.modern.title') || 'Modern Ekipmanlar'}</h3>
                <p>{t('autoRepair.features.modern.description') || 'Son teknoloji cihazlar ile hızlı ve doğru teşhis.'}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <h3>{t('autoRepair.features.quality.title') || 'Kaliteli Hizmet'}</h3>
                <p>{t('autoRepair.features.quality.description') || 'Orijinal yedek parçalar ve garantili işçilik.'}</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3>{t('autoRepair.features.fast.title') || 'Hızlı Servis'}</h3>
                <p>{t('autoRepair.features.fast.description') || 'Kısa sürede tamamlanan işlemler ile zaman tasarrufu.'}</p>
              </div>
            </div>

            <div className="services-info-section">
              <div className="services-info-content">
                <h2>{t('autoRepair.servicesInfo.title') || 'Hizmetlerimiz'}</h2>
                <p>{t('autoRepair.servicesInfo.description') || 'Motor tamiri, fren bakımı, klima servisi, elektrikli sistem tamiri, lastik değişimi ve daha birçok hizmet sunuyoruz. Detaylı fiyat bilgisi için fiyat teklifi al butonuna tıklayın.'}</p>
                <div className="service-categories">
                  <div className="service-category-tag">{t('autoRepair.categories.engine') || 'Motor Tamiri'}</div>
                  <div className="service-category-tag">{t('autoRepair.categories.brake') || 'Fren Bakımı'}</div>
                  <div className="service-category-tag">{t('autoRepair.categories.ac') || 'Klima Servisi'}</div>
                  <div className="service-category-tag">{t('autoRepair.categories.electrical') || 'Elektrikli Sistem'}</div>
                  <div className="service-category-tag">{t('autoRepair.categories.tire') || 'Lastik Değişimi'}</div>
                  <div className="service-category-tag">{t('autoRepair.categories.maintenance') || 'Bakım Servisi'}</div>
                </div>
              </div>
              <div className="services-info-image">
                <img 
                  src="https://avatars.mds.yandex.net/get-altay/14730529/2a00000193b901f4a131428ea318a67a1981/XXXL" 
                  alt="Oto Tamir Servisi" 
                  className="services-info-img"
                />
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="loading">{t('autoRepair.loading')}</div>
        )}

            {showQuoteForm && (
              <div className="modal">
                <div className="modal-content">
              <h2>{t('autoRepair.quoteForm.title') || 'Fiyat Teklifi Al'}</h2>
                  <form onSubmit={handleQuoteSubmit}>
                    <div className="form-section">
                  <h3>{t('autoRepair.quoteForm.vehicleInfo') || 'Araç Bilgileri'}</h3>
                      <select
                        name="vehicle_brand"
                        value={formData.vehicle_brand}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">{t('autoRepair.quoteForm.brand') || 'Marka Seçin'}</option>
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
                        <option value="">{t('autoRepair.quoteForm.model') || 'Model Seçin'}</option>
                        {availableModels.sort().map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                      <select
                        name="vehicle_year"
                        value={formData.vehicle_year}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">{t('autoRepair.quoteForm.year') || 'Yıl Seçin'}</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-section">
                  <h3>{t('autoRepair.quoteForm.contactInfo') || 'İletişim Bilgileri'}</h3>
                      <input
                        type="text"
                        name="customer_name"
                    placeholder={t('autoRepair.quoteForm.name') || 'Ad Soyad'}
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="email"
                        name="customer_email"
                    placeholder={t('autoRepair.quoteForm.email') || 'E-posta'}
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="tel"
                        name="customer_phone"
                    placeholder={t('autoRepair.quoteForm.phone') || 'Telefon'}
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-section">
                  <h3>{t('autoRepair.quoteForm.selectServices') || 'Hizmet Seçin'}</h3>
                  <div className="services-list-modal">
                    {loading ? (
                      <div className="loading">{t('autoRepair.loading')}</div>
                    ) : (
                      services.map(service => (
                        <label key={service.id} className="service-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedServices.some(s => s.service_id === service.id)}
                            onChange={() => toggleService(service)}
                          />
                          <div className="service-checkbox-content">
                            <span className="service-checkbox-name">{service.name}</span>
                            <span className="service-checkbox-price">${service.base_price}</span>
                            {service.description && (
                              <span className="service-checkbox-description">{service.description}</span>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                    </div>

                    <div className="modal-actions">
                  <button type="submit">{t('autoRepair.quoteForm.submit') || 'Teklif İste'}</button>
                  <button type="button" onClick={() => setShowQuoteForm(false)}>{t('autoRepair.quoteForm.cancel') || 'İptal'}</button>
                    </div>
                  </form>
                </div>
              </div>
        )}
      </div>
    </div>
  )
}

export default AutoRepairPage

