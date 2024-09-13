export const teardown = async () => {
  // const container = setupFastifyContainer();
  // const db = await container.cradle.mongoDbClient.db();
  // const collections = await db.collections();
  // // eslint-disable-next-line no-restricted-syntax
  // for (const collection of collections) {
  //   if (collection.collectionName.includes('-test')) {
  //     // eslint-disable-next-line no-await-in-loop
  //     // await db.collection(collection.collectionName).drop();
  //   }
  // }
  // await container.cradle.mongoDbClient.close();
};

afterAll(async () => {
  // await teardown();
});
