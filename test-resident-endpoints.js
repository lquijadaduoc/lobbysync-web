/**
 * Test de Endpoints Residentes - LobbySyncAPI
 * Ejecutar en: node test-resident-endpoints.js
 * 
 * Este script prueba todos los endpoints de residentes
 * sin requrir autenticación (endpoints públicos) o usando tokens de prueba
 */

const axios = require('axios');

// Configuración
const API_URL = process.env.API_URL || 'http://localhost:8080';
const AUTH_TOKEN = process.env.AUTH_TOKEN || null; // Opcional

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.blue}─${colors.reset} ${msg}`),
};

// Headers por defecto
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (AUTH_TOKEN) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  return headers;
};

// Cliente axios
const client = axios.create({
  baseURL: API_URL,
  headers: getHeaders(),
  timeout: 5000,
});

// Endpoints para probar
const endpoints = {
  // Home
  'GET /api/home/family': { method: 'GET', path: '/api/home/family', protected: true },
  'POST /api/home/family': { method: 'POST', path: '/api/home/family', protected: true, data: { name: 'Test', relationship: 'TEST' } },
  'GET /api/home/pets': { method: 'GET', path: '/api/home/pets', protected: true },
  'GET /api/home/vehicles': { method: 'GET', path: '/api/home/vehicles', protected: true },

  // Finance
  'GET /api/finance (mock)': { method: 'GET', path: '/api/v1/users', protected: false },

  // Documents
  'GET /api/documents': { method: 'GET', path: '/api/documents', protected: true },

  // Whitelist
  'GET /api/whitelist': { method: 'GET', path: '/api/whitelist', protected: true },

  // Tickets
  'GET /api/tickets': { method: 'GET', path: '/api/tickets', protected: true },

  // Reservations
  'GET /api/reservations/common-areas': { method: 'GET', path: '/api/reservations/common-areas', protected: true },

  // Parcels
  'GET /api/parcels/my-pending': { method: 'GET', path: '/api/parcels/my-pending', protected: true },

  // Invitations
  'GET /api/invitations/my-invitations': { method: 'GET', path: '/api/invitations/my-invitations', protected: true },
};

// Test de conexión básica
async function testConnection() {
  try {
    log.info(`Conectando a: ${API_URL}`);
    const response = await client.get('/api/v1/users', { validateStatus: () => true });
    if (response.status < 500) {
      log.success('Servidor accesible');
      return true;
    } else {
      log.error(`Servidor respondiendo con error: ${response.status}`);
      return false;
    }
  } catch (err) {
    log.error(`No se puede conectar: ${err.message}`);
    return false;
  }
}

// Test de endpoint
async function testEndpoint(name, config) {
  try {
    const response = await client({
      method: config.method,
      url: config.path,
      data: config.data,
      validateStatus: () => true, // Aceptar todos los status codes
    });

    const status = response.status;
    const statusColor = status < 300 ? colors.green : status < 400 ? colors.yellow : colors.red;
    const statusStr = `${statusColor}${status}${colors.reset}`;

    console.log(`  ${name.padEnd(40)} → ${statusStr}`);

    if (status >= 200 && status < 300) {
      if (response.data && typeof response.data === 'object') {
        const dataStr = JSON.stringify(response.data).substring(0, 60);
        console.log(`    Respuesta: ${dataStr}...`);
      }
      return true;
    } else if (status === 401 || status === 403) {
      console.log(`    (Requiere autenticación)`);
      return null; // Neutral, no es error real
    } else if (status === 404) {
      console.log(`    (Endpoint no encontrado)`);
      return false;
    } else {
      console.log(`    Error: ${response.statusText}`);
      return false;
    }
  } catch (err) {
    console.log(`  ${name.padEnd(40)} → ${colors.red}ERROR${colors.reset}`);
    console.log(`    ${err.message}`);
    return false;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log(`  PRUEBA DE ENDPOINTS - LOBBYSYNCAPI`);
  console.log('='.repeat(70) + '\n');

  // Test conexión
  log.test('Verificando conexión al servidor...');
  const connected = await testConnection();
  console.log();

  if (!connected) {
    log.error('No se puede conectar al servidor. ¿Está corriendo Docker?');
    console.log(`\nInicia con: docker-compose up -d\n`);
    process.exit(1);
  }

  // Información de autenticación
  if (AUTH_TOKEN) {
    log.info('Pruebas con autenticación');
  } else {
    log.info('Pruebas sin autenticación (algunas fallarán si requieren auth)');
  }
  console.log();

  // Agrupar endpoints por categoría
  const categories = {
    'HOME (Familia, Mascotas, Vehículos)': [],
    'FINANCE (Deudas, Pagos)': [],
    'DOCUMENTS (Biblioteca)': [],
    'WHITELIST (Visitas Frecuentes)': [],
    'TICKETS (PQR)': [],
    'RESERVATIONS (Amenidades)': [],
    'PARCELS (Paquetes)': [],
    'INVITATIONS (Invitaciones)': [],
  };

  // Clasificar endpoints
  Object.entries(endpoints).forEach(([name, config]) => {
    if (name.includes('home') || name.includes('family') || name.includes('pets') || name.includes('vehicles')) {
      categories['HOME (Familia, Mascotas, Vehículos)'].push([name, config]);
    } else if (name.includes('finance')) {
      categories['FINANCE (Deudas, Pagos)'].push([name, config]);
    } else if (name.includes('documents')) {
      categories['DOCUMENTS (Biblioteca)'].push([name, config]);
    } else if (name.includes('whitelist')) {
      categories['WHITELIST (Visitas Frecuentes)'].push([name, config]);
    } else if (name.includes('tickets')) {
      categories['TICKETS (PQR)'].push([name, config]);
    } else if (name.includes('reservations')) {
      categories['RESERVATIONS (Amenidades)'].push([name, config]);
    } else if (name.includes('parcels')) {
      categories['PARCELS (Paquetes)'].push([name, config]);
    } else if (name.includes('invitations')) {
      categories['INVITATIONS (Invitaciones)'].push([name, config]);
    }
  });

  // Ejecutar pruebas por categoría
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let neutralTests = 0;

  for (const [category, endpointList] of Object.entries(categories)) {
    if (endpointList.length === 0) continue;

    console.log(`\n${colors.blue}${category}${colors.reset}`);
    console.log('-'.repeat(70));

    for (const [name, config] of endpointList) {
      const result = await testEndpoint(name, config);
      totalTests++;

      if (result === true) {
        passedTests++;
      } else if (result === false) {
        failedTests++;
      } else {
        neutralTests++;
      }
    }
  }

  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('  RESUMEN');
  console.log('='.repeat(70));
  console.log(`${colors.green}Exitosos${colors.reset}: ${passedTests}/${totalTests}`);
  console.log(`${colors.yellow}Requerían auth${colors.reset}: ${neutralTests}/${totalTests}`);
  console.log(`${colors.red}Fallos${colors.reset}: ${failedTests}/${totalTests}`);
  console.log('='.repeat(70) + '\n');

  // Conclusión
  if (failedTests === 0) {
    log.success('Todos los endpoints están disponibles o requieren autenticación ✅');
  } else if (failedTests <= 2) {
    log.info(`Solo ${failedTests} endpoints no están disponibles`);
  } else {
    log.error(`Múltiples endpoints no funcionan. Revisa el backend.`);
  }

  console.log('\n📖 Documentación: RESIDENT_INTEGRATION_GUIDE.md\n');
}

// Ejecutar
runTests().catch(err => {
  log.error('Error ejecutando pruebas: ' + err.message);
  process.exit(1);
});
