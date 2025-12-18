import apiClient from './axiosConfig';

/**
 * Obtiene la lista de edificios
 * @param {object} params - Parámetros: page, size, etc.
 */
export const fetchBuildings = (params = {}) =>
  apiClient.get('/buildings', { params });

/**
 * Obtiene un edificio por ID
 */
export const fetchBuildingById = (buildingId) =>
  apiClient.get(`/buildings/${buildingId}`);

/**
 * Crea un nuevo edificio
 */
export const createBuilding = (buildingData) =>
  apiClient.post('/buildings', buildingData);

/**
 * Actualiza un edificio
 */
export const updateBuilding = (buildingId, buildingData) =>
  apiClient.put(`/buildings/${buildingId}`, buildingData);

/**
 * Elimina un edificio
 */
export const deleteBuilding = (buildingId) =>
  apiClient.delete(`/buildings/${buildingId}`);

/**
 * Obtiene las unidades/departamentos de un edificio
 */
export const fetchBuildingUnits = (buildingId, params = {}) =>
  apiClient.get(`/buildings/${buildingId}/units`, { params });
