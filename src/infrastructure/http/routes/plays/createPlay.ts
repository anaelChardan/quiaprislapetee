import { standardResponseSchema } from '@infrastructure/http/schemas/response';
import { Effect } from 'effect';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import z from 'zod';

export default async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.put(
    '/createPlay',
    {
      schema: {
        body: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({ id: z.string() }),
          ...standardResponseSchema,
        },
      },
    },
    async (request, res) => {
      const result = await typedApp.diContainer.cradle.createPlayCommandHandler.handle(
        request.body,
      );

      const match = Effect.match(result, {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onFailure: (_error) => {
          res.status(500).send({ reason: 'Internal Server Error' });
        },
        onSuccess: (success) => {
          res.status(200).send(success);
        },
      });

      await Effect.runPromise(match);
    },
  );
};
