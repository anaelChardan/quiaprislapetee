/* eslint-disable no-restricted-syntax */
import { inMemoryDatabase, InMemoryDatabase } from '@infrastructure/database/in-memory-database';
import * as R from '@utils/general-type-helpers/Result';

type InMemoryRepository<K extends keyof InMemoryDatabase, T extends InMemoryDatabase[K][0]> = {
  allExists(ids: string[]): Promise<R.Result<{ error: string }, boolean>>;
  exists(id: string): Promise<R.Result<{ error: string }, boolean>>;
  findOneById(id: string): Promise<R.Result<{ error: string }, T>>;
  save(entity: T): Promise<R.Result<{ error: string }, { _id: T['_id'] }>>;
  upsert(entity: T): Promise<R.Result<{ error: string }, { _id: T['_id'] }>>;
  bulkUpsert(entities: T[]): Promise<R.Result<{ error: unknown }, { _id: T['_id'] }[]>>;
};

export const createInMemoryRepository = <
  K extends keyof InMemoryDatabase,
  T extends InMemoryDatabase[K][0],
>(
  collection: K,
): InMemoryRepository<K, T> => {
  const exists = async (id: string) => {
    const existsResult = inMemoryDatabase[collection].some((thing) => thing._id === id);

    return R.toSuccess(existsResult);
  };

  const allExists = async (ids: string[]) => {
    const notExisting = ids.filter(
      (id) => !inMemoryDatabase[collection].some((thing) => thing._id === id),
    );

    return R.toSuccess(notExisting.length === 0);
  };

  const findOneById = async (id: string) => {
    const thing = inMemoryDatabase[collection].find((t) => t._id === id);

    if (!thing) {
      return R.toFailure({ error: `${collection} not found` });
    }

    return R.toSuccess(thing);
  };

  const save = async (thing: T) => {
    // @ts-expect-error
    inMemoryDatabase[collection].push(thing);

    return R.toSuccess({ _id: thing._id });
  };

  const upsert = async (thing: T) => {
    // @ts-expect-error
    inMemoryDatabase[collection] = [
      ...inMemoryDatabase.players.filter((p) => p._id !== thing._id),
      thing,
    ];

    return R.toSuccess({ _id: thing._id });
  };

  const bulkUpsert = async (things: T[]) => {
    const results = [];

    for (const thing of things) {
      // eslint-disable-next-line no-await-in-loop
      const result = await upsert(thing);
      results.push(result);
    }

    const r = R.sequenceResults(results);

    return R.mapError(r, (error) => ({ error }));
  };

  return {
    exists,
    allExists,
    findOneById: findOneById as InMemoryRepository<K, T>['findOneById'],
    save,
    upsert,
    bulkUpsert,
  };
};
