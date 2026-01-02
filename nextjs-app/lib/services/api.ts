import axios, { AxiosInstance } from 'axios';

// API base URL configuration for Next.js
// In Next.js, we can use relative URLs for same-origin requests
const getApiBaseUrl = (): string => {
  // Check for explicit API URL in environment
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL or explicit NEXT_PUBLIC_API_URL
    const explicitUrl = process.env.NEXT_PUBLIC_API_URL;
    if (explicitUrl) {
      return explicitUrl.endsWith('/api') ? explicitUrl : `${explicitUrl}/api`;
    }
    // Default to same origin /api
    return '/api';
  }
  // Server-side: use full URL or default to localhost
  return process.env.API_URL || 'http://localhost:3000/api';
};

const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available (client-side only)
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle response errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
}

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: (params?: any) => api.get('/vehicles', { params }),
  getById: (id: string) => api.get(`/vehicles/${id}`),
};

// Reservations API
export const reservationsAPI = {
  create: (data: any) => api.post('/reservations', data),
  createTestDrive: (data: any) => api.post('/reservations/test-drive', data),
  getMyReservations: () => api.get('/reservations'),
  getMyTestDrives: () => api.get('/reservations/test-drive'),
};

// Repair API
export const repairAPI = {
  getServices: () => api.get('/repair/services'),
  createQuote: (data: any) => api.post('/repair/quotes', data),
  createAppointment: (data: any) => api.post('/repair/appointments', data),
  getMyQuotes: () => api.get('/repair/quotes'),
  getMyAppointments: () => api.get('/repair/appointments'),
};

// Car Wash API
export const carWashAPI = {
  getPackages: () => api.get('/car-wash/packages'),
  getAddons: () => api.get('/car-wash/addons'),
  createAppointment: (data: any) => api.post('/car-wash/appointments', data),
  getMyAppointments: () => api.get('/car-wash/appointments'),
};

// Pages API
export const pagesAPI = {
  getPages: () => api.get('/pages'),
  getBySlug: (slug: string) => api.get(`/pages/${slug}`),
};

// Contact API
export const contactAPI = {
  createMessage: (messageData: any) => api.post('/contact', messageData),
  getLocations: () => api.get('/contact/locations'),
};

// Settings API
export const settingsAPI = {
  getSocialMediaLinks: () => api.get('/settings/social-media'),
};

