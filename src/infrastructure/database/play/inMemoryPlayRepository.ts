import { Effect } from 'effect';
import { type Play } from '../../../domain/plays/aggregate';
import { type PlayRepository } from '../../../domain/plays/repository';
import { inMemoryDatabase } from '../inMemoryDatabase';

export class InMemoryPlayRepository implements PlayRepository {
  // eslint-disable-next-line class-methods-use-this
  async save(play: Play): ReturnType<PlayRepository['save']> {
    inMemoryDatabase.plays.push(play);

    return Effect.succeed({ id: play.id });
  }
}
