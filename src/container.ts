import * as awilix from 'awilix';

import { Boardgame, type BoardgamesRepository } from '@domain/boardgames';
import { Player, PlayersRepository } from '@domain/players';
import { type PlaysRepository } from '@domain/plays';
import { CreatePlayCommandHandler } from '@application/write/play/create-play';
import { MongoDbClient } from '@infrastructure/database/mongodb';
import { CreateBoardgameCommandHandler } from '@application/write/boardgame/createBoardgame';
import { MongoPlayersRepository } from '@infrastructure/database/players/repository/player-repository.mongo';
import { createInMemoryRepository } from '@utils/abstractions/inMemoryRepository';
import { DummyPlayer } from './__tests__/dummy/dummy-player';
import { DummyBoardgame } from './__tests__/dummy/dummy-boardgame';
import { DummyCreator } from './__tests__/dummy/type';

export type Container = {
  DATABASE_URL: string;
  mongoDbClient: MongoDbClient;
  playsRepository: PlaysRepository;
  boardgamesRepository: BoardgamesRepository;
  playersRepository: PlayersRepository;
  createPlayCommandHandler: CreatePlayCommandHandler;
  createBoardgameCommandHandler: CreateBoardgameCommandHandler;
  dummyPlayer: DummyCreator<Player>;
  dummyBoardgame: DummyCreator<Boardgame>;
};

export type AppContainer = awilix.AwilixContainer<Container>;

export function shouldBeInMemory() {
  if ('IN_MEMORY' in global) {
    return global.IN_MEMORY;
  }

  return false;
}

export type Config = {
  DATABASE_URL: string;
};

export function setupContainer(overridingVariables?: Config): awilix.AwilixContainer<Container> {
  const container = awilix.createContainer<Container>({
    injectionMode: 'CLASSIC',
    strict: true,
  });

  const inMemoryRegistrations = {
    playsRepository: awilix.asFunction(() => createInMemoryRepository('plays')),
    boardgamesRepository: awilix.asFunction(() => createInMemoryRepository('boardgames')),
    playersRepository: awilix.asFunction(() => createInMemoryRepository('players')),
    createPlayCommandHandler: awilix.asClass(CreatePlayCommandHandler),
    createBoardgameCommandHandler: awilix.asClass(CreateBoardgameCommandHandler),
    dummyBoardgame: awilix.asClass(DummyBoardgame),
    dummyPlayer: awilix.asClass(DummyPlayer),
  };

  if (shouldBeInMemory()) {
    container.register(inMemoryRegistrations);

    return container;
  }

  container.register({
    ...inMemoryRegistrations,
    DATABASE_URL: awilix.asValue<string>(
      overridingVariables?.DATABASE_URL ?? process.env.DATABASE_URL ?? '',
    ),
    mongoDbClient: awilix.asClass(MongoDbClient, {
      lifetime: awilix.Lifetime.SINGLETON,
      dispose: (client) => client.close(),
    }),
    playersRepository: awilix.asClass(MongoPlayersRepository),
  });

  return container;
}
