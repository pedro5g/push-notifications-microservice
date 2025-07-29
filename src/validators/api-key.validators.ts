import z from 'zod';
import { HTTP_STATUS } from '@/utils/constraints';
import { validatePermissions } from '@/utils/permissions';
import {
  badRequestSchema,
  okSchema,
  validateErrorSchema,
} from './utils.validators';

export const createApiKeyParamSchema = z.object({
  projectId: z.uuid(),
});

export const createApiKeyBodySchema = z.object({
  name: z.string().trim().min(3).max(255),
  permissions: z.array(z.string()).refine((permissions) => {
    const validate = validatePermissions(permissions);
    return validate.valid;
  }),
  expiresAt: z.coerce.date().optional(),
});

export const createApiKeyResponseSchema = {
  [HTTP_STATUS.CREATED]: z.object({
    ok: z.boolean(),
    message: z.string(),
    apiKey: z.object({
      id: z.uuid(),
      name: z.string(),
      key: z.string(),
      key_preview: z.string(),
      permissions: z.array(z.string()),
      status: z.enum(['active', 'inactive', 'revoked']),
      expires_at: z.date().nullable(),
      created_at: z.date(),
    }),
  }),
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema.describe('Entity not found'),
  [HTTP_STATUS.CONFLICT]: badRequestSchema.describe('Conflict'),
};
export const updateApiKeyParamSchema = z.object({
  apiKeyId: z.uuid(),
});

export const updateApiKeyBodySchema = z.object({
  name: z.string().trim().min(3).max(255),
  status: z.enum(['active', 'inactive', 'revoked']),
  permissions: z.array(z.string()).refine((permissions) => {
    const validate = validatePermissions(permissions);
    return validate.valid;
  }),
  expiresAt: z.coerce.date().optional(),
});

export const updateApiKeyResponseSchema = {
  [HTTP_STATUS.OK]: okSchema,
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
};

export const getApiKeyParamSchema = z.object({
  apiKeyId: z.uuid(),
});

export const getApiKeyResponseSchema = {
  [HTTP_STATUS.OK]: z.object({
    ok: z.boolean(),
    message: z.string(),
    apiKey: z.object({
      id: z.uuid(),
      project_id: z.uuid(),
      name: z.string(),
      key_hash: z.string(),
      key_preview: z.string(),
      permissions: z.array(z.string()),
      status: z.enum(['active', 'inactive', 'revoked']),
      expires_at: z.date().nullable(),
      last_used_at: z.date().nullable(),
      usage_count: z.coerce.number(),
      created_at: z.date(),
      updated_at: z.date().nullable(),
    }),
  }),
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
};

export const listApiKeysParamSchema = z.object({
  projectId: z.uuid(),
});

export const listApiKeysResponseSchema = {
  [HTTP_STATUS.OK]: z.object({
    ok: z.boolean(),
    message: z.string(),
    apiKeys: z.array(
      z.object({
        id: z.uuid(),
        name: z.string(),
        key_preview: z.string(),
        permissions: z.array(z.string()),
        status: z.enum(['active', 'inactive', 'revoked']),
        expires_at: z.date().nullable(),
        last_used_at: z.date().nullable(),
        usage_count: z.coerce.number(),
        created_at: z.date(),
        updated_at: z.date().nullable(),
      })
    ),
  }),
};
