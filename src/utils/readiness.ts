import loggerModule from '@utils/logger';
// import prisma from '@db-client';

const { logger } = loggerModule;

const isReady = async () => {
  try {
    // await prisma.$queryRaw`SELECT 1`;
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
