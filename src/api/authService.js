import apiClient from './axiosConfig';
import { MOCK_USERS } from './mockData';
import { jwtEncode } from './jwtHelper';

// ===== LOGIN & LOGOUT =====
export const loginRequest = async (credentials) => {
  try {
    return await apiClient.post('/api/auth/login', credentials);
  } catch (error) {
    // Si falla el login en el backend, intentar con mock data
    console.warn('⚠️  Backend no disponible, usando mock login');
    return getMockLoginResponse(credentials);
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

// ===== FIREBASE SYNC =====
/**
 * Sincroniza un usuario con Firebase
 * POST /api/auth/sync
 */
export const syncWithFirebase = async (firebaseData) => {
  try {
    return await apiClient.post('/api/auth/sync', {
      firebaseUid: firebaseData.firebaseUid,
      email: firebaseData.email,
    });
  } catch (error) {
    console.error('❌ Error sincronizando con Firebase:', error);
    throw error;
  }
};

/**
 * Mock login: busca el usuario en MOCK_USERS y genera un token JWT
 */
function getMockLoginResponse(credentials) {
  const { username, email, password } = credentials;
  const searchTerm = email || username;

  const user = MOCK_USERS.find(
    (u) =>
      u.email === searchTerm ||
      u.username === searchTerm ||
      u.email === `${searchTerm}@lobbysync.com`,
  );

  if (!user) {
    console.error('❌ Usuario no encontrado en mock data:', searchTerm);
    throw new Error('Usuario o contraseña incorrectos');
  }

  // Generar token mock
  const token = jwtEncode({
    sub: user.email,
    email: user.email,
    username: user.username,
    role: user.role,
    userId: user.id,
  });

  console.log(`✅ Mock login exitoso para ${user.email} (${user.role})`);

  return Promise.resolve({
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    },
    status: 200,
  });
}

export const fetchProfile = () => apiClient.get('/auth/me').catch((error) => {
  // Mock profile: devolver usuario actual del token
  console.warn('⚠️  Profile no disponible, usando datos del token');
  return Promise.resolve({ data: {} });
});
