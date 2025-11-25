import http from 'http';
import app from './app.js';
import { WebSocketService } from './services/websocket.service.js';
import { getRedisClient } from './config/redis.js';
import { getExecutionQueue } from './queues/execution.queue.js';
import config from './config/env.js';
import logger from './utils/logger.js';

const server = http.createServer(app);

// Initialize WebSocket
const wsService = new WebSocketService(server);

// Make io available globally
app.set('io', wsService.getIO());

const startServer = async () => {
  try {
    // Test Redis connection
    try {
      const redis = await getRedisClient();
      await redis.ping();
      logger.info('Redis connected');
    } catch (error) {
      logger.warn('Redis connection failed, continuing without Redis', error);
    }

    // Initialize execution queue (this sets up the processor)
    try {
      const queue = getExecutionQueue();
      logger.info('Execution queue initialized');
      
      // Test queue connection
      queue.on('error', (error) => {
        logger.error('Execution queue error', error);
      });
      
      queue.on('waiting', (jobId) => {
        logger.info('Execution job waiting', { jobId });
      });
      
      queue.on('active', (job) => {
        logger.info('Execution job started', { jobId: job.id, executionId: job.data.executionId });
      });
      
      queue.on('completed', (job, result) => {
        logger.info('Execution job completed', { jobId: job.id, executionId: job.data.executionId });
      });
      
      queue.on('failed', (job, error) => {
        logger.error('Execution job failed', { 
          jobId: job?.id, 
          executionId: job?.data?.executionId,
          error: error?.message 
        });
      });
    } catch (error) {
      logger.error('Failed to initialize execution queue', error);
      // Continue anyway - queue will be initialized on first use
    }

    // Test Docker connection (for code execution)
    try {
      const { getDockerClient } = await import('./config/docker.js');
      const docker = getDockerClient();
      await docker.ping();
      logger.info('Docker connection verified');
    } catch (error) {
      logger.warn('Docker connection failed - code execution will not work', {
        error: error.message,
        hint: 'Make sure Docker Desktop is running on Windows',
        platform: process.platform
      });
    }

    // Start server
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        env: config.nodeEnv,
        port: config.port,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

startServer();

