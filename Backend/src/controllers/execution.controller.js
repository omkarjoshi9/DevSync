import { ExecutionService } from '../services/execution.service.js';
import { getExecutionQueue } from '../queues/execution.queue.js';

export const executeCode = async (req, res, next) => {
  try {
    const { roomId, language, code, input } = req.body;
    
    // Create execution record
    const execution = await ExecutionService.createExecution({
      roomId,
      userId: req.userId,
      language,
      code,
      input,
    });

    // Queue execution
    const queue = getExecutionQueue();
    await queue.add({
      executionId: execution.id,
    }, {
      jobId: execution.id,
    });

    res.status(202).json({
      success: true,
      data: {
        executionId: execution.id,
        status: 'queued',
      },
      message: 'Code execution queued',
    });
  } catch (error) {
    next(error);
  }
};

export const getExecution = async (req, res, next) => {
  try {
    const execution = await ExecutionService.getExecution(req.params.executionId, req.userId);
    res.json({
      success: true,
      data: { execution },
    });
  } catch (error) {
    next(error);
  }
};

export const getRoomExecutions = async (req, res, next) => {
  try {
    const result = await ExecutionService.getRoomExecutions(req.params.roomId, req.userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

