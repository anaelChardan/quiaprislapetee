import loggerModule from '@utils/logger';
import { Container } from '../container';

const { logger } = loggerModule;

const isReady = async (appContainer: Container) => {
  try {
    const { mongoDbClient } = appContainer;
    await mongoDbClient.ping();
  } catch (error: unknown) {
    logger.error('Error while connecting to the database', { error });
    return false;
  }

  return true;
};

let isShuttingDown = false;

export default {
  isReady: async (appContainer: Container) => !isShuttingDown && (await isReady(appContainer)),
  setShuttingDown: () => {
    isShuttingDown = true;
  },
};
