import readiness from '@utils/readiness';
import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import * as z from 'zod';
import { standardResponseSchema } from '../../schemas/response';

export default async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/health/readiness',
    {
      schema: { response: { 200: z.object({ message: z.string() }), ...standardResponseSchema } },
    },
    async (_, reply) => {
      const isReady = await readiness.isReady();
      if (!isReady) {
        return reply
          .code(503)
          .send({ message: 'System is not ready, check the logs for more information' });
      }

      return { message: 'OK' };
    },
  );
};
