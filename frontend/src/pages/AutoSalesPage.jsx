import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { vehiclesAPI } from '../services/api'
import { carBrandsAndModels, years } from '../data/carBrands'
import CountdownTimer from '../components/CountdownTimer'
import VehicleDetailModal from '../components/VehicleDetailModal'
import './AutoSalesPage.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '')

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  return `${BACKEND_BASE_URL}${imageUrl}`
}

function AutoSalesPage() {
  const { t } = useTranslation()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [availableModels, setAvailableModels] = useState([])
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    minPrice: '',
    maxPrice: ''
  })

  useEffect(() => {
    loadVehicles()
    
    // Check for expired reservations every 30 seconds
    const interval = setInterval(() => {
      loadVehicles()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const response = await vehiclesAPI.getAll(filters)
      setVehicles(response.data.vehicles)
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    if (name === 'brand') {
      setFilters({
        ...filters,
        brand: value,
        model: '' // Reset model when brand changes
      })
      setAvailableModels(value ? (carBrandsAndModels[value] || []) : [])
    } else {
      setFilters({
        ...filters,
        [name]: value
      })
    }
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    loadVehicles()
  }

  return (
    <div className="auto-sales-page">
      <div className="container">
        <div className="filters-section">
          <form onSubmit={handleFilterSubmit} className="filters-form">
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
            >
              <option value="">{t('autoSales.filters.brand')}</option>
              {Object.keys(carBrandsAndModels).map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <select
              name="model"
              value={filters.model}
              onChange={handleFilterChange}
              disabled={!filters.brand}
            >
              <option value="">{t('autoSales.filters.model')}</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
            >
              <option value="">{t('autoSales.filters.year')}</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <input
              type="number"
              name="minPrice"
              placeholder={t('autoSales.filters.minPrice')}
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder={t('autoSales.filters.maxPrice')}
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
            <button type="submit">{t('autoSales.filters.filter')}</button>
          </form>
        </div>

        {loading ? (
          <div className="loading">{t('autoSales.loading')}</div>
        ) : vehicles.length === 0 ? (
          <div className="no-results">{t('autoSales.noResults')}</div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map((vehicle) => {
              const primaryImage = vehicle.images?.find(img => img.is_primary) || vehicle.images?.[0]
              const imageUrl = primaryImage ? getImageUrl(primaryImage.image_url) : null
              
              const isReserved = vehicle.status === 'reserved'
              const reservationEndTime = vehicle.reservation_end_time
              
              return (
                <div 
                  key={vehicle.id} 
                  className={`vehicle-card ${isReserved ? 'reserved' : ''}`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {isReserved && (
                    <>
                      <div className="reserved-badge">
                        <span className="reserved-text">REZERVE</span>
                      </div>
                      {reservationEndTime && (
                        <CountdownTimer endTime={reservationEndTime} />
                      )}
                    </>
                  )}
                  <div className="vehicle-image">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`${vehicle.brand} ${vehicle.model}`} 
                        onError={(e) => {
                          if (e.target.nextSibling) {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }
                        }}
                      />
                    ) : null}
                    <div className="no-image" style={{ display: imageUrl ? 'none' : 'flex' }}>
                      {t('common.noImage')}
                    </div>
                  </div>
                  <div className="vehicle-info">
                    <div className="vehicle-header">
                      <h3>{vehicle.brand} {vehicle.model}</h3>
                      <div className="vehicle-header-right">
                        <p className="vehicle-price">${Math.round(vehicle.price).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                      </div>
                    </div>
                    <p className="vehicle-details">
                      <span className="vehicle-year-inline">{vehicle.year}</span>
                      <span> • </span>
                      <span className="transmission-text">{vehicle.transmission === 'automatic' ? t('autoSales.details.transmissionAutomatic') : t('autoSales.details.transmissionManual')}</span>
                      {vehicle.mileage && <span> • <span className="mileage-text">{vehicle.mileage?.toLocaleString()} km</span></span>}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {selectedVehicleId && (
        <VehicleDetailModal 
          vehicleId={selectedVehicleId} 
          onClose={() => setSelectedVehicleId(null)} 
        />
      )}
    </div>
  )
}

export default AutoSalesPage

