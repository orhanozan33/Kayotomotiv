'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { repairAPI } from '@/lib/services/api';
import { carBrandsAndModels, years } from '@/lib/data/carBrands';
import styles from './page.module.css';

function AutoRepairPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await repairAPI.getServices();
      setServices(response.data.services);
    } catch (error: any) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'vehicle_brand') {
      setFormData({
        ...formData,
        vehicle_brand: value,
        vehicle_model: '', // Reset model when brand changes
      });
      setAvailableModels(value ? carBrandsAndModels[value] || [] : []);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const toggleService = (service: any) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.service_id === service.id);
      if (exists) {
        return prev.filter((s) => s.service_id !== service.id);
      } else {
        return [...prev, { service_id: service.id, price: service.base_price, quantity: 1 }];
      }
    });
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await repairAPI.createQuote({
        ...formData,
        services: selectedServices,
      });
      showSuccess(t('common.success') || 'Başarılı!');
      setShowQuoteForm(false);
      setSelectedServices([]);
      setFormData({
        vehicle_brand: '',
        vehicle_model: '',
        vehicle_year: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
      });
      setAvailableModels([]);
    } catch (error: any) {
      showError(
        'Teklif gönderilirken hata oluştu: ' + (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className={styles.autoRepairPage}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1>{t('autoRepair.title')}</h1>
            <p className={styles.intro}>{t('autoRepair.subtitle')}</p>
          </div>
          <button
            onClick={() => {
              setShowQuoteForm(true);
              setFormData({
                vehicle_brand: '',
                vehicle_model: '',
                vehicle_year: '',
                customer_name: '',
                customer_email: '',
                customer_phone: '',
              });
              setAvailableModels([]);
            }}
            className={styles.btnQuoteHeader}
          >
            {t('autoRepair.getQuote')}
          </button>
        </div>

        {!loading && (
          <>
            <div className={styles.heroSection}>
              <div className={styles.heroContent}>
                <div className={styles.heroText}>
                  <h2>
                    {t('autoRepair.hero.title') || 'Profesyonel Oto Tamir Hizmetleri'}
                  </h2>
                  <p>
                    {t('autoRepair.hero.description') ||
                      'Deneyimli teknisyenlerimiz ve modern ekipmanlarımızla aracınıza en iyi hizmeti sunuyoruz. Motor tamiri, fren bakımı, klima servisi ve daha fazlası için bizimle iletişime geçin.'}
                  </p>
                </div>
                <div className={styles.heroImage}>
                  <img
                    src="https://avatars.mds.yandex.net/get-altay/14396200/2a00000193b878634142afd54ef53f888e85/XXXL"
                    alt="Oto Tamir Hizmetleri"
                    className={styles.heroImg}
                  />
                </div>
              </div>
            </div>

            <div className={styles.featuresSection}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                    <path d="M2 17L12 22L22 17" />
                    <path d="M2 12L12 17L22 12" />
                  </svg>
                </div>
                <h3>{t('autoRepair.features.experienced.title') || 'Deneyimli Teknisyenler'}</h3>
                <p>
                  {t('autoRepair.features.experienced.description') ||
                    'Yılların deneyimi ile aracınızı güvenle teslim edebilirsiniz.'}
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M21 16V8A2 2 0 0019 6H5A2 2 0 003 8V16A2 2 0 005 18H19A2 2 0 0021 16Z" />
                    <path d="M3 10H21" />
                  </svg>
                </div>
                <h3>{t('autoRepair.features.modern.title') || 'Modern Ekipmanlar'}</h3>
                <p>
                  {t('autoRepair.features.modern.description') ||
                    'Son teknoloji cihazlar ile hızlı ve doğru teşhis.'}
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <h3>{t('autoRepair.features.quality.title') || 'Kaliteli Hizmet'}</h3>
                <p>
                  {t('autoRepair.features.quality.description') ||
                    'Orijinal yedek parçalar ve garantili işçilik.'}
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3>{t('autoRepair.features.fast.title') || 'Hızlı Servis'}</h3>
                <p>
                  {t('autoRepair.features.fast.description') ||
                    'Kısa sürede tamamlanan işlemler ile zaman tasarrufu.'}
                </p>
              </div>
            </div>

            <div className={styles.servicesInfoSection}>
              <div className={styles.servicesInfoContent}>
                <h2>{t('autoRepair.servicesInfo.title') || 'Hizmetlerimiz'}</h2>
                <p>
                  {t('autoRepair.servicesInfo.description') ||
                    'Motor tamiri, fren bakımı, klima servisi, elektrikli sistem tamiri, lastik değişimi ve daha birçok hizmet sunuyoruz. Detaylı fiyat bilgisi için fiyat teklifi al butonuna tıklayın.'}
                </p>
                <div className={styles.serviceCategories}>
                  <div className={styles.serviceCategoryTag}>
                    {t('autoRepair.categories.engine') || 'Motor Tamiri'}
                  </div>
                  <div className={styles.serviceCategoryTag}>
                    {t('autoRepair.categories.brake') || 'Fren Bakımı'}
                  </div>
                  <div className={styles.serviceCategoryTag}>
                    {t('autoRepair.categories.ac') || 'Klima Servisi'}
                  </div>
                  <div className={styles.serviceCategoryTag}>
                    {t('autoRepair.categories.electrical') || 'Elektrikli Sistem'}
                  </div>
                  <div className={styles.serviceCategoryTag}>
                    {t('autoRepair.categories.tire') || 'Lastik Değişimi'}
                  </div>
                  <div className={styles.serviceCategoryTag}>
                    {t('autoRepair.categories.maintenance') || 'Bakım Servisi'}
                  </div>
                </div>
              </div>
              <div className={styles.servicesInfoImage}>
                <img
                  src="https://avatars.mds.yandex.net/get-altay/14730529/2a00000193b901f4a131428ea318a67a1981/XXXL"
                  alt="Oto Tamir Servisi"
                  className={styles.servicesInfoImg}
                />
              </div>
            </div>
          </>
        )}

        {loading && <div className={styles.loading}>{t('autoRepair.loading')}</div>}

        {showQuoteForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>{t('autoRepair.quoteForm.title') || 'Fiyat Teklifi Al'}</h2>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => {
                    setShowQuoteForm(false);
                    setSelectedServices([]);
                    setFormData({
                      vehicle_brand: '',
                      vehicle_model: '',
                      vehicle_year: '',
                      customer_name: '',
                      customer_email: '',
                      customer_phone: '',
                    });
                    setAvailableModels([]);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleQuoteSubmit}>
                <div className={styles.formSection}>
                  <h3>{t('autoRepair.quoteForm.vehicleInfo') || 'Araç Bilgileri'}</h3>
                  <select
                    name="vehicle_brand"
                    value={formData.vehicle_brand}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('autoRepair.quoteForm.brand') || 'Marka Seçin'}</option>
                    {Object.keys(carBrandsAndModels)
                      .sort()
                      .map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                  </select>
                  <select
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.vehicle_brand}
                  >
                    <option value="">{t('autoRepair.quoteForm.model') || 'Model Seçin'}</option>
                    {availableModels.sort().map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <select
                    name="vehicle_year"
                    value={formData.vehicle_year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('autoRepair.quoteForm.year') || 'Yıl Seçin'}</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formSection}>
                  <h3>{t('autoRepair.quoteForm.contactInfo') || 'İletişim Bilgileri'}</h3>
                  <input
                    type="text"
                    name="customer_name"
                    placeholder={t('autoRepair.quoteForm.name') || 'Ad Soyad'}
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="customer_email"
                    placeholder={t('autoRepair.quoteForm.email') || 'E-posta'}
                    value={formData.customer_email}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="tel"
                    name="customer_phone"
                    placeholder={t('autoRepair.quoteForm.phone') || 'Telefon'}
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.formSection}>
                  <h3>{t('autoRepair.quoteForm.selectServices') || 'Hizmet Seçin'}</h3>
                  <div className={styles.servicesListModal}>
                    {loading ? (
                      <div className={styles.loading}>{t('autoRepair.loading')}</div>
                    ) : (
                      services.map((service) => (
                        <label key={service.id} className={styles.serviceCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedServices.some((s) => s.service_id === service.id)}
                            onChange={() => toggleService(service)}
                          />
                          <div className={styles.serviceCheckboxContent}>
                            <span className={styles.serviceCheckboxName}>{service.name}</span>
                            <span className={styles.serviceCheckboxPrice}>${service.base_price}</span>
                            {service.description && (
                              <span className={styles.serviceCheckboxDescription}>
                                {service.description}
                              </span>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button type="submit">{t('autoRepair.quoteForm.submit') || 'Teklif İste'}</button>
                  <button type="button" onClick={() => setShowQuoteForm(false)}>
                    {t('autoRepair.quoteForm.cancel') || 'İptal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AutoRepairPage;
