import { io, Socket } from 'socket.io-client';

// Por defecto usamos localhost para la web, pero en Android necesitas la IP local
// Puedes reemplazar la IP 192.168.1.X por la IP de tu computadora en tu red Wi-Fi
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://192.168.1.X:3000';

let socket: Socket | null = null;

/**
 * Inicializa la conexión por WebSockets con el backend.
 */
export const initSocket = (userId?: string): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket'],
      query: { userId }
    });

    socket.on('connect', () => {
      console.log('✅ Conectado al servidor Socket.IO');
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
