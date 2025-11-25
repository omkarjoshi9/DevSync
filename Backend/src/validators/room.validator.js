import Joi from 'joi';

export const createRoomSchema = Joi.object({
  password: Joi.string().min(4).max(100).allow(null, '').optional(),
  language: Joi.string().valid(
    'cpp', 'python', 'java', 'javascript', 'typescript',
    'php', 'sql', 'go', 'kotlin', 'rust'
  ).optional(),
  settings: Joi.object().optional(),
});

export const joinRoomSchema = Joi.object({
  roomId: Joi.string().required().messages({
    'any.required': 'Room ID is required',
  }),
  password: Joi.string().allow(null, '').optional(),
});

export const validateRoomSchema = Joi.object({
  password: Joi.string().allow(null, '').optional(),
});

