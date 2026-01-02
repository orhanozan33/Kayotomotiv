'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { vehiclesAPI } from '@/lib/services/adminApi';
import { carBrandsAndModels, years } from '@/lib/data/carBrands';
import ConfirmModal from '@/components/admin/ConfirmModal';
import styles from './vehicles.module.css';

const getImageUrl = (imageUrl: string | null) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${imageUrl}`;
  }
  return imageUrl;
};

const CAR_COLOR_KEYS = [
  'white',
  'black',
  'gray',
  'silver',
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'purple',
  'brown',
  'beige',
  'gold',
  'burgundy',
  'navy',
  'turquoise',
  'pink',
  'bronze',
  'copper',
  'darkBlue',
  'lightBlue',
  'darkGray',
  'lightGray',
  'darkGreen',
  'lightGreen',
  'champagne',
  'navyBlue',
  'jetBlack',
  'pearlWhite',
  'metallicSilver',
  'charcoal',
  'midnightBlue',
];

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuel_type: string;
  transmission: string;
  color?: string;
  description?: string;
  status: string;
  featured: boolean;
  images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    display_order: number;
  }>;
}

export default function VehiclesPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{
      id: string;
      image_url: string;
      is_primary: boolean;
      display_order: number;
    }>
  >([]);
  const [newImagePrimaryIndex, setNewImagePrimaryIndex] = useState<number | null>(null);
  const [deleteImageModal, setDeleteImageModal] = useState({ isOpen: false, imageId: null as string | null });
  const [deleteVehicleModal, setDeleteVehicleModal] = useState({ isOpen: false, vehicleId: null as string | null });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    fuel_type: 'petrol',
    transmission: 'automatic',
    color: '',
    description: '',
    status: 'available',
    featured: false,
  });

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const response = await vehiclesAPI.getAll(params).catch((err) => {
        console.error('Error loading vehicles:', err);
        return { data: { vehicles: [] } };
      });
      setVehicles(response.data?.vehicles || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delay = searchTerm ? 500 : 0;
    const timer = setTimeout(() => {
      loadVehicles();
    }, delay);
    return () => clearTimeout(timer);
  }, [searchTerm, loadVehicles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    const checked = target.type === 'checkbox' ? target.checked : undefined;

    if (name === 'brand') {
      setFormData({
        ...formData,
        brand: value,
        model: '',
      });
      setAvailableModels(value ? carBrandsAndModels[value] || [] : []);
    } else {
      setFormData({
        ...formData,
        [name]: checked !== undefined ? checked : value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);

    if (newImagePrimaryIndex === index) {
      setNewImagePrimaryIndex(null);
    } else if (newImagePrimaryIndex !== null && newImagePrimaryIndex > index) {
      setNewImagePrimaryIndex(newImagePrimaryIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
      };

      let vehicleId: string;
      if (editingVehicle) {
        await vehiclesAPI.update(editingVehicle.id, data);
        vehicleId = editingVehicle.id;
      } else {
        const response = await vehiclesAPI.create(data);
        vehicleId = response.data.vehicle.id;
      }

      if (selectedImages.length > 0 && vehicleId) {
        const hasPrimaryImage = existingImages.some((img) => img.is_primary);
        const primaryIndex =
          newImagePrimaryIndex !== null ? newImagePrimaryIndex : !hasPrimaryImage ? 0 : -1;

        for (let i = 0; i < selectedImages.length; i++) {
          const formDataImage = new FormData();
          formDataImage.append('image', selectedImages[i]);
          formDataImage.append('is_primary', i === primaryIndex ? 'true' : 'false');

          try {
            await vehiclesAPI.addImage(vehicleId, formDataImage);
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
          }
        }
      }

      showSuccess(t('vehicles.savedSuccessfully') || 'Araç başarıyla kaydedildi!');
      setShowForm(false);
      setEditingVehicle(null);
      setSelectedImages([]);
      setImagePreviews([]);
      setNewImagePrimaryIndex(null);
      setExistingImages([]);
      setFormData({
        brand: '',
        model: '',
        year: '',
        price: '',
        mileage: '',
        fuel_type: 'petrol',
        transmission: 'automatic',
        color: '',
        description: '',
        status: 'available',
        featured: false,
      });
      loadVehicles();
    } catch (error: any) {
      showError(
        (t('vehicles.errors.saving') || 'Araç kaydedilirken hata oluştu') +
          ': ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleEdit = async (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    const brand = vehicle.brand || '';
    setAvailableModels(brand ? carBrandsAndModels[brand] || [] : []);
    setFormData({
      brand: brand,
      model: vehicle.model || '',
      year: vehicle.year.toString(),
      price: vehicle.price.toString(),
      mileage: vehicle.mileage?.toString() || '',
      fuel_type: vehicle.fuel_type || 'petrol',
      transmission: vehicle.transmission || 'automatic',
      color: vehicle.color || '',
      description: vehicle.description || '',
      status: vehicle.status || 'available',
      featured: vehicle.featured || false,
    });

    try {
      const response = await vehiclesAPI.getById(vehicle.id);
      setExistingImages(response.data.vehicle.images || []);
    } catch (error) {
      console.error('Error loading vehicle images:', error);
      setExistingImages([]);
    }

    setSelectedImages([]);
    setImagePreviews([]);
    setNewImagePrimaryIndex(null);
    setShowForm(true);
  };

  const handleDeleteExistingImage = (imageId: string) => {
    setDeleteImageModal({ isOpen: true, imageId });
  };

  const confirmDeleteImage = async () => {
    if (!deleteImageModal.imageId) return;
    try {
      await vehiclesAPI.deleteImage(deleteImageModal.imageId);
      setExistingImages(existingImages.filter((img) => img.id !== deleteImageModal.imageId));
      if (editingVehicle) {
        const response = await vehiclesAPI.getById(editingVehicle.id);
        setExistingImages(response.data.vehicle.images || []);
      }
      setDeleteImageModal({ isOpen: false, imageId: null });
    } catch (error: any) {
      console.error('Error deleting image:', error);
      showError(
        (t('vehicles.errors.deletingImage') || 'Resim silinirken hata oluştu') +
          ': ' +
          (error.response?.data?.error || error.message)
      );
      setDeleteImageModal({ isOpen: false, imageId: null });
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    try {
      await vehiclesAPI.updateImage(imageId, { is_primary: true });
      if (editingVehicle) {
        const response = await vehiclesAPI.getById(editingVehicle.id);
        setExistingImages(response.data.vehicle.images || []);
      }
      showSuccess(t('vehicles.primaryImageUpdated') || 'Kapak resmi güncellendi!');
    } catch (error: any) {
      console.error('Error setting primary image:', error);
      showError(
        (t('vehicles.errors.updatingPrimary') || 'Kapak resmi güncellenirken hata oluştu') +
          ': ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    try {
      const sortedImages = [...existingImages].sort(
        (a, b) => (a.display_order || 0) - (b.display_order || 0)
      );
      const currentIndex = sortedImages.findIndex((img) => img.id === imageId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= sortedImages.length) return;

      const currentOrder = sortedImages[currentIndex].display_order || currentIndex;
      const targetOrder = sortedImages[newIndex].display_order || newIndex;

      const imageOrders = [
        { imageId: imageId, display_order: targetOrder },
        { imageId: sortedImages[newIndex].id, display_order: currentOrder },
      ];

      await vehiclesAPI.updateImagesOrder(imageOrders);

      if (editingVehicle) {
        const response = await vehiclesAPI.getById(editingVehicle.id);
        setExistingImages(response.data.vehicle.images || []);
      }
    } catch (error: any) {
      console.error('Error moving image:', error);
      showError(
        (t('vehicles.errors.movingImage') || 'Resim sıralanırken hata oluştu') +
          ': ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleSetNewImageAsPrimary = (index: number) => {
    setNewImagePrimaryIndex(index);
  };

  const handleDelete = (id: string) => {
    setDeleteVehicleModal({ isOpen: true, vehicleId: id });
  };

  const confirmDeleteVehicle = async () => {
    if (!deleteVehicleModal.vehicleId) return;
    const vehicleIdToDelete = deleteVehicleModal.vehicleId;
    const previousVehicles = [...vehicles]; // Backup for error case
    
    // Close modal first
    setDeleteVehicleModal({ isOpen: false, vehicleId: null });
    
    // Immediately remove from UI (optimistic update)
    setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== vehicleIdToDelete));
    
    try {
      // Perform hard delete on server - this will permanently delete from database
      await vehiclesAPI.delete(vehicleIdToDelete);
      showSuccess(t('vehicles.deletedSuccessfully') || 'Araç başarıyla silindi!');
      // DO NOT reload - vehicle is already removed from state and permanently deleted from DB
    } catch (error: any) {
      // Restore previous state on error (server delete failed)
      setVehicles(previousVehicles);
      showError(
        (t('vehicles.errors.deleting') || 'Araç silinirken hata oluştu') +
          ': ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className={styles.vehiclesPage}>
      <div className={styles.pageHeader}>
        <h1>{t('vehicles.title') || 'Araçlar'}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, maxWidth: '400px', marginLeft: '2rem' }}>
          <input
            type="text"
            placeholder={t('vehicles.search') || 'Marka, model, yıl veya fiyat ile ara...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              width: '100%',
            }}
          />
        </div>
        <button
          onClick={() => {
            setEditingVehicle(null);
            setAvailableModels([]);
            setSelectedImages([]);
            setImagePreviews([]);
            setNewImagePrimaryIndex(null);
            setExistingImages([]);
            setFormData({
              brand: '',
              model: '',
              year: '',
              price: '',
              mileage: '',
              fuel_type: 'petrol',
              transmission: 'automatic',
              color: '',
              description: '',
              status: 'available',
              featured: false,
            });
            setShowForm(true);
          }}
          className={styles.btnPrimary}
        >
          {t('vehicles.addVehicle') || 'Araç Ekle'}
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingVehicle ? t('vehicles.editVehicle') || 'Araç Düzenle' : t('vehicles.addVehicle') || 'Araç Ekle'}</h2>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => {
                setShowForm(false);
                setEditingVehicle(null);
                setFormData({
                  brand: '',
                  model: '',
                  year: '',
                  price: '',
                  mileage: '',
                  color: '',
                  fuel_type: 'petrol',
                  transmission: 'automatic',
                  description: '',
                  status: 'available',
                  featured: false,
                });
                setSelectedImages([]);
                setImagePreviews([]);
                setExistingImages([]);
                setNewImagePrimaryIndex(null);
                imagePreviews.forEach((url) => URL.revokeObjectURL(url));
              }}
            >
              ×
            </button>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <select name="brand" value={formData.brand} onChange={handleInputChange} required>
                  <option value="">{t('vehicles.brand') || 'Marka'}</option>
                  {Object.keys(carBrandsAndModels)
                    .sort()
                    .map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                </select>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.brand}
                >
                  <option value="">{t('vehicles.model') || 'Model'}</option>
                  {availableModels.sort().map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <select name="year" value={formData.year} onChange={handleInputChange} required>
                  <option value="">{t('vehicles.year') || 'Yıl'}</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="price"
                  placeholder={t('vehicles.price') || 'Fiyat'}
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                />
                <input
                  type="number"
                  name="mileage"
                  placeholder={t('vehicles.mileage') || 'Kilometre'}
                  value={formData.mileage}
                  onChange={handleInputChange}
                />
                <select name="fuel_type" value={formData.fuel_type} onChange={handleInputChange}>
                  <option value="petrol">{t('vehicles.fuelPetrol') || 'Benzin'}</option>
                  <option value="diesel">{t('vehicles.fuelDiesel') || 'Dizel'}</option>
                  <option value="electric">{t('vehicles.fuelElectric') || 'Elektrik'}</option>
                  <option value="hybrid">{t('vehicles.fuelHybrid') || 'Hibrit'}</option>
                </select>
                <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                  <option value="manual">{t('vehicles.transmissionManual') || 'Manuel'}</option>
                  <option value="automatic">{t('vehicles.transmissionAutomatic') || 'Otomatik'}</option>
                </select>
                <select name="color" value={formData.color} onChange={handleInputChange}>
                  <option value="">{t('vehicles.color') || 'Renk Seçin'}</option>
                  {CAR_COLOR_KEYS.map((colorKey) => (
                    <option key={colorKey} value={colorKey}>
                      {t(`vehicles.colors.${colorKey}`) || colorKey}
                    </option>
                  ))}
                </select>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="available">{t('vehicles.statusAvailable') || 'Müsait'}</option>
                  <option value="sold">{t('vehicles.statusSold') || 'Satıldı'}</option>
                  <option value="reserved">{t('vehicles.statusReserved') || 'Rezerve'}</option>
                  <option value="pending">{t('vehicles.statusPending') || 'Beklemede'}</option>
                </select>
              </div>
              <textarea
                name="description"
                placeholder={t('vehicles.description') || 'Açıklama'}
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />

              <div className={styles.formGroupImages}>
                <label>{t('vehicles.images')}</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />

                {existingImages.length > 0 && (
                  <div className={styles.existingImagesSection}>
                    <h4>{t('vehicles.existingImages')}</h4>
                    <div className={styles.imagePreviewContainer}>
                      {[...existingImages]
                        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        .map((image, index) => {
                          const imageUrl = getImageUrl(image.image_url);
                          const sortedImages = [...existingImages].sort(
                            (a, b) => (a.display_order || 0) - (b.display_order || 0)
                          );
                          return imageUrl ? (
                            <div key={image.id} className={styles.imagePreviewItem}>
                              <img src={imageUrl} alt={`Existing ${image.id}`} />
                              <div className={styles.imageActions}>
                                {!image.is_primary && (
                                  <button
                                    type="button"
                                    className={styles.setPrimaryBtn}
                                    onClick={() => handleSetPrimaryImage(image.id)}
                                    title={t('vehicles.setAsPrimary') || 'Kapak Resmi Yap'}
                                  >
                                    ⭐
                                  </button>
                                )}
                                {image.is_primary && (
                                  <span className={styles.primaryBadge}>{t('vehicles.primary') || 'Kapak'}</span>
                                )}
                                <button
                                  type="button"
                                  className={styles.moveUpBtn}
                                  onClick={() => handleMoveImage(image.id, 'up')}
                                  disabled={index === 0}
                                  title={t('vehicles.moveUp') || 'Yukarı Taşı'}
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className={styles.moveDownBtn}
                                  onClick={() => handleMoveImage(image.id, 'down')}
                                  disabled={index === sortedImages.length - 1}
                                  title={t('vehicles.moveDown') || 'Aşağı Taşı'}
                                >
                                  ↓
                                </button>
                              </div>
                              <button
                                type="button"
                                className={styles.removeImageBtn}
                                onClick={() => handleDeleteExistingImage(image.id)}
                                title={t('vehicles.deleteImage') || 'Resmi Sil'}
                              >
                                ×
                              </button>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div className={styles.newImagesSection}>
                    <h4>{t('vehicles.newImages') || 'Yeni Resimler'}</h4>
                    <div className={styles.imagePreviewContainer}>
                      {imagePreviews.map((preview, index) => {
                        const hasPrimaryInExisting = existingImages.some((img) => img.is_primary);
                        const shouldBePrimary =
                          newImagePrimaryIndex === index ||
                          (!hasPrimaryInExisting && index === 0 && newImagePrimaryIndex === null);
                        return (
                          <div key={`new-${index}`} className={styles.imagePreviewItem}>
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <div className={styles.imageActions}>
                              {!shouldBePrimary && (
                                <button
                                  type="button"
                                  className={styles.setPrimaryBtn}
                                  onClick={() => handleSetNewImageAsPrimary(index)}
                                  title={t('vehicles.setAsPrimary') || 'Kapak Resmi Yap'}
                                >
                                  ⭐
                                </button>
                              )}
                              {shouldBePrimary && (
                                <span className={styles.primaryBadge}>{t('vehicles.primary') || 'Kapak'}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              className={styles.removeImageBtn}
                              onClick={() => removeImage(index)}
                              title={t('vehicles.deleteImage') || 'Resmi Sil'}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                {t('vehicles.featured')}
              </label>
              <div className={styles.modalActions}>
                <button type="submit">{t('common.save') || 'Kaydet'}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehicle(null);
                    setSelectedImages([]);
                    setImagePreviews([]);
                    setNewImagePrimaryIndex(null);
                    setExistingImages([]);
                    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
                  }}
                >
                  {t('common.cancel') || 'İptal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div>{t('common.loading') || 'Yükleniyor...'}</div>
      ) : (
        <div className={styles.vehiclesTableContainer}>
          <table className={styles.vehiclesTable}>
            <thead>
              <tr>
                <th>{t('vehicles.brand') || 'Marka'}</th>
                <th>{t('vehicles.model') || 'Model'}</th>
                <th>{t('vehicles.year') || 'Yıl'}</th>
                <th>{t('vehicles.price') || 'Fiyat'}</th>
                <th>{t('vehicles.status') || 'Durum'}</th>
                <th>{t('vehicles.actions') || 'İşlemler'}</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className={vehicle.status === 'reserved' ? styles.reservedRow : ''}
                >
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.year}</td>
                  <td>${vehicle.price.toLocaleString()}</td>
                  <td>{vehicle.status}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className={styles.actionButtons}>
                      <button onClick={() => handleEdit(vehicle)}>{t('vehicles.edit')}</button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className={styles.btnDanger}
                      >
                        {t('vehicles.delete') || 'Sil'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteImageModal.isOpen}
        onClose={() => setDeleteImageModal({ isOpen: false, imageId: null })}
        onConfirm={confirmDeleteImage}
        title={t('vehicles.confirmDeleteImageTitle') || 'Resmi Sil'}
        message={t('vehicles.confirmDeleteImage') || 'Bu resmi silmek istediğinize emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="success"
      />

      <ConfirmModal
        isOpen={deleteVehicleModal.isOpen}
        onClose={() => setDeleteVehicleModal({ isOpen: false, vehicleId: null })}
        onConfirm={confirmDeleteVehicle}
        title={t('vehicles.confirmDeleteTitle') || 'Aracı Sil'}
        message={t('vehicles.confirmDelete') || 'Bu aracı silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="success"
      />
    </div>
  );
}
