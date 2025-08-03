import type { FastifyInstance } from "fastify";
import { buildApp } from "./app";
import { DatabaseConnection } from "./config/db";
import { env } from "./config/env";
import { RedisConnection } from "./config/redis";
import { EmailQueue } from "./queue/email.queue";
import { ManagerQueue } from "./queue/manager.queue";
import { ExitCode } from "./utils/constraints";
import { Logger } from "./utils/logger";
import { EmailWorker } from "./workers/email.worker";

const logger = new Logger("Server");

async function gracefulShutdown(
  sinal: NodeJS.Signals,
  app: FastifyInstance
): Promise<void> {
  logger.info(`Received ${sinal}, starting graceful shutdown...`);

  try {
    app.server.close();
    await DatabaseConnection.destroy();
    await RedisConnection.disconnect();
    const queueManager = ManagerQueue.getInstance();
    await queueManager.shutdown();
    logger.info("Graceful shutdown completed");
    process.exit(ExitCode.SUCCESS);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(ExitCode.FAILURE);
  }
}

function fatalError() {
  process.on("unhandledRejection", (reason, promise) => {
    console.log(reason);
    logger.error("Unhandled Rejection at:", `${promise}, 'reason:', ${reason}`);
    process.exit(ExitCode.FAILURE);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    process.exit(ExitCode.FAILURE);
  });
}

async function initializeQueues() {
  const queueManager = ManagerQueue.getInstance();

  const emailQueue = new EmailQueue();
  const emailWorker = new EmailWorker();

  queueManager.registerQueue("email", emailQueue);
  queueManager.registerWorker("email", emailWorker);

  logger.info("Queues initialized");
}

async function main(): Promise<void> {
  try {
    await DatabaseConnection.init();
    await RedisConnection.init();
    initializeQueues();
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.info(`Server running on http://${env.HOST}:${env.PORT} 🚀`);

    if (env.NODE_ENV === "development") {
      logger.info(`📚 API Documentation: http://${env.HOST}:${env.PORT}/docs`);
    }

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM", app));
    process.on("SIGINT", () => gracefulShutdown("SIGINT", app));
  } catch (e) {
    logger.error("Failed to start server:", e);
    process.exit(ExitCode.FAILURE);
  }
}

fatalError();
main();
