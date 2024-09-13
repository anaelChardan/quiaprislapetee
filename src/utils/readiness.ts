import loggerModule from '@utils/logger';
import { type AppContainer } from '../container';

const { logger } = loggerModule;

const isReady = async (appContainer: AppContainer) => {
  try {
    const { mongoDbClient } = appContainer.cradle;
    await mongoDbClient.ping();
  } catch (error: unknown) {
    logger.error('Error while connecting to the database', { error });
    return false;
  }

  return true;
};

let isShuttingDown = false;

export default {
  isReady: async (appContainer: AppContainer) => !isShuttingDown && (await isReady(appContainer)),
  setShuttingDown: () => {
    isShuttingDown = true;
  },
};
