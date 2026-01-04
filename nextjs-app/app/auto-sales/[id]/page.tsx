'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { vehiclesAPI, reservationsAPI } from '@/lib/services/api';
import styles from './page.module.css';

const getImageUrl = (imageUrl: string | null | undefined): string | null => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads')) return imageUrl;
  return imageUrl.startsWith('/') ? imageUrl : `/uploads/${imageUrl}`;
};

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type: string;
  transmission: string;
  color?: string;
  description?: string;
  images?: Array<{ image_url: string; is_primary: boolean }>;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  message: string;
  preferred_date: string;
  preferred_time: string;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const vehicleId = params.id as string;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    message: '',
    preferred_date: '',
    preferred_time: '',
  });

  useEffect(() => {
    if (vehicleId) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const response = await vehiclesAPI.getById(vehicleId);
      setVehicle(response.data.vehicle);
    } catch (error: any) {
      console.error('Error loading vehicle:', error);
      showError('Araç yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reservationsAPI.create({
        vehicle_id: vehicleId,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        message: formData.message,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
      });
      showSuccess(String(t('autoSales.forms.reservation.success') || 'Rezervasyon başarıyla gönderildi'));
      setShowReservationForm(false);
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        message: '',
        preferred_date: '',
        preferred_time: '',
      });
    } catch (error: any) {
      showError(String(t('autoSales.forms.reservation.error') || 'Rezervasyon gönderilirken hata oluştu'));
    }
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        {t('common.loading') || 'Yükleniyor...'}
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className={styles.error}>
        {t('autoSales.errors.notFound') || 'Araç bulunamadı'}
      </div>
    );
  }

  const validImages = vehicle.images?.filter((img) => getImageUrl(img.image_url)) || [];
  const mainImageUrl = validImages[selectedImageIndex]
    ? getImageUrl(validImages[selectedImageIndex].image_url)
    : null;

  return (
    <div className={styles.vehicleDetailPage}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← {t('common.back') || 'Geri'}
      </button>

      <div className={styles.vehicleContent}>
        <div className={styles.vehicleImagesContainer}>
          {validImages.length > 0 ? (
            <>
              <div className={styles.mainImageWrapper}>
                <img
                  src={mainImageUrl || ''}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className={styles.mainImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              {validImages.length > 1 && (
                <div className={styles.thumbnailGallery}>
                  {validImages.map((image, index) => {
                    const thumbUrl = getImageUrl(image.image_url);
                    return thumbUrl ? (
                      <div
                        key={index}
                        className={`${styles.thumbnailItem} ${
                          index === selectedImageIndex ? styles.active : ''
                        }`}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <img
                          src={thumbUrl}
                          alt={`${vehicle.brand} ${vehicle.model} - ${index + 1}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </>
          ) : (
            <div className={styles.noImage}>{String(t('common.noImage') || '')}</div>
          )}
        </div>

        <div className={styles.vehicleDetails}>
          <h1>
            <span>
              {vehicle.brand} {vehicle.model}
            </span>
            <span className={styles.price}>
              $
              {Math.round(Number(vehicle.price)).toLocaleString('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </h1>

          <div className={styles.specsCards}>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>⛽</div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>{String(t('autoSales.details.specs.fuelType') || '')}</div>
                <div className={styles.specValue}>
                  {vehicle.fuel_type === 'petrol'
                    ? String(t('autoSales.details.fuelPetrol') || '')
                    : vehicle.fuel_type === 'diesel'
                      ? String(t('autoSales.details.fuelDiesel') || '')
                      : vehicle.fuel_type === 'electric'
                        ? String(t('autoSales.details.fuelElectric') || '')
                        : vehicle.fuel_type === 'hybrid'
                          ? String(t('autoSales.details.fuelHybrid') || '')
                          : vehicle.fuel_type === 'lpg'
                            ? String(t('autoSales.details.fuelLpg') || '')
                            : vehicle.fuel_type || 'N/A'}
                </div>
              </div>
            </div>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>⚙️</div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>
                  {String(t('autoSales.details.specs.transmission') || '')}
                </div>
                <div className={styles.specValue}>
                  {vehicle.transmission === 'automatic'
                    ? String(t('autoSales.details.transmissionAutomatic') || '')
                    : String(t('autoSales.details.transmissionManual') || '')}
                </div>
              </div>
            </div>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>📅</div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>{String(t('autoSales.details.year') || 'Yıl')}</div>
                <div className={styles.specValue}>{vehicle.year}</div>
              </div>
            </div>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>📏</div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>{String(t('autoSales.details.specs.mileage') || '')}</div>
                <div className={styles.specValue}>
                  {vehicle.mileage?.toLocaleString() || 'N/A'} km
                </div>
              </div>
            </div>
            <div className={styles.specCard}>
              <div className={styles.specIcon}>🎨</div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>{String(t('autoSales.details.specs.color') || '')}</div>
                <div className={styles.specValue}>
                  {vehicle.color
                    ? (() => {
                        const colorKey = vehicle.color.trim().toLowerCase();
                        let translated = t(`vehicles.colors.${colorKey}`);
                        if (translated === `vehicles.colors.${colorKey}`) {
                          translated = t(`autoSales.details.colors.${colorKey}`);
                          if (translated === `autoSales.details.colors.${colorKey}`) {
                            const capitalized = colorKey.charAt(0).toUpperCase() + colorKey.slice(1);
                            translated = t(`vehicles.colors.${capitalized}`);
                            if (translated === `vehicles.colors.${capitalized}`) {
                              translated = t(`autoSales.details.colors.${capitalized}`);
                              if (translated === `autoSales.details.colors.${capitalized}`) {
                                return colorKey;
                              }
                            }
                          }
                        }
                        return String(translated);
                      })()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {vehicle.description && (
            <div className={styles.description}>
              <h3>{String(t('autoSales.details.description') || '')}</h3>
              <p>{vehicle.description}</p>
            </div>
          )}

          <div className={styles.actions}>
            <button
              onClick={() => setShowReservationForm(true)}
              className={styles.btnPrimary}
            >
              {String(t('autoSales.details.reservation') || '')}
            </button>
          </div>
        </div>
      </div>

      {showReservationForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{String(t('autoSales.forms.reservation.title') || '')}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowReservationForm(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleReservationSubmit}>
              <input
                type="text"
                name="customer_name"
                placeholder={String(t('autoSales.forms.reservation.name') || '')}
                value={formData.customer_name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="customer_email"
                placeholder={String(t('autoSales.forms.reservation.email') || '')}
                value={formData.customer_email}
                onChange={handleInputChange}
                required
              />
              <input
                type="tel"
                name="customer_phone"
                placeholder={String(t('autoSales.forms.reservation.phone') || '')}
                value={formData.customer_phone}
                onChange={handleInputChange}
                required
              />
              <input
                type="date"
                name="preferred_date"
                placeholder={String(t('autoSales.forms.reservation.preferredDate') || 'Tercih Edilen Tarih')}
                value={formData.preferred_date}
                onChange={handleInputChange}
                required
              />
              <input
                type="time"
                name="preferred_time"
                placeholder={String(t('autoSales.forms.reservation.preferredTime') || 'Tercih Edilen Saat')}
                value={formData.preferred_time}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="message"
                placeholder={String(t('autoSales.forms.reservation.message') || '')}
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
              />
              <div className={styles.modalActions}>
                <button type="submit">{String(t('autoSales.forms.reservation.submit') || '')}</button>
                <button type="button" onClick={() => setShowReservationForm(false)}>
                  {String(t('autoSales.forms.reservation.cancel') || '')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

