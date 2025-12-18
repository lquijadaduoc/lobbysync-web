import apiClient from './axiosConfig';

/**
 * Obtiene la lista de usuarios
 * @param {object} params - Parámetros: page, size, role, status
 */
export const fetchUsers = (params = {}) =>
  apiClient.get('/users', { params });

/**
 * Obtiene un usuario por ID
 */
export const fetchUserById = (userId) =>
  apiClient.get(`/users/${userId}`);

/**
 * Crea un nuevo usuario
 */
export const createUser = (userData) =>
  apiClient.post('/users', userData);

/**
 * Actualiza un usuario
 */
export const updateUser = (userId, userData) =>
  apiClient.put(`/users/${userId}`, userData);

/**
 * Elimina un usuario
 */
export const deleteUser = (userId) =>
  apiClient.delete(`/users/${userId}`);

/**
 * Cambia el estado de un usuario (activo/inactivo)
 */
export const toggleUserStatus = (userId, active) =>
  apiClient.patch(`/users/${userId}/status`, { active });
