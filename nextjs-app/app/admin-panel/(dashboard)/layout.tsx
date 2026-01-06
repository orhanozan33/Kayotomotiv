'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/services/adminApi';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import styles from './admin-layout.module.css';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [userPermissions, setUserPermissions] = useState<any[] | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadPermissions = async () => {
      if (typeof window === 'undefined') return;
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role);

          if (user.role === 'admin') {
            setUserPermissions([]);
            setPermissionsLoading(false);
          } else {
            try {
              setPermissionsLoading(true);
              const response = await usersAPI.getPermissions(user.id);
              const permissions = response.data?.permissions || [];
              setUserPermissions(permissions);
            } catch (error) {
              console.error('Error loading permissions:', error);
              setUserPermissions([]);
            } finally {
              setPermissionsLoading(false);
            }
          }
        } catch (e) {
          console.error('Error parsing user:', e);
          setPermissionsLoading(false);
        }
      } else {
        setPermissionsLoading(false);
      }
    };

    loadPermissions();
  }, []);

  const canViewPage = (page: string) => {
    if (userRole === 'admin') return true;
    if (permissionsLoading || userPermissions === null) return false;
    const permission = userPermissions.find((p) => p.page === page);
    return permission?.can_view === true;
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/admin-panel/login');
    }
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className={styles.adminLayout}>
      <button 
        className={styles.mobileMenuToggle}
        onClick={toggleMobileMenu}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      {mobileMenuOpen && (
        <div 
          className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.active : ''}`}
          onClick={closeMobileMenu}
        />
      )}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            {t('common.logout') || 'Çıkış Yap'}
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <Link
            href="/admin-panel/dashboard"
            className={isActive('/admin-panel/dashboard') ? styles.active : ''}
            onClick={closeMobileMenu}
          >
            {t('adminNav.dashboard') || 'Dashboard'}
          </Link>
          {canViewPage('reservations') && (
            <Link
              href="/admin-panel/reservations"
              className={isActive('/admin-panel/reservations') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.reservations') || 'Rezervasyonlar'}
            </Link>
          )}
          {userRole === 'admin' && (
            <Link
              href="/admin-panel/messages"
              className={isActive('/admin-panel/messages') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.messages') || 'Mesajlar'}
            </Link>
          )}
          {canViewPage('vehicles') && (
            <Link
              href="/admin-panel/vehicles"
              className={isActive('/admin-panel/vehicles') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.vehicles') || 'Araçlar'}
            </Link>
          )}
          {canViewPage('customers') && (
            <Link
              href="/admin-panel/customers"
              className={isActive('/admin-panel/customers') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.customers') || 'Müşteri Kayıt'}
            </Link>
          )}
          {canViewPage('repair-services') && (
            <Link
              href="/admin-panel/repair-services"
              className={isActive('/admin-panel/repair-services') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.repairServices') || 'Tamir Hizmetleri'}
            </Link>
          )}
          {canViewPage('car-wash') && (
            <Link
              href="/admin-panel/car-wash"
              className={isActive('/admin-panel/car-wash') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.carWash') || 'Oto Yıkama'}
            </Link>
          )}
          {canViewPage('repair-quotes') && (
            <Link
              href="/admin-panel/repair-quotes"
              className={isActive('/admin-panel/repair-quotes') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.repairQuotes') || 'Oto Yıkama Kayıt'}
            </Link>
          )}
          {userRole === 'admin' && (
            <Link
              href="/admin-panel/settings"
              className={isActive('/admin-panel/settings') ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              {t('adminNav.settings') || 'Ayarlar'}
            </Link>
          )}
        </nav>
      </aside>
      <main className={styles.adminContent}>{children}</main>
    </div>
  );
}

