import { query } from '../config/database.js';

const CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ROOM_ID_LENGTH = 6;

const generateRandomId = () => {
  let result = '';
  for (let i = 0; i < ROOM_ID_LENGTH; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
  }
  return result;
};

export const generateUniqueRoomId = async () => {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const roomId = generateRandomId();
    
    const result = await query(
      'SELECT id FROM rooms WHERE room_id = $1',
      [roomId]
    );

    if (result.rows.length === 0) {
      return roomId;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique room ID after multiple attempts');
};

