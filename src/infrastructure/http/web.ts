import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import metricsPlugin from 'fastify-metrics';
import loggerModule from '@utils/logger';
import { randomUUID } from 'node:crypto';

import Fastify from 'fastify';
import { correlationIdLocalStorage, getCorrelationId } from '@utils/logger/correlation-id-storage';

import routes from './routes';
import awilix from './plugins/awilix';
import error from './plugins/error';
import swagger from './plugins/swagger';
import healthcheck from './routes/healthcheck';
import readiness from './routes/health';
// import auth from './hooks/auth';

const app = Fastify({
  logger: loggerModule.rootLogger,
  requestIdHeader: 'correlationId',
  requestIdLogLabel: 'correlationId',
  genReqId: (req) => {
    const { headers } = req;
    let correlationId = getCorrelationId();
    if (!correlationId) {
      correlationId = headers['x-correlation-id']
        ? (headers['x-correlation-id'] as string)
        : randomUUID();

      // eslint-disable-next-line no-promise-executor-return
      correlationIdLocalStorage.setAndRun(
        correlationId,
        // eslint-disable-next-line no-promise-executor-return
        () => new Promise((resolve) => resolve()),
        req,
      );
    }

    return correlationId;
  },
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Setup plugins
app.register(awilix);
app.register(swagger);
app.register(error);
app.register(metricsPlugin, { endpoint: '/metrics' });

// Register hooks
// app.register(auth);

// Register routes
app.register(routes);
app.register(healthcheck, { logLevel: 'error' });
app.register(readiness, { logLevel: 'warn' });

type Server = typeof app;

export { app, Server };
