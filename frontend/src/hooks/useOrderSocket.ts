import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getToken, getUserIdFromToken } from '@/utils/auth';

export const useOrderSocket = (onOrderUpdate?: (order: any) => void) => {
  useEffect(() => {
    const token = getToken();
    const userId = getUserIdFromToken();
    
    if (!token || !userId) return;

    const socket = io(import.meta.env.VITE_WEBSOCKET_URL + '/orders', {
      auth: {
        token: userId.toString(),
      },
    });

    socket.on('connect', () => {
      console.log('Connected to order socket');
    });

    socket.on('orderUpdate', (order) => {
      console.log('Order updated:', order);
      onOrderUpdate?.(order);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from order socket');
    });

    return () => {
      socket.disconnect();
    };
  }, [onOrderUpdate]);
}; 