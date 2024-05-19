import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import * as z from 'zod';
import { standardResponseSchema } from '../../schemas/response';

export default async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/examples',
    {
      schema: { response: { 200: z.object({ example: z.string() }), ...standardResponseSchema } },
    },
    async () => {
      return {
        example: 'coucou',
      };
    },
  );
};
