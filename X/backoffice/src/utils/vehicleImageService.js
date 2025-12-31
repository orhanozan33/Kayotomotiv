// Vehicle Image Service - Fetches vehicle images from external sources
// This service tries multiple strategies to find vehicle images

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '')
  if (imageUrl.startsWith('http')) return imageUrl
  return `${BACKEND_BASE_URL}${imageUrl}`
}

// Function to get vehicle image from external source
// Uses backend endpoint which generates SVG car illustrations
const getVehicleImageFromExternal = async (brand, model, year = null) => {
  try {
    // Clean brand and model names
    const cleanBrand = brand?.trim() || ''
    const cleanModel = model?.trim() || ''
    
    if (!cleanBrand || !cleanModel) return null
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    
    // Call backend endpoint for SVG car illustration
    const params = new URLSearchParams({ brand: cleanBrand, model: cleanModel })
    if (year) {
      params.append('year', year)
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/vehicle-image/external?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.imageUrl || null
        console.log('External image URL from backend:', imageUrl)
        return imageUrl
      } else {
        console.warn('Backend external image endpoint returned non-ok status:', response.status)
      }
    } catch (fetchError) {
      console.warn('Backend external image endpoint failed:', fetchError)
    }
    
    return null
  } catch (error) {
    console.error('Error getting external vehicle image:', error)
    return null
  }
}

// Main function to find vehicle image (tries local first, then external)
export const findVehicleImage = async (vehiclesAPI, brand, model, year = null) => {
  try {
    if (!brand || !model) return null
    
    // First, try to find in local database
    const cleanBrand = brand.trim()
    const cleanModel = model.trim()
    
    let params = { brand: cleanBrand, model: cleanModel, limit: 10, excludeSold: false }
    if (year) {
      const yearNum = parseInt(year)
      if (!isNaN(yearNum)) {
        params.year = yearNum
      }
    }
    
    const vehiclesRes = await vehiclesAPI.getAll(params)
    let vehicles = vehiclesRes.data?.vehicles || []
    
    // If no exact match found and year was provided, try without year
    if (vehicles.length === 0 && year) {
      params = { brand: cleanBrand, model: cleanModel, limit: 10, excludeSold: false }
      const vehiclesResNoYear = await vehiclesAPI.getAll(params)
      vehicles = vehiclesResNoYear.data?.vehicles || []
    }
    
    // Select the best match (prioritize vehicles with images)
    if (vehicles.length > 0) {
      // Sort by: has primary image > has any image > newest first
      vehicles.sort((a, b) => {
        const aImages = a.images || []
        const bImages = b.images || []
        const aHasPrimary = aImages.some(img => img.is_primary)
        const bHasPrimary = bImages.some(img => img.is_primary)
        
        if (aHasPrimary && !bHasPrimary) return -1
        if (!aHasPrimary && bHasPrimary) return 1
        if (aImages.length > 0 && bImages.length === 0) return -1
        if (aImages.length === 0 && bImages.length > 0) return 1
        return new Date(b.created_at) - new Date(a.created_at)
      })
      
      const vehicle = vehicles[0]
      const images = vehicle.images || []
      const primaryImage = images.find(img => img.is_primary) || images[0]
      if (primaryImage) {
        return {
          image: getImageUrl(primaryImage.image_url),
          vehicleId: vehicle.id,
          source: 'local'
        }
      }
    }
    
    // If no local image found, try external source
    const externalImage = await getVehicleImageFromExternal(brand, model, year)
    console.log('External image result for', brand, model, year, ':', externalImage)
    if (externalImage) {
      return {
        image: externalImage,
        vehicleId: null,
        source: 'external'
      }
    }
    
    console.log('No image found for', brand, model, year)
    return null
  } catch (error) {
    console.error('Error finding vehicle image:', error)
    return null
  }
}
