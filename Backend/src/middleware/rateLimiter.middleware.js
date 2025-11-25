import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../config/redis.js';
import { RateLimitError } from '../utils/errors.js';

// Store for rate limit tracking (in-memory fallback)
const rateLimitStore = new Map();

// Auth rate limiter: 5 requests per 15 minutes per IP
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many authentication attempts, please try again later',
      },
    });
  },
});

// Execution rate limiter: 10 requests per minute per user
export const executionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many execution requests, please try again later',
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many execution requests, please try again later',
      },
    });
  },
});

// Room creation rate limiter: 20 rooms per hour per user
export const roomCreationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many rooms created, please try again later',
      },
    });
  },
});

