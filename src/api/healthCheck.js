// Utilidad para verificar si el backend está disponible
import apiClient from './axiosConfig';

/**
 * Verifica si el backend está respondiendo
 * @returns {Promise<boolean>}
 */
export const checkBackendHealth = async () => {
  try {
    // Intentar un endpoint simple
    const response = await apiClient.get('/api/v1/buildings', { timeout: 3000 });
    console.log('✅ Backend está disponible');
    return true;
  } catch (error) {
    console.warn('⚠️ Backend no está respondiendo:', error.message);
    return false;
  }
};

export default checkBackendHealth;
