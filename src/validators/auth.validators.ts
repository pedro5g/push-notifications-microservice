import { z } from 'zod';
import { HTTP_STATUS } from '@/utils/constraints';
import {
  badRequestSchema,
  okSchema,
  validateErrorSchema,
} from './utils.validators';

export const registerUserBodySchema = z.object({
  name: z.string().min(3).max(255),
  email: z.email(),
  password: z.string().min(6).max(100),
});

export const registerUserResponseSchema = {
  [HTTP_STATUS.CREATED]: z.object({
    ok: z.boolean(),
    message: z.string(),
  }),
  [HTTP_STATUS.BAD_REQUEST]: badRequestSchema,
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
};

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

export const loginResponseSchema = {
  [HTTP_STATUS.OK]: z.object({
    ok: z.boolean(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.email(),
      status: z.enum([
        'active',
        'inactive',
        'suspended',
        'pending_verification',
      ]),
      email_verified_at: z.date().nullable(),
      last_login_at: z.date().nullable(),
      created_at: z.date(),
      updated_at: z.date().nullable(),
      settings: z.object({
        id: z.string(),
        language: z.string(),
        email_notifications: z.boolean(),
        push_notifications: z.boolean(),
        webhook_notifications: z.boolean(),
        max_projects: z.number(),
        max_web_hooks_per_project: z.number(),
        max_notifications_per_month: z.number(),
        created_at: z.date(),
        updated_at: z.date().nullable(),
      }),
    }),
    accessToken: z.jwt(),
    refreshToken: z.jwt(),
  }),
  [HTTP_STATUS.BAD_REQUEST]: z.object({
    ok: z.boolean(),
    message: z.string(),
    errorCode: z.string(),
  }),
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
};

export const emailVerifyQuerySchema = z.object({
  token: z.string(),
});

export const emailVerifyResponseSchema = {
  [HTTP_STATUS.OK]: okSchema,
  [HTTP_STATUS.BAD_REQUEST]: badRequestSchema,
};

export const refreshBodySchema = z.object({
  refreshToken: z.jwt(),
});

export const refreshResponseSchema = {
  [HTTP_STATUS.OK]: okSchema.and(
    z.object({
      accessToken: z.jwt(),
      refreshToken: z.jwt(),
    })
  ),
  [HTTP_STATUS.UNAUTHORIZED]: badRequestSchema,
};

export const forgotPasswordBodySchema = z.object({
  email: z.email(),
});

export const forgotPasswordResponseSchema = {
  [HTTP_STATUS.OK]: okSchema,
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
  [HTTP_STATUS.TOO_MANY_REQUESTS]: badRequestSchema,
};

export const resetPasswordBodySchema = z.object({
  token: z.string(),
  password: z.string().min(3).max(100),
});

export const resetPasswordResponseSchema = {
  [HTTP_STATUS.OK]: okSchema,
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
};
