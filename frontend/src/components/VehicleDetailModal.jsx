import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { vehiclesAPI, reservationsAPI } from '../services/api'
import './VehicleDetailModal.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '')

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  return `${BACKEND_BASE_URL}${imageUrl}`
}

function VehicleDetailModal({ vehicleId, onClose }) {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    message: '',
    preferred_date: '',
    preferred_time: ''
  })

  useEffect(() => {
    if (vehicleId) {
      loadVehicle()
    }
  }, [vehicleId])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showLightbox) {
          setShowLightbox(false)
        } else if (showReservationForm) {
          setShowReservationForm(false)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showLightbox, showReservationForm, onClose])

  const loadVehicle = async () => {
    try {
      setLoading(true)
      const response = await vehiclesAPI.getById(vehicleId)
      setVehicle(response.data.vehicle)
    } catch (error) {
      console.error('Error loading vehicle:', error)
      showError('Araç yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleReservationSubmit = async (e) => {
    e.preventDefault()
    try {
      await reservationsAPI.create({
        vehicle_id: vehicleId,
        ...formData
      })
      showSuccess(t('common.success') || 'Başarılı!')
      setShowReservationForm(false)
      setFormData({ customer_name: '', customer_email: '', customer_phone: '', message: '', preferred_date: '', preferred_time: '' })
    } catch (error) {
      showError('Rezervasyon gönderilirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!vehicleId) return null

  if (loading) {
    return (
      <div className="vehicle-modal-overlay" onClick={handleModalClose}>
        <div className="vehicle-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="vehicle-modal-overlay" onClick={handleModalClose}>
        <div className="vehicle-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="error">{t('common.error')}</div>
        </div>
      </div>
    )
  }

  const validImages = vehicle.images?.filter(img => {
    const url = getImageUrl(img.image_url)
    return url !== null
  }) || []

  const mainImageUrl = validImages[selectedImageIndex] ? getImageUrl(validImages[selectedImageIndex].image_url) : null

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index)
  }

  const handleMainImageClick = () => {
    if (mainImageUrl) {
      setShowLightbox(true)
    }
  }

  const handleLightboxClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowLightbox(false)
    }
  }

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0))
  }

  return (
    <>
      <div className="vehicle-modal-overlay" onClick={handleModalClose}>
        <div className="vehicle-modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="vehicle-modal-close" onClick={onClose}>×</button>
          
          <div className="vehicle-modal-body">
            <div className="vehicle-images-container">
              {validImages.length > 0 ? (
                <>
                  <div className="main-image-wrapper" onClick={handleMainImageClick}>
                    <img 
                      src={mainImageUrl} 
                      alt={`${vehicle.brand} ${vehicle.model}`} 
                      className="main-image"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <div className="image-zoom-hint">🔍 {t('autoSales.details.clickToZoom') || 'Büyütmek için tıklayın'}</div>
                  </div>
                  {validImages.length > 1 && (
                    <div className="thumbnail-gallery">
                      {validImages.map((image, index) => {
                        const thumbUrl = getImageUrl(image.image_url)
                        return thumbUrl ? (
                          <div 
                            key={index}
                            className={`thumbnail-item ${index === selectedImageIndex ? 'active' : ''}`}
                            onClick={() => handleThumbnailClick(index)}
                          >
                            <img 
                              src={thumbUrl} 
                              alt={`${vehicle.brand} ${vehicle.model} - ${index + 1}`}
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        ) : null
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-image">{t('common.noImage')}</div>
              )}
            </div>

            <div className="vehicle-details">
              <h1>
                <span>{vehicle.brand} {vehicle.model}</span>
                <span className="price">${Math.round(vehicle.price).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </h1>

              <div className="specs-cards">
                <div className="spec-card">
                  <div className="spec-icon">⛽</div>
                  <div className="spec-content">
                    <div className="spec-label">{t('autoSales.details.specs.fuelType')}</div>
                    <div className="spec-value">
                      {vehicle.fuel_type === 'petrol' ? t('autoSales.details.fuelPetrol') :
                       vehicle.fuel_type === 'diesel' ? t('autoSales.details.fuelDiesel') :
                       vehicle.fuel_type === 'electric' ? t('autoSales.details.fuelElectric') :
                       vehicle.fuel_type === 'hybrid' ? t('autoSales.details.fuelHybrid') :
                       vehicle.fuel_type === 'lpg' ? t('autoSales.details.fuelLpg') :
                       vehicle.fuel_type || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="spec-card">
                  <div className="spec-icon">⚙️</div>
                  <div className="spec-content">
                    <div className="spec-label">{t('autoSales.details.specs.transmission')}</div>
                    <div className="spec-value">{vehicle.transmission === 'automatic' ? t('autoSales.details.transmissionAutomatic') : t('autoSales.details.transmissionManual')}</div>
                  </div>
                </div>
                <div className="spec-card">
                  <div className="spec-icon">📅</div>
                  <div className="spec-content">
                    <div className="spec-label">{t('autoSales.details.year') || 'Yıl'}</div>
                    <div className="spec-value">{vehicle.year}</div>
                  </div>
                </div>
                <div className="spec-card">
                  <div className="spec-icon">📏</div>
                  <div className="spec-content">
                    <div className="spec-label">{t('autoSales.details.specs.mileage')}</div>
                    <div className="spec-value">{vehicle.mileage?.toLocaleString() || 'N/A'} km</div>
                  </div>
                </div>
                <div className="spec-card">
                  <div className="spec-icon">🎨</div>
                  <div className="spec-content">
                    <div className="spec-label">{t('autoSales.details.specs.color')}</div>
                    <div className="spec-value">{vehicle.color ? t(`autoSales.details.colors.${vehicle.color}`) || vehicle.color : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {vehicle.description && (
                <div className="description">
                  <h3>{t('autoSales.details.description')}</h3>
                  <p>{vehicle.description}</p>
                </div>
              )}

              <div className="actions">
                <button onClick={() => setShowReservationForm(true)} className="btn-primary">
                  {t('autoSales.details.reservation')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReservationForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{t('autoSales.forms.reservation.title')}</h2>
            <form onSubmit={handleReservationSubmit}>
              <input
                type="text"
                name="customer_name"
                placeholder={t('autoSales.forms.reservation.name')}
                value={formData.customer_name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="customer_email"
                placeholder={t('autoSales.forms.reservation.email')}
                value={formData.customer_email}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="customer_phone"
                placeholder={t('autoSales.forms.reservation.phone')}
                value={formData.customer_phone}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="preferred_date"
                placeholder={t('autoSales.forms.reservation.preferredDate') || 'Tercih Edilen Tarih'}
                value={formData.preferred_date}
                onChange={handleInputChange}
                required
              />
              <input
                type="time"
                name="preferred_time"
                placeholder={t('autoSales.forms.reservation.preferredTime') || 'Tercih Edilen Saat'}
                value={formData.preferred_time}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="message"
                placeholder={t('autoSales.forms.reservation.message')}
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
              />
              <div className="modal-actions">
                <button type="submit">{t('autoSales.forms.reservation.submit')}</button>
                <button type="button" onClick={() => setShowReservationForm(false)}>{t('autoSales.forms.reservation.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLightbox && mainImageUrl && (
        <div className="lightbox" onClick={handleLightboxClose}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setShowLightbox(false)}>×</button>
            {validImages.length > 1 && (
              <>
                <button className="lightbox-nav lightbox-prev" onClick={handlePrevImage}>‹</button>
                <button className="lightbox-nav lightbox-next" onClick={handleNextImage}>›</button>
              </>
            )}
            <img 
              src={mainImageUrl} 
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="lightbox-image"
            />
            {validImages.length > 1 && (
              <div className="lightbox-counter">
                {selectedImageIndex + 1} / {validImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default VehicleDetailModal

