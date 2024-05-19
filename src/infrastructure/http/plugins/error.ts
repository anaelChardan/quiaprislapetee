import plugin from 'fastify-plugin';
import { type ZodError } from 'zod';
import { type FastifyError, type FastifyReply, type FastifyRequest } from 'fastify';
import loggerModule from '@utils/logger';

const { logger } = loggerModule;

export function errorHandler(err: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  const { name, validationContext } = err;
  if (name === 'ZodError' && validationContext) {
    logger.error('Validation has failed', {
      url: request.url,
      context: validationContext,
      error: err,
      issues: (err as unknown as ZodError).issues.map(({ code, message, path }) => ({
        code,
        message,
        path,
      })),
    });
    return reply.code(400).send({ reason: 'Invalid data' });
  }

  logger.error('Generic error', { error: err });
  return reply.code(500).send({ reason: 'Fatal error' });
}

export default plugin(
  async (app) => {
    app.setErrorHandler(errorHandler);
  },
  { name: 'pluginErrors' },
);
