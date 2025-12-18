import apiClient from './axiosConfig';

/**
 * Obtiene las entradas de la bitácora
 * @param {object} params - Parámetros: page, size, date, user, etc.
 */
export const fetchLogEntries = (params = {}) =>
  apiClient.get('/logbook', { params });

/**
 * Crea una nueva entrada en la bitácora
 */
export const createLogEntry = (entryData) =>
  apiClient.post('/logbook', entryData);

/**
 * Obtiene una entrada específica por ID
 */
export const fetchLogEntryById = (entryId) =>
  apiClient.get(`/logbook/${entryId}`);

/**
 * Actualiza una entrada de la bitácora
 */
export const updateLogEntry = (entryId, entryData) =>
  apiClient.put(`/logbook/${entryId}`, entryData);

/**
 * Elimina una entrada de la bitácora
 */
export const deleteLogEntry = (entryId) =>
  apiClient.delete(`/logbook/${entryId}`);

/**
 * Obtiene la bitácora filtrada por fecha
 */
export const fetchLogByDate = (date, params = {}) =>
  apiClient.get(`/logbook/date/${date}`, { params });
