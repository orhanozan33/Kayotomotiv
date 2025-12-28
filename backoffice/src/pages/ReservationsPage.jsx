import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { reservationsAPI, vehiclesAPI, repairAPI, carWashAPI } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import { findVehicleImage } from '../utils/vehicleImageService'
import './ReservationsPage.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '')

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  return `${BACKEND_BASE_URL}${imageUrl}`
}

function ReservationsPage() {
  const { t } = useTranslation('common')
  const { showError, showSuccess } = useError()
  const [activeTab, setActiveTab] = useState('reservations')
  const [reservations, setReservations] = useState([])
  const [testDrives, setTestDrives] = useState([])
  const [repairQuotes, setRepairQuotes] = useState([])
  const [carWashAppointments, setCarWashAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    reservationId: null, 
    vehicleId: null, 
    isSynthetic: false, 
    type: null,
    title: '',
    message: ''
  })
  const [carWashDetailModal, setCarWashDetailModal] = useState({ isOpen: false, appointment: null })
  
  // Count pending requests for badges
  const [pendingCounts, setPendingCounts] = useState({
    reservations: 0,
    testDrives: 0,
    repairQuotes: 0,
    carWash: 0
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load all data in parallel
      const [reservationsRes, testDrivesRes, repairQuotesRes, carWashRes] = await Promise.all([
        reservationsAPI.getAll().catch(err => {
          console.error('Error loading reservations:', err)
          return { data: { reservations: [] } }
        }),
        reservationsAPI.getTestDrives().catch(err => {
          console.error('Error loading test drives:', err)
          return { data: { testDriveRequests: [] } }
        }),
        repairAPI.getQuotes().catch(err => {
          console.error('Error loading repair quotes:', err)
          return { data: { quotes: [] } }
        }),
        carWashAPI.getAppointments().catch(err => {
          console.error('Error loading car wash appointments:', err)
          return { data: { appointments: [] } }
        })
      ])
      
      const reservationsData = reservationsRes.data?.reservations || []
      const testDrivesData = testDrivesRes.data?.testDriveRequests || []
      const repairQuotesData = repairQuotesRes.data?.quotes || []
      const carWashData = carWashRes.data?.appointments || []
      
      // Count pending items
      setPendingCounts({
        reservations: reservationsData.filter(r => r.status === 'pending').length,
        testDrives: testDrivesData.filter(td => td.status === 'pending').length,
        repairQuotes: repairQuotesData.filter(rq => rq.status === 'pending').length,
        carWash: carWashData.filter(cw => cw.status === 'pending').length
      })
      
      // Load vehicle images for reservations
      const reservationsWithImages = await Promise.all(
        reservationsData.map(async (reservation) => {
          try {
            if (reservation.vehicle_id) {
              const vehicleRes = await vehiclesAPI.getById(reservation.vehicle_id)
              const images = vehicleRes.data?.vehicle?.images || []
              const primaryImage = images.find(img => img.is_primary) || images[0]
              return {
                ...reservation,
                vehicleImage: primaryImage ? getImageUrl(primaryImage.image_url) : null
              }
            }
            return { ...reservation, vehicleImage: null }
          } catch (error) {
            console.error('Error loading vehicle image:', error)
            return { ...reservation, vehicleImage: null }
          }
        })
      )
      
      // Load vehicle images for test drives
      const testDrivesWithImages = await Promise.all(
        testDrivesData.map(async (testDrive) => {
          try {
            // First try to get image by vehicle_id if available
            if (testDrive.vehicle_id) {
              const vehicleRes = await vehiclesAPI.getById(testDrive.vehicle_id)
              const images = vehicleRes.data?.vehicle?.images || []
              const primaryImage = images.find(img => img.is_primary) || images[0]
              if (primaryImage) {
                return {
                  ...testDrive,
                  vehicleImage: getImageUrl(primaryImage.image_url)
                }
              }
            }
            
            // If no vehicle_id or no image found, try to find by brand/model/year
            if (testDrive.brand && testDrive.model) {
              const vehicleInfo = await findVehicleImage(vehiclesAPI, testDrive.brand, testDrive.model, testDrive.year)
              if (vehicleInfo && vehicleInfo.image) {
                return {
                  ...testDrive,
                  vehicleImage: vehicleInfo.image,
                  vehicle_id: vehicleInfo.vehicleId || testDrive.vehicle_id
                }
              }
            }
            
            return { ...testDrive, vehicleImage: null }
          } catch (error) {
            console.error('Error loading vehicle image for test drive:', error)
            return { ...testDrive, vehicleImage: null }
          }
        })
      )
      
      // Load vehicle images for repair quotes by brand/model/year
      const repairQuotesWithImages = await Promise.all(
        repairQuotesData.map(async (quote) => {
          try {
            if (quote.vehicle_brand && quote.vehicle_model) {
              const vehicleInfo = await findVehicleImage(vehiclesAPI, quote.vehicle_brand, quote.vehicle_model, quote.vehicle_year)
              if (vehicleInfo && vehicleInfo.image) {
                return {
                  ...quote,
                  vehicleImage: vehicleInfo.image,
                  vehicle_id: vehicleInfo.vehicleId
                }
              }
            }
            return { ...quote, vehicleImage: null }
          } catch (error) {
            console.error('Error loading vehicle image for repair quote:', error)
            return { ...quote, vehicleImage: null }
          }
        })
      )
      
      // Load vehicle images for car wash appointments - always show placeholder with emoji icon
      const carWashWithImages = carWashData.map(appointment => ({
        ...appointment,
        vehicleImage: null // Always show placeholder with emoji icon for car wash
      }))
      
      setReservations(reservationsWithImages)
      setTestDrives(testDrivesWithImages)
      setRepairQuotes(repairQuotesWithImages)
      setCarWashAppointments(carWashWithImages)
    } catch (error) {
      console.error('Error loading data:', error)
      showError('Veri yüklenirken hata oluştu: ' + (error.response?.data?.error || error.message))
      setReservations([])
      setTestDrives([])
      setRepairQuotes([])
      setCarWashAppointments([])
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleReservationStatusUpdate = async (id, status) => {
    try {
      const isSynthetic = id && id.toString().startsWith('vehicle-')
      if (isSynthetic) {
        showError('Sentetik rezervasyonlar için durum güncellemesi yapılamaz.')
        return
      }
      await reservationsAPI.updateStatus(id, status)
      showSuccess(t('reservations.updatedSuccessfully') || 'Durum başarıyla güncellendi!')
      loadData()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('reservations.errors.updating') + ': ' + errorMessage)
    }
  }

  const handleTestDriveStatusUpdate = async (id, status) => {
    try {
        await reservationsAPI.updateTestDriveStatus(id, status)
      showSuccess(t('reservations.updatedSuccessfully') || 'Durum başarıyla güncellendi!')
      loadData()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('reservations.errors.updating') + ': ' + errorMessage)
    }
  }

  const handleRepairQuoteStatusUpdate = async (id, status) => {
    try {
      await repairAPI.updateQuoteStatus(id, status)
      showSuccess(t('repairQuotes.updatedSuccessfully') || 'Durum başarıyla güncellendi!')
      loadData()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('repairQuotes.errors.updating') + ': ' + errorMessage)
    }
  }

  const handleCarWashStatusUpdate = async (id, status) => {
    try {
      await carWashAPI.updateAppointmentStatus(id, status)
      showSuccess(t('carWash.updatedSuccessfully') || 'Durum başarıyla güncellendi!')
      loadData()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('carWash.errors.updating') + ': ' + errorMessage)
    }
  }

  const handleDelete = (id, vehicleId, type) => {
    const isSynthetic = id && id.toString().startsWith('vehicle-')
    const title = t('reservations.confirmDeleteTitle') || 'Rezervasyonu Sil'
    const message = t('reservations.confirmDelete') || 'Bu rezervasyonu silmek istediğinizden emin misiniz?'
    setDeleteModal({ 
      isOpen: true, 
      reservationId: id, 
      vehicleId: vehicleId, 
      isSynthetic, 
      type,
      title,
      message
    })
  }

  const handleTestDriveDelete = (id) => {
    const title = t('reservations.confirmDeleteTitle') || 'Test Sürüşü Talebini Sil'
    const message = t('reservations.confirmDelete') || 'Bu test sürüşü talebini silmek istediğinizden emin misiniz?'
    setDeleteModal({ 
      isOpen: true, 
      reservationId: id, 
      vehicleId: null, 
      isSynthetic: false, 
      type: 'testDrive',
      title,
      message
    })
  }

  const handleRepairQuoteDelete = (id) => {
    const title = t('reservations.confirmDeleteTitle') || 'Tamir Teklifini Sil'
    const message = t('reservations.confirmDelete') || 'Bu tamir teklifini silmek istediğinizden emin misiniz?'
    setDeleteModal({ 
      isOpen: true, 
      reservationId: id, 
      vehicleId: null, 
      isSynthetic: false, 
      type: 'repairQuote',
      title,
      message
    })
  }

  const handleCarWashDelete = (id) => {
    const title = t('reservations.confirmDeleteTitle') || 'Oto Yıkama Randevusunu Sil'
    const message = t('reservations.confirmDelete') || 'Bu oto yıkama randevusunu silmek istediğinizden emin misiniz?'
    setDeleteModal({ 
      isOpen: true, 
      reservationId: id, 
      vehicleId: null, 
      isSynthetic: false, 
      type: 'carWash',
      title,
      message
    })
  }

  const confirmDelete = async () => {
    const { reservationId, vehicleId, isSynthetic, type } = deleteModal
    try {
      if (type === 'reservation') {
        if (isSynthetic) {
          await vehiclesAPI.update(vehicleId, { status: 'available', reservation_end_time: null })
        } else {
          await reservationsAPI.delete(reservationId)
        }
        showSuccess(t('reservations.deletedSuccessfully') || 'Rezervasyon başarıyla silindi!')
      } else if (type === 'testDrive') {
        await reservationsAPI.deleteTestDrive(reservationId)
        showSuccess(t('reservations.deletedSuccessfully') || 'Test sürüşü talebi başarıyla silindi!')
      } else if (type === 'repairQuote') {
        await repairAPI.deleteQuote(reservationId)
        showSuccess(t('reservations.deletedSuccessfully') || 'Tamir teklifi başarıyla silindi!')
      } else if (type === 'carWash') {
        await carWashAPI.deleteAppointment(reservationId)
        showSuccess(t('reservations.deletedSuccessfully') || 'Oto yıkama randevusu başarıyla silindi!')
      }
      setDeleteModal({ 
        isOpen: false, 
        reservationId: null, 
        vehicleId: null, 
        isSynthetic: false, 
        type: null,
        title: '',
        message: ''
      })
      loadData()
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      showError(t('reservations.errors.deleting') + ': ' + errorMessage)
    }
  }

  const openVehicleDetail = (vehicleId) => {
    if (vehicleId) {
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000'
      window.open(`${frontendUrl}/auto-sales/${vehicleId}`, '_blank')
    }
  }

  if (loading) return <div className="loading">{t('common.loading') || 'Yükleniyor...'}</div>

  const renderReservationsCards = () => {
    if (reservations.length === 0) {
      return <div className="no-data">{t('reservations.noReservations') || 'Rezervasyon bulunamadı'}</div>
    }

    return (
      <div className="reservations-cards-container">
        {reservations.map(reservation => (
          <div key={reservation.id} className="reservation-card">
            <div className="reservation-card-image">
              {reservation.vehicleImage ? (
                <img
                  src={reservation.vehicleImage}
                  alt={`${reservation.brand} ${reservation.model}`}
                  onClick={() => openVehicleDetail(reservation.vehicle_id)}
                  style={{ cursor: 'pointer' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="vehicle-image-placeholder">
                  <span>🚗</span>
                  <span>{reservation.brand} {reservation.model}</span>
                </div>
              )}
            </div>
            <div className="reservation-card-content">
              <div className="reservation-card-header">
                <h3>{reservation.brand} {reservation.model} {reservation.year}</h3>
                <span className={`status-badge status-${reservation.status}`}>
                  {reservation.status === 'pending' ? t('reservations.statusPending') || 'Beklemede' :
                   reservation.status === 'confirmed' ? t('reservations.statusConfirmed') || 'Onaylandı' :
                   reservation.status === 'cancelled' ? t('reservations.statusCancelled') || 'İptal Edildi' :
                   reservation.status === 'completed' ? t('reservations.statusCompleted') || 'Tamamlandı' :
                   reservation.status}
                </span>
              </div>
              
              <div className="reservation-card-details">
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className="detail-value">{reservation.customer_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.email') || 'E-posta'}:</span>
                  <span className="detail-value">{reservation.customer_email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.phone') || 'Telefon'}:</span>
                  <span className="detail-value">{reservation.customer_phone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.date') || 'Tarih'}:</span>
                  <span className="detail-value">{new Date(reservation.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <div className="reservation-card-actions">
                {reservation.status === 'pending' && !reservation.id?.toString().startsWith('vehicle-') && (
                  <>
                    <button className="btn-accept" onClick={() => handleReservationStatusUpdate(reservation.id, 'confirmed')}>
                      {t('reservations.accept') || 'Kabul Et'}
                    </button>
                    <button className="btn-reject" onClick={() => handleReservationStatusUpdate(reservation.id, 'cancelled')}>
                      {t('reservations.reject') || 'Red Et'}
                    </button>
                  </>
                )}
                <button className="btn-delete" onClick={() => handleDelete(reservation.id, reservation.vehicle_id, 'reservation')}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTestDrivesCards = () => {
    if (testDrives.length === 0) {
      return <div className="no-data">{t('reservations.noTestDrives') || 'Test sürüşü talebi bulunamadı'}</div>
    }

    return (
      <div className="reservations-cards-container">
        {testDrives.map(testDrive => (
          <div key={testDrive.id} className="reservation-card">
            <div className="reservation-card-image">
              {testDrive.vehicleImage ? (
                <img
                  src={testDrive.vehicleImage}
                  alt={`${testDrive.brand} ${testDrive.model}`}
                  onClick={() => testDrive.vehicle_id && openVehicleDetail(testDrive.vehicle_id)}
                  style={{ cursor: testDrive.vehicle_id ? 'pointer' : 'default' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="vehicle-image-placeholder">
                  <span>🚗</span>
                  <span>{testDrive.brand} {testDrive.model}</span>
                </div>
              )}
            </div>
            <div className="reservation-card-content">
              <div className="reservation-card-header">
                <h3>{testDrive.brand} {testDrive.model} {testDrive.year}</h3>
                <span className={`status-badge status-${testDrive.status}`}>
                  {testDrive.status === 'pending' ? t('reservations.statusPending') || 'Beklemede' :
                   testDrive.status === 'confirmed' ? t('reservations.statusConfirmed') || 'Onaylandı' :
                   testDrive.status === 'cancelled' ? t('reservations.statusCancelled') || 'İptal Edildi' :
                   testDrive.status === 'completed' ? t('reservations.statusCompleted') || 'Tamamlandı' :
                   testDrive.status}
                </span>
              </div>
              
              <div className="reservation-card-details">
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className="detail-value">{testDrive.customer_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.email') || 'E-posta'}:</span>
                  <span className="detail-value">{testDrive.customer_email || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.phone') || 'Telefon'}:</span>
                  <span className="detail-value">{testDrive.customer_phone || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.date') || 'Tarih'}:</span>
                  <span className="detail-value">{new Date(testDrive.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <div className="reservation-card-actions">
                {testDrive.status === 'pending' && (
                  <>
                    <button className="btn-accept" onClick={() => handleTestDriveStatusUpdate(testDrive.id, 'confirmed')}>
                      {t('reservations.accept') || 'Kabul Et'}
                    </button>
                    <button className="btn-reject" onClick={() => handleTestDriveStatusUpdate(testDrive.id, 'cancelled')}>
                      {t('reservations.reject') || 'Red Et'}
                    </button>
                  </>
                )}
                <button className="btn-delete" onClick={() => handleTestDriveDelete(testDrive.id)}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderRepairQuotesCards = () => {
    if (repairQuotes.length === 0) {
      return <div className="no-data">{t('reservations.noRepairQuotes') || 'Tamir teklifi bulunamadı'}</div>
    }

    return (
      <div className="reservations-cards-container">
        {repairQuotes.map(quote => (
          <div key={quote.id} className="reservation-card">
            <div className="reservation-card-image">
              {quote.vehicleImage ? (
                <img
                  src={quote.vehicleImage}
                  alt={`${quote.vehicle_brand} ${quote.vehicle_model}`}
                  onClick={() => quote.vehicle_id && openVehicleDetail(quote.vehicle_id)}
                  style={{ cursor: quote.vehicle_id ? 'pointer' : 'default' }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="vehicle-image-placeholder">
                  <span>🚗</span>
                  <span>{quote.vehicle_brand} {quote.vehicle_model}</span>
                </div>
              )}
            </div>
            <div className="reservation-card-content">
              <div className="reservation-card-header">
                <h3>{quote.vehicle_brand} {quote.vehicle_model} {quote.vehicle_year}</h3>
                <span className={`status-badge status-${quote.status}`}>
                  {quote.status === 'pending' ? t('repairQuotes.statusPending') || 'Beklemede' :
                   quote.status === 'quoted' ? t('repairQuotes.statusQuoted') || 'Teklif Verildi' :
                   quote.status === 'accepted' ? t('repairQuotes.statusAccepted') || 'Kabul Edildi' :
                   quote.status === 'rejected' ? t('repairQuotes.statusRejected') || 'Reddedildi' :
                   quote.status === 'completed' ? t('repairQuotes.statusCompleted') || 'Tamamlandı' :
                   quote.status}
                </span>
              </div>
              
              <div className="reservation-card-details">
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className="detail-value">{quote.customer_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.phone') || 'Telefon'}:</span>
                  <span className="detail-value">{quote.customer_phone || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('repairQuotes.totalPrice') || 'Toplam Fiyat'}:</span>
                  <span className="detail-value">${parseFloat(quote.total_price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.date') || 'Tarih'}:</span>
                  <span className="detail-value">{new Date(quote.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <div className="reservation-card-actions">
                {quote.status === 'pending' && (
                  <button className="btn-accept" onClick={() => handleRepairQuoteStatusUpdate(quote.id, 'quoted')}>
                    Teklif Ver
                  </button>
                )}
                <button className="btn-delete" onClick={() => handleRepairQuoteDelete(quote.id)}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCarWashCards = () => {
    if (carWashAppointments.length === 0) {
      return <div className="no-data">{t('reservations.noCarWash') || 'Oto Yıkama randevusu bulunamadı'}</div>
    }

    return (
      <div className="reservations-cards-container">
        {carWashAppointments.map(appointment => (
          <div key={appointment.id} className="reservation-card">
            <div className="reservation-card-image">
              <div className="vehicle-image-placeholder">
                <span>🚗</span>
                <span>{appointment.vehicle_brand} {appointment.vehicle_model}</span>
              </div>
            </div>
            <div className="reservation-card-content">
              <div className="reservation-card-header">
                <h3>{appointment.vehicle_brand} {appointment.vehicle_model}</h3>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status === 'pending' ? t('reservations.statusPending') || 'Beklemede' :
                   appointment.status === 'confirmed' ? t('reservations.statusConfirmed') || 'Onaylandı' :
                   appointment.status === 'completed' ? t('reservations.statusCompleted') || 'Tamamlandı' :
                   appointment.status === 'cancelled' ? t('reservations.statusCancelled') || 'İptal Edildi' :
                   appointment.status}
                </span>
              </div>
              
              <div className="reservation-card-details">
                <div className="detail-item">
                  <span className="detail-label">{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className="detail-value">{appointment.customer_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('carWash.package') || 'Paket'}:</span>
                  <span className="detail-value">{appointment.package_name || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('carWash.date') || 'Tarih'}:</span>
                  <span className="detail-value">{appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('tr-TR') : '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('carWash.time') || 'Saat'}:</span>
                  <span className="detail-value">{appointment.appointment_time || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t('carWash.total') || 'Toplam'}:</span>
                  <span className="detail-value">${parseFloat(appointment.total_price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="reservation-card-actions">
                {appointment.status === 'pending' && (
                  <button className="btn-accept" onClick={() => handleCarWashStatusUpdate(appointment.id, 'confirmed')}>
                    {t('reservations.accept') || 'Kabul Et'}
                  </button>
                )}
                <button 
                  className="btn-secondary" 
                  onClick={() => setCarWashDetailModal({ isOpen: true, appointment })}
                  style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none' }}
                >
                  {t('reservations.viewDetails') || 'Detaylar'}
                </button>
                <button className="btn-delete" onClick={() => handleCarWashDelete(appointment.id)}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCarWashDetailModal = () => {
    if (!carWashDetailModal.isOpen || !carWashDetailModal.appointment) return null
    
    const appointment = carWashDetailModal.appointment
    const addons = appointment.addons || []
    const packagePrice = parseFloat(appointment.package_price || 0)
    const addonsTotal = addons.reduce((sum, addon) => sum + parseFloat(addon.price || 0), 0)
    const calculatedTotal = packagePrice + addonsTotal

    return (
      <div className="modal-overlay" onClick={() => setCarWashDetailModal({ isOpen: false, appointment: null })}>
        <div className="modal-content-detail" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{t('carWash.appointmentDetailTitle') || 'Oto Yıkama Randevu Detayları'}</h2>
            <button 
              className="close-button" 
              onClick={() => setCarWashDetailModal({ isOpen: false, appointment: null })}
            >
              ×
            </button>
          </div>
          <div className="modal-body-detail">
            <div className="detail-section">
              <h3>{t('carWash.customerInfo') || 'Müşteri Bilgileri'}</h3>
              <div className="detail-row">
                <span className="detail-label">{t('carWash.name') || 'İsim'}:</span>
                <span className="detail-value">{appointment.customer_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('carWash.email') || 'E-posta'}:</span>
                <span className="detail-value">{appointment.customer_email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('carWash.phone') || 'Telefon'}:</span>
                <span className="detail-value">{appointment.customer_phone}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>{t('carWash.appointmentInfo') || 'Randevu Bilgileri'}</h3>
              <div className="detail-row">
                <span className="detail-label">{t('carWash.date') || 'Tarih'}:</span>
                <span className="detail-value">{new Date(appointment.appointment_date).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('carWash.time') || 'Saat'}:</span>
                <span className="detail-value">{appointment.appointment_time}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('carWash.status') || 'Durum'}:</span>
                <span className={`status-badge status-${appointment.status}`}>
                  {appointment.status === 'pending' ? t('reservations.statusPending') || 'Beklemede' :
                   appointment.status === 'confirmed' ? t('reservations.statusConfirmed') || 'Onaylandı' :
                   appointment.status === 'completed' ? t('reservations.statusCompleted') || 'Tamamlandı' :
                   appointment.status === 'cancelled' ? t('reservations.statusCancelled') || 'İptal Edildi' :
                   appointment.status}
                </span>
              </div>
            </div>

            <div className="detail-section">
              <h3>{t('carWash.servicesToPerform') || 'Yapılacak İşlemler'}</h3>
              <div className="detail-row">
                <span className="detail-label">{t('carWash.package') || 'Paket'}:</span>
                <span className="detail-value">{appointment.package_name} - ${packagePrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {addons.length > 0 && (
                <>
                  <div className="detail-label" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{t('carWash.addons') || 'Ek Özellikler'}:</div>
                  <ul className="addons-list">
                    {addons.map((addon, index) => (
                      <li key={index}>
                        {addon.addon_name} - ${parseFloat(addon.price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {appointment.notes && (
              <div className="detail-section">
                <h3>{t('carWash.userNote') || 'Kullanıcı Notu'}</h3>
                <div className="notes-content">{appointment.notes}</div>
              </div>
            )}

            <div className="detail-section">
              <h3>{t('carWash.priceDetail') || 'Fiyat Detayı'}</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>{t('carWash.packagePrice') || 'Paket Fiyatı'}:</span>
                  <span>${packagePrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="price-row">
                    <span>{t('carWash.addons') || 'Ek Özellikler'}:</span>
                    <span>${addonsTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="price-row total-row">
                  <span>{t('carWash.total') || 'Toplam'}:</span>
                  <span>${calculatedTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {calculatedTotal !== parseFloat(appointment.total_price || 0) && (
                  <div className="price-row warning-row">
                    <span>Kayıtlı Toplam (veritabanı):</span>
                    <span>${parseFloat(appointment.total_price || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reservations-page">
      <h1>
        {t('reservations.title') || 'Rezervasyonlar ve Talepler'}
        {pendingCounts.reservations > 0 && (
          <span className="notification-badge">{pendingCounts.reservations}</span>
        )}
      </h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          {t('reservations.tabReservations') || 'Rezervasyonlar'}
          {pendingCounts.reservations > 0 && (
            <span className="tab-badge">{pendingCounts.reservations}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'testDrives' ? 'active' : ''}`}
          onClick={() => setActiveTab('testDrives')}
        >
          {t('reservations.tabTestDrives') || 'Test Sürüşleri'}
          {pendingCounts.testDrives > 0 && (
            <span className="tab-badge">{pendingCounts.testDrives}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'repairQuotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('repairQuotes')}
        >
          {t('reservations.tabRepairQuotes') || 'Oto Tamir'}
          {pendingCounts.repairQuotes > 0 && (
            <span className="tab-badge">{pendingCounts.repairQuotes}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'carWash' ? 'active' : ''}`}
          onClick={() => setActiveTab('carWash')}
        >
          {t('reservations.tabCarWash') || 'Oto Yıkama'}
          {pendingCounts.carWash > 0 && (
            <span className="tab-badge">{pendingCounts.carWash}</span>
          )}
        </button>
      </div>

      {activeTab === 'reservations' && renderReservationsCards()}
      {activeTab === 'testDrives' && renderTestDrivesCards()}
      {activeTab === 'repairQuotes' && renderRepairQuotesCards()}
      {activeTab === 'carWash' && renderCarWashCards()}

      {renderCarWashDetailModal()}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ 
          isOpen: false, 
          reservationId: null, 
          vehicleId: null, 
          isSynthetic: false, 
          type: null,
          title: '',
          message: ''
        })}
        onConfirm={confirmDelete}
        title={deleteModal.title || t('reservations.confirmDeleteTitle') || 'Silme Onayı'}
        message={deleteModal.message || t('reservations.confirmDelete') || 'Bu işlemi silmek istediğinizden emin misiniz?'}
        confirmText={t('reservations.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />
    </div>
  )
}

export default ReservationsPage
