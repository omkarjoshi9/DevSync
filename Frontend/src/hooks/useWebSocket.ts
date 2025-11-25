import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const WS_URL = API_BASE_URL.replace('/api/v1', ''); // Remove /api/v1 to get base URL

interface UseWebSocketOptions {
  roomId: string;
  onCodeUpdate?: (code: string, userId: string) => void;
  onUserJoined?: (user: any) => void;
  onUserLeft?: (userId: string) => void;
  onError?: (error: { message: string; code: string }) => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const { roomId, onCodeUpdate, onUserJoined, onUserLeft, onError } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const tokens = api.getAuthTokens();
    if (!tokens.accessToken) {
      console.error('No access token available for WebSocket connection');
      return;
    }

    console.log('Connecting to WebSocket:', WS_URL, 'for room:', roomId);

    // Create socket connection
    const newSocket = io(WS_URL, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setIsConnected(true);

      // Join the room
      const cleanRoomId = roomId.replace('#', '');
      newSocket.emit('room:join', {
        roomId: cleanRoomId,
        password: undefined, // Room password if needed
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Room events
    newSocket.on('room:joined', (data) => {
      console.log('Joined room via WebSocket:', data);
    });

    newSocket.on('user:joined', (data) => {
      console.log('User joined room:', data);
      onUserJoined?.(data.user);
    });

    newSocket.on('user:left', (data) => {
      console.log('User left room:', data);
      onUserLeft?.(data.userId);
    });

    // Code change events
    newSocket.on('code:updated', (data) => {
      console.log('Code updated from another user:', data);
      if (data.changes?.text !== undefined) {
        onCodeUpdate?.(data.changes.text, data.userId);
      }
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      newSocket.emit('room:leave', { roomId: roomId.replace('#', '') });
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [roomId]);

  // Function to send code changes
  const sendCodeChange = useCallback((code: string, version: number = 0) => {
    if (!socket || !isConnected) {
      console.warn('Socket not connected, cannot send code change');
      return;
    }

    const cleanRoomId = roomId.replace('#', '');
    socket.emit('code:change', {
      roomId: cleanRoomId,
      changes: {
        text: code,
      },
      version,
    });
  }, [socket, isConnected, roomId]);

  // Function to send cursor position
  const sendCursorMove = useCallback((position: { lineNumber: number; column: number }) => {
    if (!socket || !isConnected) return;

    const cleanRoomId = roomId.replace('#', '');
    socket.emit('cursor:move', {
      roomId: cleanRoomId,
      position,
    });
  }, [socket, isConnected, roomId]);

  return {
    socket,
    isConnected,
    sendCodeChange,
    sendCursorMove,
  };
};

