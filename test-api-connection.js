#!/usr/bin/env node

/**
 * Script de prueba de conectividad Frontend -> Backend
 * Verifica que todos los endpoints principales del API estén disponibles
 */

import http from 'http';

const FRONTEND_URL = 'http://localhost:5173';
const API_BASE_URL = 'http://168.197.50.14:8080';

const endpoints = [
  { method: 'GET', url: `${API_BASE_URL}/api/v1/users`, name: 'Obtener Usuarios' },
  { method: 'GET', url: `${API_BASE_URL}/api/v1/buildings`, name: 'Obtener Edificios' },
  { method: 'GET', url: `${API_BASE_URL}/api/v1/units`, name: 'Obtener Unidades' },
  { method: 'GET', url: `${API_BASE_URL}/api/tickets`, name: 'Obtener Tickets' },
  { method: 'GET', url: `${API_BASE_URL}/api/documents`, name: 'Obtener Documentos' },
  { method: 'GET', url: `${API_BASE_URL}/swagger-ui.html`, name: 'Swagger UI' },
  { method: 'GET', url: `${API_BASE_URL}/v3/api-docs`, name: 'OpenAPI Docs' },
  { method: 'GET', url: `${FRONTEND_URL}/`, name: 'Frontend (Vite)' },
];

function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: endpoint.method,
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 'ERROR',
        success: false,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 'TIMEOUT',
        success: false,
        error: 'Timeout',
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  PRUEBA DE CONECTIVIDAD - FRONTEND → BACKEND (PRODUCCIÓN)  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('🌐 FRONTEND: http://localhost:5173');
  console.log('🌐 BACKEND: http://168.197.50.14:8080\n');

  console.log('📡 PROBANDO ENDPOINTS...\n');

  const results = await Promise.all(endpoints.map(testEndpoint));

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const status = result.success
      ? `✓ HTTP ${result.status}`
      : `✗ ${result.status}`;
    const color = result.success ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${color}${status}${reset} ${result.name}`);
    if (result.error) {
      console.log(`   └─ Error: ${result.error}`);
    }

    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log('\n═════════════════════════════════════════════════════════════\n');

  const summary = `✓ ${passed} pasaron | ✗ ${failed} fallaron`;
  if (failed === 0) {
    console.log(`\x1b[32m✅ TODAS LAS PRUEBAS PASARON - ${summary}\x1b[0m\n`);
  } else {
    console.log(`\x1b[33m⚠️  ${summary}\x1b[0m\n`);
  }

  console.log('📋 RECOMENDACIONES:\n');
  console.log('1. Abre el frontend en: http://localhost:5173');
  console.log('2. Abre Swagger UI en: http://168.197.50.14:8080/swagger-ui.html');
  console.log('3. Verifica la consola del navegador (F12) para logs');
  console.log('4. Prueba crear/leer datos desde la UI\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
