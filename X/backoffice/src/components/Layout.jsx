import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { usersAPI } from '../services/api'
import LanguageSwitcher from './LanguageSwitcher'
import './Layout.css'

const PAGE_ROUTES = {
  'vehicles': '/vehicles',
  'customers': '/customers',
  'repair-services': '/repair-services',
  'repair-quotes': '/repair-quotes',
  'car-wash': '/car-wash',
  'reservations': '/reservations'
}

const PAGE_LABELS = {
  'vehicles': 'nav.vehicles',
  'customers': 'nav.customers',
  'repair-services': 'nav.repairServices',
  'repair-quotes': 'nav.repairQuotes',
  'car-wash': 'nav.carWash',
  'reservations': 'nav.reservations'
}

function Layout() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [userPermissions, setUserPermissions] = useState(null) // null means not loaded yet
  const [userRole, setUserRole] = useState(null)
  const [permissionsLoading, setPermissionsLoading] = useState(true)

  useEffect(() => {
    const loadPermissions = async () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUserRole(user.role)
          
          // Admin sees all pages, regular users need permission check
          if (user.role === 'admin') {
            // Admin can see all pages
            setUserPermissions([]) // Empty means all pages allowed
            setPermissionsLoading(false)
          } else {
            // Load user permissions
            try {
              setPermissionsLoading(true)
              const response = await usersAPI.getPermissions(user.id)
              const permissions = response.data?.permissions || []
              console.log('Loaded permissions for user:', user.id, permissions)
              setUserPermissions(permissions)
            } catch (error) {
              console.error('Error loading permissions:', error)
              setUserPermissions([])
            } finally {
              setPermissionsLoading(false)
            }
          }
        } catch (e) {
          console.error('Error parsing user:', e)
          setPermissionsLoading(false)
        }
      } else {
        setPermissionsLoading(false)
      }
    }
    
    loadPermissions()
  }, [])


  const canViewPage = (page) => {
    // Admin can see all pages
    if (userRole === 'admin') return true
    
    // Wait for permissions to load
    if (permissionsLoading || userPermissions === null) return false
    
    // Regular users need can_view permission
    const permission = userPermissions.find(p => p.page === page)
    return permission?.can_view === true
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <LanguageSwitcher />
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard">{t('nav.dashboard')}</Link>
          {canViewPage('reservations') && <Link to="/reservations">{t('nav.reservations')}</Link>}
          {(userRole === 'admin') && <Link to="/messages">{t('nav.messages')}</Link>}
          {canViewPage('vehicles') && <Link to="/vehicles">{t('nav.vehicles')}</Link>}
          {canViewPage('customers') && <Link to="/customers">{t('nav.customers')}</Link>}
          {canViewPage('repair-services') && <Link to="/repair-services">{t('nav.repairServices')}</Link>}
          {canViewPage('car-wash') && <Link to="/car-wash">{t('nav.carWash')}</Link>}
          {canViewPage('repair-quotes') && <Link to="/repair-quotes">{t('nav.repairQuotes')}</Link>}
          {userRole === 'admin' && <Link to="/settings">{t('nav.settings') || 'Ayarlar'}</Link>}
          {userRole === 'admin' && <Link to="/backend">{t('nav.backend') || 'Backend'}</Link>}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">{t('common.logout')}</button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

