import * as awilix from 'awilix';
import { diContainerClassic } from '@fastify/awilix';

import { type BoardgamesRepository } from '@domain/boardgames';
import { PlayersRepository } from '@domain/players';
import { type PlaysRepository } from '@domain/plays';
import { CreatePlayCommandHandler } from '@application/write/play/create-play';
import { MongoDbClient } from '@infrastructure/database/mongodb';
import { CreateBoardgameCommandHandler } from '@application/write/boardgame/createBoardgame';
import { InMemoryBoardgamesRepository } from '@infrastructure/database/boardgames/boardgames-repository.in-memory';
import { InMemoryPlayersRepository } from '@infrastructure/database/players/repository/player-repository.in-memory';
import { MongoPlayersRepository } from '@infrastructure/database/players/repository/player-repository.mongo';
import { InMemoryPlaysRepository } from '@infrastructure/database/plays/plays-repository.in-memory';

declare module '@fastify/awilix' {
  interface Cradle {
    playsRepository: PlaysRepository;
    boardgamesRepository: BoardgamesRepository;
    playersRepository: PlayersRepository;
    createPlayCommandHandler: CreatePlayCommandHandler;
    createBoardgameCommandHandler: CreateBoardgameCommandHandler;
    DATABASE_URL: string;
    mongoDbClient: MongoDbClient;
  }
  interface RequestCradle {}
}

export function shouldBeInMemory() {
  if (process.env.NODE_ENV === 'test') {
    if ('TEST_ENV' in global) {
      return global.TEST_ENV === 'unit' || global.TEST_ENV === 'acceptance';
    }
  }
  return false;
}

export function setupContainer() {
  const common = {
    DATABASE_URL: awilix.asValue<string>(process.env.DATABASE_URL ?? ''),
    mongoDbClient: awilix.asClass(MongoDbClient, { lifetime: awilix.Lifetime.SINGLETON }),
  };
  if (shouldBeInMemory()) {
    diContainerClassic.register({
      playsRepository: awilix.asClass(InMemoryPlaysRepository),
      boardgamesRepository: awilix.asClass(InMemoryBoardgamesRepository),
      playersRepository: awilix.asClass(InMemoryPlayersRepository),
      createPlayCommandHandler: awilix.asClass(CreatePlayCommandHandler),
      createBoardgameCommandHandler: awilix.asClass(CreateBoardgameCommandHandler),
      ...common,
    });

    return diContainerClassic;
  }

  diContainerClassic.register({
    playsRepository: awilix.asClass(InMemoryPlaysRepository),
    boardgamesRepository: awilix.asClass(InMemoryBoardgamesRepository),
    playersRepository: awilix.asClass(MongoPlayersRepository),
    createPlayCommandHandler: awilix.asClass(CreatePlayCommandHandler),
    createBoardgameCommandHandler: awilix.asClass(CreateBoardgameCommandHandler),
    ...common,
  });

  return diContainerClassic;
}

export { diContainerClassic as container };
