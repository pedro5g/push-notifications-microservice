import type { FastifyInstance } from 'fastify';
import { buildApp } from './app';
import { env } from './config/env';
import { ExitCode } from './utils/constraints';

async function gracefulShutdown(
  sinal: NodeJS.Signals,
  app: FastifyInstance
): Promise<void> {
  console.log(`Received ${sinal}, starting graceful shutdown...`);

  try {
    app.server.close((err) => {
      if (err) {
        console.error('Error during close server', err);
        process.exit(ExitCode.FAILURE);
      }
    });

    console.log('Graceful shutdown completed');
    process.exit(ExitCode.SUCCESS);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(ExitCode.FAILURE);
  }
}

function fatalError() {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(ExitCode.FAILURE);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(ExitCode.FAILURE);
  });
}

async function main(): Promise<void> {
  try {
    const app = buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`Server running on http://${env.HOST}:${env.PORT} 🚀`);

    if (env.NODE_ENV === 'dev') {
      console.log(`📚 API Documentation: http://${env.HOST}:${env.PORT}/docs`);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', app));
    process.on('SIGINT', () => gracefulShutdown('SIGINT', app));
  } catch (e) {
    console.error('Failed to start server:', e);
    process.exit(ExitCode.FAILURE);
  }
}

fatalError();
main();
