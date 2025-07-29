import z from 'zod';
import { HTTP_STATUS } from '@/utils/constraints';
import {
  badRequestSchema,
  okSchema,
  validateErrorSchema,
} from './utils.validators';

export const createProjectBodySchema = z.object({
  projectName: z.string().trim().min(3).max(255),
  description: z.string().trim().optional(),
  domain: z.url().trim().optional(),
  icon: z.string().trim().optional(),
});

export const createProjectResponseSchema = {
  [HTTP_STATUS.CREATED]: z.object({
    ok: z.boolean(),
    message: z.string(),
    project: z.object({
      id: z.uuid(),
      project_name: z.string(),
      description: z.string().nullable(),
      domain: z.url().nullable(),
      icon: z.string().nullable(),
      status: z.enum(['active', 'inactive', 'suspended']),
      webhook_secret: z.string(),
      created_at: z.date(),
    }),
  }),
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
  [HTTP_STATUS.BAD_REQUEST]: badRequestSchema,
};

export const updateProjectBodySchema = z.object({
  projectName: z.string().trim().min(3).max(255),
  description: z.string().trim().optional(),
  domain: z.url().trim().optional(),
  icon: z.string().trim().optional(),
});
export const updateProjectParamSchema = z.object({
  projectId: z.uuid(),
});

export const updateProjectResponseSchema = {
  [HTTP_STATUS.OK]: okSchema,
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: validateErrorSchema,
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
  [HTTP_STATUS.CONFLICT]: badRequestSchema,
};

export const disableProjectParamSchema = z.object({
  projectId: z.uuid(),
});

export const disableProjectResponseSchema = {
  [HTTP_STATUS.OK]: okSchema,
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
};

export const getProjectParamSchema = z.object({
  projectId: z.uuid(),
});

export const getProjectResponseSchema = {
  [HTTP_STATUS.OK]: z.object({
    ok: z.boolean(),
    message: z.string(),
    project: z.object({
      id: z.uuid(),
      project_name: z.string(),
      description: z.string().nullable(),
      domain: z.url().nullable(),
      icon: z.string().nullable(),
      status: z.enum(['active', 'inactive', 'suspended']),
      webhook_secret: z.string(),
      rate_limit_per_minute: z.number(),
      rate_limit_per_hour: z.number(),
      rate_limit_per_day: z.number(),
      created_at: z.date(),
      updated_at: z.date().nullable(),
    }),
  }),
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
};

export const listProjectsResponseSchema = {
  [HTTP_STATUS.OK]: z.object({
    ok: z.boolean(),
    message: z.string(),
    projects: z.array(
      z.object({
        id: z.uuid(),
        project_name: z.string(),
        description: z.string().nullable(),
        domain: z.url().nullable(),
        icon: z.string().nullable(),
        status: z.enum(['active', 'inactive', 'suspended']),
        created_at: z.date(),
        updated_at: z.date().nullable(),
      })
    ),
  }),
  [HTTP_STATUS.NOT_FOUND]: badRequestSchema,
};
