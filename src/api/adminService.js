/**
 * Servicios específicos para el Admin
 * CRUD completo para usuarios, edificios, unidades, activos, finanzas, métricas
 * API endpoints: /api/v1/* (excepto auth que usa /api/auth/*)
 */

import apiClient from './axiosConfig';

// ===== USUARIOS =====
export const adminUsers = {
  list: (params = {}) => apiClient.get('/api/users', { params }),
  get: (userId) => apiClient.get(`/api/users/${userId}`),
  create: (userData) => apiClient.post('/api/users', userData),
  update: (userId, userData) => apiClient.put(`/api/users/${userId}`, userData),
  delete: (userId) => apiClient.delete(`/api/users/${userId}`),
  toggleStatus: (userId, active) =>
    apiClient.patch(`/api/users/${userId}/status`, { active }),
};

// ===== EDIFICIOS (v1) =====
export const adminBuildings = {
  list: (params = {}) => apiClient.get('/api/v1/buildings', { params }),
  get: (buildingId) => apiClient.get(`/api/v1/buildings/${buildingId}`),
  create: (buildingData) => apiClient.post('/api/v1/buildings', buildingData),
  update: (buildingId, buildingData) =>
    apiClient.put(`/api/v1/buildings/${buildingId}`, buildingData),
  delete: (buildingId) => apiClient.delete(`/api/v1/buildings/${buildingId}`),
  getUnits: (buildingId, params = {}) =>
    apiClient.get(`/api/v1/buildings/${buildingId}/units`, { params }),
};

// ===== UNIDADES =====
export const adminUnits = {
  list: (params = {}) => apiClient.get('/api/units', { params }),
  get: (unitId) => apiClient.get(`/api/units/${unitId}`),
  create: (unitData) => apiClient.post('/api/units', unitData),
  update: (unitId, unitData) => apiClient.put(`/api/units/${unitId}`, unitData),
  delete: (unitId) => apiClient.delete(`/api/units/${unitId}`),
  listByBuilding: (buildingId, params = {}) =>
    apiClient.get(`/api/v1/buildings/${buildingId}/units`, { params }),
};

// ===== ACTIVOS =====
export const adminAssets = {
  list: (params = {}) => apiClient.get('/api/v1/assets', { params }),
  record: (assetData) => apiClient.post('/api/v1/assets/record', assetData),
  createTicket: (ticketData) =>
    apiClient.post('/api/v1/assets/ticket', ticketData),
  getTickets: (params = {}) =>
    apiClient.get('/api/v1/assets/tickets', { params }),
  updateTicket: (ticketId, ticketData) =>
    apiClient.put(`/api/v1/assets/tickets/${ticketId}`, ticketData),
};

// ===== FINANZAS =====
export const adminFinance = {
  listBills: (params = {}) => apiClient.get('/api/v1/bills', { params }),
  getBill: (billId) => apiClient.get(`/api/v1/bills/${billId}`),
  generateBills: (billData) =>
    apiClient.post('/api/v1/finance/bills/generate', billData),
  payBill: (billId, paymentData) =>
    apiClient.post(`/api/v1/bills/${billId}/pay`, paymentData),
  getPayments: (params = {}) =>
    apiClient.get('/api/v1/finance/payments', { params }),
};

// ===== MÉTRICAS =====
export const adminMetrics = {
  dashboard: () => apiClient.get('/api/metrics/dashboard'),
  users: () => apiClient.get('/api/metrics/users'),
  occupancy: () => apiClient.get('/api/metrics/occupancy'),
  activity: () => apiClient.get('/api/metrics/activity'),
  finance: () => apiClient.get('/api/metrics/finance'),
};
