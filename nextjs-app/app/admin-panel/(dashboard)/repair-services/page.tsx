'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useError } from '@/contexts/ErrorContext';
import { adminRepairAPI } from '@/lib/services/adminApi';
import ConfirmModal from '@/components/admin/ConfirmModal';
import styles from './repair-services.module.css';

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  display_order: number;
  is_active: boolean;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  base_price: string;
  display_order: string;
  is_active: boolean;
}

export default function RepairServicesPage() {
  const { t } = useTranslation();
  const { showError, showSuccess } = useError();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; serviceId: string | null }>({ isOpen: false, serviceId: null });
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; service: Service | null }>({ isOpen: false, service: null });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    base_price: '',
    display_order: '0',
    is_active: true
  });

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminRepairAPI.getServices().catch(err => {
        console.error('Error loading services:', err);
        return { data: { services: [] } };
      });
      setServices(response.data?.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        base_price: parseFloat(formData.base_price) || 0,
        display_order: parseInt(formData.display_order) || 0
      };

      if (editingService) {
        await adminRepairAPI.updateService(editingService.id, data);
      } else {
        await adminRepairAPI.createService(data);
      }

      setShowForm(false);
      setEditingService(null);
      setFormData({
        name: '', description: '', category: '', base_price: '',
        display_order: '0', is_active: true
      });
      showSuccess(t('repairServices.savedSuccessfully') || 'Servis başarıyla kaydedildi!');
      loadServices();
    } catch (error: any) {
      showError(t('repairServices.errors.saving') || 'Servis kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await adminRepairAPI.updateService(service.id, { is_active: !service.is_active });
      showSuccess(t('repairServices.statusUpdated') || 'Durum başarıyla güncellendi!');
      setDetailModal({ isOpen: false, service: null });
      loadServices();
    } catch (error: any) {
      showError(t('repairServices.errors.updatingStatus') || 'Durum güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleActiveFromModal = async () => {
    if (detailModal.service) {
      await handleToggleActive(detailModal.service);
    }
  };

  const handleDelete = (serviceId: string) => {
    setDetailModal({ isOpen: false, service: null });
    setDeleteModal({ isOpen: true, serviceId });
  };

  const handleDeleteFromModal = () => {
    if (detailModal.service) {
      handleDelete(detailModal.service.id);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.serviceId) return;
    try {
      await adminRepairAPI.deleteService(deleteModal.serviceId);
      showSuccess(t('repairServices.deletedSuccessfully') || 'Servis başarıyla silindi!');
      setDeleteModal({ isOpen: false, serviceId: null });
      loadServices();
    } catch (error: any) {
      showError(t('repairServices.errors.deleting') || 'Servis silinirken hata oluştu: ' + (error.response?.data?.error || error.message));
      setDeleteModal({ isOpen: false, serviceId: null });
    }
  };

  const handleRowClick = (service: Service) => {
    setDetailModal({ isOpen: true, service });
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        category: service.category || '',
        base_price: (service.base_price || 0).toString(),
        display_order: (service.display_order || 0).toString(),
        is_active: service.is_active !== false
      });
    setDetailModal({ isOpen: false, service: null });
    setShowForm(true);
  };

  const handleEditFromModal = () => {
    if (detailModal.service) {
      handleEdit(detailModal.service);
    }
  };

  if (loading) return <div className={styles.loading}>{t('common.loading')}</div>;

  return (
    <div className={styles.repairServicesPage}>
      <div className={styles.pageHeader}>
        <h1>{t('repairServices.title') || 'Tamir Hizmetleri'}</h1>
        <button onClick={() => {
          setEditingService(null);
          setFormData({
            name: '', description: '', category: '', base_price: '',
            display_order: '0', is_active: true
          });
          setShowForm(true);
        }} className={styles.btnPrimary}>{t('repairServices.addService') || 'Hizmet Ekle'}</button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingService ? t('repairServices.editService') || 'Hizmet Düzenle' : t('repairServices.addService') || 'Hizmet Ekle'}</h2>
            <button 
              type="button" 
              className={styles.modalClose} 
              onClick={() => setShowForm(false)}
            >×</button>
            <form onSubmit={handleSubmit}>
              <input name="name" placeholder={t('repairServices.serviceName') || 'Hizmet Adı'} value={formData.name} onChange={handleInputChange} required />
              <textarea name="description" placeholder={t('repairServices.description') || 'Açıklama'} value={formData.description} onChange={handleInputChange} rows={4} />
              <input name="category" placeholder={t('repairServices.category') || 'Kategori'} value={formData.category} onChange={handleInputChange} />
              <input type="number" name="base_price" placeholder={t('repairServices.basePrice') || 'Fiyat'} value={formData.base_price} onChange={handleInputChange} required step="0.01" />
              <input type="number" name="display_order" placeholder={t('repairServices.displayOrder') || 'Sıralama'} value={formData.display_order} onChange={handleInputChange} />
              <label>
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                {t('common.active')}
              </label>
              <div className={styles.modalActions}>
                <button type="submit">{t('common.save')}</button>
                <button type="button" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>{t('repairServices.name') || 'Ad'}</th>
              <th>{t('repairServices.category') || 'Kategori'}</th>
              <th>{t('repairServices.price') || 'Fiyat'}</th>
              <th>{t('repairServices.order') || 'Sıra'}</th>
              <th>{t('repairServices.status') || 'Durum'}</th>
              <th>{t('repairServices.actions') || 'İşlemler'}</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} onClick={() => handleRowClick(service)} style={{ cursor: 'pointer' }}>
                <td>{service.name}</td>
                <td>{service.category || 'N/A'}</td>
                <td>${service.base_price}</td>
                <td>{service.display_order}</td>
                <td>{service.is_active ? t('common.active') : t('common.inactive')}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className={styles.actionButtons}>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(service); }} className={styles.btnEdit}>{t('common.edit')}</button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(service); }} 
                      className={service.is_active ? styles.btnDeactivate : styles.btnActivate}
                    >
                      {service.is_active ? t('common.deactivate') : t('common.activate')}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }} className={styles.btnDelete}>{t('common.delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, serviceId: null })}
        onConfirm={confirmDelete}
        title={t('repairServices.confirmDeleteTitle') || 'Hizmeti Sil'}
        message={t('repairServices.confirmDelete') || 'Bu hizmeti silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />

      {detailModal.isOpen && detailModal.service && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{detailModal.service.name}</h2>
            <button 
              type="button" 
              className={styles.modalClose} 
              onClick={() => setDetailModal({ isOpen: false, service: null })}
            >×</button>
            <div className={styles.serviceDetail}>
              <div className={styles.detailRow}>
                <label>{t('repairServices.category')}:</label>
                <span>{detailModal.service.category || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('repairServices.description')}:</label>
                <span>{detailModal.service.description || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('repairServices.price')}:</label>
                <span>${detailModal.service.base_price || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('repairServices.displayOrder')}:</label>
                <span>{detailModal.service.display_order || 0}</span>
              </div>
              <div className={styles.detailRow}>
                <label>{t('repairServices.status')}:</label>
                <span>{detailModal.service.is_active ? t('common.active') : t('common.inactive')}</span>
              </div>
              <div className={styles.detailActions}>
                <button onClick={handleEditFromModal} className={styles.btnEdit}>{t('common.edit')}</button>
                <button 
                  onClick={handleToggleActiveFromModal} 
                  className={detailModal.service.is_active ? styles.btnDeactivate : styles.btnActivate}
                >
                  {detailModal.service.is_active ? t('common.deactivate') : t('common.activate')}
                </button>
                <button onClick={handleDeleteFromModal} className={styles.btnDelete}>{t('common.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
