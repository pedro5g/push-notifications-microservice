import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import z from 'zod';
import { env } from '@/config/env';
import { ErrorCode, HTTP_STATUS } from '@/utils/constraints';
import { AppError } from '@/utils/exceptions';

const formatZodError = (reply: FastifyReply, error: z.ZodError) => {
  const errors = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  return reply.status(HTTP_STATUS.BAD_REQUEST).send({
    ok: false,
    message: 'Validation failed',
    errors,
    errorCode: ErrorCode.VALIDATION_ERROR,
  });
};

export const globalErrorHandler = (
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply
) => {
  if (env.NODE_ENV !== 'test')
    console.error(`Error on PATH: ${req.url}`, error);

  if (error instanceof SyntaxError) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      ok: false,
      message: 'Invalid Json format, please check your request body',
    });
  }

  if (error instanceof z.ZodError) {
    return formatZodError(reply, error);
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      ok: false,
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
    ok: false,
    message: 'Internal Server Error',
    error: error?.message || 'Unknown error occurred',
  });
};
