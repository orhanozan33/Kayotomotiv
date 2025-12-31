'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { vehiclesAPI } from '@/lib/services/api';
import { carBrandsAndModels, years } from '@/lib/data/carBrands';
import CountdownTimer from '@/components/CountdownTimer';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import styles from './page.module.css';

const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http')) return imageUrl;
  // If it starts with /uploads, it's already correct for Next.js public folder
  if (imageUrl.startsWith('/uploads')) return imageUrl;
  // If it's just a filename or relative path, prepend /uploads/
  // Next.js public folder serves files from root, so /uploads/filename.jpg works
  return imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`;
};

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: string | number;
  mileage?: number;
  transmission: string;
  status: string;
  reservation_end_time?: string;
  images?: Array<{ image_url: string; is_primary: boolean }>;
}

export default function AutoSalesPage() {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    loadVehicles();

    // Check for expired reservations every 30 seconds
    const interval = setInterval(() => {
      loadVehicles();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading vehicles with filters:', filters);
      const response = await vehiclesAPI.getAll(filters);
      console.log('✅ Vehicles response:', response.data);
      setVehicles(response.data?.vehicles || []);
    } catch (error: any) {
      console.error('❌ Error loading vehicles:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'brand') {
      setFilters({
        ...filters,
        brand: value,
        model: '', // Reset model when brand changes
      });
      setAvailableModels(value ? carBrandsAndModels[value] || [] : []);
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadVehicles();
  };

  return (
    <div className={styles.autoSalesPage}>
      <div className={styles.container}>
        <div className={styles.filtersSection}>
          <form onSubmit={handleFilterSubmit} className={styles.filtersForm}>
            <select name="brand" value={filters.brand} onChange={handleFilterChange}>
              <option value="">{t('autoSales.filters.brand')}</option>
              {Object.keys(carBrandsAndModels).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            <select
              name="model"
              value={filters.model}
              onChange={handleFilterChange}
              disabled={!filters.brand}
            >
              <option value="">{t('autoSales.filters.model')}</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">{t('autoSales.filters.year')}</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
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
          <div className={styles.loading}>{t('autoSales.loading')}</div>
        ) : !vehicles || vehicles.length === 0 ? (
          <div className={styles.noResults}>{t('autoSales.noResults')}</div>
        ) : (
          <div className={styles.vehiclesGrid}>
            {vehicles.map((vehicle) => {
              const primaryImage =
                vehicle.images?.find((img) => img.is_primary) || vehicle.images?.[0];
              const imageUrl = primaryImage ? getImageUrl(primaryImage.image_url) : null;

              const isReserved = vehicle.status === 'reserved';
              const reservationEndTime = vehicle.reservation_end_time;

              return (
                <div
                  key={vehicle.id}
                  className={`${styles.vehicleCard} ${isReserved ? styles.reserved : ''}`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {isReserved && (
                    <>
                      <div className={styles.reservedBadge}>
                        <span className={styles.reservedText}>REZERVE</span>
                      </div>
                      {reservationEndTime && <CountdownTimer endTime={reservationEndTime} />}
                    </>
                  )}
                  <div className={styles.vehicleImage}>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.nextSibling) {
                            target.style.display = 'none';
                            (target.nextSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={styles.noImage}
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      {t('common.noImage')}
                    </div>
                  </div>
                  <div className={styles.vehicleInfo}>
                    <div className={styles.vehicleHeader}>
                      <h3>
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <div className={styles.vehicleHeaderRight}>
                        <p className={styles.vehiclePrice}>
                          $
                          {Math.round(Number(vehicle.price)).toLocaleString('de-DE', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </p>
                      </div>
                    </div>
                    <p className={styles.vehicleDetails}>
                      <span className={styles.vehicleYearInline}>{vehicle.year}</span>
                      <span> • </span>
                      <span className={styles.transmissionText}>
                        {vehicle.transmission === 'automatic'
                          ? t('autoSales.details.transmissionAutomatic')
                          : t('autoSales.details.transmissionManual')}
                      </span>
                      {vehicle.mileage && (
                        <span>
                          {' '}
                          • <span className={styles.mileageText}>
                            {vehicle.mileage?.toLocaleString()} km
                          </span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
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
  );
}
