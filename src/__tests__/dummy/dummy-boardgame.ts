import * as R from '@utils/general-type-helpers/Result';
import { Boardgame, BoardgameId } from '@domain/boardgames';
import { CreateBoardgameCommandHandler } from '@application/write/boardgame/createBoardgame';
import { DummyCreator } from './type';

export class DummyBoardgame implements DummyCreator<Boardgame> {
  constructor(readonly createBoardgameCommandHandler: CreateBoardgameCommandHandler) {}

  async randomOne(partial: Partial<Boardgame>): Promise<BoardgameId> {
    const result = await this.createBoardgameCommandHandler.handle({
      id: 'a-command-id',
      kind: 'createBoardgame',
      payload: {
        ...partial,
        id: 'wingspan-id',
        name: 'Wingspan',
      },
    });

    if (R.isSuccess(result)) {
      return result.value.id;
    }
    throw new Error('Failed to create boardgame');
  }

  async randoms(count: number): Promise<BoardgameId[]> {
    const boardgames: BoardgameId[] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < count; i++) {
      // eslint-disable-next-line no-await-in-loop
      const boardgame = await this.randomOne({});
      boardgames.push(boardgame);
    }

    return boardgames;
  }
}
