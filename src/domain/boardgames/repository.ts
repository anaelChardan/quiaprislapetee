import { type Result } from '@utils/general-type-helpers/Result';
import { Boardgame, BoardgameId } from './aggregate';

export interface BoardgamesRepository {
  save(boardgame: Boardgame): Promise<Result<{ error: unknown }, { id: BoardgameId }>>;
  exists(boardgameId: BoardgameId): Promise<Result<{ error: unknown }, boolean>>;
}
