import { useEffect, useCallback } from 'react';
import { socket } from '../lib/socket';
import { User, Message } from '../types';
import toast from 'react-hot-toast';

export function useSocket(roomId: string, userId: string, username: string) {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit('join_room', { roomId, userId, username });

    const handleConnect = () => {
      toast.success('Connected to chat server');
      socket.emit('join_room', { roomId, userId, username });
    };

    const handleDisconnect = () => {
      toast.error('Disconnected from chat server');
    };

    const handleConnectError = () => {
      toast.error('Failed to connect to chat server');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.emit('leave_room', { roomId, userId });
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [roomId, userId, username]);

  const sendMessage = useCallback((text: string) => {
    if (!socket.connected) {
      toast.error('Not connected to chat server');
      return;
    }

    socket.emit('message', {
      roomId,
      userId,
      username,
      text,
      timestamp: Date.now()
    });
  }, [roomId, userId, username]);

  const playGame = useCallback((bet: number) => {
    if (!socket.connected) {
      return Promise.reject(new Error('Not connected to chat server'));
    }

    return new Promise<{ won: boolean, newBalance: number }>((resolve, reject) => {
      socket.timeout(5000).emit('play_game', { roomId, userId, bet }, (err: Error | null, response: { won: boolean, newBalance: number } | null) => {
        if (err) {
          reject(err);
          return;
        }
        if (response) {
          resolve(response);
        } else {
          reject(new Error('Invalid response from server'));
        }
      });
    });
  }, [roomId, userId]);

  return { sendMessage, playGame };
}