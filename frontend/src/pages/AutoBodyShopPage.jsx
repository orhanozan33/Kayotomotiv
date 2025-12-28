import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './AutoBodyShopPage.css'

function AutoBodyShopPage() {
  const { t } = useTranslation()

  return (
    <div className="auto-body-shop-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>{t('autoBodyShop.title') || 'Oto Kaporta Hizmetleri'}</h1>
            <p className="intro">{t('autoBodyShop.subtitle') || 'Profesyonel kaporta ve boya hizmetleri ile aracınızı yeniden eski görünümüne kavuşturuyoruz.'}</p>
          </div>
        </div>

        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h2>{t('autoBodyShop.hero.title') || 'Profesyonel Oto Kaporta ve Boya Hizmetleri'}</h2>
              <p>{t('autoBodyShop.hero.description') || 'Deneyimli ustalarımız ve modern ekipmanlarımızla hasarlı aracınızı orijinal haline getiriyoruz. Kaporta tamiri, boya işlemleri, çizik giderme ve daha fazlası için bizimle iletişime geçin.'}</p>
            </div>
            <div className="hero-image">
              <img 
                src="https://www.bahatotoservis.com.tr/wp-content/uploads/2024/08/avcilar-kaporta_boya_servisi_oncesi-sonrasi.png" 
                alt="Oto Kaporta Hizmetleri" 
                className="hero-img"
              />
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
            </div>
            <h3>{t('autoBodyShop.features.experienced.title') || 'Deneyimli Ustalar'}</h3>
            <p>{t('autoBodyShop.features.experienced.description') || 'Yılların deneyimi ile aracınızı güvenle teslim edebilirsiniz.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                <path d="M21 16V8A2 2 0 0019 6H5A2 2 0 003 8V16A2 2 0 005 18H19A2 2 0 0021 16Z"/>
                <path d="M3 10H21"/>
              </svg>
            </div>
            <h3>{t('autoBodyShop.features.modern.title') || 'Modern Ekipmanlar'}</h3>
            <p>{t('autoBodyShop.features.modern.description') || 'Son teknoloji boya ve kaporta ekipmanları ile profesyonel hizmet.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h3>{t('autoBodyShop.features.quality.title') || 'Kaliteli Boya'}</h3>
            <p>{t('autoBodyShop.features.quality.description') || 'Orijinal renk eşleştirme ve kaliteli boya malzemeleri.'}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3>{t('autoBodyShop.features.fast.title') || 'Hızlı Servis'}</h3>
            <p>{t('autoBodyShop.features.fast.description') || 'Kısa sürede tamamlanan işlemler ile zaman tasarrufu.'}</p>
          </div>
        </div>

        <div className="services-info-section">
          <div className="services-info-content">
            <h2>{t('autoBodyShop.servicesInfo.title') || 'Hizmetlerimiz'}</h2>
            <p>{t('autoBodyShop.servicesInfo.description') || 'Kaporta tamiri, boya işlemleri, çizik giderme, hasar onarımı, tampon tamiri ve daha birçok hizmet sunuyoruz. Detaylı fiyat bilgisi için bizimle iletişime geçin.'}</p>
            <div className="service-categories">
              <div className="service-category-tag">{t('autoBodyShop.categories.bodyRepair') || 'Kaporta Tamiri'}</div>
              <div className="service-category-tag">{t('autoBodyShop.categories.painting') || 'Boya İşlemleri'}</div>
              <div className="service-category-tag">{t('autoBodyShop.categories.scratchRemoval') || 'Çizik Giderme'}</div>
              <div className="service-category-tag">{t('autoBodyShop.categories.damageRepair') || 'Hasar Onarımı'}</div>
              <div className="service-category-tag">{t('autoBodyShop.categories.bumperRepair') || 'Tampon Tamiri'}</div>
              <div className="service-category-tag">{t('autoBodyShop.categories.colorMatching') || 'Renk Eşleştirme'}</div>
            </div>
          </div>
          <div className="services-info-image">
            <img 
              src="https://ozturkleroto.com.tr/upload/resimler/oto-kaporta-boya.webp" 
              alt="Oto Kaporta Servisi" 
              className="services-info-img"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutoBodyShopPage

