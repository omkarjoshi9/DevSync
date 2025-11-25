import { query } from '../config/database.js';

export class RoomParticipant {
  static async create({ roomId, userId, role = 'observer' }) {
    const result = await query(
      `INSERT INTO room_participants (room_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (room_id, user_id) 
       DO UPDATE SET role = $3, last_active = NOW()
       RETURNING *`,
      [roomId, userId, role]
    );
    return result.rows[0];
  }

  static async findByRoomId(roomId) {
    const result = await query(
      `SELECT rp.*, u.id as user_id, u.email, u.first_name, u.last_name, u.avatar_url
       FROM room_participants rp
       INNER JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1
       ORDER BY rp.joined_at ASC`,
      [roomId]
    );
    return result.rows;
  }

  static async findByUserId(userId) {
    const result = await query(
      `SELECT rp.*, r.room_id, r.language, r.code_content
       FROM room_participants rp
       INNER JOIN rooms r ON rp.room_id = r.id
       WHERE rp.user_id = $1
       ORDER BY rp.last_active DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findOne(roomId, userId) {
    const result = await query(
      'SELECT * FROM room_participants WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );
    return result.rows[0] || null;
  }

  static async updateRole(roomId, userId, role) {
    const result = await query(
      `UPDATE room_participants SET role = $1, last_active = NOW()
       WHERE room_id = $2 AND user_id = $3
       RETURNING *`,
      [role, roomId, userId]
    );
    return result.rows[0] || null;
  }

  static async updateLastActive(roomId, userId) {
    await query(
      'UPDATE room_participants SET last_active = NOW() WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );
  }

  static async remove(roomId, userId) {
    const result = await query(
      'DELETE FROM room_participants WHERE room_id = $1 AND user_id = $2 RETURNING id',
      [roomId, userId]
    );
    return result.rows[0] || null;
  }

  static async removeByRoomId(roomId) {
    await query(
      'DELETE FROM room_participants WHERE room_id = $1',
      [roomId]
    );
  }
}

