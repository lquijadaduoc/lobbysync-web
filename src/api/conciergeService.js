/**
 * Servicios específicos para el Concierge
 * Bitácora, paquetes, visitantes, control de acceso
 * API endpoints: /api/v1/* y /logbook
 */

import apiClient from './axiosConfig';

// ===== BITÁCORA =====
export const conciergeLogbook = {
  list: (params = {}) => apiClient.get('/logbook', { params }),
  get: (entryId) => apiClient.get(`/logbook/${entryId}`),
  create: (entryData) => apiClient.post('/logbook', entryData),
  update: (entryId, entryData) =>
    apiClient.put(`/logbook/${entryId}`, entryData),
  delete: (entryId) => apiClient.delete(`/logbook/${entryId}`),
  listByDate: (date, params = {}) =>
    apiClient.get(`/logbook/date/${date}`, { params }),
  listByBuilding: (buildingId, params = {}) =>
    apiClient.get(`/logbook/building/${buildingId}`, { params }),
};

// ===== PAQUETES (Parcels) =====
export const conciergePackages = {
  list: (params = {}) => apiClient.get('/api/parcels', { params }),
  listByStatus: (status, params = {}) => apiClient.get(`/api/parcels/status/${status}`, { params }),
  listByUser: (userId, params = {}) => apiClient.get(`/api/parcels/user/${userId}`, { params }),
  get: (packageId) => apiClient.get(`/api/parcels/${packageId}`),
  getByTracking: (trackingNumber) => apiClient.get(`/api/parcels/tracking/${trackingNumber}`),
  create: (packageData) => apiClient.post('/api/parcels', packageData),
  updateStatus: (packageId, status) =>
    apiClient.patch(`/api/parcels/${packageId}/status`, null, { params: { status } }),
  delete: (packageId) => apiClient.delete(`/api/parcels/${packageId}`),
};

// ===== VISITANTES =====
export const conciergeVisitors = {
  list: (params = {}) => apiClient.get('/api/invitations', { params }),
  get: (visitorId) => apiClient.get(`/api/invitations/${visitorId}`),
  create: (visitorData) => apiClient.post('/api/invitations', visitorData),
  update: (visitorId, visitorData) =>
    apiClient.put(`/api/invitations/${visitorId}`, visitorData),
  delete: (visitorId) => apiClient.delete(`/api/invitations/${visitorId}`),
  approve: (visitorId) =>
    apiClient.patch(`/api/invitations/${visitorId}/approve`),
  reject: (visitorId) =>
    apiClient.patch(`/api/invitations/${visitorId}/reject`),
  markEntry: (visitorId) =>
    apiClient.patch(`/api/invitations/${visitorId}/entry`),
  markExit: (visitorId) =>
    apiClient.patch(`/api/invitations/${visitorId}/exit`),
  listInvitations: (params = {}) =>
    apiClient.get('/api/invitations', { params }),
  validateQR: (qrToken) =>
    apiClient.post('/api/visits/validate', { qrToken }),
};

// ===== CONTROL DE ACCESO =====
export const conciergeAccess = {
  listLogs: (params = {}) => apiClient.get('/api/v1/access/logs', { params }),
  recordEntry: (accessData) =>
    apiClient.post('/api/v1/access/entry', accessData),
  listByDate: (date, params = {}) =>
    apiClient.get(`/api/v1/access/logs/date/${date}`, { params }),
  listByBuilding: (buildingId, params = {}) =>
    apiClient.get(`/api/v1/access/logs/building/${buildingId}`, { params }),
  listByUnit: (unitId, params = {}) =>
    apiClient.get(`/v1/access/logs/unit/${unitId}`, { params }),
};

// ===== PAQUETES PARA RESIDENTE =====
export const residentPackages = {
  list: (params = {}) => apiClient.get('/v1/parcels', { params }),
  get: (packageId) => apiClient.get(`/v1/parcels/${packageId}`),
};

// ===== UNIDADES Y RESIDENTES =====
export const unitsService = {
  list: (params = {}) => apiClient.get('/api/v1/units', { params }),
  get: (unitId) => apiClient.get(`/api/v1/units/${unitId}`),
  listByBuilding: (buildingId, params = {}) =>
    apiClient.get(`/api/v1/units/building/${buildingId}`, { params }),
  listWithResidents: (params = {}) =>
    apiClient.get('/api/v1/units/with-residents', { params }),
};

// ===== USUARIOS =====
export const usersService = {
  list: (params = {}) => apiClient.get('/api/v1/users', { params }),
  get: (userId) => apiClient.get(`/api/v1/users/${userId}`),
  listByUnit: (unitId, params = {}) =>
    apiClient.get(`/api/v1/users/unit/${unitId}`, { params }),
  listByBuilding: (buildingId, params = {}) =>
    apiClient.get(`/api/v1/users/building/${buildingId}`, { params }),
};

// ===== EDIFICIOS =====
export const buildingsService = {
  list: (params = {}) => apiClient.get('/api/v1/buildings', { params }),
  get: (buildingId) => apiClient.get(`/api/v1/buildings/${buildingId}`),
};

// ===== ÁREAS COMUNES =====
export const commonAreasService = {
  list: (params = {}) => apiClient.get('/api/reservations/common-areas', { params }),
  get: (areaId) => apiClient.get(`/api/reservations/common-areas/${areaId}`),
  listByBuilding: (buildingId, params = {}) =>
    apiClient.get(`/api/reservations/common-areas?buildingId=${buildingId}`, { params }),
};
