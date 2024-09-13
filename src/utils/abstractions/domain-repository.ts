import * as R from '@utils/general-type-helpers/Result';

export type DomainRepository<K extends string, T extends { _id: K }> = {
  allExists(ids: string[]): Promise<R.Result<{ error: string }, boolean>>;
  exists(id: string): Promise<R.Result<{ error: string }, boolean>>;
  findOneById(id: string): Promise<R.Result<{ error: string }, T>>;
  save(entity: T): Promise<R.Result<{ error: string }, { _id: T['_id'] }>>;
  upsert(entity: T): Promise<R.Result<{ error: string }, { _id: T['_id'] }>>;
  bulkUpsert(entities: T[]): Promise<R.Result<{ error: unknown }, { _id: T['_id'] }[]>>;
};
