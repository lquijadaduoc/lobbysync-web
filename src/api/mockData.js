/**
 * Datos de prueba (mock) para desarrollo y testing
 * Cuando el backend real esté disponible, estos se reemplazan con datos reales
 */

export const MOCK_USERS = [
  {
    id: 0,
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@lobbysync.com',
    username: 'superadmin',
    role: 'SUPER_ADMIN',
    status: 'active',
    phone: '+1234567889',
  },
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@lobbysync.com',
    username: 'admin',
    role: 'ADMIN',
    status: 'active',
    phone: '+1234567890',
  },
  {
    id: 2,
    firstName: 'Concierge',
    lastName: 'Staff',
    email: 'concierge@lobbysync.com',
    username: 'concierge',
    role: 'CONCIERGE',
    status: 'active',
    phone: '+1234567891',
  },
  {
    id: 3,
    firstName: 'Resident',
    lastName: 'One',
    email: 'resident@lobbysync.com',
    username: 'resident',
    role: 'RESIDENT',
    status: 'active',
    phone: '+1234567892',
  },
  {
    id: 4,
    firstName: 'María',
    lastName: 'López',
    email: 'maria@lobbysync.com',
    username: 'maria.lopez',
    role: 'ADMIN',
    status: 'active',
    phone: '+1234567893',
  },
  {
    id: 5,
    firstName: 'Luis',
    lastName: 'Torres',
    email: 'luis@lobbysync.com',
    username: 'luis.torres',
    role: 'CONCIERGE',
    status: 'pending',
    phone: '+1234567894',
  },
];

export const MOCK_BUILDINGS = [
  {
    id: 1,
    name: 'Torre Norte',
    address: 'Calle Principal 123',
    floors: 8,
    units: 32,
    manager: 'Juan Pérez',
  },
  {
    id: 2,
    name: 'Torre Central',
    address: 'Calle Principal 125',
    floors: 12,
    units: 48,
    manager: 'María González',
  },
  {
    id: 3,
    name: 'Torre Sur',
    address: 'Calle Principal 127',
    floors: 10,
    units: 40,
    manager: 'Carlos Ramírez',
  },
];

export const MOCK_LOGBOOK = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    note: 'Ingreso proveedor CCTV',
    createdBy: 'Juan Pérez',
    building: 'Torre Norte',
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    note: 'Paquete Amazon Depto 305',
    createdBy: 'María Ruiz',
    building: 'Torre Central',
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    note: 'Reparación ascensor completada',
    createdBy: 'Técnico Mantenimiento',
    building: 'Torre Sur',
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    note: 'Revisión de seguridad área común',
    createdBy: 'Inspector',
    building: 'Torre Norte',
  },
];

export const MOCK_PACKAGES = [
  {
    id: 1,
    reference: 'Amazon #1234',
    trackingNumber: 'AMZN-2025-001',
    provider: 'Amazon',
    status: 'received',
    receivedAt: new Date(Date.now() - 86400000).toISOString(),
    deliveredAt: null,
    description: 'Paquete de electrónica',
  },
  {
    id: 2,
    reference: 'FedEx #8421',
    trackingNumber: 'FDX-2025-042',
    provider: 'FedEx',
    status: 'delivered',
    receivedAt: new Date(Date.now() - 172800000).toISOString(),
    deliveredAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'Documento importante',
  },
  {
    id: 3,
    reference: 'DHL #5678',
    trackingNumber: 'DHL-2025-567',
    provider: 'DHL',
    status: 'pending',
    receivedAt: null,
    deliveredAt: null,
    description: 'Encomienda en tránsito',
  },
];

export const MOCK_AMENITIES = [
  {
    id: 1,
    name: 'Salón de reuniones',
    description: 'Salón multiusos con capacidad para 20 personas',
    capacity: 20,
    floor: 2,
    building: 'Torre Central',
  },
  {
    id: 2,
    name: 'Gym',
    description: 'Gimnasio completamente equipado',
    capacity: 15,
    floor: 1,
    building: 'Torre Norte',
  },
  {
    id: 3,
    name: 'Piscina',
    description: 'Piscina climatizada',
    capacity: 30,
    floor: 'Azotea',
    building: 'Torre Sur',
  },
  {
    id: 4,
    name: 'Cine',
    description: 'Sala de cine con pantalla 4K',
    capacity: 25,
    floor: 'Sótano 2',
    building: 'Torre Central',
  },
];

export const MOCK_VISITORS = [
  {
    id: 1,
    name: 'Pedro Martínez',
    email: 'pedro@example.com',
    phone: '+1234567895',
    unit: '305',
    building: 'Torre Central',
    invitationDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'approved',
  },
  {
    id: 2,
    name: 'Ana García',
    email: 'ana@example.com',
    phone: '+1234567896',
    unit: '512',
    building: 'Torre Norte',
    invitationDate: new Date(Date.now() - 172800000).toISOString(),
    status: 'pending',
  },
];

export const MOCK_LOGIN_RESPONSE = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBsb2JieXN5bmMuY29tIiwicm9sZSI6IkFETUluIiwiZW1haWwiOiJhZG1pbkBsb2JieXN5bmMuY29tIiwiaWF0IjoxNjM0NTY3ODAwLCJleHAiOjE2MzQ2NTQyMDB9.EMP_TOKEN_FOR_TESTING',
  user: {
    email: 'admin@lobbysync.com',
    role: 'ADMIN',
    username: 'admin',
  },
};
