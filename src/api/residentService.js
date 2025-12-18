/**
 * Servicios específicos para el Residente
 * Acceso a paquetes, facturas, acceso a edificios, amenidades, invitaciones
 * API endpoints: /api/v1/*
 */

import apiClient from './axiosConfig';

// ===== MIS PAQUETES =====
export const residentPackages = {
  list: (params = {}) => apiClient.get('/api/v1/parcels', { params }),
  get: (packageId) => apiClient.get(`/api/v1/parcels/${packageId}`),
};

export const fetchMyPackages = (params = {}) =>
  apiClient.get('/api/v1/parcels', { params });

export const fetchPackageById = (packageId) =>
  apiClient.get(`/api/v1/parcels/${packageId}`);

export const markPackageDelivered = (packageId) =>
  apiClient.patch(`/api/v1/parcels/${packageId}/delivered`);

// ===== MIS FACTURAS =====
export const residentBills = {
  list: (params = {}) => apiClient.get('/api/v1/bills', { params }),
  get: (billId) => apiClient.get(`/api/v1/bills/${billId}`),
  pay: (billId, paymentData) =>
    apiClient.post(`/api/v1/bills/${billId}/pay`, paymentData),
};

// ===== MI ACCESO (Logs personales) =====
export const residentAccess = {
  listLogs: (params = {}) => apiClient.get('/api/v1/access/logs', { params }),
  listByDate: (date, params = {}) =>
    apiClient.get(`/api/v1/access/logs/date/${date}`, { params }),
};

// ===== INVITACIONES =====
export const residentInvitations = {
  create: (invitationData) =>
    apiClient.post('/visitors', invitationData),
  listMyInvitations: (params = {}) =>
    apiClient.get('/visitors/invitations', { params }),
};

export const createVisitorInvitation = (invitationData) =>
  apiClient.post('/visitors', invitationData);

// ===== RESERVAS DE AMENIDADES =====
export const residentAmenities = {
  listAvailable: (params = {}) =>
    apiClient.get('/amenities', { params }),
  reserve: (reservationData) =>
    apiClient.post('/amenities/reserve', reservationData),
  myReservations: (params = {}) =>
    apiClient.get('/amenities/my-reservations', { params }),
  cancelReservation: (reservationId) =>
    apiClient.delete(`/amenities/reservations/${reservationId}`),
};

export const createAmenityReservation = (reservationData) =>
  apiClient.post('/amenities/reserve', reservationData);

export const fetchMyAmenityReservations = (params = {}) =>
  apiClient.get('/amenities/my-reservations', { params });

export const cancelAmenityReservation = (reservationId) =>
  apiClient.delete(`/amenities/reservations/${reservationId}`);

export const fetchAmenities = (params = {}) =>
  apiClient.get('/amenities', { params });

/**
 * Obtiene las invitaciones de visitantes del residente
 */
export const fetchMyVisitorInvitations = (params = {}) =>
  apiClient.get('/visitors/invitations/my', { params });

/**
 * Cancela una invitación de visitante
 */
export const cancelVisitorInvitation = (invitationId) =>
  apiClient.delete(`/visitors/invitations/${invitationId}`);
