import express from 'express';
import {
  createRoom,
  joinRoom,
  getRoom,
  validateRoom,
  deleteRoom,
  leaveRoom,
  getActiveRooms,
  getParticipants,
} from '../controllers/room.controller.js';
import {
  createRoomSchema,
  joinRoomSchema,
  validateRoomSchema,
} from '../validators/room.validator.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roomCreationRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/create', authenticate, roomCreationRateLimiter, validate(createRoomSchema), createRoom);
router.post('/join', authenticate, validate(joinRoomSchema), joinRoom);
router.get('/:roomId', authenticate, getRoom);
router.post('/:roomId/validate', validate(validateRoomSchema), validateRoom);
router.delete('/:roomId', authenticate, deleteRoom);
router.post('/:roomId/leave', authenticate, leaveRoom);
router.get('/user/active', authenticate, getActiveRooms);
router.get('/:roomId/participants', authenticate, getParticipants);

export default router;

