import loggerModule from '@utils/logger';
import { container } from '../container';

const { logger } = loggerModule;

const isReady = async () => {
  try {
    const { mongoDbClient } = container.cradle;
    await mongoDbClient.ping();
  } catch (error: unknown) {
    logger.error('Error while connecting to the database', { error });
    return false;
  }

  return true;
};

let isShuttingDown = false;

export default {
  isReady: async () => !isShuttingDown && (await isReady()),
  setShuttingDown: () => {
    isShuttingDown = true;
  },
};
