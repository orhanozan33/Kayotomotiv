import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useError } from '../contexts/ErrorContext'
import { vehiclesAPI } from '../services/api'
import { carBrandsAndModels, years } from '../data/carBrands'
import ConfirmModal from '../components/ConfirmModal'
import './VehiclesPage.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '')

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http')) return imageUrl
  return `${BACKEND_BASE_URL}${imageUrl}`
}

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
  'midnightBlue'
]

function VehiclesPage() {
  const { t } = useTranslation()
  const { showError, showSuccess } = useError()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [availableModels, setAvailableModels] = useState([])
  const [selectedImages, setSelectedImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [newImagePrimaryIndex, setNewImagePrimaryIndex] = useState(null) // Track which new image should be primary
  const [deleteImageModal, setDeleteImageModal] = useState({ isOpen: false, imageId: null })
  const [deleteVehicleModal, setDeleteVehicleModal] = useState({ isOpen: false, vehicleId: null })
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
    featured: false
  })

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await vehiclesAPI.getAll({ limit: 100 }).catch(err => {
        console.error('Error loading vehicles:', err)
        return { data: { vehicles: [] } }
      })
      setVehicles(response.data?.vehicles || [])
    } catch (error) {
      console.error('Error loading vehicles:', error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVehicles()
    
    // Check for expired reservations every 30 seconds
    const interval = setInterval(() => {
      loadVehicles()
    }, 30000)
    
    return () => clearInterval(interval)
  }, []) // Empty dependency array - only run once on mount

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'brand') {
      setFormData({
        ...formData,
        brand: value,
        model: '' // Reset model when brand changes
      })
      setAvailableModels(value ? (carBrandsAndModels[value] || []) : [])
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    // Add new files to existing selected images instead of replacing them
    setSelectedImages(prev => [...prev, ...files])
    
    // Create previews for new files and add to existing previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
    
    // Reset file input so same files can be selected again
    e.target.value = ''
  }

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index])
    
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    
    // If the removed image was marked as primary, reset primary index
    if (newImagePrimaryIndex === index) {
      setNewImagePrimaryIndex(null)
    } else if (newImagePrimaryIndex !== null && newImagePrimaryIndex > index) {
      // Adjust primary index if a previous image was removed
      setNewImagePrimaryIndex(newImagePrimaryIndex - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: formData.mileage ? parseInt(formData.mileage) : null
      }

      let vehicleId
      if (editingVehicle) {
        await vehiclesAPI.update(editingVehicle.id, data)
        vehicleId = editingVehicle.id
      } else {
        const response = await vehiclesAPI.create(data)
        vehicleId = response.data.vehicle.id
      }

      // Upload images if any
      if (selectedImages.length > 0 && vehicleId) {
        // Determine if we need to set primary (only if no existing images or no primary exists)
        const hasPrimaryImage = existingImages.some(img => img.is_primary)
        // Use newImagePrimaryIndex if set, otherwise use first image if no primary exists
        const primaryIndex = newImagePrimaryIndex !== null ? newImagePrimaryIndex : (!hasPrimaryImage ? 0 : -1)
        
        for (let i = 0; i < selectedImages.length; i++) {
          const formDataImage = new FormData()
          formDataImage.append('image', selectedImages[i])
          // Set as primary if this is the selected primary index
          formDataImage.append('is_primary', (i === primaryIndex) ? 'true' : 'false')
          
          try {
            await vehiclesAPI.addImage(vehicleId, formDataImage)
          } catch (imageError) {
            console.error('Error uploading image:', imageError)
            // Continue with other images even if one fails
          }
        }
      }

      showSuccess(t('vehicles.savedSuccessfully'))
      setShowForm(false)
      setEditingVehicle(null)
      setSelectedImages([])
      setImagePreviews([])
      setNewImagePrimaryIndex(null)
      setExistingImages([])
      setFormData({
        brand: '', model: '', year: '', price: '', mileage: '',
        fuel_type: 'petrol', transmission: 'automatic', color: '',
        description: '', status: 'available', featured: false
      })
      loadVehicles()
    } catch (error) {
      showError(t('vehicles.errors.saving') + ': ' + (error.response?.data?.error || error.message))
    }
  }

  const handleEdit = async (vehicle) => {
    setEditingVehicle(vehicle)
    const brand = vehicle.brand || ''
    setAvailableModels(brand ? (carBrandsAndModels[brand] || []) : [])
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
      featured: vehicle.featured || false
    })
    
    // Load existing images
    try {
      const response = await vehiclesAPI.getById(vehicle.id)
      setExistingImages(response.data.vehicle.images || [])
    } catch (error) {
      console.error('Error loading vehicle images:', error)
      setExistingImages([])
    }
    
    setSelectedImages([])
    setImagePreviews([])
    setNewImagePrimaryIndex(null)
    setShowForm(true)
  }

  const handleDeleteExistingImage = (imageId) => {
    setDeleteImageModal({ isOpen: true, imageId })
  }

  const confirmDeleteImage = async () => {
    if (!deleteImageModal.imageId) return
    try {
      await vehiclesAPI.deleteImage(deleteImageModal.imageId)
      setExistingImages(existingImages.filter(img => img.id !== deleteImageModal.imageId))
      // Reload vehicle data to get updated images
      if (editingVehicle) {
        const response = await vehiclesAPI.getById(editingVehicle.id)
        setExistingImages(response.data.vehicle.images || [])
      }
      setDeleteImageModal({ isOpen: false, imageId: null })
    } catch (error) {
      console.error('Error deleting image:', error)
      showError(t('vehicles.errors.deletingImage') || 'Resim silinirken hata oluştu: ' + (error.response?.data?.error || error.message))
      setDeleteImageModal({ isOpen: false, imageId: null })
    }
  }

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await vehiclesAPI.updateImage(imageId, { is_primary: true })
      // Reload images to get updated state
      if (editingVehicle) {
        const response = await vehiclesAPI.getById(editingVehicle.id)
        setExistingImages(response.data.vehicle.images || [])
      }
      showSuccess(t('vehicles.primaryImageUpdated') || 'Kapak resmi güncellendi!')
    } catch (error) {
      console.error('Error setting primary image:', error)
      showError(t('vehicles.errors.updatingPrimary') || 'Kapak resmi güncellenirken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleMoveImage = async (imageId, direction) => {
    try {
      const sortedImages = [...existingImages].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      const currentIndex = sortedImages.findIndex(img => img.id === imageId)
      if (currentIndex === -1) return

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= sortedImages.length) return

      // Swap display_order values
      const currentOrder = sortedImages[currentIndex].display_order || currentIndex
      const targetOrder = sortedImages[newIndex].display_order || newIndex
      
      const imageOrders = [
        { imageId: imageId, display_order: targetOrder },
        { imageId: sortedImages[newIndex].id, display_order: currentOrder }
      ]
      
      await vehiclesAPI.updateImagesOrder(imageOrders)
      
      // Reload images
      if (editingVehicle) {
        const response = await vehiclesAPI.getById(editingVehicle.id)
        setExistingImages(response.data.vehicle.images || [])
      }
    } catch (error) {
      console.error('Error moving image:', error)
      showError(t('vehicles.errors.movingImage') || 'Resim sıralanırken hata oluştu: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleSetNewImageAsPrimary = (index) => {
    // Set this new image index as primary
    setNewImagePrimaryIndex(index)
  }

  const handleDelete = (id) => {
    setDeleteVehicleModal({ isOpen: true, vehicleId: id })
  }

  const confirmDeleteVehicle = async () => {
    if (!deleteVehicleModal.vehicleId) return
    try {
      await vehiclesAPI.delete(deleteVehicleModal.vehicleId)
      setDeleteVehicleModal({ isOpen: false, vehicleId: null })
      loadVehicles()
    } catch (error) {
      showError(t('vehicles.errors.deleting') + ': ' + (error.response?.data?.error || error.message))
      setDeleteVehicleModal({ isOpen: false, vehicleId: null })
    }
  }

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <h1>{t('vehicles.title')}</h1>
        <button onClick={() => {
          setEditingVehicle(null)
          setAvailableModels([])
          setSelectedImages([])
          setImagePreviews([])
          setNewImagePrimaryIndex(null)
          setExistingImages([])
          setFormData({
            brand: '', model: '', year: '', price: '', mileage: '',
            fuel_type: 'petrol', transmission: 'automatic', color: '',
            description: '', status: 'available', featured: false
          })
          setShowForm(true)
        }} className="btn-primary">{t('vehicles.addVehicle')}</button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingVehicle ? t('vehicles.editVehicle') : t('vehicles.addVehicle')}</h2>
            <button 
              type="button" 
              className="modal-close" 
              onClick={() => {
                setShowForm(false)
                setEditingVehicle(null)
                setFormData({
                  brand: '', model: '', year: '', price: '', mileage: '', color: '', 
                  fuel_type: '', transmission: '', description: '', status: 'available'
                })
                setSelectedImages([])
                setImagePreviews([])
                setExistingImages([])
                setNewImagePrimaryIndex(null)
              }}
            >×</button>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <select name="brand" value={formData.brand} onChange={handleInputChange} required>
                  <option value="">{t('vehicles.brand')}</option>
                  {Object.keys(carBrandsAndModels).sort().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <select name="model" value={formData.model} onChange={handleInputChange} required disabled={!formData.brand}>
                  <option value="">{t('vehicles.model')}</option>
                  {availableModels.sort().map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <select name="year" value={formData.year} onChange={handleInputChange} required>
                  <option value="">{t('vehicles.year')}</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <input type="number" name="price" placeholder={t('vehicles.price')} value={formData.price} onChange={handleInputChange} required step="0.01" />
                <input type="number" name="mileage" placeholder={t('vehicles.mileage')} value={formData.mileage} onChange={handleInputChange} />
                <select name="fuel_type" value={formData.fuel_type} onChange={handleInputChange}>
                  <option value="petrol">{t('vehicles.fuelPetrol')}</option>
                  <option value="diesel">{t('vehicles.fuelDiesel')}</option>
                  <option value="electric">{t('vehicles.fuelElectric')}</option>
                  <option value="hybrid">{t('vehicles.fuelHybrid')}</option>
                </select>
                <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                  <option value="manual">{t('vehicles.transmissionManual')}</option>
                  <option value="automatic">{t('vehicles.transmissionAutomatic')}</option>
                </select>
                <select name="color" value={formData.color} onChange={handleInputChange}>
                  <option value="">{t('vehicles.color') || 'Renk Seçin'}</option>
                  {CAR_COLOR_KEYS.map(colorKey => (
                    <option key={colorKey} value={colorKey}>{t(`vehicles.colors.${colorKey}`)}</option>
                  ))}
                </select>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="available">{t('vehicles.statusAvailable')}</option>
                  <option value="sold">{t('vehicles.statusSold')}</option>
                  <option value="reserved">{t('vehicles.statusReserved')}</option>
                  <option value="pending">{t('common.loading')}</option>
                </select>
              </div>
              <textarea name="description" placeholder={t('vehicles.description')} value={formData.description} onChange={handleInputChange} rows="4" />
              
              <div className="form-group-images">
                <label>{t('vehicles.images')}</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  className="file-input"
                />
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="existing-images-section">
                    <h4>{t('vehicles.existingImages')}</h4>
                    <div className="image-preview-container">
                      {[...existingImages].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((image, index) => {
                        const imageUrl = getImageUrl(image.image_url)
                        const sortedImages = [...existingImages].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                        return imageUrl ? (
                          <div key={image.id} className="image-preview-item">
                            <img src={imageUrl} alt={`Existing ${image.id}`} />
                            <div className="image-actions">
                              {!image.is_primary && (
                                <button 
                                  type="button" 
                                  className="set-primary-btn"
                                  onClick={() => handleSetPrimaryImage(image.id)}
                                  title={t('vehicles.setAsPrimary') || 'Kapak Resmi Yap'}
                                >
                                  ⭐
                                </button>
                              )}
                              {image.is_primary && <span className="primary-badge">{t('vehicles.primary')}</span>}
                              <button 
                                type="button" 
                                className="move-up-btn"
                                onClick={() => handleMoveImage(image.id, 'up')}
                                disabled={index === 0}
                                title={t('vehicles.moveUp') || 'Yukarı Taşı'}
                              >
                                ↑
                              </button>
                              <button 
                                type="button" 
                                className="move-down-btn"
                                onClick={() => handleMoveImage(image.id, 'down')}
                                disabled={index === sortedImages.length - 1}
                                title={t('vehicles.moveDown') || 'Aşağı Taşı'}
                              >
                                ↓
                              </button>
                            </div>
                            <button 
                              type="button" 
                              className="remove-image-btn"
                              onClick={() => handleDeleteExistingImage(image.id)}
                              title={t('vehicles.deleteImage')}
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="new-images-section">
                    <h4>{t('vehicles.newImages')}</h4>
                    <div className="image-preview-container">
                      {imagePreviews.map((preview, index) => {
                        const hasPrimaryInExisting = existingImages.some(img => img.is_primary)
                        const shouldBePrimary = (newImagePrimaryIndex === index) || (!hasPrimaryInExisting && index === 0 && newImagePrimaryIndex === null)
                        return (
                          <div key={`new-${index}`} className="image-preview-item">
                            <img src={preview} alt={`Preview ${index + 1}`} />
                            <div className="image-actions">
                              {!shouldBePrimary && (
                                <button 
                                  type="button" 
                                  className="set-primary-btn"
                                  onClick={() => handleSetNewImageAsPrimary(index)}
                                  title={t('vehicles.setAsPrimary') || 'Kapak Resmi Yap'}
                                >
                                  ⭐
                                </button>
                              )}
                              {shouldBePrimary && <span className="primary-badge">{t('vehicles.primary')}</span>}
                            </div>
                            <button 
                              type="button" 
                              className="remove-image-btn"
                              onClick={() => removeImage(index)}
                              title={t('vehicles.deleteImage')}
                            >
                              ×
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <label>
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} />
                {t('vehicles.featured')}
              </label>
              <div className="modal-actions">
                <button type="submit">{t('common.save')}</button>
                <button type="button" onClick={() => {
                  setShowForm(false)
                  setEditingVehicle(null)
                  setSelectedImages([])
                  setImagePreviews([])
                  setNewImagePrimaryIndex(null)
                  setExistingImages([])
                  // Clean up preview URLs
                  imagePreviews.forEach(url => URL.revokeObjectURL(url))
                }}>{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div>{t('common.loading')}</div>
      ) : (
        <div className="vehicles-table-container">
          <table className="vehicles-table">
            <thead>
              <tr>
                <th>{t('vehicles.brand')}</th>
                <th>{t('vehicles.model')}</th>
                <th>{t('vehicles.year')}</th>
                <th>{t('vehicles.price')}</th>
                <th>{t('vehicles.status')}</th>
                <th>{t('vehicles.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(vehicle => (
                <tr key={vehicle.id} className={vehicle.status === 'reserved' ? 'reserved-row' : ''}>
                  <td>{vehicle.brand}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.year}</td>
                  <td>${vehicle.price.toLocaleString()}</td>
                  <td>{vehicle.status}</td>
                  <td>
                    <button onClick={() => handleEdit(vehicle)}>{t('vehicles.edit')}</button>
                    <button onClick={() => handleDelete(vehicle.id)} className="btn-danger">{t('vehicles.delete')}</button>
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
  )
}

export default VehiclesPage

