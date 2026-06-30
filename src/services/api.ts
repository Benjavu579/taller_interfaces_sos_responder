import { io, Socket } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

// Por defecto usamos localhost para la web, pero en Android necesitas la IP local
// Puedes reemplazar la IP 192.168.1.X por la IP de tu computadora en tu red Wi-Fi
const isCapacitor = Capacitor.isNativePlatform();
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (isCapacitor ? 'http://192.168.1.20:3000' : (window.location.protocol === 'https:' ? window.location.origin : 'http://192.168.1.20:3000'));

let socket: Socket | null = null;

/**
 * Inicializa la conexión por WebSockets con el backend.
 */
export const initSocket = (userId?: string): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      query: { userId, role: 'interprete' }
    });

    socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO');
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión Socket.IO:', error.message, 'URL usada:', BACKEND_URL);
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor');
    });
  }
  return socket;
};

/**
 * Retorna la instancia actual del socket
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Envía la ubicación GPS del usuario al backend usando Fetch.
 * @param lat Latitud
 * @param lng Longitud
 * @param userId ID del usuario (opcional)
 */
export const sendLocationData = async (lat: number, lng: number, userId?: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/gps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lat,
        lng,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    console.log('📍 Ubicación enviada correctamente:', { lat, lng });
    return await response.json();
  } catch (error) {
    console.error('❌ Error enviando ubicación:', error);
    // Nota: Como no tienes el backend aún, esto fallará por defecto.
  }
};

/**
 * Inicia sesión del operador en el backend.
 * @param rut RUT del operador
 * @param password Contraseña
 */
export const loginOperator = async (rut: string, password: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rut, password, role: 'interprete' })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error de autenticación');
    }

    return data;
  } catch (error: any) {
    console.error('❌ Error en el inicio de sesión:', error);
    throw error;
  }
};
