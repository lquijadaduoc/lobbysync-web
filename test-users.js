#!/usr/bin/env node

/**
 * Script para probar credenciales y crear usuarios de prueba
 * Ejecutar: node test-users.js
 */

import axios from 'axios';

const BASE_URL = 'http://167.194.50.14:8080/api/v1';

const testCredentials = [
  { username: 'admin', password: 'admin' },
  { username: 'admin@example.com', password: 'admin' },
  { username: 'admin@example.com', password: '123456' },
  { username: 'concierge', password: 'concierge' },
  { username: 'resident', password: 'resident' },
  { username: 'test@example.com', password: 'test123' },
];

const testUsers = [
  {
    email: 'admin@lobbysync.com',
    username: 'admin',
    password: 'Admin@123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
  {
    email: 'concierge@lobbysync.com',
    username: 'concierge',
    password: 'Concierge@123',
    firstName: 'Concierge',
    lastName: 'Staff',
    role: 'CONCIERGE',
  },
  {
    email: 'resident@lobbysync.com',
    username: 'resident',
    password: 'Resident@123',
    firstName: 'Resident',
    lastName: 'User',
    role: 'RESIDENT',
  },
];

async function testLogin(credentials) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials, {
      timeout: 5000,
    });
    console.log(`✅ Login exitoso con ${credentials.username}:`, {
      token: response.data.token ? response.data.token.substring(0, 50) + '...' : 'N/A',
      status: response.status,
    });
    return response.data;
  } catch (error) {
    console.log(`❌ Login falló con ${credentials.username}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function createUser(userData) {
  try {
    const response = await axios.post(`${BASE_URL}/users`, userData, {
      timeout: 5000,
    });
    console.log(`✅ Usuario creado: ${userData.email}`, response.data);
    return response.data;
  } catch (error) {
    console.log(`❌ Error creando usuario ${userData.email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Probando credenciales de prueba contra:', BASE_URL);
  console.log('---');

  for (const creds of testCredentials) {
    await testLogin(creds);
  }

  console.log('\n📝 Intentando crear usuarios de prueba...');
  console.log('---');

  for (const user of testUsers) {
    await createUser(user);
  }

  console.log('\n✨ Prueba completada');
  console.log('\n📋 Credenciales sugeridas para testing:');
  console.log('   ADMIN:     admin@lobbysync.com / Admin@123');
  console.log('   CONCIERGE: concierge@lobbysync.com / Concierge@123');
  console.log('   RESIDENT:  resident@lobbysync.com / Resident@123');
}

main().catch(console.error);
