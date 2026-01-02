'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { adminReservationsAPI, adminVehiclesAPI, adminRepairAPI, adminCarWashAPI, adminSettingsAPI } from '@/lib/services/adminApi';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { findVehicleImage } from '@/lib/utils/vehicleImageService';
import styles from './reservations.module.css';

const getImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${imageUrl}`;
  }
  return imageUrl;
};

interface Reservation {
  id: number | string;
  vehicle_id?: number | null;
  brand?: string;
  model?: string;
  year?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  created_at: string;
  vehicleImage?: string | null;
}

interface TestDrive {
  id: number | string;
  vehicle_id?: number | null;
  brand?: string;
  model?: string;
  year?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: string;
  created_at: string;
  vehicleImage?: string | null;
}

interface RepairQuote {
  id: number | string;
  vehicle_id?: number | null;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  customer_name?: string;
  customer_phone?: string;
  total_price?: number | string;
  status: string;
  created_at: string;
  vehicleImage?: string | null;
}

interface CarWashAppointment {
  id: number | string;
  vehicle_brand?: string;
  vehicle_model?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  package_name?: string;
  package_price?: number | string;
  appointment_date?: string;
  appointment_time?: string;
  total_price?: number | string;
  status: string;
  notes?: string;
  addons?: Array<{ addon_name: string; price: number | string }>;
}

interface DeleteModalState {
  isOpen: boolean;
  reservationId: number | string | null;
  vehicleId: number | null;
  isSynthetic: boolean;
  type: 'reservation' | 'testDrive' | 'repairQuote' | 'carWash' | null;
  title: string;
  message: string;
}

interface CarWashDetailModalState {
  isOpen: boolean;
  appointment: CarWashAppointment | null;
}

interface PendingCounts {
  reservations: number;
  testDrives: number;
  repairQuotes: number;
  carWash: number;
}

export default function ReservationsPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'reservations' | 'testDrives' | 'repairQuotes' | 'carWash'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [repairQuotes, setRepairQuotes] = useState<RepairQuote[]>([]);
  const [carWashAppointments, setCarWashAppointments] = useState<CarWashAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    reservationId: null,
    vehicleId: null,
    isSynthetic: false,
    type: null,
    title: '',
    message: '',
  });
  const [carWashDetailModal, setCarWashDetailModal] = useState<CarWashDetailModalState>({ isOpen: false, appointment: null });
  const [pendingCounts, setPendingCounts] = useState<PendingCounts>({
    reservations: 0,
    testDrives: 0,
    repairQuotes: 0,
    carWash: 0,
  });
  const [taxRate, setTaxRate] = useState(0);
  const [federalTaxRate, setFederalTaxRate] = useState(0);
  const [provincialTaxRate, setProvincialTaxRate] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [reservationsRes, testDrivesRes, repairQuotesRes, carWashRes] = await Promise.all([
        adminReservationsAPI.getAll().catch((err) => {
          console.error('Error loading reservations:', err);
          return { data: { reservations: [] } };
        }),
        adminReservationsAPI.getTestDrives().catch((err) => {
          console.error('Error loading test drives:', err);
          return { data: { testDriveRequests: [] } };
        }),
        adminRepairAPI.getQuotes().catch((err) => {
          console.error('Error loading repair quotes:', err);
          return { data: { quotes: [] } };
        }),
        adminCarWashAPI.getAppointments().catch((err) => {
          console.error('Error loading car wash appointments:', err);
          return { data: { appointments: [] } };
        }),
      ]);

      const reservationsData = (reservationsRes.data?.reservations || []) as Reservation[];
      const testDrivesData = (testDrivesRes.data?.testDriveRequests || []) as TestDrive[];
      const repairQuotesData = (repairQuotesRes.data?.quotes || []) as RepairQuote[];
      const carWashData = (carWashRes.data?.appointments || []) as CarWashAppointment[];

      setPendingCounts({
        reservations: reservationsData.filter((r) => r.status === 'pending').length,
        testDrives: testDrivesData.filter((td) => td.status === 'pending').length,
        repairQuotes: repairQuotesData.filter((rq) => rq.status === 'pending').length,
        carWash: carWashData.filter((cw) => cw.status === 'pending').length,
      });

      // Optimize: Batch load vehicle images instead of individual calls
      const uniqueVehicleIds = [...new Set(reservationsData.map(r => r.vehicle_id).filter((id): id is number => id != null && typeof id === 'number'))];
      const vehicleImageMap = new Map<number, string | null>();
      
      // Load images in parallel but limit concurrency
      const IMAGE_BATCH_SIZE = 10;
      for (let i = 0; i < uniqueVehicleIds.length; i += IMAGE_BATCH_SIZE) {
        const batch = uniqueVehicleIds.slice(i, i + IMAGE_BATCH_SIZE);
        await Promise.all(
          batch.map(async (vehicleId) => {
            try {
              const vehicleRes = await adminVehiclesAPI.getById(String(vehicleId));
              const images = vehicleRes.data?.vehicle?.images || [];
              const primaryImage = images.find((img: any) => img.is_primary) || images[0];
              vehicleImageMap.set(vehicleId, primaryImage ? getImageUrl(primaryImage.image_url) : null);
            } catch (error) {
              console.error('Error loading vehicle image:', error);
              vehicleImageMap.set(vehicleId, null);
            }
          })
        );
      }
      
      const reservationsWithImages = reservationsData.map((reservation) => ({
        ...reservation,
        vehicleImage: reservation.vehicle_id ? vehicleImageMap.get(reservation.vehicle_id) || null : null,
      }));

      // Optimize: Batch load test drive vehicle images
      const testDriveVehicleIds = [...new Set(testDrivesData.map(td => td.vehicle_id).filter((id): id is number => id != null && typeof id === 'number'))];
      const testDriveImageMap = new Map<number, string | null>();
      
      for (let i = 0; i < testDriveVehicleIds.length; i += IMAGE_BATCH_SIZE) {
        const batch = testDriveVehicleIds.slice(i, i + IMAGE_BATCH_SIZE);
        await Promise.all(
          batch.map(async (vehicleId) => {
            try {
              const vehicleRes = await adminVehiclesAPI.getById(String(vehicleId));
              const images = vehicleRes.data?.vehicle?.images || [];
              const primaryImage = images.find((img: any) => img.is_primary) || images[0];
              testDriveImageMap.set(vehicleId, primaryImage ? getImageUrl(primaryImage.image_url) : null);
            } catch (error) {
              console.error('Error loading vehicle image:', error);
              testDriveImageMap.set(vehicleId, null);
            }
          })
        );
      }
      
      // Handle test drives without vehicle_id by searching
      const testDrivesWithImages = await Promise.all(
        testDrivesData.map(async (testDrive) => {
          if (testDrive.vehicle_id && testDriveImageMap.has(testDrive.vehicle_id)) {
            return {
              ...testDrive,
              vehicleImage: testDriveImageMap.get(testDrive.vehicle_id),
            };
          }
          
          if (testDrive.brand && testDrive.model) {
            try {
              const vehicleInfo = await findVehicleImage(adminVehiclesAPI, testDrive.brand, testDrive.model, testDrive.year || null);
              if (vehicleInfo && vehicleInfo.image) {
                return {
                  ...testDrive,
                  vehicleImage: vehicleInfo.image,
                  vehicle_id: vehicleInfo.vehicleId || testDrive.vehicle_id,
                };
              }
            } catch (error) {
              console.error('Error finding vehicle image:', error);
            }
          }
          
          return { ...testDrive, vehicleImage: null };
        })
      );

      const repairQuotesWithImages = await Promise.all(
        repairQuotesData.map(async (quote) => {
          try {
            if (quote.vehicle_brand && quote.vehicle_model) {
              const vehicleInfo = await findVehicleImage(
                adminVehiclesAPI,
                quote.vehicle_brand,
                quote.vehicle_model,
                quote.vehicle_year || null
              );
              if (vehicleInfo && vehicleInfo.image) {
                return {
                  ...quote,
                  vehicleImage: vehicleInfo.image,
                  vehicle_id: vehicleInfo.vehicleId,
                };
              }
            }
            return { ...quote, vehicleImage: null };
          } catch (error) {
            console.error('Error loading vehicle image for repair quote:', error);
            return { ...quote, vehicleImage: null };
          }
        })
      );

      const carWashWithImages = carWashData.map((appointment) => ({
        ...appointment,
        vehicleImage: null,
      }));

      setReservations(reservationsWithImages);
      setTestDrives(testDrivesWithImages);
      setRepairQuotes(repairQuotesWithImages);
      setCarWashAppointments(carWashWithImages);
    } catch (error: any) {
      console.error('Error loading data:', error);
      showError('Veri yüklenirken hata oluştu: ' + (error.response?.data?.error || error.message));
      setReservations([]);
      setTestDrives([]);
      setRepairQuotes([]);
      setCarWashAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReservationStatusUpdate = async (id: number | string, status: string) => {
    try {
      const isSynthetic = id && id.toString().startsWith('vehicle-');
      if (isSynthetic) {
        showError('Sentetik rezervasyonlar için durum güncellemesi yapılamaz.');
        return;
      }
      await adminReservationsAPI.updateStatus(String(id), status);
      showSuccess(t('reservations.updatedSuccessfully') || 'Durum başarıyla güncellendi!');
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showError((t('reservations.errors.updating') || 'Güncelleme hatası') + ': ' + errorMessage);
    }
  };

  const handleTestDriveStatusUpdate = async (id: number | string, status: string) => {
    try {
      await adminReservationsAPI.updateTestDriveStatus(String(id), status);
      showSuccess(t('reservations.updatedSuccessfully') || 'Durum başarıyla güncellendi!');
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showError((t('reservations.errors.updating') || 'Güncelleme hatası') + ': ' + errorMessage);
    }
  };

  const handleRepairQuoteStatusUpdate = async (id: number | string, status: string) => {
    try {
      await adminRepairAPI.updateQuoteStatus(String(id), status);
      showSuccess(t('repairQuotes.updatedSuccessfully') || 'Durum başarıyla güncellendi!');
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showError((t('repairQuotes.errors.updating') || 'Güncelleme hatası') + ': ' + errorMessage);
    }
  };

  const handleCarWashStatusUpdate = async (id: number | string, status: string) => {
    try {
      await adminCarWashAPI.updateAppointmentStatus(String(id), status);
      showSuccess(t('adminCarWash.updatedSuccessfully') || 'Durum başarıyla güncellendi!');
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showError((t('adminCarWash.errors.updating') || 'Güncelleme hatası') + ': ' + errorMessage);
    }
  };

  const handleDelete = (id: number | string, vehicleId: number | null, type: 'reservation' | 'testDrive' | 'repairQuote' | 'carWash') => {
    const isSynthetic = Boolean(id && id.toString().startsWith('vehicle-'));
    const title = t('reservations.confirmDeleteTitle') || 'Rezervasyonu Sil';
    const message = t('reservations.confirmDelete') || 'Bu rezervasyonu silmek istediğinizden emin misiniz?';
    setDeleteModal({
      isOpen: true,
      reservationId: id,
      vehicleId: vehicleId || null,
      isSynthetic,
      type,
      title,
      message,
    });
  };

  const handleTestDriveDelete = (id: number | string) => {
    const title = t('reservations.confirmDeleteTitle') || 'Test Sürüşü Talebini Sil';
    const message = t('reservations.confirmDelete') || 'Bu test sürüşü talebini silmek istediğinizden emin misiniz?';
    setDeleteModal({
      isOpen: true,
      reservationId: id,
      vehicleId: null,
      isSynthetic: false,
      type: 'testDrive',
      title,
      message,
    });
  };

  const handleRepairQuoteDelete = (id: number | string) => {
    const title = t('reservations.confirmDeleteTitle') || 'Tamir Teklifini Sil';
    const message = t('reservations.confirmDelete') || 'Bu tamir teklifini silmek istediğinizden emin misiniz?';
    setDeleteModal({
      isOpen: true,
      reservationId: id,
      vehicleId: null,
      isSynthetic: false,
      type: 'repairQuote',
      title,
      message,
    });
  };

  const handleCarWashDelete = (id: number | string) => {
    const title = t('reservations.confirmDeleteTitle') || 'Oto Yıkama Randevusunu Sil';
    const message = t('reservations.confirmDelete') || 'Bu oto yıkama randevusunu silmek istediğinizden emin misiniz?';
    setDeleteModal({
      isOpen: true,
      reservationId: id,
      vehicleId: null,
      isSynthetic: false,
      type: 'carWash',
      title,
      message,
    });
  };

  const confirmDelete = async () => {
    const { reservationId, vehicleId, isSynthetic, type } = deleteModal;
    try {
      if (type === 'reservation') {
        if (isSynthetic && vehicleId) {
          await adminVehiclesAPI.update(String(vehicleId), { status: 'available', reservation_end_time: null });
        } else if (reservationId) {
          await adminReservationsAPI.delete(String(reservationId));
        }
        showSuccess(t('reservations.deletedSuccessfully') || 'Rezervasyon başarıyla silindi!');
      } else if (type === 'testDrive' && reservationId) {
        await adminReservationsAPI.deleteTestDrive(String(reservationId));
        showSuccess(t('reservations.deletedSuccessfully') || 'Test sürüşü talebi başarıyla silindi!');
      } else if (type === 'repairQuote' && reservationId) {
        await adminRepairAPI.deleteQuote(String(reservationId));
        showSuccess(t('reservations.deletedSuccessfully') || 'Tamir teklifi başarıyla silindi!');
      } else if (type === 'carWash' && reservationId) {
        await adminCarWashAPI.deleteAppointment(String(reservationId));
        showSuccess(t('reservations.deletedSuccessfully') || 'Oto yıkama randevusu başarıyla silindi!');
      }
      setDeleteModal({
        isOpen: false,
        reservationId: null,
        vehicleId: null,
        isSynthetic: false,
        type: null,
        title: '',
        message: '',
      });
      loadData();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      showError((t('reservations.errors.deleting') || 'Silme hatası') + ': ' + errorMessage);
    }
  };

  const openVehicleDetail = (vehicleId: number | null | undefined) => {
    if (vehicleId) {
      const frontendUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      window.open(`${frontendUrl}/auto-sales/${vehicleId}`, '_blank');
    }
  };

  if (loading) return <div className={styles.loading}>{t('common.loading') || 'Yükleniyor...'}</div>;

  // Filter data based on search term
  const filterData = <T extends { customer_name?: string; customer_email?: string; customer_phone?: string; vehicle_brand?: string; vehicle_model?: string; brand?: string; model?: string; status?: string }>(data: T[]): T[] => {
    if (!searchTerm.trim()) return data;
    const search = searchTerm.toLowerCase().trim();
    return data.filter(item => {
      const name = (item.customer_name || '').toLowerCase();
      const email = (item.customer_email || '').toLowerCase();
      const phone = (item.customer_phone || '').toLowerCase();
      const brand = ((item.vehicle_brand || item.brand) || '').toLowerCase();
      const model = ((item.vehicle_model || item.model) || '').toLowerCase();
      const status = (item.status || '').toLowerCase();
      return name.includes(search) || email.includes(search) || phone.includes(search) || brand.includes(search) || model.includes(search) || status.includes(search);
    });
  };

  const filteredReservations = filterData(reservations);
  const filteredTestDrives = filterData(testDrives);
  const filteredRepairQuotes = filterData(repairQuotes);
  const filteredCarWash = filterData(carWashAppointments);

  const renderReservationsCards = () => {
    if (filteredReservations.length === 0) {
      return <div className={styles.noData}>{t('reservations.noReservations') || 'Rezervasyon bulunamadı'}</div>;
    }

    return (
      <div className={styles.reservationsCardsContainer}>
        {filteredReservations.map((reservation) => (
          <div key={reservation.id} className={styles.reservationCard}>
            <div className={styles.reservationCardImage}>
              {reservation.vehicleImage ? (
                <img
                  src={reservation.vehicleImage}
                  alt={`${reservation.brand} ${reservation.model}`}
                  onClick={() => openVehicleDetail(reservation.vehicle_id)}
                  style={{ cursor: 'pointer' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.vehicleImagePlaceholder}>
                  <span>🚗</span>
                  <span>
                    {reservation.brand} {reservation.model}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.reservationCardContent}>
              <div className={styles.reservationCardHeader}>
                <h3>
                  {reservation.brand} {reservation.model} {reservation.year}
                </h3>
                <span className={`${styles.statusBadge} ${styles[`status${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1).toLowerCase()}`]}`}>
                  {reservation.status === 'pending'
                    ? t('reservations.statusPending') || 'Beklemede'
                    : reservation.status === 'confirmed'
                    ? t('reservations.statusConfirmed') || 'Onaylandı'
                    : reservation.status === 'cancelled'
                    ? t('reservations.statusCancelled') || 'İptal Edildi'
                    : reservation.status === 'completed'
                    ? t('reservations.statusCompleted') || 'Tamamlandı'
                    : reservation.status}
                </span>
              </div>

              <div className={styles.reservationCardDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className={styles.detailValue}>{reservation.customer_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.email') || 'E-posta'}:</span>
                  <span className={styles.detailValue}>{reservation.customer_email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.phone') || 'Telefon'}:</span>
                  <span className={styles.detailValue}>{reservation.customer_phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.date') || 'Tarih'}:</span>
                  <span className={styles.detailValue}>{new Date(reservation.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <div className={styles.reservationCardActions}>
                {reservation.status === 'pending' && !reservation.id?.toString().startsWith('vehicle-') && (
                  <>
                    <button className={styles.btnAccept} onClick={() => handleReservationStatusUpdate(reservation.id, 'confirmed')}>
                      {t('reservations.accept') || 'Kabul Et'}
                    </button>
                    <button className={styles.btnReject} onClick={() => handleReservationStatusUpdate(reservation.id, 'cancelled')}>
                      {t('reservations.reject') || 'Red Et'}
                    </button>
                  </>
                )}
                <button className={styles.btnDelete} onClick={() => handleDelete(reservation.id, reservation.vehicle_id || null, 'reservation')}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTestDrivesCards = () => {
    if (filteredTestDrives.length === 0) {
      return <div className={styles.noData}>{t('reservations.noTestDrives') || 'Test sürüşü talebi bulunamadı'}</div>;
    }

    return (
      <div className={styles.reservationsCardsContainer}>
        {filteredTestDrives.map((testDrive) => (
          <div key={testDrive.id} className={styles.reservationCard}>
            <div className={styles.reservationCardImage}>
              {testDrive.vehicleImage ? (
                <img
                  src={testDrive.vehicleImage}
                  alt={`${testDrive.brand} ${testDrive.model}`}
                  onClick={() => testDrive.vehicle_id && openVehicleDetail(testDrive.vehicle_id)}
                  style={{ cursor: testDrive.vehicle_id ? 'pointer' : 'default' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.vehicleImagePlaceholder}>
                  <span>🚗</span>
                  <span>
                    {testDrive.brand} {testDrive.model}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.reservationCardContent}>
              <div className={styles.reservationCardHeader}>
                <h3>
                  {testDrive.brand} {testDrive.model} {testDrive.year}
                </h3>
                <span className={`${styles.statusBadge} ${styles[`status${testDrive.status.charAt(0).toUpperCase() + testDrive.status.slice(1).toLowerCase()}`]}`}>
                  {testDrive.status === 'pending'
                    ? t('reservations.statusPending') || 'Beklemede'
                    : testDrive.status === 'confirmed'
                    ? t('reservations.statusConfirmed') || 'Onaylandı'
                    : testDrive.status === 'cancelled'
                    ? t('reservations.statusCancelled') || 'İptal Edildi'
                    : testDrive.status === 'completed'
                    ? t('reservations.statusCompleted') || 'Tamamlandı'
                    : testDrive.status}
                </span>
              </div>

              <div className={styles.reservationCardDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className={styles.detailValue}>{testDrive.customer_name || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.email') || 'E-posta'}:</span>
                  <span className={styles.detailValue}>{testDrive.customer_email || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.phone') || 'Telefon'}:</span>
                  <span className={styles.detailValue}>{testDrive.customer_phone || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.date') || 'Tarih'}:</span>
                  <span className={styles.detailValue}>{new Date(testDrive.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <div className={styles.reservationCardActions}>
                {testDrive.status === 'pending' && (
                  <>
                    <button className={styles.btnAccept} onClick={() => handleTestDriveStatusUpdate(testDrive.id, 'confirmed')}>
                      {t('reservations.accept') || 'Kabul Et'}
                    </button>
                    <button className={styles.btnReject} onClick={() => handleTestDriveStatusUpdate(testDrive.id, 'cancelled')}>
                      {t('reservations.reject') || 'Red Et'}
                    </button>
                  </>
                )}
                <button className={styles.btnDelete} onClick={() => handleTestDriveDelete(testDrive.id)}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRepairQuotesCards = () => {
    if (filteredRepairQuotes.length === 0) {
      return <div className={styles.noData}>{t('reservations.noRepairQuotes') || 'Tamir teklifi bulunamadı'}</div>;
    }

    return (
      <div className={styles.reservationsCardsContainer}>
        {filteredRepairQuotes.map((quote) => (
          <div key={quote.id} className={styles.reservationCard}>
            <div className={styles.reservationCardImage}>
              {quote.vehicleImage ? (
                <img
                  src={quote.vehicleImage}
                  alt={`${quote.vehicle_brand} ${quote.vehicle_model}`}
                  onClick={() => quote.vehicle_id && openVehicleDetail(quote.vehicle_id)}
                  style={{ cursor: quote.vehicle_id ? 'pointer' : 'default' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.vehicleImagePlaceholder}>
                  <span>🚗</span>
                  <span>
                    {quote.vehicle_brand} {quote.vehicle_model}
                  </span>
                </div>
              )}
            </div>
            <div className={styles.reservationCardContent}>
              <div className={styles.reservationCardHeader}>
                <h3>
                  {quote.vehicle_brand} {quote.vehicle_model} {quote.vehicle_year}
                </h3>
                <span className={`${styles.statusBadge} ${styles[`status${quote.status.charAt(0).toUpperCase() + quote.status.slice(1).toLowerCase()}`]}`}>
                  {quote.status === 'pending'
                    ? t('repairQuotes.statusPending') || 'Beklemede'
                    : quote.status === 'quoted'
                    ? t('repairQuotes.statusQuoted') || 'Teklif Verildi'
                    : quote.status === 'accepted'
                    ? t('repairQuotes.statusAccepted') || 'Kabul Edildi'
                    : quote.status === 'rejected'
                    ? t('repairQuotes.statusRejected') || 'Reddedildi'
                    : quote.status === 'completed'
                    ? t('repairQuotes.statusCompleted') || 'Tamamlandı'
                    : quote.status}
                </span>
              </div>

              <div className={styles.reservationCardDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className={styles.detailValue}>{quote.customer_name || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.phone') || 'Telefon'}:</span>
                  <span className={styles.detailValue}>{quote.customer_phone || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('repairQuotes.totalPrice') || 'Toplam Fiyat'}:</span>
                  <span className={styles.detailValue}>
                    ${parseFloat((quote.total_price || 0).toString()).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.date') || 'Tarih'}:</span>
                  <span className={styles.detailValue}>{new Date(quote.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              <div className={styles.reservationCardActions}>
                {quote.status === 'pending' && (
                  <button className={styles.btnAccept} onClick={() => handleRepairQuoteStatusUpdate(quote.id, 'quoted')}>
                    Teklif Ver
                  </button>
                )}
                <button className={styles.btnDelete} onClick={() => handleRepairQuoteDelete(quote.id)}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCarWashCards = () => {
    if (filteredCarWash.length === 0) {
      return <div className={styles.noData}>{t('reservations.noCarWash') || 'Oto Yıkama randevusu bulunamadı'}</div>;
    }

    return (
      <div className={styles.reservationsCardsContainer}>
        {filteredCarWash.map((appointment) => (
          <div key={appointment.id} className={styles.reservationCard}>
            <div className={styles.reservationCardImage}>
              <div className={styles.vehicleImagePlaceholder}>
                <span>🚗</span>
                <span>
                  {appointment.vehicle_brand} {appointment.vehicle_model}
                </span>
              </div>
            </div>
            <div className={styles.reservationCardContent}>
              <div className={styles.reservationCardHeader}>
                <h3>
                  {appointment.vehicle_brand} {appointment.vehicle_model}
                </h3>
                <span className={`${styles.statusBadge} ${styles[`status${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase()}`]}`}>
                  {appointment.status === 'pending'
                    ? t('reservations.statusPending') || 'Beklemede'
                    : appointment.status === 'confirmed'
                    ? t('reservations.statusConfirmed') || 'Onaylandı'
                    : appointment.status === 'completed'
                    ? t('reservations.statusCompleted') || 'Tamamlandı'
                    : appointment.status === 'cancelled'
                    ? t('reservations.statusCancelled') || 'İptal Edildi'
                    : appointment.status}
                </span>
              </div>

              <div className={styles.reservationCardDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('reservations.customer') || 'Müşteri'}:</span>
                  <span className={styles.detailValue}>{appointment.customer_name || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('adminCarWash.package') || 'Paket'}:</span>
                  <span className={styles.detailValue}>{appointment.package_name || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('adminCarWash.date') || 'Tarih'}:</span>
                  <span className={styles.detailValue}>
                    {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('adminCarWash.time') || 'Saat'}:</span>
                  <span className={styles.detailValue}>{appointment.appointment_time || '-'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>{t('adminCarWash.total') || 'Toplam'}:</span>
                  <span className={styles.detailValue}>
                    ${parseFloat((appointment.total_price || 0).toString()).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className={styles.reservationCardActions}>
                {appointment.status === 'pending' && (
                  <button className={styles.btnAccept} onClick={() => handleCarWashStatusUpdate(appointment.id, 'confirmed')}>
                    {t('reservations.accept') || 'Kabul Et'}
                  </button>
                )}
                <button
                  className={styles.btnSecondary}
                  onClick={() => setCarWashDetailModal({ isOpen: true, appointment })}
                  style={{ flex: 1, background: '#6c757d', color: 'white', border: 'none' }}
                >
                  {t('reservations.viewDetails') || 'Detaylar'}
                </button>
                <button className={styles.btnDelete} onClick={() => handleCarWashDelete(appointment.id)}>
                  {t('reservations.delete') || 'Sil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handlePrintCarWashReceipt = async (appointment: CarWashAppointment) => {
    try {
      let companyInfo: any = {};
      try {
        const companyResponse = await adminSettingsAPI.getCompanyInfo();
        companyInfo = companyResponse.data?.companyInfo || {};
      } catch (error) {
        console.error('Error loading company info:', error);
      }

      const effectiveFederalRate = federalTaxRate > 0 ? federalTaxRate : (taxRate / 2);
      const effectiveProvincialRate = provincialTaxRate > 0 ? provincialTaxRate : (taxRate / 2);
      const totalTaxRate = effectiveFederalRate + effectiveProvincialRate;
      
      const totalPrice = parseFloat(String(appointment.total_price || 0));
      let basePrice = totalPrice;
      let federalTaxAmount = 0;
      let provincialTaxAmount = 0;
      
      if (totalTaxRate > 0) {
        basePrice = totalPrice / (1 + totalTaxRate / 100);
        federalTaxAmount = basePrice * (effectiveFederalRate / 100);
        provincialTaxAmount = basePrice * (effectiveProvincialRate / 100);
      }

      const addons = appointment.addons || [];

      const receiptHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reçu</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    @media print {
      body { margin: 0; padding: 5mm; }
      .no-print { display: none !important; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Courier New', 'Courier', monospace;
      font-size: 11px;
      line-height: 1.3;
      width: 70mm;
      max-width: 70mm;
      margin: 0 auto;
      padding: 5mm;
      color: #000;
    }
    .receipt-header {
      text-align: center;
      border-bottom: 1px dashed #000;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .company-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
    .company-info {
      font-size: 9px;
      line-height: 1.4;
    }
    .receipt-body {
      margin: 8px 0;
    }
    .section-divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
      padding-top: 8px;
    }
    .info-row {
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }
    .service-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 6px;
      text-align: center;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 4px 0;
    }
    .service-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
      font-size: 10px;
    }
    .total-row {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 2px solid #000;
      font-size: 13px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
    }
    .date-info {
      text-align: center;
      margin-top: 8px;
      font-size: 9px;
      border-top: 1px dashed #000;
      padding-top: 8px;
    }
    .no-print {
      text-align: center;
      margin-top: 20px;
    }
    .no-print button {
      padding: 10px 20px;
      font-size: 14px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 5px;
    }
    .no-print button.close {
      background: #666;
    }
  </style>
</head>
<body>
  <div class="receipt-header">
    <div class="company-name">${companyInfo.company_name || 'KAY Oto Servis'}</div>
    <div class="company-info">
      ${companyInfo.company_address ? `<div>${companyInfo.company_address}</div>` : ''}
      ${companyInfo.company_phone ? `<div>Tel: ${companyInfo.company_phone}</div>` : ''}
      ${companyInfo.company_tax_number ? `<div>No TVA: ${companyInfo.company_tax_number}</div>` : ''}
    </div>
  </div>

  <div class="receipt-body">
    <div class="info-row">
      <span>Client:</span>
      <span>${appointment.customer_name}</span>
    </div>
    ${appointment.customer_phone ? `
    <div class="info-row">
      <span>Tél:</span>
      <span>${appointment.customer_phone}</span>
    </div>
    ` : ''}
    ${appointment.customer_email ? `
    <div class="info-row">
      <span>Email:</span>
      <span>${appointment.customer_email}</span>
    </div>
    ` : ''}
    ${appointment.appointment_date ? `
    <div class="info-row">
      <span>Date:</span>
      <span>${new Date(appointment.appointment_date).toLocaleDateString('fr-CA')}</span>
    </div>
    ` : ''}
    ${appointment.appointment_time ? `
    <div class="info-row">
      <span>Heure:</span>
      <span>${appointment.appointment_time}</span>
    </div>
    ` : ''}

    <div class="section-divider">
      <div class="service-title">SERVICE EFFECTUÉ</div>
      <div class="service-row">
        <span>${appointment.package_name || 'Service'}</span>
        <span>$${basePrice.toFixed(2)}</span>
      </div>
      ${addons.map((addon: any) => `
      <div class="service-row">
        <span>${addon.addon_name || addon.name || 'Addon'}</span>
        <span>$${parseFloat(String(addon.price || 0)).toFixed(2)}</span>
      </div>
      `).join('')}
    </div>

    ${totalTaxRate > 0 ? `
    <div class="section-divider">
      <div class="info-row">
        <span>Sous-total:</span>
        <span>$${basePrice.toFixed(2)}</span>
      </div>
      ${effectiveFederalRate > 0 ? `
      <div class="info-row">
        <span>TPS (${effectiveFederalRate.toFixed(2)}%):</span>
        <span>$${federalTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
      ${effectiveProvincialRate > 0 ? `
      <div class="info-row">
        <span>TVQ (${effectiveProvincialRate.toFixed(2)}%):</span>
        <span>$${provincialTaxAmount.toFixed(2)}</span>
      </div>
      ` : ''}
    </div>
    ` : ''}

    <div class="total-row">
      <span>TOTAL:</span>
      <span>$${totalPrice.toFixed(2)}</span>
    </div>

    <div class="date-info">
      <div>${new Date(appointment.appointment_date || new Date()).toLocaleDateString('fr-CA')}</div>
      <div>Merci de votre visite!</div>
    </div>
  </div>

  <div class="no-print">
    <button onclick="window.print()">Imprimer</button>
    <button class="close" onclick="window.close()">Fermer</button>
  </div>
