import { type FastifyInstance } from 'fastify';
import { type ZodTypeProvider } from 'fastify-type-provider-zod';
import * as z from 'zod';
import { standardResponseSchema } from '../../schemas/response';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
});

export default async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.get(
    '/user',
    {
      schema: {
        response: {
          200: z.array(userSchema),
          ...standardResponseSchema,
        },
      },
    },
    () => {
      return [];
    },
  );

  typedApp.post(
    '/user',
    {
      schema: {
        body: userSchema.pick({ name: true, email: true }),
        response: {
          200: userSchema,
          ...standardResponseSchema,
        },
      },
    },
    async (request) => {
      const { name, email } = request.body;

      return {
        id: 1,
        name,
        email,
        createdAt: new Date(),
      };
    },
  );
};
