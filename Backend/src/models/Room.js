import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/passwordHasher.js';

export class Room {
  static async create({ roomId, ownerId, password = null, language = 'javascript', settings = {}, isPersistent = false }) {
    let passwordHash = null;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    const expiresAt = isPersistent ? null : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await query(
      `INSERT INTO rooms (room_id, owner_id, password_hash, language, settings, is_persistent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [roomId, ownerId, passwordHash, language, JSON.stringify(settings), isPersistent, expiresAt]
    );

    return result.rows[0];
  }

  static async findByRoomId(roomId) {
    const result = await query(
      'SELECT * FROM rooms WHERE room_id = $1',
      [roomId]
    );
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM rooms WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByOwnerId(ownerId) {
    const result = await query(
      'SELECT * FROM rooms WHERE owner_id = $1 ORDER BY created_at DESC',
      [ownerId]
    );
    return result.rows;
  }

  static async updateCode(roomId, code) {
    const result = await query(
      `UPDATE rooms SET code_content = $1, updated_at = NOW() WHERE room_id = $2
       RETURNING *`,
      [code, roomId]
    );
    return result.rows[0] || null;
  }

  static async updateLanguage(roomId, language) {
    const result = await query(
      `UPDATE rooms SET language = $1, updated_at = NOW() WHERE room_id = $2
       RETURNING *`,
      [language, roomId]
    );
    return result.rows[0] || null;
  }

  static async updateSettings(roomId, settings) {
    const result = await query(
      `UPDATE rooms SET settings = $1, updated_at = NOW() WHERE room_id = $2
       RETURNING *`,
      [JSON.stringify(settings), roomId]
    );
    return result.rows[0] || null;
  }

  static async verifyPassword(room, password) {
    if (!room.password_hash) {
      return true; // No password set
    }
    if (!password) {
      return false;
    }
    return await comparePassword(password, room.password_hash);
  }

  static async delete(roomId) {
    const result = await query(
      'DELETE FROM rooms WHERE room_id = $1 RETURNING id',
      [roomId]
    );
    return result.rows[0] || null;
  }

  static async deleteExpired() {
    const result = await query(
      `DELETE FROM rooms 
       WHERE is_persistent = false 
       AND expires_at IS NOT NULL 
       AND expires_at < NOW()
       RETURNING id`,
      []
    );
    return result.rows;
  }

  static async getUserActiveRooms(userId) {
    const result = await query(
      `SELECT DISTINCT r.* FROM rooms r
       INNER JOIN room_participants rp ON r.id = rp.room_id
       WHERE rp.user_id = $1
       AND (r.is_persistent = true OR r.expires_at > NOW())
       ORDER BY rp.last_active DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getUserActiveRoomsByOwnerId(ownerId) {
    const result = await query(
      'SELECT * FROM rooms WHERE owner_id = $1 AND (is_persistent = true OR expires_at > NOW()) ORDER BY created_at DESC',
      [ownerId]
    );
    return result.rows;
  }
}

