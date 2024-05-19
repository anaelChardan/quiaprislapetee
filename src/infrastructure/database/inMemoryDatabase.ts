import { type Play } from '../../domain/plays/aggregate';

type InMemoryDatabase = {
  plays: Play[];
};

export const inMemoryDatabase: InMemoryDatabase = {
  plays: [],
};
