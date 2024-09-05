import { generatePlayerId, newPlayerId, newPseudo, Player, type PlayerId } from '@domain/players';
import { faker } from '@faker-js/faker';
import * as R from '@utils/general-type-helpers/Result';
import { BoardgameId } from '@domain/boardgames';
import { container } from '../container';

export async function createDummyBoardgame(): Promise<BoardgameId> {
  const { createBoardgameCommandHandler } = container.cradle;

  const result = await createBoardgameCommandHandler.handle({
    id: 'a-command-id',
    kind: 'createBoardgame',
    payload: {
      id: 'wingspan-id',
      name: 'Wingspan',
    },
  });

  if (R.isSuccess(result)) {
    return result.value.id;
  }
  throw new Error('Failed to create boardgame');
}

export async function createDummyPlayer(playerData: Partial<Player>): Promise<Player> {
  const { playersRepository } = container.cradle;

  const player: Player = {
    _id: newPlayerId(generatePlayerId().toString()),
    pseudo: newPseudo(faker.person.fullName()),
    friends: [],
    ...playerData,
  };

  const result = await playersRepository.save(player);
  if (R.isSuccess(result)) {
    return player;
  }

  throw new Error('Failed to create player');
}

export async function saveRandomDummyPlayers(count: number): Promise<PlayerId[]> {
  const players: PlayerId[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line no-await-in-loop
    const player = await createDummyPlayer({});
    players.push(player._id);
  }

  return players;
}

export async function createDummies() {
  await createDummyBoardgame();
}
