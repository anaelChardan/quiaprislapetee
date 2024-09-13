import * as R from '@utils/general-type-helpers/Result';
import {
  type PlayerId,
  type Player,
  type PlayersRepository,
  newPlayerId,
  newPseudo,
  toPlayerRawTypesWithoutNull,
} from '@domain/players';
import { RepositoryInterface } from '@utils/abstractions/repository';
import { MapperInterface } from '@utils/abstractions/mapper';
import { ObjectId } from 'mongodb';
import { createRepository, getCollectionName } from '@utils/abstractions/mongoRepository';
import { MongoDbClient } from '../../mongodb';

type PlayerPersistence = {
  _id: ObjectId;
  pseudo: string;
  bggUsername?: string;
  friends: Player['friends'];
};

const mapper: MapperInterface<PlayerPersistence, Player> = {
  toPersistence: async (player: Player): Promise<PlayerPersistence> => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, ...rest } = toPlayerRawTypesWithoutNull(player);

    return {
      _id: new ObjectId(_id),
      ...rest,
    };
  },
  fromPersistence: async (playerPersistence: PlayerPersistence): Promise<Player> => {
    return {
      _id: newPlayerId(playerPersistence._id.toString()),
      pseudo: newPseudo(playerPersistence.pseudo),
      bggUsername: playerPersistence.bggUsername,
      friends: playerPersistence.friends,
    };
  },
};

export class MongoPlayersRepository implements PlayersRepository {
  private mongoRepository: RepositoryInterface<Player, PlayerPersistence>;

  constructor(private readonly mongoDbClient: MongoDbClient) {
    this.mongoRepository = createRepository<PlayerPersistence, Player>(
      this.mongoDbClient,
      getCollectionName('players'),
      mapper,
    );
  }

  async exists(playerId: PlayerId): ReturnType<PlayersRepository['exists']> {
    const exists = await this.mongoRepository.exists(playerId);

    return R.toSuccess(exists);
  }

  async allExists(playerIds: PlayerId[]): ReturnType<PlayersRepository['allExists']> {
    const results = await this.mongoRepository.allExists(playerIds);

    return R.toSuccess(results);
  }

  async findOneById(playerId: PlayerId): ReturnType<PlayersRepository['findOneById']> {
    const player = await this.mongoRepository.findOneById(playerId);

    if (!player) {
      return R.toFailure({ error: 'Player not found' });
    }

    return R.toSuccess(player);
  }

  async save(player: Player): ReturnType<PlayersRepository['save']> {
    return this.upsert(player);
  }

  async upsert(player: Player): ReturnType<PlayersRepository['upsert']> {
    try {
      await this.mongoRepository.upsert(player);
      return R.toSuccess({ _id: player._id });
    } catch (error) {
      return R.toFailure({ error });
    }
  }

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
