import type { FastifyTypedInstance } from '@/@types';
import type { AuthServices } from '@/services/auth.services';
import { HTTP_STATUS } from '@/utils/constraints';
import {
  emailVerifyQuerySchema,
  emailVerifyResponseSchema,
  forgotPasswordBodySchema,
  forgotPasswordResponseSchema,
  loginBodySchema,
  loginResponseSchema,
  refreshBodySchema,
  refreshResponseSchema,
  registerUserBodySchema,
  registerUserResponseSchema,
  resetPasswordBodySchema,
  resetPasswordResponseSchema,
} from '@/validators/auth.validators';

export function AuthControllers(authService: AuthServices) {
  return async (app: FastifyTypedInstance) => {
    app.post(
      '/auth/register',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Register account route',
          body: registerUserBodySchema,
          response: registerUserResponseSchema,
        },
      },
      async (request, reply) => {
        const { name, email, password } = request.body;
        const { message } = await authService.register({
          name,
          email,
          password,
        });

        return reply.status(HTTP_STATUS.CREATED).send({
          ok: true,
          message,
        });
      }
    );

    app.get(
      '/auth/verify-email',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Verification account route',
          description:
            'Confirm the account by clicking on the link in the email, without confirming email it is not possible to login',
          querystring: emailVerifyQuerySchema,
          response: emailVerifyResponseSchema,
        },
      },
      async (request, reply) => {
        const { token } = request.query;
        const { message } = await authService.confirmAccount({ token });

        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message,
        });
      }
    );

    app.post(
      '/auth/login',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Login route',
          description: 'Login to obtain access tokens and user profile',
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

    app.patch(
      '/auth/refresh',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Refresh user session route',
          description:
            'send refreshToken to revalidate the user session, if it is a valid refreshToken and the same ip and userAgent is the requester, the session will be revalidated',
          body: refreshBodySchema,
          response: refreshResponseSchema,
        },
      },
      async (request, reply) => {
        const { refreshToken } = request.body;
        const { accessToken, newRefreshToken } = await authService.refresh({
          refreshToken,
          ip: request.ip,
          userAgent: request.headers['user-agent'] || '',
        });

        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'User session revalidate successfully',
          accessToken,
          refreshToken: newRefreshToken,
        });
      }
    );

    app.post(
      '/auth/forgot-password',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Recovery password route',
          description:
            'Request password recovery and receive an email with a token for it',
          body: forgotPasswordBodySchema,
          response: forgotPasswordResponseSchema,
        },
      },
      async (request, reply) => {
        const { email } = request.body;
        const { message } = await authService.forgotPassword({ email });

        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message,
        });
      }
    );

    app.put(
      '/auth/reset-password',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Redefine password route',
          body: resetPasswordBodySchema,
          response: resetPasswordResponseSchema,
        },
      },
      async (request, reply) => {
        const { token, password } = request.body;
        const { message } = await authService.resetPassword({
          token,
          password,
        });
        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message,
        });
      }
    );

    return app;
  };
}
