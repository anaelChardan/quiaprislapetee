import type { Filter, OptionalUnlessRequiredId, Sort, WithId, Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import DataLoader from 'dataloader';
import { MongoDbClient } from '@infrastructure/database/mongodb';
import { RepositoryInterface } from './repository';
import { Id, IdPersistence } from './contracts';
import { MapperInterface } from './mapper';

export const getCollectionName = (collectionName: string): string => {
  if (process.env.NODE_ENV === 'test') {
    return `${collectionName}-test`;
  }

  return collectionName;
};

export const createRepository = <Persistence extends IdPersistence, Entity extends Id>(
  mongoDbClient: MongoDbClient,
  collectionName: string,
  mapper: MapperInterface<Persistence, Entity>,
  loader?: DataLoader<string, WithId<Persistence> | undefined>,
): RepositoryInterface<Entity, Persistence> => {
  const collection = async () => {
    return mongoDbClient.collection<Persistence>(collectionName);
  };

  const allExists = async (ids: string[]): Promise<boolean> => {
    const filters: Filter<Persistence> = {
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    } as Filter<Persistence>;
    const count = await (await collection()).countDocuments(filters, { limit: ids.length });
    return count === ids.length;
  };

  const exists = async (id: string): Promise<boolean> => {
    return allExists([id]);
  };

  const find = async ({
    filters,
    sort,
    limit,
  }: {
    filters?: Filter<Persistence>;
    sort?: Sort;
    limit?: number;
  }): Promise<Entity[]> => {
    const query = (await collection()).find<Persistence>(filters ?? {});
    if (sort) {
      query.sort(sort);
    }
    if (limit) {
      query.limit(limit);
    }
    const results = await query.toArray();
    return Promise.all(
      results.map((persistence) => mapper.fromPersistence(persistence as WithId<Persistence>)),
    );
  };

  const findOne = async (filters: Filter<Persistence>): Promise<Entity | null> => {
    const one = await (await collection()).findOne(filters);
    if (!one) return null;
    return mapper.fromPersistence(one);
  };

  const findOneById = async (id: string): Promise<Entity | null> => {
    if (loader) {
      const one = await loader.load(id);
      if (!one) return null;
      return mapper.fromPersistence(one);
    }
    const filters: Filter<Persistence> = { _id: new ObjectId(id) } as Filter<Persistence>;
    const one = await findOne(filters);
    return one;
  };

  const aggregate = async <A>(pipeline: Document[]): Promise<A[]> => {
    return (await collection()).aggregate(pipeline).toArray() as unknown as Promise<A[]>;
  };

  const addOne = async (document: Omit<Entity, '_id'> & { _id: string }): Promise<void> => {
    const persistence = await mapper.toPersistence(document as Entity);
    await (await collection()).insertOne(persistence as OptionalUnlessRequiredId<Persistence>);
  };

  const upsert = async (document: Entity): Promise<void> => {
    const persistence = await mapper.toPersistence(document);
    const filters: Filter<Persistence> = { _id: persistence._id } as Filter<Persistence>;
    await (
      await collection()
    ).replaceOne(filters, persistence, {
      upsert: true,
    });
  };

  const deleteMany = async (filters: Filter<Persistence>): Promise<void> => {
    await (await collection()).deleteMany(filters);
  };

  return {
    exists,
    allExists,
    find,
    findOne,
    findOneById,
    aggregate,
    addOne,
    upsert,
    deleteMany,
  };
};
