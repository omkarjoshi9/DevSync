import { query } from '../config/database.js';

export class PasswordResetToken {
  static async create({ userId, token, expiresAt }) {
    const result = await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, token, expiresAt]
    );
    return result.rows[0];
  }

  static async findByToken(token) {
    const result = await query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used = false',
      [token]
    );
    return result.rows[0] || null;
  }

  static async markAsUsed(token) {
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [token]
    );
  }

  static async deleteExpired() {
    await query(
      'DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = true',
      []
    );
  }
}

