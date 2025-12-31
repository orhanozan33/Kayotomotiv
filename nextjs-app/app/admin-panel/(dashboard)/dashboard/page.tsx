'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import {
  vehiclesAPI,
  reservationsAPI,
  repairAPI,
  carWashAPI,
  dashboardAPI,
} from '@/lib/services/adminApi';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState({
    vehicles: 0,
    reservations: 0,
    quotes: 0,
    appointments: 0,
  });
  const [revenue, setRevenue] = useState({
    repair: { total: 0 },
    carWash: { total: 0 },
    total: 0,
  });
  const [revenuePeriod, setRevenuePeriod] = useState('daily');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [notifications, setNotifications] = useState({
    pendingReservations: 0,
    pendingTestDrives: 0,
    total: 0,
    hasNotifications: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const isAdmin = userStr ? JSON.parse(userStr)?.role === 'admin' : false;

      const promises: Promise<any>[] = [
        vehiclesAPI.getAll({ limit: 1000 }).catch((err) => {
          console.error('Error loading vehicles:', err);
          return { data: { vehicles: [] } };
        }),
        reservationsAPI.getAll().catch((err) => {
          console.error('Error loading reservations:', err);
          return { data: { reservations: [] } };
        }),
        repairAPI.getVehicleRecords().catch((err) => {
          console.error('Error loading vehicle records:', err);
          return { data: { quotes: [] } };
        }),
        carWashAPI.getAppointments().catch((err) => {
          console.error('Error loading appointments:', err);
          return { data: { appointments: [] } };
        }),
      ];

      if (isAdmin) {
        promises.push(
          dashboardAPI
            .getRevenueStats({ period: revenuePeriod, ...dateRange })
            .catch((err) => {
              console.error('Error loading revenue stats:', err);
              return { data: { repair: { total: 0 }, carWash: { total: 0 }, total: 0 } };
            })
        );
      } else {
        promises.push(
          Promise.resolve({ data: { repair: { total: 0 }, carWash: { total: 0 }, total: 0 } })
        );
      }

      const [vehiclesRes, reservationsRes, quotesRes, washAppointmentsRes, revenueRes] =
        await Promise.all(promises);

      setStats({
        vehicles: vehiclesRes.data?.vehicles?.length || 0,
        reservations: reservationsRes.data?.reservations?.length || 0,
        quotes: quotesRes.data?.quotes?.length || 0,
        appointments: washAppointmentsRes.data?.appointments?.length || 0,
      });

      setRevenue({
        repair: { total: revenueRes.data?.repair?.total || 0 },
        carWash: { total: revenueRes.data?.carWash?.total || 0 },
        total: revenueRes.data?.total || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({ vehicles: 0, reservations: 0, quotes: 0, appointments: 0 });
      setRevenue({ repair: { total: 0 }, carWash: { total: 0 }, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [revenuePeriod, dateRange]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const playAlarmSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);

        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';

        gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.5);
      }, 300);
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      const response = await dashboardAPI.getNotifications().catch((err) => {
        console.error('Error loading notifications:', err);
        return {
          data: { pendingReservations: 0, pendingTestDrives: 0, total: 0, hasNotifications: false },
        };
      });
      const prevTotal = notifications.total;
      setNotifications(
        response.data || {
          pendingReservations: 0,
          pendingTestDrives: 0,
          total: 0,
          hasNotifications: false,
        }
      );

      if (response.data?.hasNotifications && response.data.total > prevTotal && prevTotal > 0) {
        let message = '';
        if (response.data.pendingReservations > 0 && response.data.pendingTestDrives > 0) {
          message = `Yeni bildirim: ${response.data.pendingReservations} rezervasyon talebi ve ${response.data.pendingTestDrives} test sürüşü talebi bekliyor!`;
        } else if (response.data.pendingReservations > 0) {
          message = `Yeni bildirim: ${response.data.pendingReservations} rezervasyon talebi bekliyor!`;
        } else if (response.data.pendingTestDrives > 0) {
          message = `Yeni bildirim: ${response.data.pendingTestDrives} test sürüşü talebi bekliyor!`;
        }
        if (message) {
          showSuccess(message);
          playAlarmSound();
        }
      } else if (
        response.data?.hasNotifications &&
        response.data.total > 0 &&
        prevTotal === 0
      ) {
        let message = '';
        if (response.data.pendingReservations > 0 && response.data.pendingTestDrives > 0) {
          message = `${response.data.pendingReservations} rezervasyon talebi ve ${response.data.pendingTestDrives} test sürüşü talebi bekliyor!`;
        } else if (response.data.pendingReservations > 0) {
          message = `${response.data.pendingReservations} rezervasyon talebi bekliyor!`;
        } else if (response.data.pendingTestDrives > 0) {
          message = `${response.data.pendingTestDrives} test sürüşü talebi bekliyor!`;
        }
        if (message) {
          showSuccess(message);
          playAlarmSound();
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications({
        pendingReservations: 0,
        pendingTestDrives: 0,
        total: 0,
        hasNotifications: false,
      });
    }
  }, [notifications.total, showSuccess]);

  useEffect(() => {
    loadNotifications();

    const notificationInterval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(notificationInterval);
  }, []);

  const handlePeriodChange = (period: string) => {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    setRevenuePeriod(period);
    setDateRange({ startDate: '', endDate: '' });
    setTimeout(() => {
      window.scrollTo({ top: scrollPos, left: 0, behavior: 'auto' });
    }, 0);
  };

  if (loading) {
    return <div className={styles.loading}>{t('common.loading') || 'Loading...'}</div>;
  }

  return (
    <div className={styles.dashboardPage}>
      <h1>{t('dashboard.title') || 'Dashboard'}</h1>

      {notifications.hasNotifications && (
        <div className={styles.notificationBanner}>
          <div className={styles.notificationIcon}>🔔</div>
          <div className={styles.notificationContent}>
            <strong>{t('dashboard.newNotifications') || 'Yeni Bildirimler'}</strong>
            {notifications.pendingReservations > 0 && (
              <span>
                {notifications.pendingReservations} {t('dashboard.pendingReservations') || 'bekleyen rezervasyon'}
              </span>
            )}
            {notifications.pendingTestDrives > 0 && (
              <span>
                {notifications.pendingTestDrives} {t('dashboard.pendingTestDrives') || 'bekleyen test sürüşü'}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>{t('dashboard.totalVehicles') || 'Toplam Araç'}</h3>
          <p className={styles.statNumber}>{stats.vehicles}</p>
        </div>
        <div className={styles.statCard}>
          <h3>{t('dashboard.reservations') || 'Rezervasyonlar'}</h3>
          <p className={styles.statNumber}>{stats.reservations}</p>
        </div>
        <div className={styles.statCard}>
          <h3>{t('dashboard.repairQuotes') || 'Tamir Teklifleri'}</h3>
          <p className={styles.statNumber}>{stats.quotes}</p>
        </div>
        <div className={styles.statCard}>
          <h3>{t('dashboard.carWashAppointments') || 'Oto Yıkama Randevuları'}</h3>
          <p className={styles.statNumber}>{stats.appointments}</p>
        </div>
      </div>

      {userRole === 'admin' && (
        <div className={styles.revenueSection}>
          <h2>{t('dashboard.revenue.title') || 'Gelir Raporu'}</h2>

          <div className={styles.revenueControls}>
            <div className={styles.periodSelector}>
              <button
                type="button"
                className={revenuePeriod === 'daily' ? styles.active : ''}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePeriodChange('daily');
                }}
              >
                {t('dashboard.revenue.daily') || 'Günlük'}
              </button>
              <button
                type="button"
                className={revenuePeriod === 'monthly' ? styles.active : ''}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePeriodChange('monthly');
                }}
              >
                {t('dashboard.revenue.monthly') || 'Aylık'}
              </button>
              <button
                type="button"
                className={revenuePeriod === 'total' ? styles.active : ''}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePeriodChange('total');
                }}
              >
                {t('dashboard.revenue.total') || 'Toplam'}
              </button>
            </div>

            <div className={styles.dateRangeSelector}>
              <label>{t('dashboard.revenue.dateRangeOptional') || 'Tarih Aralığı (Opsiyonel)'}</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => {
                  setDateRange({ ...dateRange, startDate: e.target.value });
                  setRevenuePeriod('total');
                }}
              />
              <span>-</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => {
                  setDateRange({ ...dateRange, endDate: e.target.value });
                  setRevenuePeriod('total');
                }}
              />
            </div>
          </div>

          <div className={styles.revenueGridSeparated}>
            <div className={styles.revenueCategory}>
              <h3>{t('dashboard.revenue.repairRevenue') || 'Tamir Geliri'}</h3>
              <div className={`${styles.statCard} ${styles.revenueCard}`}>
                <p className={`${styles.statNumber} ${styles.revenueAmount}`}>
                  ${revenue.repair.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className={styles.revenueCategory}>
              <h3>{t('dashboard.revenue.carWashRevenue') || 'Oto Yıkama Geliri'}</h3>
              <div className={`${styles.statCard} ${styles.revenueCard}`}>
                <p className={`${styles.statNumber} ${styles.revenueAmount}`}>
                  ${revenue.carWash.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className={styles.revenueCategory}>
              <h3>{t('dashboard.revenue.totalRevenue') || 'Toplam Gelir'}</h3>
              <div className={`${styles.statCard} ${styles.revenueCard} ${styles.totalRevenue}`}>
                <p className={`${styles.statNumber} ${styles.revenueAmount}`}>
                  ${revenue.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
