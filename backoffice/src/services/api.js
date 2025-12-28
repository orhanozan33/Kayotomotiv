import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Retry logic
const retryRequest = async (error, retryCount = 0) => {
  const config = error.config

  // Don't retry if already max retries or if it's not a network/timeout error
  if (!config || retryCount >= MAX_RETRIES) {
    return Promise.reject(error)
  }

  // Only retry on network errors or timeout
  if (!error.response && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message.includes('timeout'))) {
    config.__retryCount = retryCount + 1
    
    // Wait before retrying (exponential backoff)
    const delay = RETRY_DELAY * Math.pow(2, retryCount)
    await new Promise(resolve => setTimeout(resolve, delay))
    
    return api(config)
  }

  return Promise.reject(error)
}

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Add retry count if not exists
  if (!config.__retryCount) {
    config.__retryCount = 0
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle response errors with retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Try to retry the request
    return retryRequest(error, error.config?.__retryCount || 0)
  }
)

export default api

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
}

// Vehicles API
export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  addImage: (id, formData) => api.post(`/vehicles/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateImage: (imageId, data) => api.put(`/vehicles/images/${imageId}`, data),
  updateImagesOrder: (imageOrders) => api.post('/vehicles/images/update-order', { imageOrders }),
  deleteImage: (imageId) => api.delete(`/vehicles/images/${imageId}`)
}

// Reservations API
export const reservationsAPI = {
  getAll: () => api.get('/reservations'),
  updateStatus: (id, status) => api.put(`/reservations/${id}/status`, { status }),
  delete: (id) => api.delete(`/reservations/${id}`),
  getTestDrives: () => api.get('/reservations/test-drive'),
  updateTestDriveStatus: (id, status) => api.put(`/reservations/test-drive/${id}/status`, { status }),
  deleteTestDrive: (id) => api.delete(`/reservations/test-drive/${id}`)
}

// Repair API
export const repairAPI = {
  getServices: () => api.get('/repair/services/all'),
  createService: (data) => api.post('/repair/services', data),
  updateService: (id, data) => api.put(`/repair/services/${id}`, data),
  deleteService: (id) => api.delete(`/repair/services/${id}`),
  getQuotes: (params) => api.get('/repair/quotes', { params }), // Real repair quotes (NOT vehicle records)
  getVehicleRecords: (params) => api.get('/repair/vehicle-records', { params }), // Vehicle records from "Oto Yıkama Kayıt"
  getVehicleRecordsRevenue: (params) => api.get('/repair/vehicle-records/revenue', { params }), // Revenue stats for vehicle records
  createVehicleRecord: (data) => api.post('/repair/vehicle-records', data),
  cleanupOldRecords: () => api.delete('/repair/vehicle-records/cleanup'),
  updateQuoteStatus: (id, status, notes, total_price) => api.put(`/repair/quotes/${id}/status`, { status, notes, total_price }),
  deleteQuote: (id) => api.delete(`/repair/quotes/${id}`),
  getAppointments: () => api.get('/repair/appointments'),
  updateAppointmentStatus: (id, status, notes) => api.put(`/repair/appointments/${id}/status`, { status, notes })
}

// Car Wash API
export const carWashAPI = {
  getPackages: () => api.get('/car-wash/packages/all'),
  createPackage: (data) => api.post('/car-wash/packages', data),
  updatePackage: (id, data) => api.put(`/car-wash/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/car-wash/packages/${id}`),
  getAddons: () => api.get('/car-wash/addons/all'),
  createAddon: (data) => api.post('/car-wash/addons', data),
  updateAddon: (id, data) => api.put(`/car-wash/addons/${id}`, data),
  deleteAddon: (id) => api.delete(`/car-wash/addons/${id}`),
  getAppointments: () => api.get('/car-wash/appointments'),
  updateAppointmentStatus: (id, status, notes) => api.put(`/car-wash/appointments/${id}/status`, { status, notes }),
  deleteAppointment: (id) => api.delete(`/car-wash/appointments/${id}`)
}

// Pages API
export const pagesAPI = {
  getAll: () => api.get('/pages/admin/all'),
  getBySlug: (slug) => api.get(`/pages/${slug}`),
  create: (data) => api.post('/pages', data),
  update: (id, data) => api.put(`/pages/${id}`, data),
  delete: (id) => api.delete(`/pages/${id}`)
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getPermissions: (userId) => api.get(`/users/${userId}/permissions`),
  updatePermissions: (userId, permissions) => api.put(`/users/${userId}/permissions`, { permissions }),
  verifyPermissionPassword: (userId, page, password) => api.post('/users/verify-permission-password', { userId, page, password })
}

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  addVehicle: (customerId, data) => api.post(`/customers/${customerId}/vehicles`, data),
  addServiceRecord: (customerId, data) => api.post(`/customers/${customerId}/service-records`, data),
  updateServiceRecord: (customerId, serviceRecordId, data) => api.put(`/customers/${customerId}/service-records/${serviceRecordId}`, data),
  deleteServiceRecord: (customerId, serviceRecordId) => api.delete(`/customers/${customerId}/service-records/${serviceRecordId}`)
}

// Dashboard API
export const dashboardAPI = {
  getRevenueStats: (params) => api.get('/dashboard/revenue', { params }),
  getNotifications: () => api.get('/dashboard/notifications')
}

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', { settings }),
  getSocialMediaLinks: () => api.get('/settings/social-media'),
  getCompanyInfo: () => api.get('/settings/company-info'),
  getContactLocations: () => api.get('/settings/contact-locations')
}

// Receipts API
export const receiptsAPI = {
  create: (receiptData) => api.post('/receipts', receiptData),
  getAll: (params) => api.get('/receipts', { params }),
  getById: (id) => api.get(`/receipts/${id}`),
  delete: (id) => api.delete(`/receipts/${id}`)
}

// Contact API
export const contactAPI = {
  getMessages: (params) => api.get('/contact', { params }),
  getMessage: (id) => api.get(`/contact/${id}`),
  updateStatus: (id, status) => api.put(`/contact/${id}/status`, { status }),
  deleteMessage: (id) => api.delete(`/contact/${id}`)
}

// Backend API
export const backendAPI = {
  verifyPassword: (password) => api.post('/backend/verify-password', { password }),
  executeSQL: (sql) => api.post('/backend/execute-sql', { sql }),
  getFiles: (directory) => api.get('/backend/files', { params: { directory } }),
  readFile: (filePath) => api.get('/backend/file-content', { params: { filePath } }),
  writeFile: (filePath, content) => api.post('/backend/file-content', { filePath, content })
}