</body>
</html>
      `;

      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        try {
          printWindow.document.write(receiptHTML);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 1000);
        } catch (error) {
          console.error('Error writing to print window:', error);
          showError(t('adminCarWash.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu');
          printWindow.close();
        }
      } else {
        showError('Popup engellendi. Lütfen popup blocker\'ı kapatın.');
      }
    } catch (error: unknown) {
      console.error('Error printing receipt:', error);
      const err = error as { response?: { data?: { error?: string } }; message?: string };
      showError(t('adminCarWash.errors.printingReceipt') || 'Makbuz yazdırılırken hata oluştu: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    }
  };

  const renderCarWashDetailModal = () => {
    if (!carWashDetailModal.isOpen || !carWashDetailModal.appointment) return null;

    const appointment = carWashDetailModal.appointment;
    const addons = appointment.addons || [];
    const packagePrice = parseFloat((appointment.package_price || 0).toString());
    const addonsTotal = addons.reduce((sum, addon) => sum + parseFloat((addon.price || 0).toString()), 0);
    const calculatedTotal = packagePrice + addonsTotal;

    return (
      <div className={styles.modalOverlay} onClick={() => setCarWashDetailModal({ isOpen: false, appointment: null })}>
        <div className={styles.modalContentDetail} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>{t('adminCarWash.appointmentDetailTitle') || 'Oto Yıkama Randevu Detayları'}</h2>
            <button className={styles.closeButton} onClick={() => setCarWashDetailModal({ isOpen: false, appointment: null })}>
              ×
            </button>
          </div>
          <div className={styles.modalBodyDetail}>
            <div className={styles.detailSection}>
              <h3>{t('adminCarWash.customerInfo') || 'Müşteri Bilgileri'}</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('adminCarWash.name') || 'İsim'}:</span>
                <span className={styles.detailValue}>{appointment.customer_name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('adminCarWash.email') || 'E-posta'}:</span>
                <span className={styles.detailValue}>{appointment.customer_email}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('adminCarWash.phone') || 'Telefon'}:</span>
                <span className={styles.detailValue}>{appointment.customer_phone}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>{t('adminCarWash.appointmentInfo') || 'Randevu Bilgileri'}</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('adminCarWash.date') || 'Tarih'}:</span>
                <span className={styles.detailValue}>{new Date(appointment.appointment_date || '').toLocaleDateString('tr-TR')}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('adminCarWash.time') || 'Saat'}:</span>
                <span className={styles.detailValue}>{appointment.appointment_time}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('adminCarWash.status') || 'Durum'}:</span>
                <span className={`${styles.statusBadge} ${styles[`status${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).toLowerCase()}`]}`}>
                  {appointment.status === 'pending'
                    ? t('reservations.statusPending') || 'Beklemede'
                    : appointment.status === 'confirmed'
                    ? t('reservations.statusConfirmed') || 'Onaylandı'
                    : appointment.status === 'completed'
                    ? t('reservations.statusCompleted') || 'Tamamlandı'
                    : appointment.status === 'cancelled'
                    ? t('reservations.statusCancelled') || 'İptal Edildi'
                    : appointment.status}
                </span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>{t('adminCarWash.servicesToPerform') || 'Yapılacak İşlemler'}</h3>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>{t('adminCarWash.package') || 'Paket'}:</span>
                <span className={styles.detailValue}>
                  {appointment.package_name} - ${packagePrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {addons.length > 0 && (
                <>
                  <div className={styles.detailLabel} style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                    {t('adminCarWash.addons') || 'Ek Özellikler'}:
                  </div>
                  <ul className={styles.addonsList}>
                    {addons.map((addon, index) => (
                      <li key={index}>
                        {addon.addon_name} - ${parseFloat((addon.price || 0).toString()).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {appointment.notes && (
              <div className={styles.detailSection}>
                <h3>{t('adminCarWash.userNote') || 'Kullanıcı Notu'}</h3>
                <div className={styles.notesContent}>{appointment.notes}</div>
              </div>
            )}

            <div className={styles.detailSection}>
              <h3>{t('adminCarWash.priceDetail') || 'Fiyat Detayı'}</h3>
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>{t('adminCarWash.packagePrice') || 'Paket Fiyatı'}:</span>
                  <span>${packagePrice.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className={styles.priceRow}>
                    <span>{t('adminCarWash.addons') || 'Ek Özellikler'}:</span>
                    <span>${addonsTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span>{t('adminCarWash.total') || 'Toplam'}:</span>
                  <span>${calculatedTotal.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {calculatedTotal !== parseFloat((appointment.total_price || 0).toString()) && (
                  <div className={`${styles.priceRow} ${styles.warningRow}`}>
                    <span>Kayıtlı Toplam (veritabanı):</span>
                    <span>${parseFloat((appointment.total_price || 0).toString()).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnPrint}
              onClick={() => handlePrintCarWashReceipt(appointment)}
            >
              🖨️ {t('adminCarWash.printReceipt') || 'Yazdır'}
            </button>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={() => setCarWashDetailModal({ isOpen: false, appointment: null })}
            >
              {t('common.close') || 'Kapat'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.reservationsPage}>
      {error && (
        <div className={styles.errorToast}>
          <div className={styles.errorToastContent}>
            <div className={styles.errorIcon}>⚠</div>
            <div className={styles.errorMessageText}>{error}</div>
            <button className={styles.errorCloseBtn} onClick={() => setError(null)}>
              ×
            </button>
          </div>
        </div>
      )}
      {success && (
        <div className={styles.successToast}>
          <div className={styles.successToastContent}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successMessageText}>{success}</div>
            <button className={styles.successCloseBtn} onClick={() => setSuccess(null)}>
              ×
            </button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>
          {t('reservations.title') || 'Rezervasyonlar ve Talepler'}
          {pendingCounts.reservations > 0 && <span className={styles.notificationBadge}>{pendingCounts.reservations}</span>}
        </h1>
        <input
          type="text"
          placeholder={t('reservations.search') || 'Müşteri, araç veya durum ile ara...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            minWidth: '300px',
          }}
        />
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'reservations' ? styles.active : ''}`}
          onClick={() => setActiveTab('reservations')}
        >
          {t('reservations.tabReservations') || 'Rezervasyonlar'}
          {pendingCounts.reservations > 0 && <span className={styles.tabBadge}>{pendingCounts.reservations}</span>}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'testDrives' ? styles.active : ''}`}
          onClick={() => setActiveTab('testDrives')}
        >
          {t('reservations.tabTestDrives') || 'Test Sürüşleri'}
          {pendingCounts.testDrives > 0 && <span className={styles.tabBadge}>{pendingCounts.testDrives}</span>}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'repairQuotes' ? styles.active : ''}`}
          onClick={() => setActiveTab('repairQuotes')}
        >
          {t('reservations.tabRepairQuotes') || 'Oto Tamir'}
          {pendingCounts.repairQuotes > 0 && <span className={styles.tabBadge}>{pendingCounts.repairQuotes}</span>}
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'carWash' ? styles.active : ''}`}
          onClick={() => setActiveTab('carWash')}
        >
          {t('reservations.tabCarWash') || 'Oto Yıkama'}
          {pendingCounts.carWash > 0 && <span className={styles.tabBadge}>{pendingCounts.carWash}</span>}
        </button>
      </div>

      {activeTab === 'reservations' && renderReservationsCards()}
      {activeTab === 'testDrives' && renderTestDrivesCards()}
      {activeTab === 'repairQuotes' && renderRepairQuotesCards()}
      {activeTab === 'carWash' && renderCarWashCards()}

      {renderCarWashDetailModal()}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            reservationId: null,
            vehicleId: null,
            isSynthetic: false,
            type: null,
            title: '',
            message: '',
          })
        }
        onConfirm={confirmDelete}
        title={deleteModal.title || t('reservations.confirmDeleteTitle') || 'Silme Onayı'}
        message={deleteModal.message || t('reservations.confirmDelete') || 'Bu işlemi silmek istediğinizden emin misiniz?'}
        confirmText={t('reservations.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="danger"
      />
    </div>
  );
}
