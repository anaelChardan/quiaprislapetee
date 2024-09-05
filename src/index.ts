import '@utils/tracer';
import os from 'node:os';
import config from 'config';
import { exitGracefully } from '@utils/exit-gracefully';
// import prisma from '@db-client';

import loggerModule from '@utils/logger';
import { app } from '@infrastructure/http/web';
import { setupContainer } from './container';

// set the default app port to be greater than 1024 to ensure that the container
// doesn't run as root-user
// see https://docs.docker.com/engine/security/rootless/ for more information
const DEFAULT_APP_PORT = 8080;
const DEFAULT_APP_HOST = '0.0.0.0';
const { logger } = loggerModule;

// Setup server
(async () => {
  try {
    const container = setupContainer();
    await container.cradle.mongoDbClient.db();
  } catch (error: unknown) {
    logger.error('Error while connecting to the database', { error });
    process.exit(1);
  }

  const port: number = config.has('app.port') ? config.get('app.port') : DEFAULT_APP_PORT;
  const host: string = config.has('app.host') ? config.get('app.host') : DEFAULT_APP_HOST;

  const start = async () => {
    try {
      logger.info('[Server information]', {
        platform: os.platform(),
        osRelease: os.release(),
        totalMemory: `${(os.totalmem() / 1024 ** 3).toFixed(2)} GB`, // bytes to GB
      });
      await app.listen({ host, port });
      logger.debug(`Documentation available at http://127.0.0.1:${port}/documentation/`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };
  start();

  let terminationSignaled = false;

  const handleShutdown = (
    event: NodeJS.Signals | 'uncaughtException' | 'unhandledRejection',
    exitCode?: 1,
    error?: Error,
  ) => {
    if (terminationSignaled) {
      return;
    }
    terminationSignaled = true;

    exitGracefully(app, event, exitCode ?? 0, error);
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  process.on('SIGINT', () => handleShutdown('SIGINT'));

  process.on('uncaughtException', (err: Error) => handleShutdown('uncaughtException', 1, err));

  process.on('unhandledRejection', (error: Error) => {
    return handleShutdown('unhandledRejection', 1, error);
  });
})();
