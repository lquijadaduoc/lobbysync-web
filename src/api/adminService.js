/**
 * Servicios específicos para el Admin
 * CRUD completo para usuarios, edificios, unidades, activos, finanzas, métricas
 * API endpoints: /api/v1/* (excepto auth que usa /api/auth/*)
 */

import apiClient from './axiosConfig';

// ===== USUARIOS =====
export const adminUsers = {
  list: (params = {}) => apiClient.get('/api/v1/users', { params }),
  get: (userId) => apiClient.get(`/api/v1/users/${userId}`),
  create: (userData) => apiClient.post('/api/v1/users', userData),
  update: (userId, userData) => apiClient.put(`/api/v1/users/${userId}`, userData),
  delete: (userId) => apiClient.delete(`/api/v1/users/${userId}`),
  toggleStatus: (userId, active) =>
    apiClient.patch(`/api/v1/users/${userId}/status`, { active }),
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
  list: (params = {}) => apiClient.get('/api/v1/units', { params }),
  get: (unitId) => apiClient.get(`/api/v1/units/${unitId}`),
  create: (unitData) => apiClient.post('/api/v1/units', unitData),
  update: (unitId, unitData) => apiClient.put(`/api/v1/units/${unitId}`, unitData),
  delete: (unitId) => apiClient.delete(`/api/v1/units/${unitId}`),
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

// ===== RESERVACIONES =====
export const adminReservations = {
  list: (params = {}) => apiClient.get('/api/reservations', { params }),
  getById: (id) => apiClient.get(`/api/reservations/${id}`),
  approve: (id, approved, rejectionReason = null) => 
    apiClient.post(`/api/reservations/${id}/approve`, { approved, rejectionReason }),
  updateStatus: (id, status) => 
    apiClient.patch(`/api/reservations/${id}/status`, null, { params: { status } }),
};

// ===== PAQUETES =====
export const adminPackages = {
  list: (params = {}) => apiClient.get('/api/parcels', { params }),
  listByStatus: (status, params = {}) => 
    apiClient.get(`/api/parcels/status/${status}`, { params }),
};

// ===== TICKETS/MANTENIMIENTO =====
export const adminTickets = {
  list: (params = {}) => apiClient.get('/api/tickets', { params }),
  getById: (id) => apiClient.get(`/api/tickets/${id}`),
  updateStatus: (id, status) => 
    apiClient.patch(`/api/tickets/${id}/status`, { status }),
};

// ===== BROADCASTS/COMUNICACIÓN =====
export const adminBroadcasts = {
  list: (params = {}) => apiClient.get('/api/admin/broadcasts', { params }),
  create: (broadcastData) => apiClient.post('/api/admin/broadcasts', broadcastData),
  getStats: () => apiClient.get('/api/admin/broadcasts/stats'),
};

// ===== FINANZAS (ACTUALIZADAS) =====
export const adminFinances = {
  getPaymentReports: (params = {}) => apiClient.get('/api/finances/payment-reports', { params }),
  reviewPayment: (paymentId, approved, reviewedBy) => 
    apiClient.post(`/api/finances/payment-reports/${paymentId}/review`, { approved, reviewedBy }),
  getMoroseUnits: () => apiClient.get('/api/finances/morose-units'),
  generateMonthlyCharges: (month, year, baseAmount) => 
    apiClient.post('/api/finances/generate-monthly-charges', { month, year, baseAmount }),
  getFinancialStats: () => apiClient.get('/api/finances/stats'),
};
