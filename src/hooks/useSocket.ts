import { useEffect, useCallback } from 'react';
import { socket } from '../lib/socket';
import { User, Message } from '../types';

export function useSocket(roomId: string, userId: string, username: string) {
  useEffect(() => {
    socket.connect();
    socket.emit('join_room', { roomId, userId, username });

    return () => {
      socket.emit('leave_room', { roomId, userId });
      socket.disconnect();
    };
  }, [roomId, userId, username]);

  const sendMessage = useCallback((text: string) => {
    socket.emit('message', {
      roomId,
      userId,
      username,
      text,
      timestamp: Date.now()
    });
  }, [roomId, userId, username]);

  const playGame = useCallback((bet: number) => {
    return new Promise<{ won: boolean, newBalance: number }>((resolve) => {
      socket.emit('play_game', { roomId, userId, bet }, (response: { won: boolean, newBalance: number }) => {
        resolve(response);
      });
    });
  }, [roomId, userId]);

  return { sendMessage, playGame };
}