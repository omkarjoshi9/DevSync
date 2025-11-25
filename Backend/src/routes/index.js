import express from 'express';
import authRoutes from './auth.routes.js';
import roomRoutes from './room.routes.js';
import executionRoutes from './execution.routes.js';
import config from '../config/env.js';

const router = express.Router();

const apiVersion = config.apiVersion;

router.use(`/${apiVersion}/auth`, authRoutes);
router.use(`/${apiVersion}/rooms`, roomRoutes);
router.use(`/${apiVersion}/execute`, executionRoutes);

// Health check endpoints
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

router.get('/health/db', async (req, res) => {
  try {
    const { query } = await import('../config/database.js');
    await query('SELECT 1');
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'database',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection failed',
      },
    });
  }
});

router.get('/health/redis', async (req, res) => {
  try {
    const getRedisClient = await import('../config/redis.js');
    const redis = await getRedisClient.default();
    await redis.ping();
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'redis',
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Redis connection failed',
      },
    });
  }
});

export default router;

