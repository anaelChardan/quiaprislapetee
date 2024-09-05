import * as R from '@utils/general-type-helpers/Result';
import { PlayId, type Play, type PlaysRepository } from '@domain/plays';
import { inMemoryDatabase } from '../in-memory-database';

export class InMemoryPlaysRepository implements PlaysRepository {
  // eslint-disable-next-line class-methods-use-this
  async exists(playId: PlayId): ReturnType<PlaysRepository['exists']> {
    const exists = inMemoryDatabase.plays.some((play) => play.id === playId);

    return R.toSuccess(exists);
  }

  // eslint-disable-next-line class-methods-use-this
  async save(play: Play): ReturnType<PlaysRepository['save']> {
    inMemoryDatabase.plays.push(play);

    return R.toSuccess({ id: play.id });
  }
}
