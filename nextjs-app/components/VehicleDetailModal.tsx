'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { vehiclesAPI, reservationsAPI } from '@/lib/services/api';
import styles from './VehicleDetailModal.module.css';

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

interface VehicleDetailModalProps {
  vehicleId: string;
  onClose: () => void;
}

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

export default function VehicleDetailModal({ vehicleId, onClose }: VehicleDetailModalProps) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLightbox) {
          setShowLightbox(false);
        } else if (showReservationForm) {
          setShowReservationForm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showLightbox, showReservationForm, onClose]);

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
        ...formData,
      });
      showSuccess(t('common.success') || 'Başarılı!');
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
      showError(
        'Rezervasyon gönderilirken hata oluştu: ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleModalClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!vehicleId) return null;

  if (loading) {
    return (
      <div className={styles.vehicleModalOverlay} onClick={handleModalClose}>
        <div className={styles.vehicleModalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.loading}>{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className={styles.vehicleModalOverlay} onClick={handleModalClose}>
        <div className={styles.vehicleModalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.error}>{t('common.error')}</div>
        </div>
      </div>
    );
  }

  const validImages =
    vehicle?.images && Array.isArray(vehicle.images)
      ? vehicle.images.filter((img) => {
          const url = getImageUrl(img?.image_url);
          return url !== null;
        })
      : [];

  const mainImageUrl = validImages[selectedImageIndex]
    ? getImageUrl(validImages[selectedImageIndex].image_url)
    : null;

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleMainImageClick = () => {
    if (mainImageUrl) {
      setShowLightbox(true);
    }
  };

  const handleLightboxClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowLightbox(false);
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className={styles.vehicleModalOverlay} onClick={handleModalClose}>
        <div className={styles.vehicleModalContent} onClick={(e) => e.stopPropagation()}>
          <button className={styles.vehicleModalClose} onClick={onClose}>
            ×
          </button>

          <div className={styles.vehicleModalBody}>
            <div className={styles.vehicleImagesContainer}>
              {validImages.length > 0 ? (
                <>
                  <div className={styles.mainImageWrapper} onClick={handleMainImageClick}>
                    <img
                      src={mainImageUrl || ''}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className={styles.mainImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className={styles.imageZoomHint}>
                      🔍 {t('autoSales.details.clickToZoom') || 'Büyütmek için tıklayın'}
                    </div>
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
                <div className={styles.noImage}>{t('common.noImage')}</div>
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
                    <div className={styles.specLabel}>{t('autoSales.details.specs.fuelType')}</div>
                    <div className={styles.specValue}>
                      {vehicle.fuel_type === 'petrol'
                        ? t('autoSales.details.fuelPetrol')
                        : vehicle.fuel_type === 'diesel'
                          ? t('autoSales.details.fuelDiesel')
                          : vehicle.fuel_type === 'electric'
                            ? t('autoSales.details.fuelElectric')
                            : vehicle.fuel_type === 'hybrid'
                              ? t('autoSales.details.fuelHybrid')
                              : vehicle.fuel_type === 'lpg'
                                ? t('autoSales.details.fuelLpg')
                                : vehicle.fuel_type || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>⚙️</div>
                  <div className={styles.specContent}>
                    <div className={styles.specLabel}>
                      {t('autoSales.details.specs.transmission')}
                    </div>
                    <div className={styles.specValue}>
                      {vehicle.transmission === 'automatic'
                        ? t('autoSales.details.transmissionAutomatic')
                        : t('autoSales.details.transmissionManual')}
                    </div>
                  </div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>📅</div>
                  <div className={styles.specContent}>
                    <div className={styles.specLabel}>{t('autoSales.details.year') || 'Yıl'}</div>
                    <div className={styles.specValue}>{vehicle.year}</div>
                  </div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>📏</div>
                  <div className={styles.specContent}>
                    <div className={styles.specLabel}>{t('autoSales.details.specs.mileage')}</div>
                    <div className={styles.specValue}>
                      {vehicle.mileage?.toLocaleString() || 'N/A'} km
                    </div>
                  </div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specIcon}>🎨</div>
                  <div className={styles.specContent}>
                    <div className={styles.specLabel}>{t('autoSales.details.specs.color')}</div>
                    <div className={styles.specValue}>
                      {vehicle.color
                        ? t(`autoSales.details.colors.${vehicle.color}`) || vehicle.color
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {vehicle.description && (
                <div className={styles.description}>
                  <h3>{t('autoSales.details.description')}</h3>
                  <p>{vehicle.description}</p>
                </div>
              )}

              <div className={styles.actions}>
                <button
                  onClick={() => setShowReservationForm(true)}
                  className={styles.btnPrimary}
                >
                  {t('autoSales.details.reservation')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReservationForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
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
                rows={4}
              />
              <div className={styles.modalActions}>
                <button type="submit">{t('autoSales.forms.reservation.submit')}</button>
                <button type="button" onClick={() => setShowReservationForm(false)}>
                  {t('autoSales.forms.reservation.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLightbox && mainImageUrl && (
        <div className={styles.lightbox} onClick={handleLightboxClose}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setShowLightbox(false)}>
              ×
            </button>
            {validImages.length > 1 && (
              <>
                <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={handlePrevImage}>
                  ‹
                </button>
                <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={handleNextImage}>
                  ›
                </button>
              </>
            )}
            <img
              src={mainImageUrl}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className={styles.lightboxImage}
            />
            {validImages.length > 1 && (
              <div className={styles.lightboxCounter}>
                {selectedImageIndex + 1} / {validImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

