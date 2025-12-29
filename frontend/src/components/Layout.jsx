import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useCallback } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import CarBrandsSlider from './CarBrandsSlider'
import { settingsAPI } from '../services/api'
import './Layout.css'

function Layout({ children }) {
  const { t } = useTranslation()
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    x: '',
    phone: ''
  })
  const [logoEditMode, setLogoEditMode] = useState(false) // Logo düzenleme modu - şu an kapalı
  const [logoSettings, setLogoSettings] = useState(() => {
    const saved = localStorage.getItem('logoSettings')
    const defaultSettings = {
      width: '139px',
      height: '50px',
      top: '0',
      left: '0',
      transform: 'none'
    }
    if (saved) {
      const parsed = JSON.parse(saved)
      // Mevcut genişliği %20 küçült
      if (parsed.width) {
        const currentWidth = parseFloat(parsed.width) || 139
        parsed.width = `${Math.round(currentWidth * 0.8)}px`
      }
      return parsed
    }
    // Varsayılan genişlik
    defaultSettings.width = '139px'
    return defaultSettings
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 })

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await settingsAPI.getSocialMediaLinks()
        if (response.data && response.data.links) {
          setSocialLinks(response.data.links)
        }
      } catch (error) {
        console.error('Error fetching social media links:', error)
        // Hata durumunda sessizce devam et, varsayılan boş değerler kullanılacak
      }
    }
    fetchSocialLinks()
  }, [])

  useEffect(() => {
    // Logo genişliğini %20 küçült ve kaydet
    const currentWidth = parseFloat(logoSettings.width) || 139
    const newWidth = Math.round(currentWidth * 0.8)
    if (newWidth !== parseFloat(logoSettings.width)) {
      const updatedSettings = {
        ...logoSettings,
        width: `${newWidth}px`
      }
      setLogoSettings(updatedSettings)
      localStorage.setItem('logoSettings', JSON.stringify(updatedSettings))
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('logoSettings', JSON.stringify(logoSettings))
  }, [logoSettings])

  const handleLogoSettingChange = (property, value) => {
    setLogoSettings(prev => ({
      ...prev,
      [property]: value
    }))
  }

  const toggleLogoEditMode = () => {
    setLogoEditMode(!logoEditMode)
  }

  const handleMouseDown = (e, type) => {
    if (!logoEditMode) return
    
    if (type === 'drag') {
      setIsDragging(true)
      const rect = e.currentTarget.getBoundingClientRect()
      const container = e.currentTarget.closest('.logo')
      if (container) {
        const containerRect = container.getBoundingClientRect()
        setDragStart({
          x: e.clientX - containerRect.left - parseFloat(logoSettings.left || 0),
          y: e.clientY - containerRect.top - parseFloat(logoSettings.top || 0)
        })
      }
    } else if (type === 'resize') {
      setIsResizing(true)
      setResizeStart({
        width: parseFloat(logoSettings.width) || 152,
        height: parseFloat(logoSettings.height) || 50,
        x: e.clientX,
        y: e.clientY
      })
    }
    e.preventDefault()
    e.stopPropagation()
  }

  const handleMouseMove = useCallback((e) => {
    if (isDragging && logoEditMode) {
      const logoElement = document.querySelector('.logo')
      if (logoElement) {
        const containerRect = logoElement.getBoundingClientRect()
        const newLeft = e.clientX - containerRect.left - dragStart.x
        const newTop = e.clientY - containerRect.top - dragStart.y
        
        setLogoSettings(prev => ({
          ...prev,
          left: `${Math.max(0, newLeft)}px`,
          top: `${Math.max(0, newTop)}px`
        }))
      }
    } else if (isResizing && logoEditMode) {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      const newWidth = Math.max(50, resizeStart.width + deltaX)
      const newHeight = Math.max(30, resizeStart.height + deltaY)
      
      setLogoSettings(prev => ({
        ...prev,
        width: `${newWidth}px`,
        height: `${newHeight}px`
      }))
    }
  }, [isDragging, isResizing, logoEditMode, dragStart, resizeStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <Link to="/" className="logo">
            <div 
              className={`logo-wrapper ${logoEditMode ? 'edit-mode' : ''}`}
              style={{
                position: (logoEditMode || logoSettings.top !== '0' || logoSettings.left !== '0') ? 'relative' : 'static',
                display: 'inline-block'
              }}
            >
              <img 
                src="/kayauto-logo.png.png" 
                alt="KAY Auto Service Logo" 
                className={`logo-image ${logoEditMode ? 'draggable' : ''}`}
                style={{
                  width: logoSettings.width,
                  height: logoSettings.height,
                  top: logoSettings.top,
                  left: logoSettings.left,
                  transform: logoSettings.transform !== 'none' ? logoSettings.transform : 'translateX(-3%)',
                  position: (logoEditMode || logoSettings.top !== '0' || logoSettings.left !== '0') ? 'relative' : 'static',
                  cursor: logoEditMode ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                onMouseDown={(e) => logoEditMode && handleMouseDown(e, 'drag')}
              />
              {logoEditMode && (
                <>
                  <div 
                    className="resize-handle"
                    onMouseDown={(e) => handleMouseDown(e, 'resize')}
                    style={{
                      cursor: 'nwse-resize'
                    }}
                  />
                  <div className="drag-hint">Sürükle</div>
                  <div className="resize-hint">Boyutlandır</div>
                </>
              )}
            </div>
            <h1>Service</h1>
          </Link>
          <nav className="nav">
            <Link to="/">{t('nav.home')}</Link>
            <Link to="/auto-sales">{t('nav.autoSales')}</Link>
            <Link to="/auto-repair">{t('nav.autoRepair')}</Link>
            <Link to="/auto-body-shop">{t('nav.autoBodyShop')}</Link>
            <Link to="/car-wash">{t('nav.carWash')}</Link>
            <Link to="/contact">{t('nav.contact')}</Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <CarBrandsSlider />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-left">
            <img 
              src="https://www.eurotec-ep.com/s/2503/i/2021-07-28-news-3.jpg" 
              alt="Kalite Sertifikası" 
              className="certificate-image"
            />
          </div>
          <p className="copyright">{t('footer.copyright')}</p>
          {(socialLinks.phone || socialLinks.facebook || socialLinks.instagram || socialLinks.x) && (
            <div className="social-links">
              {socialLinks.phone && (
                <a href={`tel:${socialLinks.phone}`} className="social-link phone-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {socialLinks.x && (
                <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="social-link x-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}

export default Layout

