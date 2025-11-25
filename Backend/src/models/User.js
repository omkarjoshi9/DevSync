import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/passwordHasher.js';

export class User {
  static async create({ email, password, firstName, lastName, googleId = null, avatarUrl = null }) {
    let passwordHash = null;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, google_id, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, avatar_url, subscription_tier, email_verified, created_at, updated_at`,
      [email, passwordHash, firstName, lastName, googleId, avatarUrl]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, email, first_name, last_name, avatar_url, subscription_tier, email_verified, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByGoogleId(googleId) {
    const result = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    return result.rows[0] || null;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.firstName !== undefined) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(updates.lastName);
    }
    if (updates.avatarUrl !== undefined) {
      fields.push(`avatar_url = $${paramCount++}`);
      values.push(updates.avatarUrl);
    }
    if (updates.password !== undefined) {
      const passwordHash = await hashPassword(updates.password);
      fields.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }
    if (updates.emailVerified !== undefined) {
      fields.push(`email_verified = $${paramCount++}`);
      values.push(updates.emailVerified);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, avatar_url, subscription_tier, email_verified, created_at, updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  static async verifyPassword(user, password) {
    if (!user.password_hash) {
      return false;
    }
    return await comparePassword(password, user.password_hash);
  }
}

