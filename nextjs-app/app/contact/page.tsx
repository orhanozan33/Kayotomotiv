'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { contactAPI } from '@/lib/services/api';
import styles from './page.module.css';

function ContactPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [locations, setLocations] = useState([
    {
      name: t('contact.locations.1.name') || 'Merkez Şube',
      address: t('contact.locations.1.address') || 'Atatürk Bulvarı No:123, Çankaya, Ankara',
      phone: t('contact.locations.1.phone') || '+90 312 123 45 67',
      hours: t('contact.locations.1.hours') || 'Pazartesi - Cumartesi: 09:00 - 18:00',
    },
    {
      name: t('contact.locations.2.name') || 'Kuzey Şube',
      address: t('contact.locations.2.address') || 'İnönü Caddesi No:456, Keçiören, Ankara',
      phone: t('contact.locations.2.phone') || '+90 312 234 56 78',
      hours: t('contact.locations.2.hours') || 'Pazartesi - Cumartesi: 09:00 - 18:00',
    },
    {
      name: t('contact.locations.3.name') || 'Güney Şube',
      address: t('contact.locations.3.address') || 'Cumhuriyet Mahallesi No:789, Etimesgut, Ankara',
      phone: t('contact.locations.3.phone') || '+90 312 345 67 89',
      hours: t('contact.locations.3.hours') || 'Pazartesi - Cumartesi: 09:00 - 18:00',
    },
  ]);

  useEffect(() => {
    loadContactLocations();
  }, []);

  const loadContactLocations = async () => {
    try {
      // Try to load from API if available
      // For now, use default locations
    } catch (error: any) {
      console.error('Error loading contact locations:', error);
      // Keep default locations if API fails
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await contactAPI.createMessage(formData);
      showSuccess(t('contact.form.success') || 'Mesajınız başarıyla gönderildi!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error: any) {
      showError(
        t('contact.form.error') ||
          'Mesaj gönderilirken hata oluştu: ' + (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1>{t('contact.title') || 'İletişim'}</h1>
            <p className={styles.intro}>
              {t('contact.subtitle') ||
                'Sorularınız, önerileriniz veya randevu talepleriniz için bizimle iletişime geçin.'}
            </p>
          </div>
        </div>

        <div className={styles.contactContent}>
          <div className={styles.locationsSection}>
            <h2>{t('contact.locations.title') || 'Şubelerimiz'}</h2>
            <div className={styles.locationsGrid}>
              {locations.map((location, index) => (
                <div key={index} className={styles.locationCard}>
                  <div className={styles.locationIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <h3>{location.name}</h3>
                  <div className={styles.locationDetail}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{location.address}</span>
                  </div>
                  <div className={styles.locationDetail}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <a href={`tel:${location.phone}`}>{location.phone}</a>
                  </div>
                  <div className={styles.locationDetail}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{location.hours}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.messageSection}>
            <h2>{t('contact.form.title') || 'Bize Mesaj Gönderin'}</h2>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">{t('contact.form.name') || 'Ad Soyad'}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">{t('contact.form.email') || 'E-posta'}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">{t('contact.form.phone') || 'Telefon'}</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="subject">{t('contact.form.subject') || 'Konu'}</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">{t('contact.form.message') || 'Mesajınız'}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className={styles.submitBtn}>
                {t('contact.form.submit') || 'Gönder'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
