import Joi from 'joi';

export const executeCodeSchema = Joi.object({
  roomId: Joi.string().min(1).max(50).required().messages({
    'any.required': 'Room ID is required',
    'string.min': 'Room ID must be at least 1 character',
    'string.max': 'Room ID must be at most 50 characters',
  }),
  language: Joi.string().valid(
    'cpp', 'python', 'java', 'javascript', 'typescript',
    'php', 'sql', 'go', 'kotlin', 'rust'
  ).required().messages({
    'any.required': 'Language is required',
    'any.only': 'Invalid language specified',
  }),
  code: Joi.string().required().messages({
    'any.required': 'Code is required',
  }),
  input: Joi.string().allow(null, '').optional(),
});

