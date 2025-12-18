import axios from 'axios';

// Configuración: cambiar USE_MOCK a false para usar backend real
// NOTA: Si el backend tarda >30s, usar USE_MOCK = true
const USE_MOCK = true; // Cambiar a false cuando backend esté estable

// Backend real: http://167.194.50.14:8080
// En modo MOCK: intercepta requests y devuelve datos simulados
const apiClient = axios.create({
  baseURL: USE_MOCK ? 'http://localhost:3000' : 'http://167.194.50.14:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: USE_MOCK ? 5000 : 30000, // 30s para backend real (puede estar lento)
});

// En modo MOCK, usar mock adapter para devolver datos sin HTTP
if (USE_MOCK && import.meta.env.DEV) {
  const { getMockAdapter } = await import('./mockAdapter');
  apiClient.defaults.adapter = getMockAdapter();
  console.log('✅ Modo MOCK: Usando mock adapter (sin HTTP)');
} else if (!USE_MOCK) {
  console.log('🌐 Modo REAL: Conectando a backend en http://167.194.50.14:8080');
}

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

    // Log según duración
    if (duration < 100) {
      console.log(`⚡ ${method} ${url}: ${duration.toFixed(2)}ms`);
    } else if (duration < 500) {
      console.warn(`⏱️  ${method} ${url}: ${duration.toFixed(2)}ms`);
    } else {
      console.error(`🐢 ${method} ${url}: ${duration.toFixed(2)}ms (LENTO)`);
    }

    return response;
  },
  async (error) => {
    // Manejar errores
    const duration = performance.now() - (error.config?.metadata?.startTime || 0);
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const errorMsg = error.message || 'Unknown error';

    console.error(`❌ ${method} ${url}: ${duration.toFixed(2)}ms - ${errorMsg}`);

    // Si es timeout o connection error y NO estamos en MOCK, cambiar a MOCK automáticamente
    if (!USE_MOCK && (error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED' || errorMsg.includes('timeout') || errorMsg.includes('Network Error'))) {
      console.warn('⚠️  Backend no disponible. Cambiando a MOCK automáticamente...');
      // Cambiar a mock para este y los siguientes requests
      const { getMockAdapter } = await import('./mockAdapter');
      apiClient.defaults.adapter = getMockAdapter();
      
      // Reintentar con mock adapter
      error.config.metadata = { startTime: performance.now() };
      return apiClient.request(error.config);
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
