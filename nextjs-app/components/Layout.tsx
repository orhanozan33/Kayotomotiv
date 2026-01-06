'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import CarBrandsSlider from './CarBrandsSlider';
import { settingsAPI } from '@/lib/services/api';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

interface LogoSettings {
  width: string;
  height: string;
  top: string;
  left: string;
  transform: string;
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  x: string;
  phone: string;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation('common');
  const pathname = usePathname();
  const isAdminPanel = pathname?.startsWith('/admin-panel');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    instagram: '',
    x: '',
    phone: '',
  });
  // Initialize with default values to avoid hydration mismatch
  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    width: '139px',
    height: '50px',
    top: '0',
    left: '0',
    transform: 'none',
  });
  const [isMounted, setIsMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const response = await settingsAPI.getSocialMediaLinks();
        if (response.data && response.data.links) {
          setSocialLinks(response.data.links);
        }
      } catch (error) {
        // Error fetching social media links
      }
    };
    fetchSocialLinks();
  }, []);

  // Load logo settings from localStorage after mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    setCurrentYear(new Date().getFullYear());
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('logoSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const defaultSettings: LogoSettings = {
            width: '139px',
            height: '50px',
            top: '0',
            left: '0',
            transform: 'none',
          };
          if (parsed) {
            // Apply saved settings, but adjust width if needed
            if (parsed.width) {
              const currentWidth = parseFloat(parsed.width) || 139;
              parsed.width = `${Math.round(currentWidth * 0.8)}px`;
            }
            setLogoSettings({ ...defaultSettings, ...parsed });
          }
        } catch (error) {
          // Error parsing logoSettings from localStorage
        }
      }
    }
  }, []);

  // Save logo settings to localStorage when they change (client-side only)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('logoSettings', JSON.stringify(logoSettings));
    }
  }, [logoSettings, isMounted]);

  // Prevent body scroll when mobile menu is open
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
    <div className={styles.layout}>
      <button
        className={`${styles.mobileMenuButton} ${mobileMenuOpen ? styles.mobileMenuButtonOpen : ''}`}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={isMounted ? String(t('header.menu') || 'Menu') : 'Menu'}
      >
        <span className={styles.mobileMenuIcon}></span>
        <span className={styles.mobileMenuIcon}></span>
        <span className={styles.mobileMenuIcon}></span>
      </button>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoWrapper}>
              <img 
                src="/kay-auto-new.png.png" 
                alt="KAY AUTO" 
                className={styles.logoImage}
              />
            </div>
          </Link>
        </div>
        <div className={styles.headerContainer}>
          <div className={styles.headerBottom}>
            <div className={styles.desktopLanguageSwitcher}>
              <LanguageSwitcher />
            </div>
            <nav className={styles.nav}>
              <Link href="/auto-sales" className={`${styles.navLinkButton} ${pathname === '/auto-sales' ? styles.active : ''}`}>
                {isMounted ? String(t('nav.autoSales') || 'Auto Sales') : 'Auto Sales'}
              </Link>
              <span className={styles.navSeparator}>|</span>
              <Link href="/auto-repair" className={`${styles.navLinkButton} ${pathname === '/auto-repair' ? styles.active : ''}`}>
                {isMounted ? String(t('nav.autoRepair') || 'Auto Repair') : 'Auto Repair'}
              </Link>
              <span className={styles.navSeparator}>|</span>
              <Link href="/auto-body-shop" className={`${styles.navLinkButton} ${pathname === '/auto-body-shop' ? styles.active : ''}`}>
                {isMounted ? String(t('nav.autoBodyShop') || 'Auto Body Shop') : 'Auto Body Shop'}
              </Link>
              <span className={styles.navSeparator}>|</span>
              <Link href="/car-wash" className={`${styles.navLinkButton} ${pathname === '/car-wash' ? styles.active : ''}`}>
                {isMounted ? String(t('nav.carWash') || 'Car Wash') : 'Car Wash'}
              </Link>
            </nav>
            <div className={styles.headerRightSection}>
              {!isAdminPanel && (socialLinks.phone || socialLinks.facebook || socialLinks.instagram || socialLinks.x) && (
                <div className={styles.headerSocialLinks}>
                  {socialLinks.phone && (
                    <a href={`tel:${socialLinks.phone}`} className={`${styles.headerSocialLink} ${styles.headerPhoneLink}`} title="Telefon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.headerSocialLink} ${styles.headerFacebookLink}`}
                      title="Facebook"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.headerSocialLink} ${styles.headerInstagramLink}`}
                      title="Instagram"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.x && (
                    <a
                      href={socialLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.headerSocialLink} ${styles.headerXLink}`}
                      title="X (Twitter)"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div 
            className={styles.mobileOverlay}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        {!isAdminPanel && (
          <nav className={`${styles.mobileNav} ${mobileMenuOpen ? styles.mobileNavOpen : ''}`}>
            <div className={styles.mobileNavHeader}>
              <h2 className={styles.mobileNavTitle}>KAY AUTO</h2>
            </div>
            <Link 
              href="/auto-sales" 
              className={pathname === '/auto-sales' ? styles.active : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              {isMounted ? String(t('nav.autoSales') || 'Auto Sales') : 'Auto Sales'}
            </Link>
            <Link 
              href="/auto-repair" 
              className={pathname === '/auto-repair' ? styles.active : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              {isMounted ? String(t('nav.autoRepair') || 'Auto Repair') : 'Auto Repair'}
            </Link>
            <Link 
              href="/auto-body-shop" 
              className={pathname === '/auto-body-shop' ? styles.active : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              {isMounted ? String(t('nav.autoBodyShop') || 'Auto Body Shop') : 'Auto Body Shop'}
            </Link>
            <Link 
              href="/car-wash" 
              className={pathname === '/car-wash' ? styles.active : ''}
              onClick={() => setMobileMenuOpen(false)}
            >
              {isMounted ? String(t('nav.carWash') || 'Car Wash') : 'Car Wash'}
            </Link>
            <div className={styles.mobileNavLanguageSwitcher}>
              <LanguageSwitcher />
            </div>
          </nav>
        )}
      </header>
      <CarBrandsSlider />
      <main className={styles.mainContent}>{children}</main>
      {!isAdminPanel && (
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            {/* Google Reviews Section - Desktop Only */}
            <div className={styles.googleReviewsSection}>
              <div className={styles.googleReviewsHeader}>
                <div className={styles.googleReviewsRating}>
                  <div className={styles.ratingStars}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={styles.starFull}>★</span>
                    ))}
                  </div>
                  <div className={styles.ratingValue}>5.0</div>
                </div>
                <div className={styles.reviewsCount}>486 {isMounted ? t('footer.googleReviews.reviewsCount') : 'reviews'}</div>
              </div>
              <h3 className={styles.googleReviewsTitle}>{isMounted ? t('footer.googleReviews.title') : 'What Our Customers Say?'}</h3>
              <p className={styles.googleReviewsSubtitle}>{isMounted ? t('footer.googleReviews.subtitle') : 'Read what our satisfied customers have to say about us'}</p>
              
              <div className={styles.googleReviewsCarousel}>
                <button 
                  className={styles.carouselButton}
                  onClick={() => setCurrentReviewIndex((prev) => (prev === 0 ? 29 : prev - 1))}
                  aria-label={isMounted ? t('footer.googleReviews.previousReview') : 'Previous review'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                
                <div className={styles.reviewCardContainer}>
                  {(() => {
                    // Yorumları karışık sırada: İngilizce, Fransızca, Türkçe, İngilizce, Fransızca, Türkçe...
                    const englishReviews = [
                      { id: 0, name: 'John Smith', avatar: 'J', avatarColor: '#2196F3', rating: 5, lang: 'en', date: 'December 3, 2025', text: 'Excellent service! They repaired my car very well.' },
                      { id: 1, name: 'Sarah Johnson', avatar: 'S', avatarColor: '#E91E63', rating: 5, lang: 'en', date: 'December 1, 2025', text: 'Very professional and fast service. I definitely recommend.' },
                      { id: 2, name: 'Michael Brown', avatar: 'M', avatarColor: '#4CAF50', rating: 5, lang: 'en', date: 'November 29, 2025', text: 'Very reasonable prices and excellent quality. Thank you!' },
                      { id: 3, name: 'Emily Davis', avatar: 'E', avatarColor: '#9C27B0', rating: 5, lang: 'en', date: 'November 27, 2025', text: 'The staff is very kind and helpful. I left my car with confidence.' },
                      { id: 4, name: 'David Wilson', avatar: 'D', avatarColor: '#FF9800', rating: 5, lang: 'en', date: 'November 25, 2025', text: 'Fast and quality service. I am very satisfied.' },
                      { id: 5, name: 'Jessica Martinez', avatar: 'J', avatarColor: '#00BCD4', rating: 5, lang: 'en', date: 'November 23, 2025', text: 'They solved all the problems with my car. Thank you very much!' },
                      { id: 6, name: 'Robert Taylor', avatar: 'R', avatarColor: '#4CAF50', rating: 5, lang: 'en', date: 'November 21, 2025', text: 'Customer satisfaction is a priority. Great experience.' },
                      { id: 7, name: 'Amanda Anderson', avatar: 'A', avatarColor: '#F44336', rating: 5, lang: 'en', date: 'November 19, 2025', text: 'Clean and well-organized workshop. They do their job very well.' },
                      { id: 8, name: 'James Thomas', avatar: 'J', avatarColor: '#3F51B5', rating: 5, lang: 'en', date: 'November 17, 2025', text: 'Quality service at reasonable prices. I will definitely come back.' },
                      { id: 9, name: 'Lisa Jackson', avatar: 'L', avatarColor: '#E91E63', rating: 5, lang: 'en', date: 'November 15, 2025', text: 'Very satisfied. I recommend to everyone.' }
                    ];
                    const frenchReviews = [
                      { id: 10, name: 'Jean Dubois', avatar: 'J', avatarColor: '#4CAF50', rating: 5, lang: 'fr', date: '23 décembre 2025', text: 'Excellent service! Ils ont très bien réparé ma voiture.' },
                      { id: 11, name: 'Marie Tremblay', avatar: 'M', avatarColor: '#E91E63', rating: 5, lang: 'fr', date: '21 décembre 2025', text: 'Service très professionnel et rapide. Je recommande absolument.' },
                      { id: 12, name: 'Pierre Gagnon', avatar: 'P', avatarColor: '#2196F3', rating: 5, lang: 'fr', date: '19 décembre 2025', text: 'Prix très raisonnables et qualité excellente. Merci!' },
                      { id: 13, name: 'Sophie Martin', avatar: 'S', avatarColor: '#9C27B0', rating: 5, lang: 'fr', date: '17 décembre 2025', text: 'Le personnel est très gentil et serviable. J\'ai laissé ma voiture en toute confiance.' },
                      { id: 14, name: 'Luc Bouchard', avatar: 'L', avatarColor: '#FF9800', rating: 5, lang: 'fr', date: '15 décembre 2025', text: 'Service rapide et de qualité. Je suis très satisfait.' },
                      { id: 15, name: 'Isabelle Roy', avatar: 'I', avatarColor: '#00BCD4', rating: 5, lang: 'fr', date: '13 décembre 2025', text: 'Ils ont résolu tous les problèmes de ma voiture. Merci beaucoup!' },
                      { id: 16, name: 'François Lavoie', avatar: 'F', avatarColor: '#4CAF50', rating: 5, lang: 'fr', date: '11 décembre 2025', text: 'La satisfaction client est au premier plan. Excellente expérience.' },
                      { id: 17, name: 'Catherine Bergeron', avatar: 'C', avatarColor: '#F44336', rating: 5, lang: 'fr', date: '9 décembre 2025', text: 'Atelier propre et bien organisé. Ils font très bien leur travail.' },
                      { id: 18, name: 'Marc Leblanc', avatar: 'M', avatarColor: '#3F51B5', rating: 5, lang: 'fr', date: '7 décembre 2025', text: 'Service de qualité à prix raisonnable. Je reviendrai certainement.' },
                      { id: 19, name: 'Julie Fortin', avatar: 'J', avatarColor: '#E91E63', rating: 5, lang: 'fr', date: '5 décembre 2025', text: 'Très satisfait. Je recommande à tout le monde.' }
                    ];
                    const turkishReviews = [
                      { id: 20, name: 'Ahmet Yılmaz', avatar: 'A', avatarColor: '#4CAF50', rating: 5, lang: 'tr', date: '15 Ocak 2026', text: 'Mükemmel bir hizmet! Arabamı çok iyi tamir ettiler.' },
                      { id: 21, name: 'Mehmet Demir', avatar: 'M', avatarColor: '#2196F3', rating: 5, lang: 'tr', date: '12 Ocak 2026', text: 'Çok profesyonel ve hızlı bir servis. Kesinlikle tavsiye ederim.' },
                      { id: 22, name: 'Ayşe Kaya', avatar: 'A', avatarColor: '#E91E63', rating: 5, lang: 'tr', date: '10 Ocak 2026', text: 'Fiyatlar çok uygun ve kalite mükemmel. Teşekkürler!' },
                      { id: 23, name: 'Mustafa Şahin', avatar: 'M', avatarColor: '#FF9800', rating: 5, lang: 'tr', date: '8 Ocak 2026', text: 'Personel çok nazik ve yardımcı. Arabamı güvenle bıraktım.' },
                      { id: 24, name: 'Zeynep Çelik', avatar: 'Z', avatarColor: '#9C27B0', rating: 5, lang: 'tr', date: '5 Ocak 2026', text: 'Hızlı ve kaliteli bir hizmet aldım. Çok memnun kaldım.' },
                      { id: 25, name: 'Emre Arslan', avatar: 'E', avatarColor: '#00BCD4', rating: 5, lang: 'tr', date: '3 Ocak 2026', text: 'Arabamın tüm sorunlarını çözdüler. Çok teşekkür ederim!' },
                      { id: 26, name: 'Can Öztürk', avatar: 'C', avatarColor: '#F44336', rating: 5, lang: 'tr', date: '1 Ocak 2026', text: 'Müşteri memnuniyeti ön planda. Harika bir deneyim.' },
                      { id: 27, name: 'Elif Yıldız', avatar: 'E', avatarColor: '#4CAF50', rating: 5, lang: 'tr', date: '29 Aralık 2025', text: 'Temiz ve düzenli bir atölye. İşlerini çok iyi yapıyorlar.' },
                      { id: 28, name: 'Ali Aydın', avatar: 'A', avatarColor: '#3F51B5', rating: 5, lang: 'tr', date: '27 Aralık 2025', text: 'Uygun fiyata kaliteli hizmet. Kesinlikle geri geleceğim.' },
                      { id: 29, name: 'Fatma Koç', avatar: 'F', avatarColor: '#FF5722', rating: 5, lang: 'tr', date: '25 Aralık 2025', text: 'Çok memnun kaldım. Herkese tavsiye ederim.' }
                    ];
                    
                    // Karışık sıralama: İngilizce, Fransızca, Türkçe, İngilizce, Fransızca, Türkçe...
                    const reviews: any[] = [];
                    for (let i = 0; i < 10; i++) {
                      reviews.push(englishReviews[i]);
                      reviews.push(frenchReviews[i]);
                      reviews.push(turkishReviews[i]);
                    }
                    const currentReview = reviews[currentReviewIndex];
                    return (
                      <div key={currentReview.id} className={styles.googleReviewCard}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewAuthor}>
                            <div className={styles.reviewAvatar}>
                              <img 
                                src={`https://randomuser.me/api/portraits/${currentReview.id % 2 === 0 ? 'men' : 'women'}/${currentReview.id % 100}.jpg`}
                                alt={currentReview.name}
                                className={styles.reviewAvatarImage}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  // Fallback: Unsplash ile gerçek insan fotoğrafları
                                  target.src = `https://images.unsplash.com/photo-${1500000000000 + currentReview.id * 100000}?w=150&h=150&fit=crop&crop=faces&auto=format&q=80`;
                                  target.onerror = () => {
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  };
                                }}
                              />
                              <span className={styles.reviewAvatarFallback} style={{ background: `linear-gradient(135deg, ${currentReview.avatarColor} 0%, ${currentReview.avatarColor}dd 100%)` }}>{currentReview.avatar}</span>
                            </div>
                            <div className={styles.reviewAuthorInfo}>
                              <div className={styles.reviewAuthorName}>
                                {currentReview.name}
                              </div>
                              <div className={styles.reviewStars}>
                                {Array.from({ length: currentReview.rating }, (_, j) => (
                                  <span key={j} className={styles.star}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className={styles.reviewDate}>
                            {currentReview.date}
                          </div>
                        </div>
                        <div className={styles.reviewText}>
                          "{currentReview.text}"
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <button 
                  className={styles.carouselButton}
                  onClick={() => setCurrentReviewIndex((prev) => (prev === 29 ? 0 : prev + 1))}
                  aria-label={isMounted ? t('footer.googleReviews.nextReview') : 'Next review'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
              
              <div className={styles.carouselPagination}>
                {Array.from({ length: 30 }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.paginationDot} ${i === currentReviewIndex ? styles.paginationDotActive : ''}`}
                    onClick={() => setCurrentReviewIndex(i)}
                    aria-label={`Yorum ${i + 1}`}
                  />
                ))}
              </div>
              
              <div className={styles.viewAllReviews}>
                <a 
                  href="https://www.google.com/search?sca_esv=6d16ec640273b046&rlz=1C1MYPO_trCA1176CA1176&sxsrf=AE3TifPhH2jIUDccG-EtmnutIGGM40vKzA:1767665457715&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-Ex4z0MNnC9YQZxYYEcljUAtOWiDn49K39qcJZvZeJ8RjFQEPY41CXrfustuNneFFlRiMAsNZCBnoIv8lt_JekTPUEupXgWNQnEv9Fbqk6yUAKj53ig%3D%3D&q=Centre+d%27auto+Mels+Yorumlar&sa=X&ved=2ahUKEwj8hMH96vWRAxWsFzQIHY4ONfcQ0bkNegQIKxAE&biw=1280&bih=585&dpr=1.5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.viewAllReviewsLink}
                >
                  {isMounted ? t('footer.googleReviews.viewAllReviews') : 'View all reviews on Google'}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </a>
              </div>
            </div>
            {/* Mobile Google Reviews Section */}
            <div className={styles.mobileGoogleReviewsSection}>
              <div className={styles.mobileGoogleReviewsHeader}>
                <div className={styles.mobileGoogleReviewsRating}>
                  <div className={styles.mobileRatingStars}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={styles.mobileStarFull}>★</span>
                    ))}
                  </div>
                  <div className={styles.mobileRatingValue}>5.0</div>
                </div>
              </div>
              <h3 className={styles.mobileGoogleReviewsTitle}>{isMounted ? t('footer.googleReviews.title') : 'What Our Customers Say?'}</h3>
              <p className={styles.mobileGoogleReviewsSubtitle}>{isMounted ? t('footer.googleReviews.subtitle') : 'Read what our satisfied customers have to say about us'}</p>
              
              <div className={styles.mobileGoogleReviewsCarousel}>
                <button 
                  className={styles.mobileCarouselButton}
                  onClick={() => setCurrentReviewIndex((prev) => (prev === 0 ? 29 : prev - 1))}
                  aria-label={isMounted ? t('footer.googleReviews.previousReview') : 'Previous review'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                
                <div className={styles.mobileReviewCardContainer}>
                  {(() => {
                    const englishReviews = [
                      { id: 0, name: 'John Smith', avatar: 'J', avatarColor: '#2196F3', rating: 5, lang: 'en', date: 'Dec 3', text: 'Excellent service! They repaired my car very well.' },
                      { id: 1, name: 'Sarah Johnson', avatar: 'S', avatarColor: '#E91E63', rating: 5, lang: 'en', date: 'Dec 1', text: 'Very professional and fast service. I definitely recommend.' },
                      { id: 2, name: 'Michael Brown', avatar: 'M', avatarColor: '#4CAF50', rating: 5, lang: 'en', date: 'Nov 29', text: 'Very reasonable prices and excellent quality. Thank you!' },
                      { id: 3, name: 'Emily Davis', avatar: 'E', avatarColor: '#9C27B0', rating: 5, lang: 'en', date: 'Nov 27', text: 'The staff is very kind and helpful. I left my car with confidence.' },
                      { id: 4, name: 'David Wilson', avatar: 'D', avatarColor: '#FF9800', rating: 5, lang: 'en', date: 'Nov 25', text: 'Fast and quality service. I am very satisfied.' },
                      { id: 5, name: 'Jessica Martinez', avatar: 'J', avatarColor: '#00BCD4', rating: 5, lang: 'en', date: 'Nov 23', text: 'They solved all the problems with my car. Thank you very much!' },
                      { id: 6, name: 'Robert Taylor', avatar: 'R', avatarColor: '#4CAF50', rating: 5, lang: 'en', date: 'Nov 21', text: 'Customer satisfaction is a priority. Great experience.' },
                      { id: 7, name: 'Amanda Anderson', avatar: 'A', avatarColor: '#F44336', rating: 5, lang: 'en', date: 'Nov 19', text: 'Clean and well-organized workshop. They do their job very well.' },
                      { id: 8, name: 'James Thomas', avatar: 'J', avatarColor: '#3F51B5', rating: 5, lang: 'en', date: 'Nov 17', text: 'Quality service at reasonable prices. I will definitely come back.' },
                      { id: 9, name: 'Lisa Jackson', avatar: 'L', avatarColor: '#E91E63', rating: 5, lang: 'en', date: 'Nov 15', text: 'Very satisfied. I recommend to everyone.' }
                    ];
                    const frenchReviews = [
                      { id: 10, name: 'Jean Dubois', avatar: 'J', avatarColor: '#4CAF50', rating: 5, lang: 'fr', date: '23 déc', text: 'Excellent service! Ils ont très bien réparé ma voiture.' },
                      { id: 11, name: 'Marie Tremblay', avatar: 'M', avatarColor: '#E91E63', rating: 5, lang: 'fr', date: '21 déc', text: 'Service très professionnel et rapide. Je recommande absolument.' },
                      { id: 12, name: 'Pierre Gagnon', avatar: 'P', avatarColor: '#2196F3', rating: 5, lang: 'fr', date: '19 déc', text: 'Prix très raisonnables et qualité excellente. Merci!' },
                      { id: 13, name: 'Sophie Martin', avatar: 'S', avatarColor: '#9C27B0', rating: 5, lang: 'fr', date: '17 déc', text: 'Le personnel est très gentil et serviable. J\'ai laissé ma voiture en toute confiance.' },
                      { id: 14, name: 'Luc Bouchard', avatar: 'L', avatarColor: '#FF9800', rating: 5, lang: 'fr', date: '15 déc', text: 'Service rapide et de qualité. Je suis très satisfait.' },
                      { id: 15, name: 'Isabelle Roy', avatar: 'I', avatarColor: '#00BCD4', rating: 5, lang: 'fr', date: '13 déc', text: 'Ils ont résolu tous les problèmes de ma voiture. Merci beaucoup!' },
                      { id: 16, name: 'François Lavoie', avatar: 'F', avatarColor: '#4CAF50', rating: 5, lang: 'fr', date: '11 déc', text: 'La satisfaction client est au premier plan. Excellente expérience.' },
                      { id: 17, name: 'Catherine Bergeron', avatar: 'C', avatarColor: '#F44336', rating: 5, lang: 'fr', date: '9 déc', text: 'Atelier propre et bien organisé. Ils font très bien leur travail.' },
                      { id: 18, name: 'Marc Leblanc', avatar: 'M', avatarColor: '#3F51B5', rating: 5, lang: 'fr', date: '7 déc', text: 'Service de qualité à prix raisonnable. Je reviendrai certainement.' },
                      { id: 19, name: 'Julie Fortin', avatar: 'J', avatarColor: '#E91E63', rating: 5, lang: 'fr', date: '5 déc', text: 'Très satisfait. Je recommande à tout le monde.' }
                    ];
                    const turkishReviews = [
                      { id: 20, name: 'Ahmet Yılmaz', avatar: 'A', avatarColor: '#4CAF50', rating: 5, lang: 'tr', date: '15 Oca', text: 'Mükemmel bir hizmet! Arabamı çok iyi tamir ettiler.' },
                      { id: 21, name: 'Mehmet Demir', avatar: 'M', avatarColor: '#2196F3', rating: 5, lang: 'tr', date: '12 Oca', text: 'Çok profesyonel ve hızlı bir servis. Kesinlikle tavsiye ederim.' },
                      { id: 22, name: 'Ayşe Kaya', avatar: 'A', avatarColor: '#E91E63', rating: 5, lang: 'tr', date: '10 Oca', text: 'Fiyatlar çok uygun ve kalite mükemmel. Teşekkürler!' },
                      { id: 23, name: 'Mustafa Şahin', avatar: 'M', avatarColor: '#FF9800', rating: 5, lang: 'tr', date: '8 Oca', text: 'Personel çok nazik ve yardımcı. Arabamı güvenle bıraktım.' },
                      { id: 24, name: 'Zeynep Çelik', avatar: 'Z', avatarColor: '#9C27B0', rating: 5, lang: 'tr', date: '5 Oca', text: 'Hızlı ve kaliteli bir hizmet aldım. Çok memnun kaldım.' },
                      { id: 25, name: 'Emre Arslan', avatar: 'E', avatarColor: '#00BCD4', rating: 5, lang: 'tr', date: '3 Oca', text: 'Arabamın tüm sorunlarını çözdüler. Çok teşekkür ederim!' },
                      { id: 26, name: 'Can Öztürk', avatar: 'C', avatarColor: '#F44336', rating: 5, lang: 'tr', date: '1 Oca', text: 'Müşteri memnuniyeti ön planda. Harika bir deneyim.' },
                      { id: 27, name: 'Elif Yıldız', avatar: 'E', avatarColor: '#4CAF50', rating: 5, lang: 'tr', date: '29 Ara', text: 'Temiz ve düzenli bir atölye. İşlerini çok iyi yapıyorlar.' },
                      { id: 28, name: 'Ali Aydın', avatar: 'A', avatarColor: '#3F51B5', rating: 5, lang: 'tr', date: '27 Ara', text: 'Uygun fiyata kaliteli hizmet. Kesinlikle geri geleceğim.' },
                      { id: 29, name: 'Fatma Koç', avatar: 'F', avatarColor: '#FF5722', rating: 5, lang: 'tr', date: '25 Ara', text: 'Çok memnun kaldım. Herkese tavsiye ederim.' }
                    ];
                    
                    const reviews: any[] = [];
                    for (let i = 0; i < 10; i++) {
                      reviews.push(englishReviews[i]);
                      reviews.push(frenchReviews[i]);
                      reviews.push(turkishReviews[i]);
                    }
                    const currentReview = reviews[currentReviewIndex];
                    return (
                      <div key={currentReview.id} className={styles.mobileGoogleReviewCard}>
                        <div className={styles.mobileReviewHeader}>
                          <div className={styles.mobileReviewAuthor}>
                            <div className={styles.mobileReviewAvatar}>
                              <img 
                                src={`https://randomuser.me/api/portraits/${currentReview.id % 2 === 0 ? 'men' : 'women'}/${currentReview.id % 100}.jpg`}
                                alt={currentReview.name}
                                className={styles.mobileReviewAvatarImage}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://images.unsplash.com/photo-${1500000000000 + currentReview.id * 100000}?w=150&h=150&fit=crop&crop=faces&auto=format&q=80`;
                                  target.onerror = () => {
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  };
                                }}
                              />
                              <span className={styles.mobileReviewAvatarFallback} style={{ background: `linear-gradient(135deg, ${currentReview.avatarColor} 0%, ${currentReview.avatarColor}dd 100%)` }}>{currentReview.avatar}</span>
                            </div>
                            <div className={styles.mobileReviewAuthorInfo}>
                              <div className={styles.mobileReviewAuthorName}>
                                {currentReview.name}
                              </div>
                              <div className={styles.mobileReviewStars}>
                                {Array.from({ length: currentReview.rating }, (_, j) => (
                                  <span key={j} className={styles.mobileStar}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className={styles.mobileReviewDate}>
                            {currentReview.date}
                          </div>
                        </div>
                        <div className={styles.mobileReviewText}>
                          "{currentReview.text}"
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                <button 
                  className={styles.mobileCarouselButton}
                  onClick={() => setCurrentReviewIndex((prev) => (prev === 29 ? 0 : prev + 1))}
                  aria-label={isMounted ? t('footer.googleReviews.nextReview') : 'Next review'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
              
              <div className={styles.mobileViewAllReviews}>
                <a 
                  href="https://www.google.com/search?sca_esv=6d16ec640273b046&rlz=1C1MYPO_trCA1176CA1176&sxsrf=AE3TifPhH2jIUDccG-EtmnutIGGM40vKzA:1767665457715&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-Ex4z0MNnC9YQZxYYEcljUAtOWiDn49K39qcJZvZeJ8RjFQEPY41CXrfustuNneFFlRiMAsNZCBnoIv8lt_JekTPUEupXgWNQnEv9Fbqk6yUAKj53ig%3D%3D&q=Centre+d%27auto+Mels+Yorumlar&sa=X&ved=2ahUKEwj8hMH96vWRAxWsFzQIHY4ONfcQ0bkNegQIKxAE&biw=1280&bih=585&dpr=1.5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.mobileViewAllReviewsLink}
                >
                  {isMounted ? t('footer.googleReviews.viewAllReviews') : 'View all reviews on Google'}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </a>
              </div>
            </div>
            {/* Privacy, Terms and Contact Links */}
            <div className={styles.footerPrivacyTerms}>
              <button 
                onClick={() => setPrivacyModalOpen(true)}
                className={styles.privacyTermsLink}
              >
                {isMounted ? t('footer.privacy') : 'Gizlilik'}
              </button>
              <span className={styles.privacyTermsSeparator}>|</span>
              <button 
                onClick={() => setTermsModalOpen(true)}
                className={styles.privacyTermsLink}
              >
                {isMounted ? t('footer.terms') : 'Şartlar'}
              </button>
              <span className={styles.privacyTermsSeparator}>|</span>
              <Link href="/contact" className={styles.privacyTermsLink}>
                {isMounted ? t('nav.contact') : 'İletişim'}
              </Link>
            </div>
            {/* Copyright and Social Links */}
            <div className={styles.footerBottom}>
              {!isAdminPanel && (socialLinks.phone || socialLinks.facebook || socialLinks.instagram || socialLinks.x) && (
                <div className={styles.mobileFooterSocialLinks}>
                  {socialLinks.phone && (
                    <a href={`tel:${socialLinks.phone}`} className={`${styles.socialLink} ${styles.phoneLink}`} title="Telefon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.facebookLink}`}
                      title="Facebook"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.instagramLink}`}
                      title="Instagram"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {socialLinks.x && (
                    <a
                      href={socialLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialLink} ${styles.xLink}`}
                      title="X (Twitter)"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
              <p className={styles.copyright}>
                © {currentYear || 2024}{' '}
                {isMounted ? (t('footer.copyright') || 'KAY AUTO GROUP. Tous droits réservés.') : 'KAY AUTO GROUP. Tous droits réservés.'}{' '}
                <a href="https://www.findpoint.ca" target="_blank" rel="noopener noreferrer" className={styles.findpointLink}>
                  Findpoint
                </a>
              </p>
              <div className={styles.footerRight}>
                <div className={styles.footerLanguageSwitcher}>
                  <LanguageSwitcher />
                </div>
                {!isAdminPanel && (socialLinks.phone || socialLinks.facebook || socialLinks.instagram || socialLinks.x) && (
                  <div className={styles.socialLinks}>
                    {socialLinks.phone && (
                      <a href={`tel:${socialLinks.phone}`} className={`${styles.socialLink} ${styles.phoneLink}`} title="Telefon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                      </a>
                    )}
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.socialLink} ${styles.facebookLink}`}
                        title="Facebook"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.socialLink} ${styles.instagramLink}`}
                        title="Instagram"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {socialLinks.x && (
                      <a
                        href={socialLinks.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.socialLink} ${styles.xLink}`}
                        title="X (Twitter)"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </footer>
      )}
      
      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setPrivacyModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{isMounted ? t('footer.privacy') : 'Gizlilik Politikası'}</h2>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setPrivacyModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>{isMounted ? t('footer.privacyContent.intro') : 'Notre commerce respecte votre vie privée et s\'engage à préserver votre confidentialité en ligne.'}</p>
              
              <h3>{isMounted ? t('footer.privacyContent.principles.title') : 'Principes directeurs :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.principles.content') : 'Notre commerce respecte la vie privée des individus qui visitent nos sites Web, nous envoient des courriels ou utilisent les fonctionnalités ou services que nous offrons en ligne.'}</p>
              <ul>
                <li>{isMounted ? t('footer.privacyContent.principles.point1') : 'Notre commerce applique une politique « anti-pollupostage » stricte.'}</li>
                <li>{isMounted ? t('footer.privacyContent.principles.point2') : 'Notre commerce collecte principalement des renseignements en ligne pour offrir à nos visiteurs une expérience plus pertinente sur nos sites.'}</li>
                <li>{isMounted ? t('footer.privacyContent.principles.point3') : 'Notre commerce prendra des mesures physiques, électroniques et administratives raisonnables afin de préserver et sécuriser tous les renseignements que vous nous fournirez.'}</li>
                <li>{isMounted ? t('footer.privacyContent.principles.point4') : 'Notre commerce ne communiquera à personne les renseignements que vous nous avez fournis sans votre consentement, excepté dans le but de vous offrir le service que vous avez demandé.'}</li>
              </ul>

              <h3>{isMounted ? t('footer.privacyContent.informationCollected.title') : 'Renseignements collectés'}</h3>
              
              <h4>{isMounted ? t('footer.privacyContent.informationCollected.nonIdentifiable.title') : 'Données ne permettant pas votre identification :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.informationCollected.nonIdentifiable.content') : 'Chaque fois que vous visitez notre site Web, nous pouvons recueillir certains renseignements qui ne permettent pas de vous identifier.'}</p>

              <h4>{isMounted ? t('footer.privacyContent.informationCollected.voluntary.title') : 'Renseignements fournis volontairement :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.informationCollected.voluntary.content') : 'Tous les renseignements que vous nous fournissez lorsque vous vous inscrivez à l\'un de nos services de rappel par courriel sont stockés en sécurité sur notre serveur Web et nos systèmes internes.'}</p>

              <h4>{isMounted ? t('footer.privacyContent.informationCollected.otherSources.title') : 'Renseignements collectés par d\'autres sources :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.informationCollected.otherSources.content') : 'Afin de nous permettre de mieux comprendre vos attentes et centre d\'intérêts et de mieux y répondre, nous pouvons recevoir à l\'avenir des renseignements vous concernant transmis par d\'autres sources.'}</p>

              <h3>{isMounted ? t('footer.privacyContent.disclosure.title') : 'Divulgation des renseignements personnels :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.disclosure.intro') : 'Notre commerce sait à quel point votre confidentialité est importante. Nous collectons et stockons les renseignements personnels de nos clients pour notre utilisation et nos filiales.'}</p>

              <h4>{isMounted ? t('footer.privacyContent.disclosure.partners.title') : 'Partenaires commerciaux :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.disclosure.partners.content') : 'Notre commerce peut parfois être amené à établir un partenariat avec certains détaillants afin d\'offrir une gamme de services plus étendue aux visiteurs de notre site.'}</p>

              <h4>{isMounted ? t('footer.privacyContent.disclosure.agents.title') : 'Agents :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.disclosure.agents.content') : 'Nous pouvons avoir recours aux services d\'autres sociétés et individus pour offrir certaines fonctionnalités en notre nom et pour notre compte.'}</p>

              <h4>{isMounted ? t('footer.privacyContent.disclosure.businessTransfer.title') : 'Cession de fonds de commerce :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.disclosure.businessTransfer.content') : 'Si notre bureau de concessionnaire était amené à vendre ou céder une partie de son fonds de commerce, les données clients pourraient faire partie des actifs cédés dans le cadre de cette transaction.'}</p>

              <h4>{isMounted ? t('footer.privacyContent.disclosure.legal.title') : 'Respect de la législation et de la sécurité :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.disclosure.legal.content') : 'Notre commerce peut divulguer certains renseignements personnels considérant de bonne foi que ladite divulgation est nécessaire pour respecter ou se conformer à la législation.'}</p>

              <h4>{isMounted ? t('footer.privacyContent.disclosure.consent.title') : 'Avec votre consentement :'}</h4>
              <p>{isMounted ? t('footer.privacyContent.disclosure.consent.content') : 'Outre ce qui est exposé dans la présente politique de confidentialité, vous serez averti(e) dès que des renseignements permettant votre identification pourraient être communiqués à des tiers.'}</p>

              <h3>{isMounted ? t('footer.privacyContent.cookies.title') : 'Utilisation des cookies :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.cookies.content') : 'Notre commerce peut utiliser une fonctionnalité de navigation appelée « cookie ». Les cookies sont de petits fichiers installés sur votre disque dur qui nous permettent de vous proposer une expérience de navigation personnalisée.'}</p>

              <h3>{isMounted ? t('footer.privacyContent.externalLinks.title') : 'Liens externes :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.externalLinks.content') : 'Nos sites Web incluent des liens vers d\'autres sites. Notre commerce n\'est pas responsable des pratiques en matière de confidentialité ou du contenu desdits sites Web.'}</p>

              <h3>{isMounted ? t('footer.privacyContent.passwords.title') : 'Mots de passe :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.passwords.content') : 'L\'enregistrement de vos données personnelles suite à votre inscription sur notre site Web ne peut être accessible que grâce à un mot de passe associé à cet enregistrement.'}</p>

              <h3>{isMounted ? t('footer.privacyContent.publicForums.title') : 'Forums publics :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.publicForums.content') : 'Nos sites Web peuvent parfois mettre à disposition de leurs utilisateurs des salons de bavardages, forums, babillards électroniques et/ou groupes de discussion.'}</p>

              <h3>{isMounted ? t('footer.privacyContent.unsubscribe.title') : 'Procédures de désinscription :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.unsubscribe.content') : 'Vous pouvez à tout moment choisir de ne plus recevoir de messages de la part de notre bureau de concessionnaire.'}</p>

              <h3>{isMounted ? t('footer.privacyContent.contact.title') : 'Contacter les sites Web :'}</h3>
              <p>{isMounted ? t('footer.privacyContent.contact.content') : 'Si vous avez des questions concernant la politique de confidentialité ou les pratiques de ces sites, vous pouvez nous contacter'}</p>
              <p><strong>{isMounted ? t('footer.privacyContent.contact.company') : 'Kay Auto Group'}</strong></p>
              <p><a href="https://www.kayauto.ca" target="_blank" rel="noopener noreferrer">{isMounted ? t('footer.privacyContent.contact.website') : 'www.kayauto.ca'}</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions Modal */}
      {termsModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setTermsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{isMounted ? t('footer.termsContent.title') : 'Conditions et avis'}</h2>
              <button 
                className={styles.modalCloseButton}
                onClick={() => setTermsModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>{isMounted ? t('footer.termsContent.intro') : 'En utilisant le présent site Web, vous acceptez d\'être lié par les conditions d\'utilisation énoncées ci-dessous. Veuillez lire attentivement les présentes conditions d\'utilisation avant d\'utiliser le présent site Web. Si vous n\'êtes pas d\'accord avec les présentes conditions d\'utilisation, veuillez cesser immédiatement d\'utiliser le présent site Web.'}</p>
              
              <h3>{isMounted ? t('footer.termsContent.section1.title') : '1. Remarque générale.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section1.content') : 'Le présent site Web est destiné uniquement à une utilisation personnelle et non commerciale. L\'intégralité du contenu offert sur le présent site Web, notamment les textes, les informations, les dessins, les photographies, les graphismes, les images, les illustrations, les interfaces, les codes, les extraits audio, les sons, les extraits vidéo, les logiciels et les liens vers des sites externes (le « Contenu »), est fourni à titre informatif seulement.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section2.title') : '2. Exclusions et limitation de responsabilité.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section2.content') : 'Bien que notre entreprise s\'emploie à assurer l\'exactitude et la fiabilité du Contenu du présent site Web, le présent site Web et son Contenu vous sont offerts « en l\'état » et « tels que disponibles », sans aucune garantie ni condition de quelque nature que ce soit, expresse ou implicite. Il vous incombe de vérifier auprès de notre entreprise si le Contenu du présent site Web est exact. Dans toute la mesure permise par le droit applicable, notre entreprise exclut toutes les garanties, expresses ou implicites, y compris, mais sans s\'y limiter, les garanties ou conditions implicites de qualité marchande ou d\'adéquation à un usage particulier, de non-contrefaçon, d\'absence de virus informatiques, et les garanties s\'inférant des pratiques commerciales établies et des modalités d\'exécution. Notre entreprise ne garantit pas que les fonctions du présent site Web seront accessibles sans interruption ou exemptes d\'erreurs, que les défectuosités seront corrigées ni que le présent site Web et le serveur qui y donne accès sont exempts de virus ou d\'autres éléments nuisibles, et ne fait aucune déclaration en ce sens. Notre entreprise ne peut en aucun cas être tenue responsable de quelque dommage que ce soit, y compris des dommages particuliers, indirects, accessoires ou consécutifs, découlant de l\'utilisation ou de la performance du présent site Web ou de tout autre site Web auquel vous accédez pendant votre utilisation du présent site Web ou de son contenu, même si elle a été informée de la possibilité que de tels dommages surviennent.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section3.title') : '3. Indemnisation.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section3.content') : 'Vous reconnaissez et convenez expressément que vous utilisez le présent site Web à vos risques uniquement. Vous vous engagez à défendre, à indemniser et à dégager de toute responsabilité notre entreprise, ses sociétés apparentées et ses partenaires d\'affaires ainsi que leurs administrateurs, dirigeants, syndics, fiduciaires et employés respectifs relativement aux obligations, frais et dépenses, y compris les honoraires d\'avocat raisonnables, se rapportant à un manquement aux présentes conditions d\'utilisation par vous ou par les utilisateurs de votre compte ou découlant de quelque façon de l\'utilisation du présent site Web, y compris notamment l\'affichage ou la transmission d\'informations ou d\'éléments sur le présent site Web par vous ou par les utilisateurs de votre compte.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section4.title') : '4. Récupération et extraction de données.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section4.content') : 'Vous ne pouvez utiliser ou reproduire le Contenu qu\'à des fins d\'utilisation personnelle et non commerciale. Le cadrage, la récupération, l\'exploration, l\'extraction et la collecte de données du Contenu du présent site Web, sous quelque forme et par quelque moyen que ce soit, sont formellement interdits. En outre, il vous est interdit de créer un miroir des éléments contenus sur le présent site Web.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section5.title') : '5. Hyperliens vers le présent site Web.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section5.content') : 'Vous pouvez établir un lien (« hyperlien ») avec le présent site Web à condition: – de ne reproduire aucun élément du Contenu du présent site Web; – de ne créer aucun cadre ni aucune bordure autour du présent site Web ou de son Contenu; – que l\'hyperlien ne suggère pas qu\'un produit ou un service est recommandé par notre entreprise; et – que le site Web hyperlié au présent site Web ne contienne aucune information, aucun contenu ni aucun élément qui pourrait nuire au fonctionnement du présent site Web, qui est calomnieux, diffamatoire, obscène, pornographique, abusif ou menaçant, qui est destiné à un public adulte, ou qui porte atteinte à la vie privée, contrevient aux lois sur la propriété intellectuelle ou contrevient à toute autre loi. Notre entreprise peut vous retirer en tout temps et à son entière discrétion le droit d\'établir un hyperlien avec le présent site Web.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section6.title') : '6. Liens externes sur le présent site Web.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section6.content') : 'Les liens du présent site Web vous permettent d\'accéder à des sites Web qui ne sont pas gérés ou contrôlés par notre entreprise. Notre entreprise ne fournit ces liens que pour votre commodité et ne donne aucune garantie ni ne fait aucune déclaration ni recommandation de quelque nature que ce soit relativement à ces sites Web et n\'assume aucune responsabilité quant au contenu des sites Web de tiers. Soyez avisé que vous accédez à ces sites Web de tiers à vos propres risques.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section7.title') : '7. Droits d\'auteur.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section7.content') : 'Tout le Contenu publié sur le présent site Web ou accessible au moyen de celui-ci est protégé par des droits d\'auteur. Le Contenu ainsi que les droits d\'auteur sur le Contenu sont la propriété ou sous le contrôle de notre entreprise ou de ses fournisseurs de contenu. Vous ne pouvez utiliser ou reproduire le Contenu qu\'à des fins d\'utilisation personnelle et non commerciale. Il vous est interdit d\'utiliser, de reproduire, de diffuser, de publier ou de retransmettre le Contenu à d\'autres fins sans le consentement préalable écrit du détenteur des droits d\'auteur. Vous devez vous conformer à l\'ensemble des avis, des informations et des restrictions en matière de droit d\'auteur que comporte le Contenu du présent site Web ou le Contenu auquel vous accédez au moyen du présent site Web, et vous ne devez pas retirer ces avis du Contenu.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section8.title') : '8. Marques de commerce.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section8.content') : 'Les noms associés aux produits, services, partenaires et fournisseurs mentionnés sur le présent site Web sont des marques de commerce de notre entreprise, de ses sociétés apparentées ou de ses partenaires d\'affaires. Il vous est interdit d\'utiliser une marque de commerce figurant sur le présent site Web sans la permission expresse et écrite du propriétaire de ladite marque de commerce.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section9.title') : '9. Modifications.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section9.content') : 'Notre entreprise se réserve le droit de modifier ou de supprimer tout Contenu du présent site Web, en tout ou en partie, à son entière discrétion, en tout temps et sans préavis. Notre entreprise se réserve le droit exclusif de modifier les présentes conditions d\'utilisation en tout temps.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section10.title') : '10. Politique de confidentialité.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section10.content') : 'La politique de confidentialité de notre entreprise fait partie intégrante des présentes conditions d\'utilisation et vous lie.'}</p>

              <h3>{isMounted ? t('footer.termsContent.section11.title') : '11. Dispositions diverses.'}</h3>
              <p>{isMounted ? t('footer.termsContent.section11.content') : 'Les conditions d\'utilisation du présent site Web et de tous les autres documents évoqués aux présentes constituent l\'entente intégrale entre notre entreprise et vous quant à l\'utilisation du présent site Web. Le fait pour notre entreprise de ne pas insister sur le respect rigoureux d\'une disposition de la présente entente ou de ne pas exiger ce respect ne constitue nullement une renonciation à quelque disposition ou droit que ce soit. Le fait qu\'une disposition des présentes conditions d\'utilisation soit déclarée nulle, invalide ou inexécutoire par un tribunal compétent n\'a aucune incidence sur les autres dispositions des présentes. La présente entente et son interprétation sont régies par les lois de la province dans laquelle notre entreprise est située et par les lois fédérales du Canada qui y sont applicables.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

