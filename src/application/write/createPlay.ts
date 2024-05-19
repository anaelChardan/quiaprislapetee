import { Effect } from 'effect';
import { type PlayRepository } from '../../domain/plays/repository';
import { PlayId } from '../../domain/plays/aggregate';
import { createPlay } from '../../domain/plays/actions/create';

export type CreatePlayCommand = {
  id: string;
};

export class CreatePlayCommandHandler {
  constructor(private readonly playRepository: PlayRepository) {}

  async handle(
    command: CreatePlayCommand,
  ): Promise<Effect.Effect<{ id: PlayId }, { error: unknown }>> {
    const play = createPlay({ id: command.id });
    const result = await this.playRepository.save(play);

    return result;
  }
}
