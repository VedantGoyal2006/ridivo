import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Default Backend Port

let socket = null;

/**
 * Returns a singleton Socket.IO client instance
 */
export const getSocket = (userId = null) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket client connected: ', socket.id);
      if (userId) {
        socket.emit('register', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket client disconnected.');
    });
  } else if (userId) {
    // Re-register if user ID is provided later or changes
    socket.emit('register', userId);
  }

  return socket;
};
