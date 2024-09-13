import z from 'zod';
import {
  type BoardgameId,
  type BoardgamesRepository,
  newBoardGameId,
  newBoardGameName,
} from '@domain/boardgames';
import * as R from '@utils/general-type-helpers/Result';

export const createBoardgameCommandPayloadSchema = z.object({
  id: z.string(),
  name: z.string(),
  bggThingId: z.string().optional(),
});

const createBoardgameCommandSchema = z.object({
  id: z.string(),
  kind: z.literal('createBoardgame'),
  payload: createBoardgameCommandPayloadSchema,
});

export type CreateBoardgameCommand = z.infer<typeof createBoardgameCommandSchema>;

export class CreateBoardgameCommandHandler {
  constructor(private readonly boardgamesRepository: BoardgamesRepository) {}

  async handle(
    command: CreateBoardgameCommand,
  ): Promise<R.Result<{ error: unknown }, { id: BoardgameId }>> {
    const boardGameId = newBoardGameId(command.payload.id);
    const boardgameName = newBoardGameName(command.payload.name);

    const boardGame = {
      _id: boardGameId,
      name: boardgameName,
      bggThingId: command.payload.bggThingId,
    };

    const result = await this.boardgamesRepository.save(boardGame);

    return R.map(result, ({ _id }) => ({ id: _id }));
  }
}
