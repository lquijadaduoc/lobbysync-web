import apiClient from './axiosConfig';

// ===== FIREBASE AUTHENTICATION =====
/**
 * Sincroniza usuario de Firebase con el backend
 * POST /api/auth/sync-user
 */
export const syncUserWithBackend = async (firebaseToken) => {
  try {
    console.log('🔄 Syncing user with backend...');
    const response = await apiClient.post('/api/auth/sync-user', {}, {
      headers: {
        'Authorization': `Bearer ${firebaseToken}`
      }
    });
    console.log('✅ User synced with backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error syncing with backend:', error);
    // Retornar datos básicos si falla
    return {
      role: 'RESIDENT',
      isNew: false,
      message: 'Backend sync failed, using defaults'
    };
  }
};

// ===== LOGIN & LOGOUT (Legacy - ya no usado con Firebase) =====
export const loginRequest = async (credentials) => {
  try {
    return await apiClient.post('/api/auth/login', credentials);
  } catch (error) {
    console.warn('⚠️  Backend login not available');
    throw error;
  }
};

export const logoutRequest = async () => {
  try {
    return await apiClient.post('/api/auth/logout', {});
  } catch (error) {
    console.warn('⚠️  Logout en backend falló:', error.message);
    return { status: 200 };
  }
};

export const fetchProfile = () => apiClient.get('/auth/me').catch((error) => {
  console.warn('⚠️  Profile no disponible');
  return Promise.resolve({ data: {} });
});
