import { useEffect } from 'react';
import { io } from 'socket.io-client';

export const useOrderSocket = (onOrderUpdate?: (order: any) => void) => {
  useEffect(() => {
    // 直接连接到后端 WebSocket 服务器
    const socket = io(import.meta.env.VITE_API_URL + '/orders', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to order socket');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
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