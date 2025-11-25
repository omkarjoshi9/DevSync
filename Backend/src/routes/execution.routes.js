import express from 'express';
import {
  executeCode,
  getExecution,
  getRoomExecutions,
} from '../controllers/execution.controller.js';
import { executeCodeSchema } from '../validators/execution.validator.js';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { executionRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/', authenticate, executionRateLimiter, validate(executeCodeSchema), executeCode);
router.get('/rooms/:roomId/executions', authenticate, getRoomExecutions);
router.get('/:executionId', authenticate, getExecution);

export default router;

