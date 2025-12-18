/**
 * Adapter personalizado para devolver mock data sin hacer requests HTTP
 * Esto evita los timeouts completamente
 */

import {
  MOCK_USERS,
  MOCK_BUILDINGS,
  MOCK_LOGBOOK,
  MOCK_PACKAGES,
  MOCK_AMENITIES,
  MOCK_VISITORS,
} from './mockData';

export function getMockAdapter() {
  return async (config) => {
    // Simular latencia mínima - compatible con navegador
    await new Promise((r) => setTimeout(r, 0));

    const url = config.url || '';
    const method = config.method?.toUpperCase() || 'GET';

    console.log(`📦 Mock: ${method} ${url} (sin HTTP)`);

    try {
      // Rutas de usuarios
      if (url.includes('/users') && method === 'GET') {
        return {
          data: MOCK_USERS,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // Rutas de edificios
      if (url.includes('/buildings') && method === 'GET') {
        return {
          data: MOCK_BUILDINGS,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // Rutas de bitácora
      if (url.includes('/logbook') && method === 'GET') {
        return {
          data: MOCK_LOGBOOK,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      if (url.includes('/logbook') && method === 'POST') {
        const newEntry = {
          id: MOCK_LOGBOOK.length + 1,
          ...config.data,
          timestamp: config.data.timestamp || new Date().toISOString(),
        };
        MOCK_LOGBOOK.unshift(newEntry);
        return {
          data: newEntry,
          status: 201,
          statusText: 'Created',
          headers: {},
          config,
        };
      }

      // Rutas de paquetes
      if (url.includes('/packages') && method === 'GET') {
        return {
          data: MOCK_PACKAGES,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // Rutas de amenidades
      if (url.includes('/amenities') && method === 'GET') {
        return {
          data: MOCK_AMENITIES,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // Rutas de visitantes
      if (url.includes('/visitors') && method === 'GET') {
        return {
          data: MOCK_VISITORS,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

      // Ruta no encontrada
      const error = new Error(`No hay mock para: ${method} ${url}`);
      error.response = {
        status: 404,
        statusText: 'Not Found',
        data: { message: 'Mock data no disponible' },
        headers: {},
        config,
      };
      throw error;
    } catch (error) {
      if (error.response) throw error;
      throw {
        message: error.message,
        config,
      };
    }
  };
}
