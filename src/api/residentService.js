/**
 * Servicios específicos para el Residente
 * Acceso a paquetes, facturas, acceso a edificios, amenidades, invitaciones
 * API endpoints: /api/v1/*, /api/*
 */

import apiClient from './axiosConfig';

// ===== MIS PAQUETES =====
export const residentPackages = {
  list: (params = {}) => apiClient.get('/api/parcels/my-pending', { params }),
  get: (packageId) => apiClient.get(`/api/parcels/${packageId}`),
};

export const fetchMyPackages = (params = {}) =>
  apiClient.get('/api/parcels/my-pending', { params });

export const fetchPackageById = (packageId) =>
  apiClient.get(`/api/parcels/${packageId}`);

export const markPackageDelivered = (packageId) =>
  apiClient.patch(`/api/parcels/${packageId}/delivered`);

// ===== MIS FINANZAS =====
export const residentsService = {
  // Finanzas (endpoints reales del backend)
  getCurrentDues: (unitId) => apiClient.get(`/api/finance/units/${unitId}/debt`),
  getPaymentHistory: (unitId, year = new Date().getFullYear()) => 
    apiClient.get(`/api/finance/bills/unit/${unitId}/year/${year}`),
  downloadDuesPDF: (billId) => apiClient.get(`/api/finance/bills/${billId}/pdf`, { responseType: 'blob' }),
  reportPayment: (paymentData) => apiClient.post('/api/finance/payments', paymentData),

  // Grupo Familiar
  getFamilyMembers: () => apiClient.get('/api/home/family'),
  createFamilyMember: (memberData) => apiClient.post('/api/home/family', memberData),
  updateFamilyMember: (memberId, memberData) => apiClient.put(`/api/home/family/${memberId}`, memberData),
  deleteFamilyMember: (memberId) => apiClient.delete(`/api/home/family/${memberId}`),

  // Mascotas
  getPets: () => apiClient.get('/api/home/pets'),
  createPet: (petData) => apiClient.post('/api/home/pets', petData),
  updatePet: (petId, petData) => apiClient.put(`/api/home/pets/${petId}`, petData),
  deletePet: (petId) => apiClient.delete(`/api/home/pets/${petId}`),

  // Vehículos
  getVehicles: () => apiClient.get('/api/home/vehicles'),
  createVehicle: (vehicleData) => apiClient.post('/api/home/vehicles', vehicleData),
  updateVehicle: (vehicleId, vehicleData) => apiClient.put(`/api/home/vehicles/${vehicleId}`, vehicleData),
  deleteVehicle: (vehicleId) => apiClient.delete(`/api/home/vehicles/${vehicleId}`),

  // Tickets / PQR
  getTickets: (params = {}) => apiClient.get('/api/tickets', { params }),
  createTicket: (ticketData) => apiClient.post('/api/tickets', ticketData),
  getTicketById: (ticketId) => apiClient.get(`/api/tickets/${ticketId}`),
  updateTicketStatus: (ticketId, status) => apiClient.patch(`/api/tickets/${ticketId}/status`, { status }),

  // Documentos
  getDocuments: () => apiClient.get('/api/documents'),
  downloadDocument: (docId) => apiClient.get(`/api/documents/${docId}/download`, { responseType: 'blob' }),

  // Lista Blanca / Visitas Frecuentes
  getWhitelist: () => apiClient.get('/api/whitelist'),
  createWhitelistContact: (contactData) => apiClient.post('/api/whitelist', contactData),
  updateWhitelistContact: (contactId, contactData) => apiClient.put(`/api/whitelist/${contactId}`, contactData),
  deleteWhitelistContact: (contactId) => apiClient.delete(`/api/whitelist/${contactId}`),

  // Invitaciones (existentes)
  createInvitation: (invitationData) => apiClient.post('/api/invitations', invitationData),
  getMyInvitations: (params = {}) => apiClient.get('/api/invitations/my-invitations', { params }),
  cancelInvitation: (invitationId) => apiClient.delete(`/api/invitations/${invitationId}`),

  // Reservas de Amenidades (existentes)
  getCommonAreas: (params = {}) => apiClient.get('/api/reservations/common-areas', { params }),
  createReservation: (reservationData) => apiClient.post('/api/reservations', reservationData),
  getMyReservations: (params = {}) => apiClient.get('/api/reservations/my-reservations', { params }),
  cancelReservation: (reservationId) => apiClient.delete(`/api/reservations/${reservationId}`),
};

// ===== MIS FACTURAS (Legacy - deprecated, usar residentsService.getPaymentHistory) =====
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

// ===== INVITACIONES (Legacy) =====
export const residentInvitations = {
  create: (invitationData) =>
    apiClient.post('/api/invitations', invitationData),
  listMyInvitations: (params = {}) =>
    apiClient.get('/api/invitations/my-invitations', { params }),
};

export const createVisitorInvitation = (invitationData) =>
  apiClient.post('/api/invitations', invitationData);

// ===== RESERVAS DE AMENIDADES (Legacy) =====
export const residentAmenities = {
  listAvailable: (params = {}) =>
    apiClient.get('/api/reservations/common-areas', { params }),
  reserve: (reservationData) =>
    apiClient.post('/api/reservations', reservationData),
  myReservations: (params = {}) =>
    apiClient.get('/api/reservations/my-reservations', { params }),
  cancelReservation: (reservationId) =>
    apiClient.delete(`/api/reservations/${reservationId}`),
};

export const createAmenityReservation = (reservationData) =>
  apiClient.post('/api/reservations', reservationData);

export const fetchMyAmenityReservations = (params = {}) =>
  apiClient.get('/api/reservations/my-reservations', { params });

export const cancelAmenityReservation = (reservationId) =>
  apiClient.delete(`/api/reservations/${reservationId}`);

export const fetchAmenities = (params = {}) =>
  apiClient.get('/api/reservations/common-areas', { params });

/**
 * Obtiene las invitaciones de visitantes del residente
 */
export const fetchMyVisitorInvitations = (params = {}) =>
  apiClient.get('/api/invitations/my-invitations', { params });

/**
 * Cancela una invitación de visitante
 */
export const cancelVisitorInvitation = (invitationId) =>
  apiClient.delete(`/api/invitations/${invitationId}`);
