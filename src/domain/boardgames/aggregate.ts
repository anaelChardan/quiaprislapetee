import { Brand } from 'effect';

export type BoardgameId = string & Brand.Brand<'BoardgameId'>;
export const newBoardGameId = Brand.refined<BoardgameId>(
  (boardgameId: string) => boardgameId.length > 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_boardgameId: string) => Brand.error('BoardgameId must not be empty'),
);

export type BoardgameName = string & Brand.Brand<'BoardgameName'>;
export const newBoardGameName = Brand.refined<BoardgameName>(
  (boardgameName: string) => boardgameName.length > 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (_boardgameName: string) => Brand.error('BoardGameName must not be empty'),
);

export type Boardgame = {
  id: BoardgameId;
  name: BoardgameName;
};
