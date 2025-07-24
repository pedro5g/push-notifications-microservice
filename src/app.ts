import { fastifyCors } from '@fastify/cors';
import { fastifyHelmet } from '@fastify/helmet';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';
import { type FastifyInstance, fastify } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import z from 'zod';
import { env } from './config/env';
import { AuthControllers } from './controllers/auth.controllers';
import { globalErrorHandler } from './middlewares/global-error-handler';
import { HTTP_STATUS } from './utils/constraints';

export function buildApp(): FastifyInstance {
  const app = fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyHelmet, {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: false,
  });

  app.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  app.setErrorHandler(globalErrorHandler);

  if (env.NODE_ENV === 'development') {
    app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Push Notifications Microservice',
          description: 'API para gerenciar push notifications via webhooks',
          version: '1.0.0',
        },
      },
      transform: jsonSchemaTransform,
    });

    app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    });
  }

  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        description: 'Health check endpoint',
        response: {
          [HTTP_STATUS.OK]: z.object({
            timestamp: z.string(),
            uptime: z.number(),
            version: z.string(),
          }),
        },
      },
    },
    async (_, reply) => {
      return reply.status(HTTP_STATUS.OK).send({
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      });
    }
  );

  app.register(AuthControllers, { prefix: env.API_PREFIX });

  app.setNotFoundHandler(async (request, reply) => {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: HTTP_STATUS.NOT_FOUND,
    });
  });

  return app;
}
