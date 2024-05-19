import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import * as z from 'zod';
import { standardResponseSchema } from '../schemas/response';

export default async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/healthcheck',
    {
      schema: { response: { 200: z.object({ message: z.string() }), ...standardResponseSchema } },
    },
    async () => {
      return { message: 'OK' };
    },
  );
};
