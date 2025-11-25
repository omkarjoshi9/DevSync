import Queue from 'bull';
import { getRedisClient } from '../config/redis.js';
import { ExecutionService } from '../services/execution.service.js';
import logger from '../utils/logger.js';
import config from '../config/env.js';

let executionQueue = null;

export const getExecutionQueue = () => {
  if (executionQueue) {
    return executionQueue;
  }

  // Parse Redis URL for Bull queue (supports Upstash with TLS)
  let redisConfig;
  
  if (config.redis.url) {
    try {
      // Parse the Redis URL (handles both redis:// and rediss://)
      const url = new URL(config.redis.url);
      const isTLS = url.protocol === 'rediss:' || config.redis.url.startsWith('rediss://');
      
      // Extract password from URL (format: rediss://default:password@host:port)
      const password = url.password || (url.username && url.username !== 'default' ? url.username : undefined);
      
      redisConfig = {
        host: url.hostname,
        port: parseInt(url.port || '6379', 10),
        ...(password && { password }),
        // For Upstash/TLS connections
        ...(isTLS && {
          tls: {
            rejectUnauthorized: false, // Upstash uses self-signed certs
          },
        }),
      };
      
      logger.info('Execution queue configured with Redis', { 
        host: redisConfig.host, 
        port: redisConfig.port,
        hasPassword: !!password,
        tls: isTLS,
        urlPreview: config.redis.url.substring(0, 30) + '...'
      });
    } catch (error) {
      logger.error('Failed to parse Redis URL, using host/port fallback', { 
        error: error.message,
        url: config.redis.url?.substring(0, 30) + '...'
      });
      redisConfig = {
        host: config.redis.host,
        port: config.redis.port,
      };
    }
  } else {
    logger.warn('No Redis URL configured, using host/port', {
      host: config.redis.host,
      port: config.redis.port
    });
    redisConfig = {
      host: config.redis.host,
      port: config.redis.port,
    };
  }

  executionQueue = new Queue('code-execution', {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 1,
      timeout: 120000, // 2 minutes timeout (enough for Docker image pull + execution)
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  // Process jobs
  executionQueue.process(async (job) => {
    const { executionId } = job.data;
    logger.info('Processing code execution job', { executionId, jobId: job.id });
    
    try {
      const result = await ExecutionService.executeCode(executionId);
      logger.info('Code execution job completed successfully', { 
        executionId, 
        jobId: job.id,
        status: result?.status 
      });
      return result;
    } catch (error) {
      logger.error('Code execution job failed with exception', { 
        executionId, 
        jobId: job.id,
        error: error.message,
        stack: error.stack 
      });
      // Update execution status to failed
      try {
        const { CodeExecution } = await import('../models/CodeExecution.js');
        const errorMessage = error.message || 'Execution failed';
        await CodeExecution.update(executionId, {
          status: 'failed',
          error: errorMessage.includes('timeout') 
            ? 'Execution timed out - code took too long to run or Docker image pull took too long'
            : errorMessage,
        });
        logger.info('Execution status updated to failed', { executionId, error: errorMessage });
      } catch (updateError) {
        logger.error('Failed to update execution status', { executionId, error: updateError.message });
      }
      throw error;
    }
  });

  // Event handlers
  executionQueue.on('completed', (job, result) => {
    logger.info('Code execution job completed', { jobId: job.id, executionId: job.data.executionId });
  });

  executionQueue.on('failed', (job, error) => {
    logger.error('Code execution job failed', { jobId: job.id, executionId: job.data.executionId, error: error.message });
  });

  return executionQueue;
};

