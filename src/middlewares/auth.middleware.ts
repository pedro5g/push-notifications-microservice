import type { FastifyReply, FastifyRequest } from 'fastify';
import { ErrorCode, HTTP_STATUS } from '@/utils/constraints';
import {
  type AccessTokenPayload,
  accessTokenConfig,
  verifyToken,
} from '@/utils/jwt';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const bearer = request.headers.authorization;

  if (!bearer) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      ok: false,
      message: 'Unauthorized Access',
      errorCode: ErrorCode.AUTH_TOKEN_NOT_FOUND,
    });
  }

  const [_, token] = bearer.split(' ');

  if (!token) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      ok: false,
      message: 'Unauthorized Access',
      errorCode: ErrorCode.AUTH_TOKEN_NOT_FOUND,
    });
  }

  const payload = verifyToken<AccessTokenPayload>(
    token,
    accessTokenConfig.verify
  );

  if (!payload) {
    return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
      ok: false,
      message: 'Unauthorized Access',
      errorCode: ErrorCode.AUTH_INVALID_TOKEN,
    });
  }

  Object.assign(request, { user: { id: payload.id } });
}
