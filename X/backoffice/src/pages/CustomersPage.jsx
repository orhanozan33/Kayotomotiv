import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { customersAPI } from '../services/api'
import CustomerDetailModal from '../components/CustomerDetailModal'
import ConfirmModal from '../components/ConfirmModal'
import { carBrandsAndModels, years } from '../data/carBrands'
import './CustomersPage.css'

function CustomersPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteCustomerModal, setDeleteCustomerModal] = useState({ isOpen: false, customerId: null })
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_year: '',
    license_plate: '',
    notes: ''
  })
  const [availableModels, setAvailableModels] = useState([])

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const params = searchTerm ? { search: searchTerm } : {}
      const response = await customersAPI.getAll(params).catch(err => {
        console.error('Error loading customers:', err)
        return { data: { customers: [] } }
      })
      setCustomers(response.data?.customers || [])
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
    // Debounce search - wait 500ms before searching (but not on initial load)
    const delay = searchTerm ? 500 : 0
    const timer = setTimeout(() => {
      loadCustomers()
    }, delay)
    
    return () => clearTimeout(timer)
  }, [searchTerm]) // Remove loadCustomers from dependencies to avoid infinite loop

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // If brand changes, update available models and reset model selection
    if (name === 'vehicle_brand') {
      setFormData({
        ...formData,
        vehicle_brand: value,
        vehicle_model: '' // Reset model when brand changes
      })
      setAvailableModels(value ? (carBrandsAndModels[value] || []) : [])
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Clean up form data - convert empty strings to null and year to number if provided
      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        vehicle_brand: formData.vehicle_brand || null,
        vehicle_model: formData.vehicle_model || null,
        vehicle_year: formData.vehicle_year ? parseInt(formData.vehicle_year) : null,
        license_plate: formData.license_plate.trim() || null,
        notes: formData.notes.trim() || null
      }
      
      await customersAPI.create(submitData)
      showSuccess(t('customers.createdSuccessfully') || 'Customer created successfully!')
      setShowForm(false)
      setFormData({
        first_name: '', last_name: '', email: '', phone: '', address: '',
        vehicle_brand: '', vehicle_model: '', vehicle_year: '', license_plate: '', notes: ''
      })
      setAvailableModels([])
      loadCustomers()
    } catch (error) {
      console.error('Error creating customer:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message
      showError('Error creating customer: ' + errorMessage)
    }
  }

  const handleCustomerClick = async (customer) => {
    try {
      const response = await customersAPI.getById(customer.id)
      setSelectedCustomer(response.data.customer)
    } catch (error) {
      showError(t('customers.errors.loadingDetails') + ': ' + (error.response?.data?.error || error.message))
    }
  }

  const handleCloseModal = () => {
    setSelectedCustomer(null)
    loadCustomers()
  }

  const handleCustomerUpdate = async () => {
    // Reload customer data when updated
    if (selectedCustomer) {
      try {
        const response = await customersAPI.getById(selectedCustomer.id)
        setSelectedCustomer(response.data.customer)
      } catch (error) {
        console.error('Error reloading customer:', error)
      }
    }
    loadCustomers()
  }

  const handleDelete = (id) => {
    setDeleteCustomerModal({ isOpen: true, customerId: id })
  }

  const confirmDeleteCustomer = async () => {
    if (!deleteCustomerModal.customerId) return
    try {
      await customersAPI.delete(deleteCustomerModal.customerId)
      setDeleteCustomerModal({ isOpen: false, customerId: null })
      loadCustomers()
    } catch (error) {
      showError(t('customers.errors.deleting') + ': ' + (error.response?.data?.error || error.message))
      setDeleteCustomerModal({ isOpen: false, customerId: null })
    }
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>{t('customers.title')}</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">{t('customers.addCustomer')}</button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder={t('customers.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{t('customers.form.title')}</h2>
            <button 
              type="button" 
              className="modal-close" 
              onClick={() => {
                setShowForm(false)
                setFormData({
                  first_name: '', last_name: '', email: '', phone: '', address: '',
                  vehicle_brand: '', vehicle_model: '', vehicle_year: '', notes: ''
                })
                setAvailableModels([])
              }}
            >×</button>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <input
                  name="first_name"
                  placeholder={t('customers.form.firstName')}
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  name="last_name"
                  placeholder={t('customers.form.lastName')}
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t('customers.form.email')}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder={t('customers.form.phone')}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <select
                  name="vehicle_brand"
                  value={formData.vehicle_brand}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">{t('customers.form.selectBrand') || 'Select Brand'}</option>
                  {Object.keys(carBrandsAndModels).sort().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <select
                  name="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={!formData.vehicle_brand}
                >
                  <option value="">{t('customers.form.selectModel') || 'Select Model'}</option>
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <select
                  name="vehicle_year"
                  value={formData.vehicle_year}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">{t('customers.form.selectYear') || 'Select Year'}</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <input
                  name="license_plate"
                  placeholder={t('customers.form.licensePlate') || 'Plaka'}
                  value={formData.license_plate}
                  onChange={handleInputChange}
                />
              </div>
              <textarea
                name="address"
                placeholder={t('customers.form.address')}
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
              />
              <textarea
                name="notes"
                placeholder={t('customers.form.notes')}
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
              />
              <div className="modal-actions">
                <button type="submit">{t('customers.form.create')}</button>
                <button type="button" onClick={() => setShowForm(false)}>{t('customers.form.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={handleCloseModal}
          onUpdate={handleCustomerUpdate}
        />
      )}

      {loading ? (
        <div className="loading">{t('customers.loading')}</div>
      ) : customers.length === 0 ? (
        <div className="no-results">{t('customers.noResults')}</div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>{t('customers.name')}</th>
                <th>{t('customers.email')}</th>
                <th>{t('customers.phone')}</th>
                <th>{t('customers.vehicle')}</th>
                <th>{t('customers.totalSpent')}</th>
                <th>{t('customers.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.first_name} {customer.last_name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>
                    {customer.vehicle_brand && customer.vehicle_model
                      ? `${customer.vehicle_brand} ${customer.vehicle_model} ${customer.vehicle_year || ''}`
                      : '-'}
                  </td>
                  <td>${parseFloat(customer.total_spent || 0).toFixed(2)}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleCustomerClick(customer)} className="btn-view">{t('customers.viewDetails')}</button>
                      <button onClick={() => handleDelete(customer.id)} className="btn-danger">{t('customers.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteCustomerModal.isOpen}
        onClose={() => setDeleteCustomerModal({ isOpen: false, customerId: null })}
        onConfirm={confirmDeleteCustomer}
        title={t('customers.confirmDeleteTitle') || 'Müşteriyi Sil'}
        message={t('customers.confirmDelete') || 'Bu müşteriyi silmek istediğinizden emin misiniz?'}
        confirmText={t('common.delete') || 'Sil'}
        cancelText={t('common.cancel') || 'İptal'}
        type="success"
      />
    </div>
  )
}

export default CustomersPage

