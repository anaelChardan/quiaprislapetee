import * as awilix from 'awilix';
import { diContainerClassic } from '@fastify/awilix';
import { InMemoryPlayRepository } from '@infrastructure/database/play/inMemoryPlayRepository';
import { CreatePlayCommandHandler } from './application/write/createPlay';

export function setupContainer() {
  diContainerClassic.register({
    playRepository: awilix.asClass(InMemoryPlayRepository),
    createPlayCommandHandler: awilix.asClass(CreatePlayCommandHandler),
  });
}

export { diContainerClassic as container };
