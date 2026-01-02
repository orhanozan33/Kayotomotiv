import axios from 'axios';

// API base URL - Next.js API routes kullan
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }
  return window.location.origin + '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const retryRequest = async (error: any, retryCount = 0) => {
  const config = error.config;

  if (!config || retryCount >= MAX_RETRIES) {
    return Promise.reject(error);
  }

  if (
    !error.response &&
    (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.message?.includes('timeout'))
  ) {
    config.__retryCount = retryCount + 1;
    const delay = RETRY_DELAY * Math.pow(2, retryCount);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return api(config);
  }

  return Promise.reject(error);
};

// Add token to requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (!(config as any).__retryCount) {
      (config as any).__retryCount = 0;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors with retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin-panel/login';
      return Promise.reject(error);
    }
    return retryRequest(error, (error.config as any)?.__retryCount || 0);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Vehicles API
export const vehiclesAPI = {
  getAll: (params?: any) => api.get('/vehicles', { params }),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  addImage: (id: string, formData: FormData) =>
    api.post(`/vehicles/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateImage: (imageId: string, data: any) => api.put(`/vehicles/images/${imageId}`, data),
  updateImagesOrder: (imageOrders: any[]) => api.post('/vehicles/images/update-order', { imageOrders }),
  deleteImage: (imageId: string) => api.delete(`/vehicles/images/${imageId}`),
};

// Admin Vehicles API (alias)
export const adminVehiclesAPI = vehiclesAPI;

// Reservations API
export const reservationsAPI = {
  getAll: () => api.get('/reservations'),
  updateStatus: (id: string, status: string) => api.put(`/reservations/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/reservations/${id}`),
  getTestDrives: () => api.get('/reservations/test-drive'),
  updateTestDriveStatus: (id: string, status: string) =>
    api.put(`/reservations/test-drive/${id}/status`, { status }),
  deleteTestDrive: (id: string) => api.delete(`/reservations/test-drive/${id}`),
};

// Admin Reservations API (alias)
export const adminReservationsAPI = reservationsAPI;

// Repair API
export const repairAPI = {
  getServices: (params?: any) => api.get('/repair/services/all', { params }),
  createService: (data: any) => api.post('/repair/services', data),
  updateService: (id: string, data: any) => api.put(`/repair/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/repair/services/${id}`),
  getQuotes: (params?: any) => api.get('/repair/quotes', { params }),
  getVehicleRecords: (params?: any) => api.get('/repair/vehicle-records', { params }),
  getVehicleRecordsRevenue: (params?: any) => api.get('/repair/vehicle-records/revenue', { params }),
  createVehicleRecord: (data: any) => api.post('/repair/vehicle-records', data),
  deleteVehicleRecord: (id: string) => api.delete(`/repair/vehicle-records/${id}`),
  cleanupOldRecords: () => api.delete('/repair/vehicle-records/cleanup'),
  updateQuoteStatus: (id: string, status: string, notes?: string, total_price?: number) =>
    api.put(`/repair/quotes/${id}/status`, { status, notes, total_price }),
  deleteQuote: (id: string) => api.delete(`/repair/quotes/${id}`),
  getAppointments: (params?: any) => api.get('/repair/appointments', { params }),
  updateAppointmentStatus: (id: string, status: string, notes?: string) =>
    api.put(`/repair/appointments/${id}/status`, { status, notes }),
};

// Admin Repair API - explicitly defined to ensure TypeScript type inference works correctly
export const adminRepairAPI = {
  getServices: repairAPI.getServices,
  createService: repairAPI.createService,
  updateService: repairAPI.updateService,
  deleteService: repairAPI.deleteService,
  getQuotes: repairAPI.getQuotes,
  getVehicleRecords: repairAPI.getVehicleRecords,
  getVehicleRecordsRevenue: repairAPI.getVehicleRecordsRevenue,
  createVehicleRecord: repairAPI.createVehicleRecord,
  deleteVehicleRecord: repairAPI.deleteVehicleRecord,
  cleanupOldRecords: repairAPI.cleanupOldRecords,
  updateQuoteStatus: repairAPI.updateQuoteStatus,
  deleteQuote: repairAPI.deleteQuote,
  getAppointments: repairAPI.getAppointments,
  updateAppointmentStatus: repairAPI.updateAppointmentStatus,
};

// Car Wash API
export const carWashAPI = {
  getPackages: (params?: any) => api.get('/car-wash/packages/all', { params }),
  createPackage: (data: any) => api.post('/car-wash/packages', data),
  updatePackage: (id: string, data: any) => api.put(`/car-wash/packages/${id}`, data),
  deletePackage: (id: string) => api.delete(`/car-wash/packages/${id}`),
  getAddons: (params?: any) => api.get('/car-wash/addons/all', { params }),
  createAddon: (data: any) => api.post('/car-wash/addons', data),
  updateAddon: (id: string, data: any) => api.put(`/car-wash/addons/${id}`, data),
  deleteAddon: (id: string) => api.delete(`/car-wash/addons/${id}`),
  getAppointments: (params?: any) => api.get('/car-wash/appointments', { params }),
  getAppointmentById: (id: string) => api.get(`/car-wash/appointments/${id}`),
  updateAppointmentStatus: (id: string, status: string, notes?: string) =>
    api.put(`/car-wash/appointments/${id}/status`, { status, notes }),
  deleteAppointment: (id: string) => api.delete(`/car-wash/appointments/${id}`),
};

// Admin Car Wash API (alias)
export const adminCarWashAPI = carWashAPI;

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  getPermissions: (userId: string) => api.get(`/users/${userId}/permissions`),
  updatePermissions: (userId: string, permissions: any) =>
    api.put(`/users/${userId}/permissions`, { permissions }),
  verifyPermissionPassword: (userId: string, page: string, password: string) =>
    api.post('/users/verify-permission-password', { userId, page, password }),
};

// Admin Users API (alias)
export const adminUsersAPI = usersAPI;

// Customers API
export const customersAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  addVehicle: (customerId: string, data: any) => api.post(`/customers/${customerId}/vehicles`, data),
  addServiceRecord: (customerId: string, data: any) => api.post(`/customers/${customerId}/service-records`, data),
  updateServiceRecord: (customerId: string, serviceRecordId: string, data: any) =>
    api.put(`/customers/${customerId}/service-records/${serviceRecordId}`, data),
  deleteServiceRecord: (customerId: string, serviceRecordId: string) =>
    api.delete(`/customers/${customerId}/service-records/${serviceRecordId}`),
};

// Admin Customers API (alias)
export const adminCustomersAPI = customersAPI;

// Dashboard API
export const dashboardAPI = {
  getRevenueStats: (params?: any) => api.get('/dashboard/revenue', { params }),
  getNotifications: () => api.get('/dashboard/notifications'),
};

// Admin Dashboard API (alias)
export const adminDashboardAPI = dashboardAPI;

// Settings API
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings: any) => api.put('/settings', { settings }),
  getSocialMediaLinks: () => api.get('/settings/social-media'),
  getCompanyInfo: () => api.get('/settings/company-info'),
  getContactLocations: () => api.get('/settings/contact-locations'),
};

// Admin Settings API (alias)
export const adminSettingsAPI = settingsAPI;

// Contact API
export const contactAPI = {
  getMessages: (params?: any) => api.get('/contact', { params }),
  getMessage: (id: string) => api.get(`/contact/${id}`),
  updateStatus: (id: string, status: string) => api.put(`/contact/${id}/status`, { status }),
  deleteMessage: (id: string) => api.delete(`/contact/${id}`),
};

// Admin Contact API (alias)
export const adminContactAPI = contactAPI;

// Pages API
export const pagesAPI = {
  getAll: (params?: any) => api.get('/pages/admin/all', { params }),
  getBySlug: (slug: string) => api.get(`/pages/${slug}`),
  create: (data: any) => api.post('/pages', data),
  update: (id: string, data: any) => api.put(`/pages/${id}`, data),
  delete: (id: string) => api.delete(`/pages/${id}`),
};

// Admin Pages API (alias)
export const adminPagesAPI = pagesAPI;

// Receipts API
export const receiptsAPI = {
  create: (receiptData: any) => api.post('/receipts', receiptData),
  getAll: (params?: any) => api.get('/receipts', { params }),
  getById: (id: string) => api.get(`/receipts/${id}`),
  delete: (id: string) => api.delete(`/receipts/${id}`),
};

// Admin Receipts API (alias)
export const adminReceiptsAPI = receiptsAPI;

// Backend API
export const backendAPI = {
  verifyPassword: (password: string) => api.post('/backend/verify-password', { password }),
  executeSQL: (sql: string) => api.post('/backend/execute-sql', { sql }),
  getFiles: (directory: string) => api.get('/backend/files', { params: { directory } }),
  readFile: (filePath: string) => api.get('/backend/file-content', { params: { filePath } }),
  writeFile: (filePath: string, content: string) => api.post('/backend/file-content', { filePath, content }),
};

// Admin Backend API (alias)
export const adminBackendAPI = backendAPI;

export default api;

