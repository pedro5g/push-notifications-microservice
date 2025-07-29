import type { FastifyTypedInstance } from '@/@types';
import { authMiddleware } from '@/middlewares/auth.middleware';
import type { ApiKeyServices } from '@/services/api-key.services';
import { HTTP_STATUS } from '@/utils/constraints';
import {
  createApiKeyBodySchema,
  createApiKeyParamSchema,
  createApiKeyResponseSchema,
  getApiKeyParamSchema,
  getApiKeyResponseSchema,
  listApiKeysParamSchema,
  listApiKeysResponseSchema,
  updateApiKeyBodySchema,
  updateApiKeyParamSchema,
  updateApiKeyResponseSchema,
} from '@/validators/api-key.validators';

export function ApiKeyControllers(apiKeyServices: ApiKeyServices) {
  return async (app: FastifyTypedInstance) => {
    app.post(
      '/api-key/:projectId/create',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['ApiKey'],
          security: [{ Bearer: [] }],
          params: createApiKeyParamSchema,
          body: createApiKeyBodySchema,
          response: createApiKeyResponseSchema,
        },
      },
      async (request, reply) => {
        const { projectId } = request.params;
        const { name, permissions, expiresAt } = request.body;
        const { apiKey } = await apiKeyServices.createApiKey({
          projectId,
          name,
          permissions,
          expiresAt,
        });
        return reply.status(HTTP_STATUS.CREATED).send({
          ok: true,
          message: 'ApiKey created successfully',
          apiKey,
        });
      }
    );
    app.put(
      '/api-key/:apiKeyId/update',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['ApiKey'],
          security: [{ Bearer: [] }],
          params: updateApiKeyParamSchema,
          body: updateApiKeyBodySchema,
          response: updateApiKeyResponseSchema,
        },
      },
      async (request, reply) => {
        const { apiKeyId } = request.params;
        const { name, permissions, status, expiresAt } = request.body;
        await apiKeyServices.updateApiKey({
          apiKeyId,
          name,
          permissions,
          status,
          expiresAt,
        });
        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'ApiKey updated successfully',
        });
      }
    );
    app.get(
      '/api-key/:apiKeyId/get',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['ApiKey'],
          security: [{ Bearer: [] }],
          params: getApiKeyParamSchema,
          response: getApiKeyResponseSchema,
        },
      },
      async (request, reply) => {
        const { apiKeyId } = request.params;
        const { apiKey } = await apiKeyServices.getApiKey({ apiKeyId });
        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'ApiKey found',
          apiKey,
        });
      }
    );
    app.post(
      '/api-key/:projectId/list',
      {
        preHandler: [authMiddleware],
        schema: {
          tags: ['ApiKey'],
          security: [{ Bearer: [] }],
          params: listApiKeysParamSchema,
          response: listApiKeysResponseSchema,
        },
      },
      async (request, reply) => {
        const { projectId } = request.params;
        const { apiKeys } = await apiKeyServices.listAll({ projectId });
        return reply.status(HTTP_STATUS.OK).send({
          ok: true,
          message: 'All project apiKeys',
          apiKeys,
        });
      }
    );
  };
}
