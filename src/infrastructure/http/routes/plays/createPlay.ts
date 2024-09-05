import { standardResponseSchema } from '@infrastructure/http/schemas/response';
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import * as R from '@utils/general-type-helpers/Result';
import z from 'zod';
import { createPlayCommandPayloadSchema } from '../../../../application/write/play/create-play';

export default async (app: FastifyInstance) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.put(
    '/createPlay',
    {
      schema: {
        body: createPlayCommandPayloadSchema.extend({ commandId: z.string() }),
        response: {
          200: z.object({ id: z.string() }),
          ...standardResponseSchema,
        },
      },
    },
    async (request, res) => {
      const result = await typedApp.diContainer.cradle.createPlayCommandHandler.handle({
        id: request.body.commandId,
        kind: 'createPlay',
        payload: request.body,
      });

      if (R.isFailure(result)) {
        res.status(500).send({ reason: 'Internal Server Error' });
      } else {
        res.status(200).send(result.value);
      }
    },
  );
};
