import { MongoDBContainer } from '@testcontainers/mongodb';
import { Container, setupContainer } from '../container';

export async function getTestContainer(): Promise<{
  container: Container;
  shutdown: () => Promise<void>;
}> {
  if ('IN_MEMORY' in global && global.IN_MEMORY === false) {
    const mongoDbContainer = await new MongoDBContainer('mongo:7.0.12').start();
    const container = setupContainer({
      DATABASE_URL: `${mongoDbContainer.getConnectionString()}?directConnection=true`,
    });

    return {
      container: container.cradle,
      shutdown: async () => {
        await container.dispose();
        await mongoDbContainer.stop();
      },
    };
  }

  const container = setupContainer();

  return {
    container: container.cradle,
    shutdown: async () => {
      await container.dispose();
    },
  };
}
