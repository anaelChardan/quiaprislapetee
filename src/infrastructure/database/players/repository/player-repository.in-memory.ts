import { type PlayerId, type Player, type PlayersRepository } from '@domain/players';
import { createInMemoryRepository } from '@utils/abstractions/inMemoryRepository';

export class InMemoryPlayersRepository implements PlayersRepository {
  private inMemoryRepository = createInMemoryRepository('players');

  async exists(playerId: PlayerId): ReturnType<PlayersRepository['exists']> {
    return this.inMemoryRepository.exists(playerId);
  }

  async allExists(playerIds: PlayerId[]): ReturnType<PlayersRepository['exists']> {
    return this.inMemoryRepository.allExists(playerIds);
  }

  async findOneById(playerId: PlayerId): ReturnType<PlayersRepository['findOneById']> {
    return this.inMemoryRepository.findOneById(playerId);
  }

  async save(player: Player): ReturnType<PlayersRepository['save']> {
    return this.inMemoryRepository.save(player);
  }

  async upsert(player: Player): ReturnType<PlayersRepository['upsert']> {
    return this.inMemoryRepository.upsert(player);
  }

  async bulkUpsert(players: Player[]): ReturnType<PlayersRepository['bulkUpsert']> {
    return this.inMemoryRepository.bulkUpsert(players);
  }
}
