import { type Result } from '@utils/general-type-helpers/Result';
import { Player, PlayerId } from './aggregate';

export interface PlayersRepository {
  save(player: Player): Promise<Result<{ error: unknown }, { _id: PlayerId }>>;
  allExists(playerIds: PlayerId[]): Promise<Result<{ error: unknown }, boolean>>;
  exists(playerId: PlayerId): Promise<Result<{ error: unknown }, boolean>>;
  upsert(player: Player): Promise<Result<{ error: unknown }, { _id: PlayerId }>>;
  bulkUpsert(players: Player[]): Promise<Result<{ error: unknown }, { _id: PlayerId }[]>>;
  findOneById(playerId: PlayerId): Promise<Result<{ error: unknown }, Player>>;
}
