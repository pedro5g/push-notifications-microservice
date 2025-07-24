import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCode, HTTP_STATUS } from '@/utils/constraints';
import { AppError } from '@/utils/exceptions';
import { Logger } from '@/utils/logger';

const logger = new Logger('Global error handler');

export const globalErrorHandler = (
  error: FastifyError,
  req: FastifyRequest,
  reply: FastifyReply
) => {
  logger.error(`Error on PATH: ${req.url}`, error);

  if (error instanceof SyntaxError) {
    return reply.status(HTTP_STATUS.BAD_REQUEST).send({
      ok: false,
      message: 'Invalid Json format, please check your request body',
    });
  }

  if (error.validation) {
    const errors = error.validation.map((error) => ({
      field: error.instancePath.split('/')[1],
      message: error.message,
    }));

    return reply.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).send({
      ok: false,
      message: 'Validation failed',
      errors: errors,
      errorCode: ErrorCode.VALIDATION_ERROR,
    });
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
