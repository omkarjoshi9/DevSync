import { query } from '../config/database.js';

export class RefreshToken {
  static async create({ userId, token, expiresAt }) {
    const result = await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  static async findByToken(token) {
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    return result.rows[0] || null;
  }

  static async delete(token) {
    await query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [token]
    );
  }

  static async deleteByUserId(userId) {
    await query(
      'DELETE FROM refresh_tokens WHERE user_id = $1',
      [userId]
    );
  }

  static async deleteExpired() {
    await query(
      'DELETE FROM refresh_tokens WHERE expires_at < NOW()',
      []
    );
  }
}

