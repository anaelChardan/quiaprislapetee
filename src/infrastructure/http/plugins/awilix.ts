import { fastifyAwilixPlugin } from '@fastify/awilix';
import plugin from 'fastify-plugin';

export default plugin(async (app) => {
  app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: true,
    strictBooleanEnforced: true,
    injectionMode: 'CLASSIC',
  });
});
