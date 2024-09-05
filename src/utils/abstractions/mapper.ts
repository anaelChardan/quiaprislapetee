import type { WithId } from 'mongodb';

export type MapperInterface<Persistence, Entity> = {
  toPersistence: (entity: Entity) => Promise<WithId<Persistence>>;
  fromPersistence: (persistence: WithId<Persistence>) => Promise<Entity>;
};
