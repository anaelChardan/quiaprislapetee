import { Result } from '@utils/general-type-helpers/Result';
import { Play, PlayId } from './aggregate';

type SuccessSave = {
  id: PlayId;
};

type FailureSave = {
  reason: string;
  error: unknown;
};

export interface PlaysRepository {
  save(play: Play): Promise<Result<FailureSave, SuccessSave>>;
  exists(playId: PlayId): Promise<Result<{ reason: string; error: unknown }, boolean>>;
}
