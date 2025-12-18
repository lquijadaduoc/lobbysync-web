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
  list: (params = {}) => apiClient.get('/api/v1/parcels', { params }),
  get: (packageId) => apiClient.get(`/api/v1/parcels/${packageId}`),
  create: (packageData) => apiClient.post('/api/v1/parcels', packageData),
  markDelivered: (packageId, deliveryData) =>
    apiClient.put(`/api/v1/parcels/${packageId}`, deliveryData),
  delete: (packageId) => apiClient.delete(`/api/v1/parcels/${packageId}`),
  listByBuilding: (buildingId, params = {}) =>
    apiClient.get(`/api/v1/parcels/building/${buildingId}`, { params }),
};

// ===== VISITANTES =====
export const conciergeVisitors = {
  list: (params = {}) => apiClient.get('/visitors', { params }),
  get: (visitorId) => apiClient.get(`/visitors/${visitorId}`),
  create: (visitorData) => apiClient.post('/visitors', visitorData),
  update: (visitorId, visitorData) =>
    apiClient.put(`/visitors/${visitorId}`, visitorData),
  delete: (visitorId) => apiClient.delete(`/visitors/${visitorId}`),
  approve: (visitorId) =>
    apiClient.patch(`/visitors/${visitorId}/approve`),
  reject: (visitorId) =>
    apiClient.patch(`/visitors/${visitorId}/reject`),
  listInvitations: (params = {}) =>
    apiClient.get('/visitors/invitations', { params }),
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
