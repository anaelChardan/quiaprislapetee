import { Effect } from 'effect';
import { Boardgame, BoardgameId } from './aggregate';

export interface BoardGameRepository {
  save(boardgame: Boardgame): Promise<Effect.Effect<{ id: BoardgameId }, { error: unknown }>>;
  exists(boardgameId: BoardgameId): Promise<Effect.Effect<boolean, { error: unknown }>>;
}
