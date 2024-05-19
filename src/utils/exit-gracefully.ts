// import prisma from '@db-client';
import loggerModule from '@utils/logger';

const { logger } = loggerModule;

type CloseableServer = {
  close: () => Promise<void>;
};

async function shutdownDependencies(server: CloseableServer) {
  const dependencies = new Map<string, () => Promise<void>>([['server', server.close]]);
  // dependencies.set('prisma', prisma.$disconnect);

  // eslint-disable-next-line no-restricted-syntax
  for (const [name, shutdown] of dependencies) {
    // eslint-disable-next-line no-await-in-loop
    await shutdown().catch((error) => {
      logger.error('Error when shutting down dependency', { error, name });
    });
  }
}

export async function exitGracefully(
  server: CloseableServer,
  eventName: NodeJS.Signals | 'uncaughtException' | 'unhandledRejection',
  exitCode: number,
  error?: Error,
  reason?: unknown,
): Promise<void> {
  if (error) {
    logger.error(`Error while exiting: ${error.message}`, { error });
  }

  if (reason) {
    logger.error(`Error while exiting: unhandledRejection`, {
      error: new Error(reason as string),
      reason,
    });
  }

  logger.info(`Exit Gracefully Received "${eventName}" event`, {
    eventName,
    exitCode,
  });

  await shutdownDependencies(server);
}
