import z from 'zod';
import { HTTP_STATUS } from '@/utils/constraints';
import { validateErrorSchema } from './utils.validators';

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
  [HTTP_STATUS.BAD_REQUEST]: z.object({
    ok: z.boolean(),
    message: z.string(),
    errorCode: z.string(),
  }),
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
        user_id: z.string(),
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
