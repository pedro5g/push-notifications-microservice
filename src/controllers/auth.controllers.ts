import type { FastifyTypedInstance } from '@/@types';
import { ContextRepository } from '@/repositories/context.repository';
import { AuthServices } from '@/services/auth.services';
import { HTTP_STATUS } from '@/utils/constraints';
import {
  loginBodySchema,
  loginResponseSchema,
  registerUserBodySchema,
  registerUserResponseSchema,
} from '@/validators/auth.validators';

export async function AuthControllers(app: FastifyTypedInstance) {
  const ctx = new ContextRepository();
  const authService = new AuthServices(ctx);

  app.post(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Register an account',
        body: registerUserBodySchema,
        response: registerUserResponseSchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body;
      await authService.register({
        name,
        email,
        password,
      });

      return reply.status(HTTP_STATUS.CREATED).send({
        ok: true,
        message: 'New user registered successfully',
      });
    }
  );

  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        body: loginBodySchema,
        response: loginResponseSchema,
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;
      const { user, accessToken, refreshToken } = await authService.login({
        email,
        password,
        ip: request.ip,
        userAgent: request.headers['user-agent'] || '',
      });

      return reply.status(HTTP_STATUS.OK).send({
        ok: true,
        user,
        accessToken,
        refreshToken,
      });
    }
  );

  return app;
}
