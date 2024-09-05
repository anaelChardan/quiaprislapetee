import { Filter, Sort, Document } from 'mongodb';

export type RepositoryInterface<Entity, Persistence> = {
  exists: (id: string) => Promise<boolean>;
  allExists: (ids: string[]) => Promise<boolean>;
  find: ({
    filters,
    sort,
    limit,
  }: {
    filters?: Filter<Persistence>;
    sort?: Sort;
    limit?: number;
  }) => Promise<Entity[]>;
  findOne: (filters: Filter<Persistence>) => Promise<Entity | null>;
  findOneById: (id: string) => Promise<Entity | null>;
  aggregate: <A>(pipeline: Document[]) => Promise<A[]>;
  addOne: (document: Omit<Entity, '_id'> & { _id: string }) => Promise<void>;
  upsert: (document: Entity) => Promise<void>;
  deleteMany: (filters: Filter<Persistence>) => Promise<void>;
};
