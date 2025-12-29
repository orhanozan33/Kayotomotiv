import axios from 'axios'

// API base URL'yi ayarla - eğer VITE_API_URL varsa kullan, yoksa default
let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Eğer VITE_API_URL ayarlanmışsa ve /api ile bitmiyorsa, /api ekle
if (import.meta.env.VITE_API_URL && !API_BASE_URL.endsWith('/api')) {
  // Eğer / ile bitiyorsa, sadece api ekle, yoksa /api ekle
  API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api'
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// Vehicles API
export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`)
}

// Reservations API
export const reservationsAPI = {
  create: (data) => api.post('/reservations', data),
  createTestDrive: (data) => api.post('/reservations/test-drive', data),
  getMyReservations: () => api.get('/reservations'),
  getMyTestDrives: () => api.get('/reservations/test-drive')
}

// Repair API
export const repairAPI = {
  getServices: () => api.get('/repair/services'),
  createQuote: (data) => api.post('/repair/quotes', data),
  createAppointment: (data) => api.post('/repair/appointments', data),
  getMyQuotes: () => api.get('/repair/quotes'),
  getMyAppointments: () => api.get('/repair/appointments')
}

// Car Wash API
export const carWashAPI = {
  getPackages: () => api.get('/car-wash/packages'),
  getAddons: () => api.get('/car-wash/addons'),
  createAppointment: (data) => api.post('/car-wash/appointments', data),
  getMyAppointments: () => api.get('/car-wash/appointments')
}

// Pages API
export const pagesAPI = {
  getPages: () => api.get('/pages'),
  getBySlug: (slug) => api.get(`/pages/${slug}`)
}

// Contact API
export const contactAPI = {
  createMessage: (messageData) => api.post('/contact', messageData)
}

// Settings API
export const settingsAPI = {
  getSocialMediaLinks: () => api.get('/settings/social-media')
}


