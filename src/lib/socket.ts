import { io } from 'socket.io-client';

export const socket = io('https://chat-zv6y.onrender.com', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});