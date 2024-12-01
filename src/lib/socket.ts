import { io } from 'socket.io-client';

export const socket = io('https://chat-zv6y.onrender.com', {
  autoConnect: false
});