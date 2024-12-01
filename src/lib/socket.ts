import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.PROD 
  ? 'https://chat-zltm.onrender.com'
  : 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});