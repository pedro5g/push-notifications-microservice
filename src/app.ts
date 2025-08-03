import { fastifyCors } from "@fastify/cors";
import { fastifyHelmet } from "@fastify/helmet";
import { fastifySwagger } from "@fastify/swagger";
import scalarFastifyApiReference from "@scalar/fastify-api-reference";
import { type FastifyInstance, fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import z from "zod";
import { env } from "./config/env";
import { globalErrorHandler } from "./middlewares/global-error-handler";
import { loggerRequester } from "./middlewares/logger-requester";
import { ApiKeyModule } from "./modules/api-key.module";
import { AuthModule } from "./modules/auth.module";
import { ProjectModule } from "./modules/project.module";
import { HTTP_STATUS } from "./utils/constraints";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify().withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://unpkg.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  });

  loggerRequester(app);

  app.setErrorHandler(globalErrorHandler);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Push Notifications Microservice",
        description: "API para gerenciar push notifications via webhooks",
        version: "1.0.0",
      },
      servers: [
        {
          url: env.API_URL,
        },
      ],
      components: {
        securitySchemes: {
          Bearer: {
            description:
              "RS256 JWT signed by private key, with username in payload",
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        description: "Health check endpoint",
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
        version: process.env.npm_package_version || "1.0.0",
      });
    }
  );

  await app.register(AuthModule.bind, { prefix: env.API_PREFIX });
  await app.register(ProjectModule.bind, { prefix: env.API_PREFIX });
  await app.register(ApiKeyModule.bind, { prefix: env.API_PREFIX });

  app.setNotFoundHandler(async (request, reply) => {
    return reply.status(HTTP_STATUS.NOT_FOUND).send({
      error: "Not Found",
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: HTTP_STATUS.NOT_FOUND,
    });
  });

  await app.register(scalarFastifyApiReference, {
    routePrefix: "/docs",
    configuration: {
      theme: "kepler",
    },
  });

  await app.ready();

  return app;
}
