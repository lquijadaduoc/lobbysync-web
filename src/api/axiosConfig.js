import axios from 'axios';

// MODO AUTOMÁTICO: Siempre intenta backend real primero
// Si el backend no responde → automáticamente usa mock data como fallback
const USE_MOCK = false; // false = Backend real | true = Mock forzado

// Backend real: http://168.197.50.14:8080
const apiClient = axios.create({
  baseURL: 'http://168.197.50.14:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10s timeout - suficiente para operaciones de Firebase
});

console.log('🌐 Intentando conectar a backend real: http://168.197.50.14:8080');
console.log('💡 Si no hay conexión, cambiará automáticamente a datos mock');

console.log('🌐 Intentando conectar a backend real: http://168.197.50.14:8080');
console.log('💡 Si no hay conexión, cambiará automáticamente a datos mock');

// Eliminar el bloque condicional de mock adapter - se activará automáticamente en el interceptor de error
// if (USE_MOCK && import.meta.env.DEV) {
//   const { getMockAdapter } = await import('./mockAdapter');
//   apiClient.defaults.adapter = getMockAdapter();
//   console.log('✅ Modo MOCK: Usando mock adapter (sin HTTP)');
// } else if (!USE_MOCK) {
//   console.log('🌐 Modo REAL: Conectando a backend en http://167.194.50.14:8080');
// }

// Interceptor de request: agregar token a todas las requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('lobbysync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Iniciar timer para medir performance
  config.metadata = { startTime: performance.now() };

  return config;
});

// Interceptor de response: manejar éxito y errores
apiClient.interceptors.response.use(
  (response) => {
    // Medir tiempo
    const duration = performance.now() - response.config.metadata.startTime;
    const method = response.config.method?.toUpperCase();
    const url = response.config.url;

    // Desactivar flag de modo mock si la respuesta es exitosa (backend volvió)
    if (window.__LOBBYSYNC_MOCK_MODE__ === true) {
      console.log('✅ Backend reconectado - Desactivando modo mock');
      window.__LOBBYSYNC_MOCK_MODE__ = false;
    }
    
    // Log según duración
    if (duration < 100) {
      console.log(`⚡ ${method} ${url}: ${duration.toFixed(2)}ms`);
    } else if (duration < 500) {
      console.warn(`⏱️  ${method} ${url}: ${duration.toFixed(2)}ms`);
    } else {
      console.error(`🐢 ${method} ${url}: ${duration.toFixed(2)}ms (LENTO)`);
    }

    // CACHÉ: Guardar datos reales del backend para usar como fallback
    if (method === 'GET' && response.data) {
      try {
        const cacheKey = `cache_${url}`;
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
        localStorage.setItem('last_real_data_cache_time', new Date().toISOString());
        console.log(`💾 Datos reales cacheados: ${url}`);
      } catch (cacheError) {
        console.warn('⚠️ Error guardando caché:', cacheError.message);
      }
    }

    return response;
  },
  async (error) => {
    // Manejar errores
    const duration = performance.now() - (error.config?.metadata?.startTime || 0);
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const errorMsg = error.message || 'Unknown error';
    const errorCode = error.code;

    console.error(`❌ ${method} ${url}: ${duration.toFixed(2)}ms - ${errorMsg} (code: ${errorCode})`);
    console.log('🔍 Error details:', { code: errorCode, message: errorMsg, hasResponse: !!error.response });

    // Detectar si es un error de conexión/timeout
    const isConnectionError = 
      errorCode === 'ECONNABORTED' || 
      errorCode === 'ECONNREFUSED' || 
      errorCode === 'ERR_NETWORK' ||
      errorCode === 'ETIMEDOUT' ||
      errorMsg.includes('timeout') || 
      errorMsg.includes('Network Error') ||
      errorMsg.includes('Network error') ||
      !error.response; // Sin respuesta = problema de conexión
    
    console.log('🔍 Is connection error?', isConnectionError);
    
    // NO activar mock para peticiones POST (crear/actualizar datos)
    const isWriteOperation = method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
    
    if (isConnectionError && !isWriteOperation) {
      console.warn('⚠️  Backend no disponible. Activando MOCK automáticamente...');
      
      // Activar flag de modo mock
      window.__LOBBYSYNC_MOCK_MODE__ = true;
      
      try {
        // Cambiar a mock adapter para este y los siguientes requests
        const { getMockAdapter } = await import('./mockAdapter');
        const mockAdapter = getMockAdapter();
        apiClient.defaults.adapter = mockAdapter;
        console.log('✅ Mock adapter cargado');
        console.log('🔄 Reintentando request con mock...');
        
        // Reintentar la misma request con mock adapter
        error.config.metadata = { startTime: performance.now() };
        const retryResponse = await apiClient.request(error.config);
        console.log('✅ Request completada con mock:', retryResponse);
        return retryResponse;
      } catch (mockError) {
        console.error('❌ Error activando mock:', mockError);
        return Promise.reject(error);
      }
    }

    // Si es 401 (no autorizado), limpiar token
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expirado o inválido. Redirigiendo a login...');
      localStorage.removeItem('lobbysync_token');
      // Aquí podríamos redirigir al login
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
