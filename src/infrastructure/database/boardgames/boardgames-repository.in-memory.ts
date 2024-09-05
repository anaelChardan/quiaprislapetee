import * as R from '@utils/general-type-helpers/Result';
import { type BoardgamesRepository, type Boardgame } from '@domain/boardgames';
import { inMemoryDatabase } from '../in-memory-database';

export class InMemoryBoardgamesRepository implements BoardgamesRepository {
  // eslint-disable-next-line class-methods-use-this
  async save(boardgame: Boardgame): ReturnType<BoardgamesRepository['save']> {
    inMemoryDatabase.boardgames.push(boardgame);

    return R.toSuccess({ id: boardgame.id });
  }

  // eslint-disable-next-line class-methods-use-this
  async exists(boardgameId: string): ReturnType<BoardgamesRepository['exists']> {
    const exists = inMemoryDatabase.boardgames.some((boardgame) => boardgame.id === boardgameId);

    return R.toSuccess(exists);
  }
}
