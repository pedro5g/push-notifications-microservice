import { fastify, type FastifyInstance } from "fastify";
import { fastifyHelmet } from "@fastify/helmet";
import { fastifyCors } from '@fastify/cors'
import { validatorCompiler, serializerCompiler, type ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod'
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { env } from "./config/env";
import { HTTP_STATUS } from "./utils/constraints";
import z from "zod";
import { globalErrorHandler } from "./middlewares/global-error-handler";

export  function buildApp(): FastifyInstance {
  const app = fastify().withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifyHelmet, {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: false
  }) 

  app.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  })

  app.setErrorHandler(globalErrorHandler)

  if(env.NODE_ENV === 'dev') {
    app.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Push Notifications Microservice',
          description: 'API para gerenciar push notifications via webhooks',
          version: '1.0.0',
        },  
      },
      transform: jsonSchemaTransform
    })

   app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
   });

  }

  app.get("/health", {
    schema: {
      tags: ['Health'],
      description: 'Health check endpoint',
      response: {
        200: z.object({
          timestamp: z.string(),
          uptime: z.number(),
          version: z.string()
        })
      }
    }
  }, async (_, reply) => {
    return reply.status(HTTP_STATUS.OK).send({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    })
  })

   app.setNotFoundHandler(async (request, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404
    })
  })

  return app
}