import { Room } from '../models/Room.js';
import { RoomParticipant } from '../models/RoomParticipant.js';
import { generateUniqueRoomId } from '../utils/roomIdGenerator.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class RoomService {
  static async createRoom({ ownerId, password, language, settings }) {
    const roomId = await generateUniqueRoomId();
    
    const user = await Room.findByOwnerId(ownerId);
    const isPersistent = false; // TODO: Check subscription tier

    const room = await Room.create({
      roomId,
      ownerId,
      password: password || null,
      language: language || 'javascript',
      settings: settings || {},
      isPersistent,
    });

    // Add owner as participant
    await RoomParticipant.create({
      roomId: room.id,
      userId: ownerId,
      role: 'driver',
    });

    logger.info('Room created', { roomId: room.room_id, ownerId });

    return {
      id: room.id,
      roomId: room.room_id,
      ownerId: room.owner_id,
      language: room.language,
      code: room.code_content,
      settings: typeof room.settings === 'string' ? JSON.parse(room.settings) : room.settings,
      createdAt: room.created_at,
      expiresAt: room.expires_at,
      isPersistent: room.is_persistent,
    };
  }

  static async joinRoom({ roomId, userId, password }) {
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    // Check if room is expired
    if (!room.is_persistent && room.expires_at && new Date(room.expires_at) < new Date()) {
      throw new ValidationError('Room has expired');
    }

    // Verify password if room has one
    const isValidPassword = await Room.verifyPassword(room, password);
    if (!isValidPassword) {
      throw new ValidationError('Invalid room password');
    }

    // Check if user is already a participant
    let participant = await RoomParticipant.findOne(room.id, userId);
    if (!participant) {
      participant = await RoomParticipant.create({
        roomId: room.id,
        userId,
        role: 'observer',
      });
    } else {
      await RoomParticipant.updateLastActive(room.id, userId);
    }

    const participants = await RoomParticipant.findByRoomId(room.id);

    logger.info('User joined room', { roomId: room.room_id, userId });

    return {
      room: {
        id: room.id,
        roomId: room.room_id,
        ownerId: room.owner_id,
        language: room.language,
        code: room.code_content,
        settings: typeof room.settings === 'string' ? JSON.parse(room.settings) : room.settings,
        createdAt: room.created_at,
        expiresAt: room.expires_at,
        isPersistent: room.is_persistent,
      },
      participants: participants.map(p => ({
        id: p.user_id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        avatarUrl: p.avatar_url,
        role: p.role,
        joinedAt: p.joined_at,
      })),
    };
  }

  static async getRoom(roomId, userId) {
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    // Check if user is a participant
    const participant = await RoomParticipant.findOne(room.id, userId);
    if (!participant) {
      throw new AuthorizationError('You are not a participant of this room');
    }

    const participants = await RoomParticipant.findByRoomId(room.id);

    return {
      room: {
        id: room.id,
        roomId: room.room_id,
        ownerId: room.owner_id,
        language: room.language,
        code: room.code_content,
        settings: typeof room.settings === 'string' ? JSON.parse(room.settings) : room.settings,
        createdAt: room.created_at,
        expiresAt: room.expires_at,
        isPersistent: room.is_persistent,
      },
      participants: participants.map(p => ({
        id: p.user_id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        avatarUrl: p.avatar_url,
        role: p.role,
        joinedAt: p.joined_at,
      })),
    };
  }

  static async validateRoom(roomId, password) {
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      return { valid: false, room: null };
    }

    const isValidPassword = await Room.verifyPassword(room, password);
    return {
      valid: isValidPassword,
      room: isValidPassword ? {
        id: room.id,
        roomId: room.room_id,
        language: room.language,
      } : null,
    };
  }

  static async deleteRoom(roomId, userId) {
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    if (room.owner_id !== userId) {
      throw new AuthorizationError('Only the room owner can delete the room');
    }

    await Room.delete(roomId);
    logger.info('Room deleted', { roomId, userId });

    return { message: 'Room deleted successfully' };
  }

  static async leaveRoom(roomId, userId) {
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    if (room.owner_id === userId) {
      throw new ValidationError('Room owner cannot leave the room. Please delete it instead.');
    }

    await RoomParticipant.remove(room.id, userId);
    logger.info('User left room', { roomId, userId });

    return { message: 'Left room successfully' };
  }

  static async getActiveRooms(userId) {
    // Get rooms where user is owner or participant
    const ownedRooms = await Room.getUserActiveRoomsByOwnerId(userId);
    const participantRooms = await Room.getUserActiveRooms(userId);
    
    // Combine and deduplicate
    const allRooms = [...ownedRooms, ...participantRooms];
    const uniqueRooms = Array.from(
      new Map(allRooms.map(room => [room.id, room])).values()
    );
    
    return {
      rooms: uniqueRooms.map(room => ({
        id: room.id,
        roomId: room.room_id,
        language: room.language,
        createdAt: room.created_at,
        expiresAt: room.expires_at,
        isPersistent: room.is_persistent,
      })),
    };
  }

  static async getParticipants(roomId, userId) {
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    const participant = await RoomParticipant.findOne(room.id, userId);
    if (!participant) {
      throw new AuthorizationError('You are not a participant of this room');
    }

    const participants = await RoomParticipant.findByRoomId(room.id);
    return {
      participants: participants.map(p => ({
        id: p.user_id,
        email: p.email,
        firstName: p.first_name,
        lastName: p.last_name,
        avatarUrl: p.avatar_url,
        role: p.role,
        joinedAt: p.joined_at,
        lastActive: p.last_active,
      })),
    };
  }
}

