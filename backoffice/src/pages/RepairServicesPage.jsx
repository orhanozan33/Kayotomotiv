import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { repairAPI } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import './RepairServicesPage.css'

function RepairServicesPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, serviceId: null })
  const [detailModal, setDetailModal] = useState({ isOpen: false, service: null })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_price: '',
    display_order: '0',
    is_active: true
  })

  const loadServices = useCallback(async () => {
    try {
      setLoading(true)
      const response = await repairAPI.getServices().catch(err => {
        console.error('Error loading services:', err)
        return { data: { services: [] } }
      })
      setServices(response.data?.services || [])
    } catch (error) {
      console.error('Error loading services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, []) // Empty dependency array - only run once on mount

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        display_order: parseInt(formData.display_order)
      }

      if (editingService) {
        await repairAPI.updateService(editingService.id, data)
      } else {
        await repairAPI.createService(data)
      }

      // Service saved successfully
      setShowForm(false)
      setEditingService(null)
      setFormData({
        name: '', description: '', category: '', base_price: '',
        display_order: '0', is_active: true
      })
      showSuccess(t('repairServices.savedSuccessfully') || 'Servis başarıyla kaydedildi!')
      loadServices()
    } catch (error) {
      showError(t('repairServices.errors.saving') || 'Servis kaydedilirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleToggleActive = async (service) => {
    try {
      await repairAPI.updateService(service.id, { is_active: !service.is_active })
      showSuccess(t('repairServices.statusUpdated') || 'Durum başarıyla güncellendi!')
      setDetailModal({ isOpen: false, service: null })
      loadServices()
    } catch (error) {
      showError(t('repairServices.errors.updatingStatus') || 'Durum güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleToggleActiveFromModal = async () => {
    if (detailModal.service) {
      await handleToggleActive(detailModal.service)
    }
  }

  const handleDelete = (serviceId) => {
    setDetailModal({ isOpen: false, service: null })
    setDeleteModal({ isOpen: true, serviceId })
  }

  const handleDeleteFromModal = () => {
    if (detailModal.service) {
      handleDelete(detailModal.service.id)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal.serviceId) return
    try {
      await repairAPI.deleteService(deleteModal.serviceId)
      showSuccess(t('repairServices.deletedSuccessfully') || 'Servis başarıyla silindi!')
      setDeleteModal({ isOpen: false, serviceId: null })
      loadServices()
    } catch (error) {
      showError(t('repairServices.errors.deleting') || 'Servis silinirken hata oluştu: ' + (error.response?.data?.error || error.message))
      setDeleteModal({ isOpen: false, serviceId: null })
    }
  }

  const handleRowClick = (service) => {
    setDetailModal({ isOpen: true, service })
  }

  const handleEdit = (service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category || '',
      base_price: service.base_price?.toString() || '',
      display_order: service.display_order?.toString() || '0',
      is_active: service.is_active !== false
    })
    setDetailModal({ isOpen: false, service: null })
    setShowForm(true)
  }

  const handleEditFromModal = () => {
    if (detailModal.service) {
      handleEdit(detailModal.service)
    }
  }

  if (loading) return <div className="loading">{t('common.loading')}</div>

  return (
    <div className="repair-services-page">
      <div className="page-header">
        <h1>{t('repairServices.title')}</h1>
        <button onClick={() => {
          setEditingService(null)
          setFormData({
            name: '', description: '', category: '', base_price: '',
            display_order: '0', is_active: true
          })
          setShowForm(true)
        }} className="btn-primary">{t('repairServices.addService')}</button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingService ? t('repairServices.editService') : t('repairServices.addService')}</h2>
            <form onSubmit={handleSubmit}>
              <input name="name" placeholder={t('repairServices.serviceName')} value={formData.name} onChange={handleInputChange} required />
              <textarea name="description" placeholder={t('repairServices.description')} value={formData.description} onChange={handleInputChange} rows="4" />
              <input name="category" placeholder={t('repairServices.category')} value={formData.category} onChange={handleInputChange} />
              <input type="number" name="base_price" placeholder={t('repairServices.basePrice')} value={formData.base_price} onChange={handleInputChange} required step="0.01" />
              <input type="number" name="display_order" placeholder={t('repairServices.displayOrder')} value={formData.display_order} onChange={handleInputChange} />
              <label>
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
                {t('common.active')}
              </label>
              <div className="modal-actions">
                <button type="submit">{t('common.save')}</button>
                <button type="button" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('repairServices.name')}</th>
              <th>{t('repairServices.category')}</th>
              <th>{t('repairServices.price')}</th>
              <th>{t('repairServices.order')}</th>
              <th>{t('repairServices.status')}</th>
              <th>{t('repairServices.actions')}</th>
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
                  <div className="action-buttons">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(service); }} className="btn-edit">{t('common.edit')}</button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(service); }} 
                      className={service.is_active ? 'btn-deactivate' : 'btn-activate'}
                    >
                      {service.is_active ? t('common.deactivate') : t('common.activate')}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(service.id); }} className="btn-delete">{t('common.delete')}</button>
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
        title={t('repairServices.confirmDeleteTitle')}
        message={t('repairServices.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
      />

      {detailModal.isOpen && detailModal.service && (
        <div className="modal">
          <div className="modal-content">
            <h2>{detailModal.service.name}</h2>
            <button 
              type="button" 
              className="modal-close" 
              onClick={() => setDetailModal({ isOpen: false, service: null })}
            >×</button>
            <div className="service-detail">
              <div className="detail-row">
                <label>{t('repairServices.category')}:</label>
                <span>{detailModal.service.category || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>{t('repairServices.description')}:</label>
                <span>{detailModal.service.description || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <label>{t('repairServices.price')}:</label>
                <span>${detailModal.service.base_price}</span>
              </div>
              <div className="detail-row">
                <label>{t('repairServices.displayOrder')}:</label>
                <span>{detailModal.service.display_order}</span>
              </div>
              <div className="detail-row">
                <label>{t('repairServices.status')}:</label>
                <span>{detailModal.service.is_active ? t('common.active') : t('common.inactive')}</span>
              </div>
              <div className="detail-actions">
                <button onClick={handleEditFromModal} className="btn-edit">{t('common.edit')}</button>
                <button 
                  onClick={handleToggleActiveFromModal} 
                  className={detailModal.service.is_active ? 'btn-deactivate' : 'btn-activate'}
                >
                  {detailModal.service.is_active ? t('common.deactivate') : t('common.activate')}
                </button>
                <button onClick={handleDeleteFromModal} className="btn-delete">{t('common.delete')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RepairServicesPage

