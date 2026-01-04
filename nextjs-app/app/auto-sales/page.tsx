'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { vehiclesAPI } from '@/lib/services/api';
import { carBrandsAndModels, years } from '@/lib/data/carBrands';
import CountdownTimer from '@/components/CountdownTimer';
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
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    setIsMounted(true);
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
    // Close filter on mobile after search
    if (window.innerWidth <= 768) {
      setIsFilterOpen(false);
    }
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleVehicleClick = (vehicleId: string) => {
    // Her zaman sayfaya yönlendir
    router.push(`/auto-sales/${vehicleId}`);
  };

  return (
    <div className={styles.autoSalesPage}>
      <div className={styles.container}>
        <div className={styles.filtersSection}>
          <button
            type="button"
            onClick={toggleFilter}
            className={styles.filterToggle}
            aria-expanded={isFilterOpen}
          >
            {isMounted ? t('autoSales.filters.filter') : 'Filtrele'}
            <span className={styles.filterToggleIcon}>
              {isFilterOpen ? '▲' : '▼'}
            </span>
          </button>
          <form
            onSubmit={handleFilterSubmit}
            className={`${styles.filtersForm} ${isFilterOpen ? styles.filtersFormOpen : ''}`}
          >
            <select name="brand" value={filters.brand} onChange={handleFilterChange}>
              <option value="">{isMounted ? t('autoSales.filters.brand') : 'Marka'}</option>
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
              <option value="">{isMounted ? t('autoSales.filters.model') : 'Model'}</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">{isMounted ? t('autoSales.filters.year') : 'Yıl'}</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="minPrice"
              placeholder={isMounted ? t('autoSales.filters.minPrice') : 'Min Fiyat'}
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
            <input
              type="number"
              name="maxPrice"
              placeholder={isMounted ? t('autoSales.filters.maxPrice') : 'Max Fiyat'}
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
            <button type="submit">{isMounted ? t('autoSales.filters.filter') : 'Filtrele'}</button>
          </form>
        </div>

        {loading ? (
          <div className={styles.loading}>{isMounted ? t('autoSales.loading') : 'Araçlar yükleniyor...'}</div>
        ) : !vehicles || vehicles.length === 0 ? (
          <div className={styles.noResults}>{isMounted ? t('autoSales.noResults') : 'Araç bulunamadı'}</div>
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
                  onClick={() => handleVehicleClick(vehicle.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {isReserved && (
                    <>
                      <div className={styles.reservedBadge}>
                        <span className={styles.reservedText}>
                          {isMounted ? t('autoSales.reserved') : 'REZERVE'}
                        </span>
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
                      {isMounted ? t('common.noImage') : 'Resim Yok'}
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
                    <div className={styles.vehicleDetails}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>📅</span>
                        <span className={styles.detailText}>{vehicle.year}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailIcon}>⚙️</span>
                        <span className={styles.detailText}>
                          {isMounted
                            ? vehicle.transmission === 'automatic'
                              ? t('autoSales.details.transmissionAutomatic')
                              : t('autoSales.details.transmissionManual')
                            : vehicle.transmission === 'automatic'
                              ? 'Otomatik'
                              : 'Manuel'}
                        </span>
                      </div>
                      {vehicle.mileage && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailIcon}>📏</span>
                          <span className={styles.detailText}>
                            {vehicle.mileage?.toLocaleString()} km
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
