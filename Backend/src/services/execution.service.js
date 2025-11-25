import { CodeExecution } from '../models/CodeExecution.js';
import { Room } from '../models/Room.js';
import { RoomParticipant } from '../models/RoomParticipant.js';
import { CodeExecutorService } from './codeExecutor.service.js';
import { NotFoundError, AuthorizationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class ExecutionService {
  static async createExecution({ roomId, userId, language, code, input }) {
    // Verify room exists and user has access
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    const participant = await RoomParticipant.findOne(room.id, userId);
    if (!participant) {
      throw new AuthorizationError('You are not a participant of this room');
    }

    // Create execution record
    const execution = await CodeExecution.create({
      roomId: room.id,
      userId,
      language,
      code,
      input,
    });

    return execution;
  }

  static async executeCode(executionId) {
    const execution = await CodeExecution.findById(executionId);
    if (!execution) {
      throw new NotFoundError('Execution');
    }

    logger.info('Starting code execution', { executionId, language: execution.language });

    // Update status to running
    await CodeExecution.update(executionId, { status: 'running' });

    try {
      // Execute code
      const result = await CodeExecutorService.executeCode({
        language: execution.language,
        code: execution.code,
        input: execution.input,
      });

      logger.info('Code execution finished', {
        executionId,
        hasOutput: !!result.output,
        hasError: !!result.error,
        executionTime: result.executionTime,
      });

      // Update execution record
      // Only mark as failed if there's an actual error (non-empty stderr)
      const hasError = result.error && result.error.trim().length > 0;
      const status = hasError ? 'failed' : 'completed';
      
      logger.info('Updating execution record', {
        executionId,
        status,
        outputLength: result.output?.length || 0,
        errorLength: result.error?.length || 0,
        outputPreview: result.output?.substring(0, 100),
        errorPreview: result.error?.substring(0, 100)
      });
      
      const updatedExecution = await CodeExecution.update(executionId, {
        status,
        output: result.output || '', // Ensure it's always a string
        error: result.error || '',   // Ensure it's always a string
        executionTime: result.executionTime,
      });

      logger.info('Code execution record updated', {
        executionId,
        status: updatedExecution?.status,
        output: updatedExecution?.output?.substring(0, 100) || '(empty)',
        error: updatedExecution?.error?.substring(0, 100) || '(empty)',
        executionTime: result.executionTime,
      });

      return updatedExecution;
    } catch (error) {
      logger.error('Code execution error', { 
        executionId, 
        error: error.message,
        stack: error.stack 
      });
      
      const errorMessage = error.message || 'Unknown error occurred during execution';
      
      await CodeExecution.update(executionId, {
        status: 'failed',
        error: errorMessage,
      });

      // Don't throw - return the failed execution instead
      const failedExecution = await CodeExecution.findById(executionId);
      return failedExecution;
    }
  }

  static async getExecution(executionId, userId) {
    const execution = await CodeExecution.findById(executionId);
    if (!execution) {
      throw new NotFoundError('Execution');
    }

    // Verify user has access to the room
    const room = await Room.findById(execution.room_id);
    const participant = await RoomParticipant.findOne(room.id, userId);
    if (!participant) {
      throw new AuthorizationError('You do not have access to this execution');
    }

    return execution;
  }

  static async getRoomExecutions(roomId, userId) {
    const room = await Room.findByRoomId(roomId);
    if (!room) {
      throw new NotFoundError('Room');
    }

    const participant = await RoomParticipant.findOne(room.id, userId);
    if (!participant) {
      throw new AuthorizationError('You are not a participant of this room');
    }

    const executions = await CodeExecution.findByRoomId(room.id);
    return { executions };
  }
}

