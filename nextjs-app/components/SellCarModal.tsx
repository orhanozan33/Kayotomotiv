'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { carBrandsAndModels, years } from '@/lib/data/carBrands';
import styles from './SellCarModal.module.css';

interface SellCarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  brand: string;
  model: string;
  year: string;
  transmission: string;
  fuelType: string;
  images: File[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'CVT', 'Dual Clutch'];
const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid'];

export default function SellCarModal({ isOpen, onClose }: SellCarModalProps) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [loading, setLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    brand: '',
    model: '',
    year: '',
    transmission: '',
    fuelType: '',
    images: [],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });

  useEffect(() => {
    if (formData.brand) {
      setAvailableModels(carBrandsAndModels[formData.brand] || []);
      setFormData(prev => ({ ...prev, model: '' }));
    } else {
      setAvailableModels([]);
    }
  }, [formData.brand]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 6) {
      showError(t('sellCar.maxImages') || 'Maksimum 6 resim yükleyebilirsiniz');
      return;
    }

    const validFiles = files.slice(0, 6);
    setFormData(prev => ({ ...prev, images: validFiles }));

    // Create previews
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model || !formData.year || !formData.transmission || !formData.fuelType) {
      showError(t('sellCar.fillRequired') || 'Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      showError(t('sellCar.fillContact') || 'Lütfen iletişim bilgilerinizi doldurun');
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('transmission', formData.transmission);
      formDataToSend.append('fuelType', formData.fuelType);
      formDataToSend.append('customerName', formData.customerName);
      formDataToSend.append('customerEmail', formData.customerEmail);
      formDataToSend.append('customerPhone', formData.customerPhone);
      formDataToSend.append('notes', formData.notes || '');
      
      formData.images.forEach((file, index) => {
        formDataToSend.append(`images`, file);
      });

      const response = await fetch('/api/sell-car', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Form gönderilirken bir hata oluştu');
      }

      showSuccess(t('sellCar.success') || 'Araç satış talebiniz başarıyla gönderildi!');
      handleClose();
    } catch (error: any) {
      showError(error.message || t('sellCar.error') || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      brand: '',
      model: '',
      year: '',
      transmission: '',
      fuelType: '',
      images: [],
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
    });
    setImagePreviews([]);
    setAvailableModels([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{t('sellCar.title') || 'Arabanızı Satın'}</h2>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>
                {t('sellCar.brand') || 'Marka'} <span className={styles.required}>*</span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
              >
                <option value="">{t('sellCar.selectBrand') || 'Marka Seçin'}</option>
                {Object.keys(carBrandsAndModels).map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>
                {t('sellCar.model') || 'Model'} <span className={styles.required}>*</span>
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
                disabled={!formData.brand}
              >
                <option value="">{t('sellCar.selectModel') || 'Model Seçin'}</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>
                {t('sellCar.year') || 'Yıl'} <span className={styles.required}>*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
              >
                <option value="">{t('sellCar.selectYear') || 'Yıl Seçin'}</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>
                {t('sellCar.transmission') || 'Vites Türü'} <span className={styles.required}>*</span>
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                required
              >
                <option value="">{t('sellCar.selectTransmission') || 'Vites Türü Seçin'}</option>
                {TRANSMISSION_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>
                {t('sellCar.fuelType') || 'Yakıt Türü'} <span className={styles.required}>*</span>
              </label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                required
              >
                <option value="">{t('sellCar.selectFuelType') || 'Yakıt Türü Seçin'}</option>
                {FUEL_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              {t('sellCar.images') || 'Araç Resimleri'} (Maksimum 6)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className={styles.fileInput}
            />
            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviews}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImageBtn}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.contactSection}>
            <h3>{t('sellCar.contactInfo') || 'İletişim Bilgileri'}</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>
                  {t('sellCar.name') || 'Ad Soyad'} <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  {t('sellCar.email') || 'E-posta'} <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  {t('sellCar.phone') || 'Telefon'} <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>{t('sellCar.notes') || 'Notlar'}</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder={t('sellCar.notesPlaceholder') || 'Araç hakkında ek bilgiler...'}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
              {t('common.cancel') || 'İptal'}
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? (t('common.sending') || 'Gönderiliyor...') : (t('sellCar.submit') || 'Gönder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
