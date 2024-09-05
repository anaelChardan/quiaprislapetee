import { type Boardgame } from '@domain/boardgames';
import { type Player } from '@domain/players/';
import { type Play } from '@domain/plays';

type InMemoryDatabase = {
  boardgames: Boardgame[];
  plays: Play[];
  players: Player[];
};

export const inMemoryDatabase: InMemoryDatabase = {
  plays: [],
  boardgames: [],
  players: [],
};
