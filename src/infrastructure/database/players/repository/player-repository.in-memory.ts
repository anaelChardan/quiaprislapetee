import * as R from '@utils/general-type-helpers/Result';
import { type PlayerId, type Player, type PlayersRepository } from '@domain/players';
import { inMemoryDatabase } from '../../in-memory-database';

export class InMemoryPlayersRepository implements PlayersRepository {
  // eslint-disable-next-line class-methods-use-this
  async exists(playerId: PlayerId): ReturnType<PlayersRepository['exists']> {
    const exists = inMemoryDatabase.players.some((player) => player._id === playerId);

    return R.toSuccess(exists);
  }

  // eslint-disable-next-line class-methods-use-this
  async allExists(playerIds: PlayerId[]): ReturnType<PlayersRepository['exists']> {
    const notExisting = playerIds.filter(
      (playerId) => !inMemoryDatabase.players.some((player) => player._id === playerId),
    );

    return R.toSuccess(notExisting.length === 0);
  }

  // eslint-disable-next-line class-methods-use-this
  async findOneById(playerId: PlayerId): ReturnType<PlayersRepository['findOneById']> {
    const player = inMemoryDatabase.players.find((p) => p._id === playerId);

    if (!player) {
      return R.toFailure({ error: 'Player not found' });
    }

    return R.toSuccess(player);
  }

  // eslint-disable-next-line class-methods-use-this
  async save(player: Player): ReturnType<PlayersRepository['save']> {
    inMemoryDatabase.players.push(player);

    return R.toSuccess({ id: player._id });
  }

  // eslint-disable-next-line class-methods-use-this
  async upsert(player: Player): ReturnType<PlayersRepository['upsert']> {
    inMemoryDatabase.players = [
      ...inMemoryDatabase.players.filter((p) => p._id !== player._id),
      player,
    ];

    return R.toSuccess({ id: player._id });
  }

  // eslint-disable-next-line class-methods-use-this
  async bulkUpsert(players: Player[]): ReturnType<PlayersRepository['bulkUpsert']> {
    const results: Awaited<ReturnType<PlayersRepository['upsert']>>[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const player of players) {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.upsert(player);
      results.push(result);
    }

    const r = R.sequenceResults(results);

    return R.mapError(r, (error) => ({ error }));
  }
}
