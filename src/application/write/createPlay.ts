import { Effect } from 'effect';
import z from 'zod';
import { type PlayRepository } from '../../domain/plays/repository';
import { type PlayId } from '../../domain/plays/aggregate';
import { createPlay } from '../../domain/plays/actions/create';
import { type BoardGameRepository } from '../../domain/boardgame/repository';
import { newBoardGameId } from '../../domain/boardgame/aggregate';

const createPlayCommandSchema = z.object({
  id: z.string(),
  kind: z.literal('createPlay'),
  payload: z.object({
    id: z.string(),
    boardgameId: z.string(),
    partyOwner: z.string(),
  }),
});

export type CreatePlayCommand = z.infer<typeof createPlayCommandSchema>;

export class CreatePlayCommandHandler {
  constructor(
    private readonly playRepository: PlayRepository,
    private readonly boardGameRepository: BoardGameRepository,
  ) {}

  async handle(
    command: CreatePlayCommand,
  ): Promise<Effect.Effect<{ id: PlayId }, { error: unknown }>> {
    const boardGameId = newBoardGameId(command.payload.boardgameId);
    const boardgame = await this.boardGameRepository.exists(boardGameId);

    if (Effect.isSuccess(boardgame)) {
      const play = createPlay({ id: command.payload.id, boardgame: boardGameId });
    }
    const result = await this.playRepository.save(play);

    return result;
  }
}
