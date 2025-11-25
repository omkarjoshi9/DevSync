import { query } from '../config/database.js';

export class CodeExecution {
  static async create({ roomId, userId, language, code, input = null }) {
    const result = await query(
      `INSERT INTO code_executions (room_id, user_id, language, code, input, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [roomId, userId, language, code, input]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      'SELECT * FROM code_executions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.output !== undefined) {
      fields.push(`output = $${paramCount++}`);
      values.push(updates.output);
    }
    if (updates.error !== undefined) {
      fields.push(`error = $${paramCount++}`);
      values.push(updates.error);
    }
    if (updates.executionTime !== undefined) {
      fields.push(`execution_time = $${paramCount++}`);
      values.push(updates.executionTime);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE code_executions SET ${fields.join(', ')} WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async findByRoomId(roomId, limit = 50) {
    const result = await query(
      `SELECT * FROM code_executions 
       WHERE room_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [roomId, limit]
    );
    return result.rows;
  }
}

