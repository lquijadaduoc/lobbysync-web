/**
 * Interceptor para usar datos mock en desarrollo cuando el backend no está disponible
 * Automáticamente detecta errores de conexión y sirve datos mock AL INSTANTE
 */

import {
  MOCK_USERS,
  MOCK_BUILDINGS,
  MOCK_UNITS,
  MOCK_LOGBOOK,
  MOCK_PACKAGES,
  MOCK_AMENITIES,
  MOCK_VISITORS,
} from './mockData';

let useMockData = false;

// Flag global para indicar que estamos en modo mock
window.__LOBBYSYNC_MOCK_MODE__ = false;

// Detectar si debe usar mock data
if (import.meta.env.DEV) {
  console.warn('💡 Modo desarrollo: Usando mock data si el backend no responde');
}

// SIN DELAY - Responder inmediatamente con mock data
const MOCK_DELAY = 0;

export const setupMockInterceptor = (apiClient) => {
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Si hay timeout, ECONNREFUSED o ENOTFOUND, usar mock data
      if (
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Network')
      ) {
        console.warn(
          `⚠️  Backend no disponible (${error.code || error.message}), usando mock data INMEDIATAMENTE`,
        );
        useMockData = true;
        window.__LOBBYSYNC_MOCK_MODE__ = true;
        return getMockResponse(error.config);
      }
      return Promise.reject(error);
    },
  );
};

/**
 * Verifica si está en modo mock
 */
export const isMockMode = () => {
  return window.__LOBBYSYNC_MOCK_MODE__ === true;
};

/**
 * Devuelve mock data sin delays
 * Si necesitas simular latencia, descomenta MOCK_DELAY y cámbialo
 */
async function getMockResponse(config) {
  const url = config.url || '';
  const method = config.method || 'get';

  // Opcional: Simular latencia de red (descomentar para testing)
  // if (MOCK_DELAY > 0) {
  //   await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  // }

  console.log(`📦 Mock: ${method.toUpperCase()} ${url} (sin delay)`);

  try {
    // Rutas de usuarios
    if (url.includes('/users') && method === 'get') {
      return Promise.resolve({ data: MOCK_USERS, status: 200 });
    }

    // Rutas de edificios
    if (url.includes('/buildings') && method === 'get') {
      return Promise.resolve({ data: MOCK_BUILDINGS, status: 200 });
    }

    // Rutas de unidades/departamentos
    if (url.includes('/units') && method === 'get') {
      return Promise.resolve({ data: MOCK_UNITS, status: 200 });
    }

    // Rutas de bitácora
    if (url.includes('/logbook') && method === 'get') {
      return Promise.resolve({ data: MOCK_LOGBOOK, status: 200 });
    }
    if (url.includes('/logbook') && method === 'post') {
      const newEntry = {
        id: MOCK_LOGBOOK.length + 1,
        ...config.data,
        timestamp: config.data.timestamp || new Date().toISOString(),
      };
      MOCK_LOGBOOK.unshift(newEntry);
      return Promise.resolve({ data: newEntry, status: 201 });
    }

    // Rutas de paquetes
    if (url.includes('/packages') && method === 'get') {
      return Promise.resolve({ data: MOCK_PACKAGES, status: 200 });
    }

    // Rutas de amenidades
    if (url.includes('/amenities') && method === 'get') {
      return Promise.resolve({ data: MOCK_AMENITIES, status: 200 });
    }

    // Rutas de visitantes
    if (url.includes('/visitors') && method === 'get') {
      return Promise.resolve({ data: MOCK_VISITORS, status: 200 });
    }

    // Por defecto, devolver error
    console.warn(`⚠️  No hay mock data para: ${method} ${url}`);
    return Promise.reject(new Error(`No mock data para: ${method} ${url}`));
  } catch (error) {
    console.error('Error en getMockResponse:', error);
    return Promise.reject(error);
  }
}

export const isMockMode = () => useMockData;
