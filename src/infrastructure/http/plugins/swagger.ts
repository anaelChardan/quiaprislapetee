import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import plugin from 'fastify-plugin';
import { jsonSchemaTransform as transform } from 'fastify-type-provider-zod';

export default plugin(
  async (app) => {
    app.register(fastifySwagger, {
      openapi: { info: { title: 'qui-a-pris-la-petee', version: '0.0.1' } },
      transform,
    });
    app.register(fastifySwaggerUI, { routePrefix: '/documentation' });
  },
  { name: 'pluginSwagger' },
);
