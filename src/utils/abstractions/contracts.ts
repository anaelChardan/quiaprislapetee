import { ObjectId } from 'bson';
import { z } from 'zod';

export const IdPersistenceSchema = z
  .object({
    _id: z.instanceof(ObjectId),
  })
  .strict();

export const IdSchema = IdPersistenceSchema.omit({ _id: true })
  .extend({
    _id: z.string(),
  })
  .strict();

export type Id = z.infer<typeof IdSchema>;
export type IdPersistence = z.infer<typeof IdPersistenceSchema>;

export const MetadataPersistenceSchema = IdPersistenceSchema.extend({
  createdAt: z.date(),
  updatedAt: z.date(),
}).strict();

export const MetadataSchema = MetadataPersistenceSchema.omit({ _id: true })
  .merge(IdSchema)
  .strict();

export type MetadataPersistence = z.infer<typeof MetadataPersistenceSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
