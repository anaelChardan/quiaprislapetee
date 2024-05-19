import { type FastifyInstance } from 'fastify';
import plugin from 'fastify-plugin';
import routeExample from './example/example-route';

import routeUser from './example/user-route';
import routeCreatePlay from './plays/createPlay';

const prefix = '/qui-a-pris-la-petee';

const routes = async (app: FastifyInstance) => {
  routeExample(app);

  routeUser(app);
  routeCreatePlay(app);
};

export default plugin(async (app) => app.register(routes, { prefix }), { name: 'pluginRoutes' });
