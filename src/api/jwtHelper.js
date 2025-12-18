/**
 * Utilidades para codificar/decodificar JWT
 * Solo para TESTING Y DESARROLLO
 */

/**
 * Codifica un payload como JWT simple (sin validación criptográfica)
 * SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
 */
export function jwtEncode(payload) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '');
  const body = btoa(JSON.stringify(payload)).replace(/=+$/, '');
  const signature = 'MOCK_SIGNATURE_NOT_VALIDATED';

  return `${header}.${body}.${signature}`;
}

/**
 * Decodifica un JWT sin validación
 */
export function jwtDecode(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Token inválido');

    const payload = parts[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}
