import z from 'zod';
import { type PlayId, type PlaysRepository, newPlayId } from '@domain/plays';
import { type BoardgamesRepository, newBoardGameId } from '@domain/boardgames';
import { PlayersRepository, addFriends, newPlayerId } from '@domain/players';
import * as R from '@utils/general-type-helpers/Result';

export const createPlayCommandPayloadSchema = z.object({
  id: z.string(),
  boardgameId: z.string(),
  partyOwner: z.string(),
  players: z
    .union([
      z.object({
        kind: z.literal('nickname'),
        nickname: z.string(),
        score: z.number(),
      }),
      z.object({
        kind: z.literal('user'),
        userId: z.string(),
        score: z.number(),
      }),
    ])
    .array(),
});

const createPlayCommandSchema = z.object({
  id: z.string(),
  kind: z.literal('createPlay'),
  payload: createPlayCommandPayloadSchema,
});

export type CreatePlayCommand = z.infer<typeof createPlayCommandSchema>;

export class CreatePlayCommandHandler {
  constructor(
    private readonly playsRepository: PlaysRepository,
    private readonly boardgamesRepository: BoardgamesRepository,
    private readonly playersRepository: PlayersRepository,
  ) {}

  async handle(command: CreatePlayCommand): Promise<R.Result<{ reason: unknown }, { id: PlayId }>> {
    const boardGameId = newBoardGameId(command.payload.boardgameId);
    const ownerId = newPlayerId(command.payload.partyOwner);
    const boardGameExists = await this.boardgamesRepository.exists(boardGameId);
    const owner = await this.playersRepository.findOneById(ownerId);

    if (R.isSuccess(boardGameExists) && R.isSuccess(owner)) {
      if (boardGameExists.value === false || !owner) {
        return R.toFailure({
          reason: 'Boardgame or owner does not exist',
          boardGameExists: boardGameExists.value,
          ownerExists: owner.value,
        });
      }

      const friendsLinked: { kind: 'user'; userId: string }[] = command.payload.players.filter(
        (player) => player.kind === 'user',
      ) as { kind: 'user'; userId: string }[];
      const allExists = await this.playersRepository.allExists(
        friendsLinked.map((player) => newPlayerId(player.userId)),
      );

      if (R.isFailure(allExists)) {
        return R.toFailure({ reason: 'Error while retrieving players', error: allExists.error });
      }

      if (!allExists.value) {
        return R.toFailure({
          reason: 'Some players do not exist',
          players: command.payload.players,
        });
      }

      const ownerWithFriends = addFriends(owner.value, command.payload.players);
      const saveOwner = await this.playersRepository.save(ownerWithFriends);

      if (R.isFailure(saveOwner)) {
        return R.toFailure({ reason: 'Error saving owner', error: saveOwner.error });
      }

      const play = {
        id: newPlayId(command.payload.id),
        boardgame: boardGameId,
        partyOwner: ownerId,
        players: command.payload.players,
      };

      const result = await this.playsRepository.save(play);

      return result;
    }

    return R.toFailure({
      reason: 'Error while retrieving boardgame or owner',
      error: {
        boardGameExists,
        ownerExists: owner,
      },
    });
  }
}
