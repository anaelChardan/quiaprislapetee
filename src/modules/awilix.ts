import { type CreatePlayCommandHandler } from '../application/write/createPlay';
import { type PlayRepository } from '../domain/plays/repository';

declare module '@fastify/awilix' {
  interface Cradle {
    playRepository: PlayRepository;
    createPlayCommandHandler: CreatePlayCommandHandler;
  }
  interface RequestCradle {}
}
