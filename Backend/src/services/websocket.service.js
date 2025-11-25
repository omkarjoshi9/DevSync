import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { RoomParticipant } from '../models/RoomParticipant.js';
import { getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

export class WebSocketService {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initializeRedisAdapter();
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  async initializeRedisAdapter() {
    try {
      const pubClient = await getRedisClient();
      if (!pubClient) {
        logger.warn('Redis not available, using in-memory adapter for Socket.io');
        return;
      }
      
      const subClient = pubClient.duplicate();
      await subClient.connect();
      
      this.io.adapter(createAdapter(pubClient, subClient));
      logger.info('Redis adapter initialized for Socket.io');
    } catch (error) {
      logger.warn('Redis adapter initialization failed, using in-memory adapter', error);
    }
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = decoded.userId;
        socket.user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url,
        };
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('User connected', { userId: socket.userId, socketId: socket.id });

      socket.on('room:join', async (data) => {
        try {
          const { roomId, password } = data;
          const room = await Room.findByRoomId(roomId);
          
          if (!room) {
            socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
            return;
          }

          // Verify password
          const isValidPassword = await Room.verifyPassword(room, password);
          if (!isValidPassword) {
            socket.emit('error', { message: 'Invalid room password', code: 'INVALID_PASSWORD' });
            return;
          }

          // Join room
          await socket.join(room.id.toString());
          
          // Add/update participant
          let participant = await RoomParticipant.findOne(room.id, socket.userId);
          if (!participant) {
            participant = await RoomParticipant.create({
              roomId: room.id,
              userId: socket.userId,
              role: 'observer',
            });
          } else {
            await RoomParticipant.updateLastActive(room.id, socket.userId);
          }

          const participants = await RoomParticipant.findByRoomId(room.id);

          // Notify user
          socket.emit('room:joined', {
            room: {
              id: room.id,
              roomId: room.room_id,
              language: room.language,
              code: room.code_content,
            },
            participants: participants.map(p => ({
              id: p.user_id,
              email: p.email,
              firstName: p.first_name,
              lastName: p.last_name,
              avatarUrl: p.avatar_url,
              role: p.role,
            })),
          });

          // Notify others
          socket.to(room.id.toString()).emit('user:joined', {
            user: socket.user,
            role: participant.role,
          });

          logger.info('User joined room via WebSocket', { userId: socket.userId, roomId: room.room_id });
        } catch (error) {
          logger.error('Error in room:join', error);
          socket.emit('error', { message: 'Failed to join room', code: 'JOIN_ERROR' });
        }
      });

      socket.on('room:leave', async (data) => {
        try {
          const { roomId } = data;
          const room = await Room.findByRoomId(roomId);
          
          if (room) {
            await socket.leave(room.id.toString());
            await RoomParticipant.updateLastActive(room.id, socket.userId);
            
            socket.emit('room:left', { roomId: room.room_id });
            socket.to(room.id.toString()).emit('user:left', { userId: socket.userId });
            
            logger.info('User left room via WebSocket', { userId: socket.userId, roomId: room.room_id });
          }
        } catch (error) {
          logger.error('Error in room:leave', error);
        }
      });

      socket.on('code:change', async (data) => {
        try {
          const { roomId, changes, version } = data;
          const room = await Room.findByRoomId(roomId);
          
          if (!room) {
            socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
            return;
          }

          // Verify user is in room
          const participant = await RoomParticipant.findOne(room.id, socket.userId);
          if (!participant) {
            socket.emit('error', { message: 'Not a participant of this room', code: 'NOT_PARTICIPANT' });
            return;
          }

          // Broadcast to other users in room
          socket.to(room.id.toString()).emit('code:updated', {
            changes,
            version,
            userId: socket.userId,
          });

          // Update code in database (debounced in production)
          // Note: In production, debounce this to avoid too many DB writes
          if (changes.text !== undefined) {
            await Room.updateCode(room.room_id, changes.text);
          }
        } catch (error) {
          logger.error('Error in code:change', error);
          socket.emit('error', { message: 'Failed to update code', code: 'CODE_UPDATE_ERROR' });
        }
      });

      socket.on('cursor:move', async (data) => {
        try {
          const { roomId, position } = data;
          const room = await Room.findByRoomId(roomId);
          
          if (room) {
            socket.to(room.id.toString()).emit('cursor:moved', {
              userId: socket.userId,
              position,
            });
          }
        } catch (error) {
          logger.error('Error in cursor:move', error);
        }
      });

      socket.on('selection:change', async (data) => {
        try {
          const { roomId, selection } = data;
          const room = await Room.findByRoomId(roomId);
          
          if (room) {
            socket.to(room.id.toString()).emit('selection:changed', {
              userId: socket.userId,
              selection,
            });
          }
        } catch (error) {
          logger.error('Error in selection:change', error);
        }
      });

      socket.on('language:change', async (data) => {
        try {
          const { roomId, language } = data;
          const room = await Room.findByRoomId(roomId);
          
          if (!room) {
            return;
          }

          // Verify user is in room
          const participant = await RoomParticipant.findOne(room.id, socket.userId);
          if (!participant) {
            return;
          }

          // Update language
          await Room.updateLanguage(room.room_id, language);

          // Broadcast to others
          socket.to(room.id.toString()).emit('language:changed', {
            language,
            userId: socket.userId,
          });
        } catch (error) {
          logger.error('Error in language:change', error);
        }
      });

      socket.on('presence:update', async (data) => {
        try {
          const { roomId, status } = data;
          const room = await Room.findByRoomId(roomId);
          
          if (room) {
            socket.to(room.id.toString()).emit('presence:updated', {
              userId: socket.userId,
              status,
            });
          }
        } catch (error) {
          logger.error('Error in presence:update', error);
        }
      });

      socket.on('disconnect', async () => {
        logger.info('User disconnected', { userId: socket.userId, socketId: socket.id });
      });
    });
  }

  getIO() {
    return this.io;
  }
}

