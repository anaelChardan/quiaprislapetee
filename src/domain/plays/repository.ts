import { Effect } from 'effect';
import { Play, PlayId } from './aggregate';

type SuccessSave = {
  id: PlayId;
};

type FailureSave = {
  error: unknown;
};

export interface PlayRepository {
  save(play: Play): Promise<Effect.Effect<SuccessSave, FailureSave>>;
}
