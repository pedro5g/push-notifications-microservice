import type { FastifyTypedInstance } from '@/@types';
import { env } from '@/config/env';
import { Logger } from '@/utils/logger';

export async function loggerRequester(app: FastifyTypedInstance) {
  app.addHook('onRequest', async (request) => {
    const logger = new Logger('Request');
    const { ip, method, url, headers } = request;

    const id = Date.now();

    let idsMsg = '';
    if (headers['user-agent']) idsMsg += ` _ u=${headers['user-agent']}`;

    if (env.NODE_ENV !== 'test') {
      const msg = `[${ip}] \x1b[32m[${method}]\x1b[0m ${id} - Receiving ${url}`;
      logger.info(`${msg}${idsMsg}`);
    }

    request.headers['request-start-time'] = `${Date.now()}`;
  });

  app.addHook('onResponse', async (request, reply) => {
    const logger = new Logger('Response');
    const started = Number(request.headers['request-start-time'] || 0);
    const took = Date.now() - started;

    const { ip, method, url } = request;

    if (env.NODE_ENV !== 'test') {
      logger.info(
        `[${ip}] ${method}` + `${url} : http=${reply.statusCode} ${took}ms`
      );
    }
  });
}
